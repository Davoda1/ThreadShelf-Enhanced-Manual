import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { forbiddenPublicPath, inspectPublicText } from './public-hygiene.mjs';

const root = resolve('.');
const ignored = new Set(['.git', 'node_modules', 'dist', '.build-ssr', 'coverage', '.vite']);
const textExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.css', '.html', '.md', '.txt', '.json', '.yml', '.yaml', '.svg']);
const textNames = new Set(['LICENSE', '.gitignore', '.gitattributes', '.editorconfig', '.nvmrc']);
const failures = [];
let count = 0;

async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    const name = relative(root, path).replaceAll('\\', '/');
    if (forbiddenPublicPath(name)) {
      failures.push(`${name}: file type is unsuitable for the public documentation source`);
      continue;
    }
    if (entry.isSymbolicLink()) {
      failures.push(`${name}: source files must not link outside the checkout`);
      continue;
    }
    if (entry.isDirectory()) { await scan(path); continue; }
    if (!entry.isFile() || (!textExtensions.has(extname(entry.name)) && !textNames.has(entry.name))) continue;
    count++;
    const text = await readFile(path, 'utf8');
    for (const finding of inspectPublicText(text)) {
      // Report locations, never the potentially sensitive value.
      failures.push(`${name}:${finding.line}: ${finding.rule}`);
    }
  }
}

await scan(root);
if (failures.length) {
  console.error(`Public source review failed:\n${failures.map(message => `- ${message}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${count} source text files checked for common secrets, private paths, and authoring metadata.`);
}
