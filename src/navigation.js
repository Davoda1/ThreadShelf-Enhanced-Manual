export const pageUrl = (root, slug = '', hash = '') => `${root}${slug ? `${slug}/` : ''}${hash}`;
export const assetUrl = (root, path) => `${root}${path.replace(/^\//, '')}`;

// The same guide can be reached through a directory URL or its static index file.
// Normalize both forms when browser history restores a page beneath the site root.
export function slugFromPath(pathname, root = '/') {
  const prefix = root.endsWith('/') ? root : `${root}/`;
  if (pathname === prefix.slice(0, -1)) return '';
  if (!pathname.startsWith(prefix)) return '';
  let relative;
  try { relative = decodeURI(pathname.slice(prefix.length)); }
  catch { return ''; }
  return relative.replace(/(?:^|\/)index\.html$/, '').replace(/^\/+|\/+$/g, '');
}
