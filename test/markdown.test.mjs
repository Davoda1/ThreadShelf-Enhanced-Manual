import test from 'node:test';
import assert from 'node:assert/strict';
import { groups } from '../src/catalog.js';
import { escapeHTML, renderMarkdown } from '../src/docs-core.js';

const routes = groups.flatMap(group => group.pages.map(([slug]) => ({ slug })));
const render = (raw, root = './') => renderMarkdown(raw, root, routes);

test('fenced code and raw HTML are displayed as text rather than executable elements', () => {
  const { html } = render('# Example\n\n```html\n<script>alert("example")</script>\n```\n\n<iframe src="https://example.org"></iframe>');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(html.includes('&lt;script&gt;alert(&quot;example&quot;)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;iframe src=&quot;https://example.org&quot;&gt;&lt;/iframe&gt;'));
  assert.match(html, /class="copy-code"[^>]*>Copy<\/button>/);
  assert.equal(escapeHTML('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});

test('internal guides, anchors, downloads, and images use the current static site root', () => {
  const markdown = '[Home](/) [Speech](/speech/#local-voices) [Example](/examples/demo-conversation.json)\n\n![Reader](/media/01-reader-dark.png)';
  for (const root of ['./', '../', '/manual/', '/projects/manual/']) {
    const { html } = render(markdown, root);
    assert.ok(html.includes(`href="${root}" data-doc=""`));
    assert.ok(html.includes(`href="${root}speech/#local-voices" data-doc="speech"`));
    assert.ok(html.includes(`href="${root}examples/demo-conversation.json"`));
    assert.ok(html.includes(`src="${root}media/01-reader-dark.png"`));
  }
});

test('external links keep query strings escaped and open with isolated window access', () => {
  const { html } = render('[Reference](https://example.org/docs?first=1&second=2)');
  assert.ok(html.includes('href="https://example.org/docs?first=1&amp;second=2"'));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(!html.includes('data-doc='));
});

test('standalone images are figures with a safe enlarge link and caption, outside paragraphs', () => {
  const { html } = render('![Reader & details](/media/01-reader-dark.png)', '../');
  assert.match(html, /^<figure class="doc-figure"><a /);
  assert.ok(html.includes('href="../media/01-reader-dark.png" target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('aria-label="Open full-size image: Reader &amp; details"'));
  assert.ok(html.includes('src="../media/01-reader-dark.png" alt="Reader &amp; details"'));
  assert.ok(html.includes('<figcaption>Reader &amp; details · Select to enlarge</figcaption>'));
  assert.ok(!/<\/?p(?:\s|>)/.test(html));
});

test('inline images retain paragraph text without block figures or automatic nested links', () => {
  const { html } = render('Before ![Reader](/media/01-reader-dark.png) after.', '../');
  assert.match(html, /^<p>Before <img /);
  assert.match(html, /\/> after\.<\/p>\n$/);
  assert.ok(html.includes('src="../media/01-reader-dark.png"'));
  assert.ok(!/<(?:figure|figcaption|a)(?:\s|>)/.test(html));
});

test('authored image links have one anchor and preserve safe destinations', () => {
  const { html } = render('[![Reader](/media/01-reader-dark.png)](/reader/)', '../');
  assert.equal((html.match(/<a(?:\s|>)/g) || []).length, 1);
  assert.match(html, /^<p><a href="\.\.\/reader\/" data-doc="reader"><img /);
  assert.match(html, /\/><\/a><\/p>\n$/);
  assert.ok(!html.includes('<figure'));

  const blocked = render('[![Unsafe](javascript:alert(1))](data:text/html,example)').html;
  assert.match(blocked, /<a href="#"><img src="#"/);
  assert.ok(!/(?:href|src)="(?:javascript|data|vbscript):/i.test(blocked));
});

test('executable URL schemes are rejected in links and linked images', () => {
  const markdown = '[Run](javascript:alert(1)) [Data](data:text/html,example) [VB](VbScript:MsgBox(1))\n\n![Unsafe](javascript:alert(1))';
  const { html } = render(markdown);
  assert.ok(!/(?:href|src)="(?:javascript|data|vbscript):/i.test(html));
  assert.equal((html.match(/href="#"/g) || []).length, 4);
  assert.ok(html.includes('src="#"'));
});

test('heading anchors stay nonempty and unique when titles repeat or already have suffixes', () => {
  const { html, headings } = render('# Shell title\n\n## Setup\n\n## Setup\n\n## Setup 2\n\n### **Setup**\n\n## ???\n\n## ???\n\n#### Detail\n\n## Source references');
  const ids = [...html.matchAll(/<h[2-6] id="([^"]*)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(Boolean));
  assert.deepEqual(ids.slice(0, 4), ['setup', 'setup-2', 'setup-2-2', 'setup-3']);
  for (const id of ids) assert.ok(html.includes(`href="#${id}"`));
  assert.ok(!html.includes('<h1'));
  assert.ok(headings.every(heading => heading.depth <= 3));
  assert.ok(!headings.some(heading => heading.text === 'Source references'));
});

test('Markdown tables preserve headers, body cells, inline code, and scroll accessibility', () => {
  const { html } = render('| Setting | Value |\n| --- | ---: |\n| `ALLOW_LAN_AI` | **0** |');
  assert.ok(html.includes('class="table-scroll" role="region" aria-label="Reference table" tabindex="0"'));
  assert.match(html, /<thead><tr>[\s\S]*<\/tr><\/thead><tbody><tr>/);
  assert.equal((html.match(/<th(?:\s|>)/g) || []).length, 2);
  assert.equal((html.match(/<td(?:\s|>)/g) || []).length, 2);
  assert.ok(html.includes('<code>ALLOW_LAN_AI</code>'));
  assert.ok(html.includes('<strong>0</strong>'));
});
