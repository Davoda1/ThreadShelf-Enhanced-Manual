# Testing the documentation website

The verification workflow checks the documentation source, pure rendering/search/navigation behavior, the local static server and the generated website. It does not run the ThreadShelf Enhanced application or certify the behavior of its providers and models.

## Full local verification

From the repository root, with Node.js 24 or newer and a compatible npm:

```bash
npm ci
npm run verify
```

`verify` runs these steps in order:

1. `npm run check:public`
2. `npm test`
3. `npm run build`
4. `npm run check`

A failure stops the sequence. Resolve its reported cause before treating the candidate as ready. The lockfile is part of the candidate; use `npm ci` rather than silently substituting a different dependency graph.

## Automated layers

| Layer | Main coverage |
| --- | --- |
| Public-content checks | Private artifacts, sensitive material and source-distribution hygiene |
| `test/public-hygiene.test.mjs` | Secret and private-path detection without disclosing matches; legitimate AI product terminology and safe examples remain allowed |
| `test/docs.test.mjs` | Catalog/article correspondence, unique slugs, required source footers, useful search results, exact environment-variable tokens, query normalization and exclusion of citation-only text |
| `test/markdown.test.mjs` | Escaped raw HTML and code, blocked executable URL schemes, external-link attributes, relative internal links/assets, unique heading IDs and accessible table markup |
| `test/navigation.test.mjs` | Page/asset URLs, root and nested prefixes, explicit `index.html` paths, history normalization and malformed or encoded paths |
| `test/serve.test.mjs` | Real HTTP requests to an isolated preview server: routes, assets, redirects, GET/HEAD, missing paths, method restrictions, UTF-8 names and filesystem-boundary protections |
| Production build | Bundled browser assets, complete pre-rendered pages and basic search assertions |
| Built-site check | One H1 per guide, rendered content, unique IDs, local links/assets/anchors at root and nested prefixes, navigation coverage, source references and sample JSON |

The Node test runner uses a concurrency of one for the top-level test files. Static-server tests create synthetic temporary files, request an operating-system-assigned port and stop their child server during cleanup. They do not use a live archive or a fixed shared test port.

Filesystem-link cases can be skipped when an operating system or account cannot create the required link. Read skip reasons separately from passing assertions; a skipped case is not evidence that the behavior was exercised on that platform.

## Focused commands

Run all source-level tests without rebuilding:

```bash
npm test
```

Run one affected layer:

```bash
node --test test/markdown.test.mjs
node --test test/navigation.test.mjs
node --test test/serve.test.mjs
```

After changing content, assets, rendering or routing, regenerate and validate the output:

```bash
npm run build
npm run check
```

`npm run check` examines an existing `dist/`; running it before a new build can validate stale output. Use `npm run verify` for the final candidate.

CI performs the verification workflow with Node 24 on Linux and Windows. Dependency auditing is a separate check of published advisories; it does not validate prose or replace functional tests. A downloadable build artifact is suitable for local inspection and does not constitute a deployment.

## Manual browser smoke checklist

Build the current source, run `npm run preview`, and open the printed loopback URL. Repeat the routing checks beneath a project prefix:

```bash
node scripts/serve.mjs dist --prefix /example-docs/ --port 4173
```

Use this checklist when changing the interface or navigation:

- Open the home page and a direct guide URL. Refresh the guide, follow an in-page heading link, and use browser Back and Forward.
- Open documentation search with its button and **Ctrl+K** or **Command+K**. Search for a title, `ALLOW_LAN_TTS`, and a nonexistent term. Check arrow-key selection, Enter, Escape and focus behavior.
- Navigate using only the keyboard. Check the skip link, visible focus, menu controls and table scrolling.
- Switch among system, light and dark themes, then reload. Confirm that text, controls and code remain readable.
- At a narrow viewport, open and close navigation, choose a guide, and inspect long commands and tables for usable scrolling without page-wide overflow.
- Copy a code block and paste it into a plain-text editor. Confirm that the copied text matches the displayed source.
- Change the interactive search-method choice and confirm that its explanation and selected state update.
- Open the print preview for an article and check that its content remains readable without navigation obscuring it.
- Disable JavaScript and reload a direct guide URL. Confirm that its pre-rendered article and ordinary links remain available; interactive search and controls require JavaScript.

These are manual acceptance steps, not claims of automated browser coverage. Report which checks were performed, platform/browser details relevant to a failure, and any untested cases.

## Review facts separately

Tests can detect broken links or unsafe markup; they cannot establish that a server setting, import ceiling or API example still matches Enhanced. Review the cited source when changing such claims, preserve exact command/field names, and update `SOURCE-REFERENCE.json` after reviewing a new application snapshot.

Use only synthetic examples in regressions and reports. Do not attach server databases, populated environment files, provider keys or private conversations. Follow [SECURITY.md](SECURITY.md) for security-sensitive findings.
