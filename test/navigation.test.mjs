import test from 'node:test';
import assert from 'node:assert/strict';
import { groups } from '../src/catalog.js';
import { findPage } from '../src/docs-core.js';
import { pageUrl, assetUrl, slugFromPath } from '../src/navigation.js';

const pages = groups.flatMap(group => group.pages.map(([slug, title]) => ({ slug, title })));

test('page and asset URLs work for prerendered root pages, nested guides, and repository paths', () => {
  for (const root of ['./', '../', '/', '/manual/', '/projects/manual/']) {
    assert.equal(pageUrl(root), root);
    assert.equal(pageUrl(root, 'reader'), `${root}reader/`);
    assert.equal(pageUrl(root, 'reader', '#copy-and-export-precisely'), `${root}reader/#copy-and-export-precisely`);
    assert.equal(assetUrl(root, '/media/01-reader-dark.png'), `${root}media/01-reader-dark.png`);
    assert.equal(assetUrl(root, 'examples/demo-conversation.json'), `${root}examples/demo-conversation.json`);
  }
});

test('history paths restore every actual guide from directory and explicit index URLs', () => {
  for (const root of ['/', '/manual/', '/projects/manual/']) {
    for (const page of pages) {
      const url = pageUrl(root, page.slug);
      assert.equal(slugFromPath(url, root), page.slug);
      assert.equal(slugFromPath(`${url}index.html`, root), page.slug);
      assert.equal(findPage(pages, slugFromPath(`${url}index.html`, root)).slug, page.slug);
    }
  }
});

test('history normalization respects the site prefix and tolerates encoded or malformed paths', () => {
  assert.equal(slugFromPath('/manual', '/manual/'), '');
  assert.equal(slugFromPath('/manual/reader', '/manual'), 'reader');
  assert.equal(slugFromPath('/manual/%73earch/index.html', '/manual/'), 'search');
  assert.equal(slugFromPath('/public%20docs/reader/index.html', '/public%20docs/'), 'reader');
  assert.equal(slugFromPath('/manual-other/reader/', '/manual/'), '');
  assert.equal(slugFromPath('/manual/%E0%A4%A/', '/manual/'), '');
  assert.equal(findPage(pages, slugFromPath('/manual/missing/', '/manual/')).slug, '');
});
