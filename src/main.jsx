import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { pages } from './docs.js';
import './styles.css';

const meta = document.querySelector('meta[name="docs-root"]');
let initialSlug = document.querySelector('meta[name="docs-slug"]')?.content || '';
let root = meta?.content || './';
const element = document.getElementById('root');
if (!element) throw new Error('The documentation root element is missing.');
if (element.querySelector('main')) {
  // Preserve the exact server-rendered props for the initial hydration pass.
  hydrateRoot(element, <App initialSlug={initialSlug} root={root} />);
} else {
  // Vite serves the source index as its development fallback for every route.
  // Recover a known guide from the URL without changing production SSG hydration.
  const pathname = location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  const separator = pathname.lastIndexOf('/');
  let candidate = '';
  try { candidate = decodeURIComponent(pathname.slice(separator + 1)); } catch {}
  if (!initialSlug && candidate && pages.some(page => page.slug === candidate)) {
    initialSlug = candidate;
    root = pathname.slice(0, separator + 1) || '/';
  }
  createRoot(element).render(<App initialSlug={initialSlug} root={root} />);
}
