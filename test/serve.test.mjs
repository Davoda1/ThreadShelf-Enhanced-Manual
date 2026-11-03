import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { mkdir, mkdtemp, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const serverScript = fileURLToPath(new URL('../scripts/serve.mjs', import.meta.url));
const home = '<!doctype html><title>Home</title><main>Documentation home</main>';
const reader = '<!doctype html><title>Reader</title><main>Reader guide</main>';
const notFound = '<!doctype html><title>Not found</title><main>Missing guide</main>';
const privateContent = 'This file must never be returned by the static server.';

function settlesWithin(promise, timeoutMs) {
  let timer;
  return Promise.race([
    promise.then(() => true),
    new Promise(resolve => { timer = setTimeout(() => resolve(false), timeoutMs); }),
  ]).finally(() => clearTimeout(timer));
}

async function stopChild(child, closed) {
  if (child.exitCode === null && child.signalCode === null) child.kill();
  if (await settlesWithin(closed, 5000)) return;
  child.kill('SIGKILL');
  assert.ok(await settlesWithin(closed, 5000), 'Static server did not close after termination');
}

function waitUntilListening(child) {
  return new Promise((resolve, reject) => {
    let output = '', diagnostics = '';
    const timer = setTimeout(() => finish(new Error('Static server did not report a listening URL')), 15_000);
    const onError = error => finish(error);
    const onExit = (code, signal) => finish(new Error(`Static server exited before listening (${code ?? signal}): ${diagnostics}`));
    const onStderr = chunk => { diagnostics = (diagnostics + chunk).slice(-8192); };
    const onStdout = chunk => {
      output = (output + chunk).slice(-8192);
      const match = /Documentation available at (http:\/\/[^\s]+)(?:\r?\n)/.exec(output);
      if (match) finish(undefined, new URL(match[1]));
    };
    function finish(error, url) {
      clearTimeout(timer);
      child.off('error', onError);
      child.off('exit', onExit);
      child.stdout.off('data', onStdout);
      child.stderr.off('data', onStderr);
      if (error) reject(error); else resolve(url);
    }
    child.once('error', onError);
    child.once('exit', onExit);
    child.stdout.on('data', onStdout);
    child.stderr.on('data', onStderr);
  });
}

async function fixture(t, prefix = '/') {
  const temporary = await mkdtemp(join(tmpdir(), 'threadshelf-static-test-'));
  const publicRoot = join(temporary, 'public files ü');
  let child, closed;
  t.after(async () => {
    try {
      if (child) await stopChild(child, closed);
    } finally {
      await rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
  await mkdir(join(publicRoot, 'reader'), { recursive: true });
  await mkdir(join(publicRoot, 'assets'));
  await mkdir(join(publicRoot, 'empty'));
  await mkdir(join(temporary, 'private'));
  await Promise.all([
    writeFile(join(publicRoot, 'index.html'), home),
    writeFile(join(publicRoot, 'reader', 'index.html'), reader),
    writeFile(join(publicRoot, '404.html'), notFound),
    writeFile(join(publicRoot, 'assets', 'app.js'), 'export const example = true;'),
    writeFile(join(publicRoot, 'assets', 'style.css'), 'body { color: black; }'),
    writeFile(join(publicRoot, 'reader ü name.html'), 'UTF-8 filename'),
    writeFile(join(temporary, 'private', 'index.html'), privateContent),
    writeFile(join(temporary, 'private', 'secret.txt'), privateContent),
  ]);
  child = spawn(process.execPath, [serverScript, publicRoot, '--host', '127.0.0.1', '--port', '0', '--prefix', prefix], {
    cwd: temporary,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  closed = new Promise(resolve => child.once('close', resolve));
  const url = await waitUntilListening(child);
  assert.equal(url.hostname, '127.0.0.1');
  assert.ok(Number(url.port) > 0, 'The server must report its allocated ephemeral port');
  return { publicRoot, temporary, url, prefix: url.pathname };
}

function request(server, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    // Use a raw request path so traversal cases are not normalized by a client URL parser.
    const outgoing = http.request({
      hostname: server.url.hostname,
      port: server.url.port,
      path,
      method,
      agent: false,
      signal: AbortSignal.timeout(8000),
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.once('error', reject);
      response.once('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    outgoing.once('error', reject);
    outgoing.end();
  });
}

async function createLink(t, target, path, type) {
  try {
    await symlink(target, path, type);
    return true;
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOSYS', 'ENOTSUP'].includes(error.code)) throw error;
    t.skip(`This filesystem or account does not permit ${type} links (${error.code})`);
    return false;
  }
}

test('static server at a nested repository prefix', { timeout: 60_000 }, async t => {
  const server = await fixture(t, '/nested/manual/');
  const prefix = server.prefix;

  await t.test('serves directory routes, explicit index files and local assets', async () => {
    const homeResponse = await request(server, prefix);
    assert.equal(homeResponse.status, 200);
    assert.equal(homeResponse.body, home);
    assert.match(homeResponse.headers['content-type'], /^text\/html\b/);
    assert.equal(homeResponse.headers['content-length'], String(Buffer.byteLength(home)));
    assert.equal(homeResponse.headers['x-content-type-options'], 'nosniff');
    assert.equal(homeResponse.headers['cache-control'], 'no-cache');
    for (const path of ['reader/', 'reader/index.html']) {
      const response = await request(server, prefix + path);
      assert.equal(response.status, 200);
      assert.equal(response.body, reader);
    }
    const javascript = await request(server, prefix + 'assets/app.js');
    const css = await request(server, prefix + 'assets/style.css');
    assert.equal(javascript.status, 200);
    assert.match(javascript.headers['content-type'], /^application\/javascript\b/);
    assert.equal(css.status, 200);
    assert.match(css.headers['content-type'], /^text\/css\b/);
  });

  await t.test('preserves query strings on mount and directory redirects', async () => {
    for (const [path, location] of [
      [prefix.slice(0, -1) + '?q=two%20words&mode=exact', prefix + '?q=two%20words&mode=exact'],
      [prefix + 'reader?q=two%20words', prefix + 'reader/?q=two%20words'],
    ]) {
      const response = await request(server, path);
      assert.equal(response.status, 301);
      assert.equal(response.headers.location, location);
      assert.equal(response.body, '');
    }
  });

  await t.test('HEAD returns GET headers without a response body', async () => {
    const response = await request(server, prefix + 'reader/', 'HEAD');
    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /^text\/html\b/);
    assert.equal(response.headers['content-length'], String(Buffer.byteLength(reader)));
    assert.equal(response.body, '');
    const missing = await request(server, prefix + 'missing', 'HEAD');
    assert.equal(missing.status, 404);
    assert.equal(missing.body, '');
  });

  await t.test('returns the custom 404 for missing or unmounted paths', async () => {
    for (const path of [prefix + 'missing', prefix + 'empty/', '/reader/', '/nested/manual-other/']) {
      const response = await request(server, path);
      assert.equal(response.status, 404, path);
      assert.equal(response.body, notFound, path);
    }
  });

  await t.test('rejects unsupported methods without serving a document', async () => {
    for (const method of ['POST', 'PUT', 'DELETE']) {
      const response = await request(server, prefix, method);
      assert.equal(response.status, 405, method);
      assert.equal(response.headers.allow, 'GET, HEAD');
      assert.equal(response.body, 'Method not allowed');
    }
  });

  await t.test('decodes legitimate UTF-8 filenames', async () => {
    const response = await request(server, prefix + encodeURIComponent('reader ü name.html'));
    assert.equal(response.status, 200);
    assert.equal(response.body, 'UTF-8 filename');
  });

  await t.test('rejects encoded traversal, absolute paths and malformed escapes', async () => {
    const secret = join(server.temporary, 'private', 'secret.txt');
    const paths = [
      '%2e%2e%2fprivate%2fsecret.txt',
      '%2e%2e%5cprivate%5csecret.txt',
      '../private/secret.txt',
      encodeURIComponent(secret),
      '%00',
      '%zz',
    ];
    for (const path of paths) {
      const response = await request(server, prefix + path);
      assert.equal(response.status, 404, path);
      assert.equal(response.body, notFound, path);
      assert.ok(!response.body.includes(privateContent), path);
    }
  });

  await t.test('blocks file links outside the public root and permits internal links', async t => {
    const external = join(server.publicRoot, 'external.txt');
    if (!await createLink(t, join(server.temporary, 'private', 'secret.txt'), external, 'file')) return;
    await symlink(join(server.publicRoot, 'index.html'), join(server.publicRoot, 'internal.html'), 'file');
    const rejected = await request(server, prefix + 'external.txt');
    assert.equal(rejected.status, 404);
    assert.equal(rejected.body, notFound);
    const allowed = await request(server, prefix + 'internal.html');
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body, home);
  });

  await t.test('blocks directory links outside the public root', async t => {
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    if (!await createLink(t, join(server.temporary, 'private'), join(server.publicRoot, 'external-directory'), type)) return;
    for (const path of ['external-directory', 'external-directory/', 'external-directory/secret.txt']) {
      const response = await request(server, prefix + path);
      assert.equal(response.status, 404, path);
      assert.equal(response.body, notFound);
    }
  });

  await t.test('does not expose an external file through a linked 404 page', async t => {
    const probe = join(server.publicRoot, 'error-link.html');
    if (!await createLink(t, join(server.temporary, 'private', 'secret.txt'), probe, 'file')) return;
    const errorPage = join(server.publicRoot, '404.html');
    const saved = join(server.publicRoot, '404.saved.html');
    await rename(errorPage, saved);
    try {
      await rename(probe, errorPage);
      const response = await request(server, prefix + 'still-missing');
      assert.equal(response.status, 404);
      assert.equal(response.body, 'Not found');
      assert.ok(!response.body.includes(privateContent));
    } finally {
      await rm(errorPage, { force: true });
      await rename(saved, errorPage);
    }
  });
});

test('static server also works at the origin root', { timeout: 30_000 }, async t => {
  const server = await fixture(t);
  assert.equal(server.prefix, '/');
  const response = await request(server, '/');
  assert.equal(response.status, 200);
  assert.equal(response.body, home);
  const redirect = await request(server, '/reader?from=home');
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.location, '/reader/?from=home');
  const guide = await request(server, '/reader/');
  assert.equal(guide.status, 200);
  assert.equal(guide.body, reader);
});
