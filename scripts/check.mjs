import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve('dist');
const { pages } = JSON.parse(await readFile(resolve(root, 'site-index.json'), 'utf8'));
const contents = await readdir('content');
assert.equal(contents.filter(name => name.endsWith('.md')).length, pages.length, 'Every article must be in navigation');
let internalLinks = 0, sourceReferences = 0;
const htmlCache = new Map();
for (const page of pages) {
  const file = resolve(root, page.slug, 'index.html');
  htmlCache.set(file, await readFile(file, 'utf8'));
}
for (const page of pages) {
  const file = resolve(root, page.slug, 'index.html'), html = htmlCache.get(file);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `One H1: ${page.slug}`);
  assert.ok(html.includes('<main'), `Pre-rendered content: ${page.slug}`);
  assert.ok(!html.includes('<!--app-html-->'), `Unfilled template: ${page.slug}`);
  assert.ok(!/<(?:script|link)\b[^>]*(?:src|href)="https?:\/\//.test(html), 'Assets must be self-contained');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Unique document IDs: ${page.slug}`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = raw.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|data:|tel:)/i.test(value)) continue;
    for (const prefix of ['/', '/project-docs/', '/example/nested/']) {
      const url = new URL(value, `https://docs.example${prefix}${page.slug ? page.slug + '/' : ''}`);
      assert.ok(url.pathname.startsWith(prefix), `Link escapes publishing prefix ${prefix}: ${value}`);
      const relative = decodeURIComponent(url.pathname.slice(prefix.length));
      let target = resolve(root, relative);
      const info = await stat(target).catch(() => null);
      assert.ok(info, `Broken local target ${value} from ${page.slug || 'home'}`);
      if (info.isDirectory()) target = resolve(target, 'index.html');
      if (url.hash && extname(target) === '.html') {
        const targetHtml = htmlCache.get(target) || await readFile(target, 'utf8');
        assert.ok(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${value} from ${page.slug}`);
      }
      internalLinks++;
    }
  }
  const markdown = await readFile(`content/${page.slug || 'introduction'}.md`, 'utf8');
  assert.equal((markdown.match(/^```/gm) || []).length % 2, 0, `Balanced fences: ${page.slug}`);
  assert.ok(markdown.includes('## Source references'), `Sources: ${page.slug}`);
  sourceReferences += (markdown.match(/https:\/\/github\.com\/Davoda1\/ThreadShelf-Enhanced/g) || []).length;
  assert.ok(!/github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]{20}|\/workspace\/scratch\//i.test(markdown), `Public content hygiene: ${page.slug}`);
}
const demo = JSON.parse(await readFile('public/examples/demo-conversation.json', 'utf8'));
assert.equal(demo.turns.length, 4);
assert.ok(demo.turns.every(turn => typeof (turn.user ?? turn.ai) === 'string'));
console.log(`PASS: ${pages.length} pre-rendered pages; ${internalLinks} local links/assets/anchors across root and two subpaths; ${sourceReferences} repository citations; navigation coverage, source hygiene, and sample JSON.`);
