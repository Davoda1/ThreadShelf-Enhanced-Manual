import { build } from 'vite';
import { readFile, writeFile, mkdir, rm, cp, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

await build({ build: { rolldownOptions: { output: { codeSplitting: { groups: [
  { name: 'vendor', test: /node_modules[\\/]/ }
] } } } } });
await build({ build: { ssr: 'src/prerender.jsx', outDir: '.build-ssr', emptyOutDir: true } });
const { render, pages, searchDocs } = await import(pathToFileURL(resolve('.build-ssr/prerender.js')).href);
assert.ok(searchDocs('ALLOW_LAN_TTS').some(page => page.slug === 'network-access'), 'Search must preserve environment-variable underscores');
assert.ok(searchDocs('Pocket').some(page => page.slug === 'speech'), 'Search must find speech engine documentation');
assert.equal(searchDocs('unfindable-query-for-documentation-validation').length, 0, 'Search must handle absent terms');
const template = await readFile('dist/index.html', 'utf8');
const escape = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const manifest = [];

for (const page of pages) {
  if (!page.raw.trim()) throw new Error(`Missing article: ${page.slug || 'introduction'}`);
  const relativeRoot = page.slug ? '../' : './';
  const directory = page.slug ? `dist/${page.slug}` : 'dist';
  const title = page.slug ? `${page.title} · ThreadShelf Enhanced Documentation` : 'ThreadShelf Enhanced · Documentation';
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(page.description)}$2`)
    .replace(/(<meta name="docs-root" content=")[^"]*("\s*\/?>)/, `$1${relativeRoot}$2`)
    .replace(/(<meta name="docs-slug" content=")[^"]*("\s*\/?>)/, `$1${page.slug}$2`)
    .replace('<!--app-html-->', render(page.slug, relativeRoot));
  if (page.slug) html = html.replace(/(src|href)="\.\/(assets\/[^"<>]+|favicon\.svg)"/g, '$1="../$2"');
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  manifest.push({ slug: page.slug, title: page.title, group: page.group, description: page.description, words: page.raw.split(/\s+/).filter(Boolean).length });
}

await writeFile('dist/.nojekyll', '');
await cp('licenses', 'dist/licenses', { recursive: true });
await copyFile('LICENSE', 'dist/LICENSE.txt');
await copyFile('THIRD-PARTY-NOTICES.md', 'dist/THIRD-PARTY-NOTICES.md');
await writeFile('dist/site-index.json', JSON.stringify({ title: 'ThreadShelf Enhanced Documentation', pages: manifest }, null, 2) + '\n');
await writeFile('dist/404.html', `<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · ThreadShelf Enhanced</title><style>body{font:16px/1.7 system-ui,sans-serif;background:#101b22;color:#d2e0e7;padding:12vh 8vw;max-width:650px;margin:auto}h1{color:#fff;font-size:42px;letter-spacing:-.04em}a,button{color:#7fe0e5}button{background:transparent;border:1px solid #42606f;padding:9px 15px;border-radius:6px;cursor:pointer;font:inherit}p{color:#a4bac7}</style><main><small>THREADSHELF ENHANCED DOCUMENTATION</small><h1>This page could not be found.</h1><p>The guide may have moved, or the address may be incomplete. Use your browser's Back button to return to the handbook, or visit the project repository.</p><p><a href="https://github.com/Davoda1/ThreadShelf-Enhanced">Project repository</a></p></main></html>`);
await rm('.build-ssr', { recursive: true, force: true });
console.log(`Generated ${pages.length} complete HTML pages. Relative assets support any GitHub Pages repository path.`);
