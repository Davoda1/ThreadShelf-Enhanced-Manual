import { marked, Renderer } from 'marked';
import { pageUrl, assetUrl } from './navigation.js';

export function createPages(groups, sources) {
  return groups.flatMap(group => group.pages.map(([slug, title, description]) => {
    const raw = sources[slug || 'introduction'] || '';
    const searchable = raw.split('## Source references')[0];
    return { slug, title, description, group: group.title, raw,
      // Keep underscores: environment variables and API identifiers are useful queries.
      text: searchable.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#`*>|]/g, '').replace(/\s+/g, ' ').trim(),
      minutes: Math.max(2, Math.ceil(searchable.split(/\s+/).length / 220)) };
  }));
}

export const findPage = (pages, slug) => pages.find(page => page.slug === slug) || pages[0];

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function safeUrl(value) {
  const url = String(value ?? '');
  const scheme = url.replace(/[\u0000-\u0020\u007f]/g, '');
  return /^(javascript|data|vbscript):/i.test(scheme) ? '#' : url;
}

export function renderMarkdown(raw, root, pages = []) {
  const headings = [], used = new Set();
  const imageUrl = href => {
    const safe = safeUrl(href);
    return safe.startsWith('/') && !safe.startsWith('//') ? assetUrl(root, safe) : safe;
  };
  const imageTag = ({ href, text }, standalone = false) => `<img src="${escapeHTML(imageUrl(href))}" alt="${escapeHTML(text)}" loading="lazy"${standalone ? ' width="1600" height="1000"' : ''} />`;
  const renderer = new Renderer();
  renderer.heading = function ({ tokens, depth }) {
    if (depth === 1) return '';
    const content = this.parser.parseInline(tokens);
    const plain = content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
    const base = plain.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') || 'section';
    let id = base, suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    if (depth <= 3 && plain !== 'Source references') headings.push({ id, text: plain, depth });
    return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to ${escapeHTML(plain)}">${content}<span aria-hidden="true">#</span></a></h${depth}>`;
  };
  renderer.link = function ({ href, tokens }) {
    let url = safeUrl(href), attrs = '';
    if (url.startsWith('/') && !url.startsWith('//')) {
      const match = url.match(/^\/([^/#]*)(?:\/)?(#[^ ]*)?$/);
      if (match && pages.some(p => p.slug === match[1])) {
        url = pageUrl(root, match[1], match[2] || ''); attrs = ` data-doc="${escapeHTML(match[1])}"`;
      } else url = assetUrl(root, url);
    } else if (/^https?:\/\//i.test(url)) attrs = ' target="_blank" rel="noopener noreferrer"';
    return `<a href="${escapeHTML(url)}"${attrs}>${this.parser.parseInline(tokens)}</a>`;
  };
  renderer.code = function ({ text, lang }) {
    const language = (lang || 'text').split(/\s+/)[0];
    return `<div class="code-block"><div class="code-toolbar"><span>${escapeHTML(language)}</span><button type="button" class="copy-code" aria-label="Copy code">Copy</button></div><pre tabindex="0"><code>${escapeHTML(text)}</code></pre></div>`;
  };
  // Images are phrasing content by default, including inside authored links.
  // Promote an image-only paragraph to a figure without an invalid surrounding <p>.
  renderer.image = token => imageTag(token);
  renderer.paragraph = function ({ tokens }) {
    const content = tokens.filter(token => token.type !== 'text' || token.text.trim());
    if (content.length === 1 && content[0].type === 'image') {
      const image = content[0];
      return `<figure class="doc-figure"><a href="${escapeHTML(imageUrl(image.href))}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size image: ${escapeHTML(image.text)}">${imageTag(image, true)}</a><figcaption>${escapeHTML(image.text)} · Select to enlarge</figcaption></figure>\n`;
    }
    return `<p>${this.parser.parseInline(tokens)}</p>\n`;
  };
  renderer.table = function (token) {
    const header = token.header.map(cell => this.tablecell(cell)).join('');
    const body = token.rows.map(row => `<tr>${row.map(cell => this.tablecell(cell)).join('')}</tr>`).join('');
    return `<div class="table-scroll" role="region" aria-label="Reference table" tabindex="0"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
  };
  renderer.html = ({ text }) => escapeHTML(text);
  const html = marked.parse(raw, { renderer, gfm: true, breaks: false });
  return { html, headings };
}

export function searchDocs(pages, query) {
  const term = String(query ?? '').trim().toLowerCase();
  if (!term) return pages.filter(p => ['quick-start', 'installation', 'imports', 'search', 'speech', 'network-access'].includes(p.slug)).map(p => ({ ...p, snippet: p.description }));
  const words = term.split(/\s+/).filter(Boolean);
  return pages.map(page => {
    const haystack = `${page.title} ${page.description} ${page.text}`.toLowerCase();
    if (!words.every(word => haystack.includes(word))) return null;
    const title = page.title.toLowerCase(), description = page.description.toLowerCase();
    const score = (title.includes(term) ? 40 : 0) + words.reduce((n, w) => n + (title.includes(w) ? 8 : 0) + (description.includes(w) ? 3 : 0), 0) + (page.text.toLowerCase().includes(term) ? 5 : 0);
    const at = Math.max(0, page.text.toLowerCase().indexOf(term));
    const start = Math.max(0, at - 70);
    const snippet = `${start ? '…' : ''}${page.text.slice(start, start + 190)}${page.text.length > start + 190 ? '…' : ''}`;
    return { ...page, score, snippet };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 14);
}
