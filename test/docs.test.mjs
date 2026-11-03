import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { marked } from 'marked';
import { groups } from '../src/catalog.js';
import { createPages, findPage, searchDocs } from '../src/docs-core.js';

const contentDirectory = new URL('../content/', import.meta.url);
const sources = Object.fromEntries(readdirSync(contentDirectory)
  .filter(name => name.endsWith('.md'))
  .map(name => [name.slice(0, -3), readFileSync(new URL(name, contentDirectory), 'utf8')]));
const pages = createPages(groups, sources);

test('every catalog guide has one article and source references, with no orphan articles', () => {
  const slugs = pages.map(page => page.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'Guide slugs must be unique');
  assert.deepEqual(new Set(slugs.map(slug => slug || 'introduction')), new Set(Object.keys(sources)));
  for (const page of pages) {
    assert.ok(page.raw.trim(), `${page.slug || 'introduction'} is empty`);
    const headings = marked.lexer(page.raw).filter(token => token.type === 'heading');
    assert.equal(headings.filter(heading => heading.depth === 1).length, 1, `${page.slug || 'introduction'} needs one H1`);
    assert.ok(headings.some(heading => heading.depth === 2 && heading.text === 'Source references'), `${page.slug || 'introduction'} needs its source footer`);
  }
  assert.equal(findPage(pages, '').title, 'Introduction');
  assert.equal(findPage(pages, 'not-a-guide').slug, '');
});

test('environment-variable queries preserve underscores and locate their operational guides', () => {
  const expectations = [
    ['THREADSHELF_DATA_DIR', 'configuration'],
    ['OPENROUTER_API_KEY', 'remote-providers'],
    ['ALLOW_LAN_AI', 'network-access'],
    ['ALLOW_LAN_TTS', 'speech']
  ];
  for (const [query, slug] of expectations) {
    const guide = findPage(pages, slug);
    assert.ok(guide.text.includes(query), `${slug} must retain ${query} in searchable text`);
    assert.ok(searchDocs(pages, query).some(page => page.slug === slug), `${query} must find ${slug}`);
  }
});

test('guide-title searches put the corresponding reference or task first', () => {
  const expectations = [
    ['Archive HTTP API', 'http-api'],
    ['MCP integration', 'mcp'],
    ['Text-to-speech', 'speech'],
    ['Import jobs', 'background-jobs'],
    ['Backups & migration', 'backup-migration']
  ];
  for (const [query, slug] of expectations) {
    assert.equal(searchDocs(pages, query)[0]?.slug, slug, `Expected ${slug} for ${query}`);
  }
});

test('empty, whitespace-only, and absent queries offer useful starting guides', () => {
  const expected = ['quick-start', 'installation', 'imports', 'search', 'speech', 'network-access'];
  for (const query of ['', ' \n\t ', undefined, null]) {
    const results = searchDocs(pages, query);
    assert.deepEqual(results.map(page => page.slug), expected);
    assert.ok(results.every(page => page.snippet === page.description));
  }
});

test('queries ignore case and surrounding whitespace while requiring all words', () => {
  assert.deepEqual(searchDocs(pages, '  aLLoW_LaN_AI  ').map(page => page.slug), searchDocs(pages, 'ALLOW_LAN_AI').map(page => page.slug));
  assert.ok(searchDocs(pages, 'ALLOW_LAN_AI ALLOW_LAN_TTS').some(page => page.slug === 'network-access'));
  assert.deepEqual(searchDocs(pages, 'ALLOW_LAN_AI nonexistentdocumentationterm'), []);
});

test('citation-only text and link destinations do not pollute article search', () => {
  const sample = createPages([{ title: 'Example', pages: [['example', 'Example', 'A short guide.']] }], {
    example: '# Example\n\nRead the [visible label](https://example.org/destinationonly).\n\n## Source references\n\nCitationonlytoken.'
  });
  assert.equal(searchDocs(sample, 'visible label')[0]?.slug, 'example');
  assert.deepEqual(searchDocs(sample, 'destinationonly'), []);
  assert.deepEqual(searchDocs(sample, 'citationonlytoken'), []);
});
