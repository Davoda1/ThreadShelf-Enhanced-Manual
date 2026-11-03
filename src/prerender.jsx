import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';
import { pages, renderMarkdown, searchDocs } from './docs.js';
export { pages, renderMarkdown, searchDocs };
export function render(slug, root) { return renderToString(<App initialSlug={slug} root={root} />); }
