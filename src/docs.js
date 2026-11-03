import { groups } from './catalog.js';
import { createPages, findPage as find, renderMarkdown as render, searchDocs as search } from './docs-core.js';

export { groups, REPOSITORY } from './catalog.js';
export { pageUrl, assetUrl, slugFromPath } from './navigation.js';
export { escapeHTML } from './docs-core.js';

const files = import.meta.glob('../content/*.md', { eager: true, query: '?raw', import: 'default' });
const sources = Object.fromEntries(Object.entries(files).map(([path, raw]) => [path.split('/').pop().slice(0, -3), raw]));
export const pages = createPages(groups, sources);
export const findPage = slug => find(pages, slug);
export const renderMarkdown = (raw, root) => render(raw, root, pages);
export const searchDocs = query => search(pages, query);
