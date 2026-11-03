# Contributing

Contributions to ThreadShelf Enhanced should improve the public application while preserving archive privacy, source identity, existing integration contracts and reproducible source distribution. Report ordinary bugs and feature proposals through the [repository issues](https://github.com/Davoda1/ThreadShelf-Enhanced/issues). Use the security reporting process below for vulnerabilities.

## Set up a development checkout

Start from the repository's `master` branch and read its contribution guide. Enhanced requires Node 24 or newer and a compatible npm version. The setup scripts install the reviewed project-local runtime and build the application; their selected versions live in the source rather than in this guide.

With the appropriate Node/npm tools available:

```bash
git clone --branch master https://github.com/Davoda1/ThreadShelf-Enhanced.git
cd ThreadShelf-Enhanced
npm ci
npm run build
npm start
```

The root package and React client form npm workspaces with one root lockfile. Install dependencies at the root. For active development, run `npm run dev` and `npm run dev:client` in separate terminals; the client development server proxies API calls to the backend.

Use isolated synthetic data and a separate data directory. Do not point development tests at a live archive. Source checkouts normally create repository-local runtime data, which must remain excluded from commits.

## Navigate the source

| Location | Responsibility |
| --- | --- |
| `src/routes/` | HTTP validation, request/response handling and access boundaries. |
| `src/services/` | Shared search, thread, collection and statistics logic. |
| `src/enhanced-import/` | Import adapters, source preservation and bounded processing. |
| `src/store.ts` and storage modules | LanceDB access, publication and process coordination. |
| `src/generation/` | Model providers, local runtime management, tools and generation configuration. |
| `src/tts/`, `tts/` | Server speech, optional engines and retained notices. |
| `client/src/` | React application and reader controls. |
| `mcp/server.ts` | MCP stdio schemas and handlers. |
| `test/` | Unit, integration, browser and synthetic compatibility coverage. |

The project uses TypeScript and ES modules. Relative source imports use `.js` extensions for compilation/runtime compatibility. Match surrounding conventions and use the repository's formatter. Generated `public/` output should come from the client build; make source changes in the client instead of hand-editing generated files.

## Validate the behavior changed

Run focused checks during implementation and the complete gate before submitting behavior changes:

| Command | Scope |
| --- | --- |
| `npm test` | Unit and regression tests. |
| `npm run test:e2e` | HTTP, native storage and MCP integration. |
| `npm run build:client` | Client type checking and production build. |
| `npm run build:server` | Compiled server and MCP output. |
| `npm run test:playwright` | Browser workflows; needs built UI and Chromium. |
| `npm run check:repo` | Source hygiene and private-artifact checks. |
| `npm run check:security` | Dependency advisories, bundled inventory and asset integrity. |
| `npm run check` | Full security, hygiene, lint, type, unit, integration and browser gate. |
| `python3 test/source-release.test.py` | Source-package contents, permissions, exclusions and reproducibility. |

Install the test browser with `npx playwright install chromium` when needed. Use `python` instead of `python3` on systems where that is the interpreter command. Embedding tests can need a first-use model download. Security checks require the advisory service; an unavailable service is not a passed audit.

Describe exactly which checks ran and any skips or platform limits. For visible changes, include screenshots made from synthetic content. For storage or API changes, demonstrate compatibility with existing readers and explicit failure handling rather than only a happy-path response.

## Reproduce bugs without private data

A useful report contains the operation, expected result, observed result, platform, relevant configuration names and a minimal reproduction. Record the affected application build in the report even though ordinary usage guides avoid patch-specific wording.

Replace conversation text, account fields, names, email addresses, source paths and identifiers with synthetic equivalents while preserving the failing shape. Never publish real exports, API keys, `.env`, databases, uploaded originals, logs containing conversations or screenshots of private threads. When an import format fails, add a small fixture and a regression that demonstrates the issue before changing the adapter.

Keep source inputs read-only. Do not repair parser behavior by rewriting the user's original export. Keep intended preservation limits clear when a source format cannot be represented fully.

## Review API and storage effects

Preserve stable source identities, published API fields and existing Reader pagination. Make additions explicit and avoid treating a partial result as complete. Process coordination must remain valid across the HTTP server, MCP and CLI tools sharing a store. Document schema, storage-path, environment, cancellation or network changes together with their tests.

Check the staged file set before submitting. Runtime caches, local Node installations, credentials and generated user stores do not belong in source releases. Enhanced distributes source ZIP and TAR.GZ archives and keeps its npm package private; do not re-enable an inherited npm-publishing workflow.

## Security reports and licensing

Use [private vulnerability reporting](https://github.com/Davoda1/ThreadShelf-Enhanced/security/advisories/new) when enabled. Otherwise, open an issue requesting a private channel without disclosing exploit details or sensitive data. Include a synthetic reproduction and the affected route or feature.

Enhanced retains ThreadShelf's MIT license and attribution to Chrystian Schutz and contributors; Enhanced modifications and adapted Local Suite components retain their own public attribution under the corresponding notices. Preserve copyright and license texts when modifying or redistributing covered code. Optional models, speech runtimes and bundled libraries have separate license terms; do not describe every downloadable component as MIT. The repository's license and third-party notices are the authoritative texts.

## Source references

- [Contribution guide](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/CONTRIBUTING.md)
- [Development scripts](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/package.json)
- [Security reporting and privacy policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md)
- [MIT license](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/LICENSE)
- [Third-party notices](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/THIRD_PARTY_NOTICES.md) and [speech attribution](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/tts/ATTRIBUTION.md)
