import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const args = process.argv.slice(2);
const root = resolve(args[0] && !args[0].startsWith('--') ? args[0] : 'dist');
const canonicalRoot = await realpath(root);
const inside = (base, file) => file === base || file.startsWith(base.endsWith(sep) ? base : base + sep);
const resolvePublicFile = async file => {
  if (!inside(root, file)) throw new Error('Not found');
  const canonical = await realpath(file);
  if (!inside(canonicalRoot, canonical)) throw new Error('Not found');
  return canonical;
};
const option = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; };
const port = Number(option('--port', process.env.PORT || '4173'));
const host = option('--host', '127.0.0.1');
const prefixInput = option('--prefix', '/');
const prefix = '/' + prefixInput.replace(/^\/+|\/+$/g, '') + '/';
const mount = prefix === '//' ? '/' : prefix;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
    response.end('Method not allowed');
    return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    if (mount !== '/' && url.pathname === mount.slice(0, -1)) { response.writeHead(301, { location: mount + url.search }); response.end(); return; }
    if (!url.pathname.startsWith(mount)) throw new Error('Not found');
    const relative = decodeURIComponent(url.pathname.slice(mount.length));
    let file = resolve(root, relative);
    let canonical = await resolvePublicFile(file);
    let info = await stat(canonical);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, { location: url.pathname + '/' + url.search }); response.end(); return; }
      file = resolve(file, 'index.html');
      canonical = await resolvePublicFile(file);
      info = await stat(canonical);
    }
    if (!info.isFile()) throw new Error('Not found');
    const bytes = await readFile(canonical);
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'content-length': bytes.length, 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {
    let body = 'Not found'; try { body = await readFile(await resolvePublicFile(resolve(root, '404.html'))); } catch {}
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); response.end(request.method === 'HEAD' ? undefined : body);
  }
});
server.listen(port, host, () => {
  const displayHost = host.includes(':') ? `[${host}]` : host;
  console.log(`Documentation available at http://${displayHost}:${server.address().port}${mount}`);
});
