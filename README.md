# ThreadShelf Enhanced Manual

A static React documentation website for [ThreadShelf Enhanced](https://github.com/Davoda1/ThreadShelf-Enhanced), covering installation, conversation archives, search, AI providers, live Markdown notes, speech, server operation and integrations.

The handbook contains **26 guides**. Each guide is pre-rendered into complete HTML, then enhanced with browser-local search, responsive navigation, light/dark/system themes, code-copy controls, page outlines and print styles. An interactive search-method guide explains when to choose Exact, Semantic or Hybrid retrieval.

This repository contains the documentation website. Install and operate the ThreadShelf Enhanced server from its [application repository](https://github.com/Davoda1/ThreadShelf-Enhanced).

## Run locally

Use **Node.js 24 or newer** and a compatible npm version. Install the locked dependencies, verify the project and serve the production output:

```bash
npm ci
npm run verify
npm run preview
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). The preview serves `dist/` on loopback; stop it with **Ctrl+C**. It requires an existing build. No ThreadShelf server, database or model runtime is needed to read the handbook.

For source development with live updates:

```bash
npm run dev
```

Use the local URL printed by Vite. Verify routing and generated HTML with the production build before submitting changes.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the committed lockfile |
| `npm run dev` | Start the source development server on loopback |
| `npm run develop` | Alias for source development |
| `npm test` | Run the Node test suite, including static-server integration tests |
| `npm run check:public` | Check the candidate source for private artifacts and sensitive material |
| `npm run build` | Bundle React assets and pre-render the complete handbook into `dist/` |
| `npm run check` | Validate the built pages, local links, assets, anchors and documentation coverage |
| `npm run verify` | Run public-content checks, tests, build and built-site validation in order |
| `npm run preview` | Serve the completed static site on loopback |

See [TESTING.md](TESTING.md) for test coverage, platform limits and the manual interaction checklist. A successful build is not a substitute for checking documentation facts against the application source.

## Static hosting and GitHub Pages

The production website is the **contents of `dist/`**. It needs only a static host: there is no server-side rendering service, remote search service or application backend at runtime. Each guide has a real directory/index page, so direct links do not require a wildcard single-page-app rewrite.

Internal assets and navigation work beneath a repository path or a deeper static-host prefix. Check a project-style path locally with:

```bash
node scripts/serve.mjs dist --prefix /example-docs/ --port 4173
```

Then open [http://127.0.0.1:4173/example-docs/](http://127.0.0.1:4173/example-docs/). Keep the complete generated directory structure and `.nojekyll` when publishing.

### Deliberate Pages publication

CI builds and validates the handbook on **Node 24 for Linux and Windows**. Its preview artifact is downloadable build output, not a hosted website.

The separate **Publish documentation** workflow is manual. Its `publish` input defaults to `false`; deployment requires an explicit `true`, the `master` branch and a repository that is already public. Ordinary pushes do not activate Pages, and the workflow does not change repository visibility.

When publication is intended, a maintainer must configure **Settings → Pages → Source → GitHub Actions**, then run the publication workflow from `master` with `publish` enabled. It publishes the verified `dist/` artifact without a `gh-pages` branch. Until a deployment succeeds, this repository does not imply an active documentation URL.

Official hosting references: [Vite static deployment](https://vite.dev/guide/static-deploy) and [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Project structure

| Path | Responsibility |
| --- | --- |
| `content/` | Public Markdown guides and source-reference footers |
| `src/catalog.js` | Guide slugs, titles, descriptions, groups and order |
| `src/docs-core.js` | Markdown rendering, page preparation and documentation search |
| `src/docs.js` | Vite content loading and application-facing documentation helpers |
| `src/navigation.js` | Page/asset URLs and history-path normalization |
| `src/App.jsx`, `src/main.jsx` | React interface and browser entry point |
| `src/prerender.jsx` | Static rendering entry point used during the build |
| `src/styles.css`, `src/fonts.css` | Layout, themes, typography and print presentation |
| `public/media/` | Application illustrations from the documented synthetic source archive |
| `public/examples/` | Synthetic quick-start conversation JSON |
| `scripts/` | Build, validation, public-content and static-preview utilities |
| `test/` | Node unit and static-server integration tests |
| `.github/workflows/` | CI and explicitly gated Pages publication |
| `dist/` | Generated static website; change source files and rebuild |
| `SOURCE-REFERENCE.json` | Reviewed application commit and asset provenance |
| `licenses/` | Retained upstream and dependency license notices |

## Maintain the handbook

Edit prose in `content/*.md` and navigation metadata in `src/catalog.js`. Each article has one H1 and a `## Source references` footer. Write guide links as `/speech/`, local image links as `/media/filename.png`, and example downloads as `/examples/filename.json`; the renderer resolves them beneath the publishing root.

Guide titles, routine setup commands and release-download links avoid patch-specific names. Update facts when behavior changes and record the reviewed application commit in `SOURCE-REFERENCE.json`. Keep historical version boundaries when they explain a real compatibility or storage change. [CONTRIBUTING.md](CONTRIBUTING.md) describes the content and review standards.

## Privacy, provenance and license

Documentation search runs in the browser. The site has no analytics, tracking script, external font or required runtime CDN. A theme preference is stored locally in the browser. External links lead to their respective services when followed.

Application illustrations retain the public source repository's synthetic-data provenance. The quick-start JSON is a separate fictional example. The website does not contain user archives, server configuration or provider credentials.

The original website implementation and documentation are **MIT-licensed**. Preserve the attribution and licenses for ThreadShelf-derived material and bundled dependencies. See [LICENSE](LICENSE), [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), [SOURCE-REFERENCE.json](SOURCE-REFERENCE.json) and [SECURITY.md](SECURITY.md).
