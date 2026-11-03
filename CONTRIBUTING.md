# Contributing to the manual

This repository maintains the documentation website for [ThreadShelf Enhanced](https://github.com/Davoda1/ThreadShelf-Enhanced). Changes should make the public handbook accurate, navigable and easy to maintain. Application bugs and changes belong in the application repository; documentation rendering, navigation and content corrections belong here.

## Prepare a change

Use Node.js 24 or newer and install the committed dependency graph:

```bash
npm ci
npm run dev
```

Target `master`. Keep the change focused, explain the reader's problem and describe the resulting behavior. Follow the repository's access and review settings; do not add a deployment branch or alter publication policy as part of an unrelated documentation change.

## Write for a public audience

Use direct instructions, explicit prerequisites and concrete examples. Explain when a command runs on the server computer rather than the browser's computer. Distinguish archive data, derived caches, optional AI/speech services and integration boundaries.

Content must stand alone for any reader. Exclude private conversations, account details, credentials, real exported chats, machine-specific paths and unpublished internal decisions. Use clearly fictional examples and generic paths. Product features involving AI models or assistants should be documented normally; the standard concerns private material and unsupported claims, not the feature vocabulary.

Keep limitations close to the affected instruction. In particular, distinguish a staged import replacement from direct deletion, a host/origin check from authentication, and private-chat persistence from remote-provider transmission.

## Ground factual claims

Treat the current Enhanced implementation as authoritative when inherited upstream prose differs. Inspect the relevant route, validator, setting or workflow before changing exact names, defaults, limits or behavior. Do not transfer upstream installation instructions or features to Enhanced without checking that they apply to this fork.

Every guide must contain one H1 and a `## Source references` section. Cite the public implementation or project documentation supporting the guide. Prefer direct relevant files over a repository-home link for detailed API or configuration claims. Preserve existing attribution for imported material and assets.

`SOURCE-REFERENCE.json` records the application commit reviewed and the provenance of bundled assets. Update that record when reviewing a different source snapshot. Do not update the recorded commit merely to imply that unreviewed code is covered.

## Avoid patch-version churn

Use stable task names in headings and navigation. Link routine downloads to the current release page instead of embedding a patch number in every procedure. Use the runtime selected by the application's setup scripts where possible.

A specific historical version still belongs in an explanation when it identifies a storage-protocol break, format contract or tested compatibility reference. Removing those distinctions can make upgrade guidance misleading. Version-neutral wording also does not excuse leaving changed defaults or capabilities unreviewed.

## Edit the right files

| Change | Location |
| --- | --- |
| Guide text | `content/*.md` |
| Navigation titles, descriptions and order | `src/catalog.js` |
| Markdown rendering or search semantics | `src/docs-core.js` |
| Content-loading integration | `src/docs.js` |
| Relative URLs and history-path handling | `src/navigation.js` |
| Interactive interface | `src/App.jsx` and related styles |
| Public examples or illustrations | `public/`, with provenance where applicable |
| Automated regressions | `test/` |

Use `/guide-slug/` for internal article links, `/media/filename.png` for local images and `/examples/filename.json` for downloadable examples. The renderer rewrites those paths beneath the publishing root. Raw HTML in Markdown is escaped; use supported Markdown structures instead.

When adding a guide, add its catalog entry and source footer. Check that it appears in navigation and search. Edit source files and regenerate `dist/`; do not patch a generated HTML page to create a source change.

## Validate and submit

Run:

```bash
npm run verify
```

For rendering, search, navigation or server changes, add a focused regression for the actual risk. Avoid tests that only repeat the implementation. Follow the manual interaction checklist in [TESTING.md](TESTING.md) when the interface changes, and state what was checked without implying that unperformed checks passed.

The change description should explain why it is needed, what readers will see, which sources support factual changes and how it was validated. Note skipped or platform-specific cases. Keep diagnostics synthetic and remove private values before sharing them.

Publication is separate from ordinary contribution and CI. The Pages workflow requires explicit manual authorization, `master` and an already-public repository. Do not change repository visibility, enable Pages or publish as a side effect of a content correction.

## License and security

Contributions are made under the repository's MIT license, subject to retained third-party notices. Preserve `LICENSE`, `THIRD-PARTY-NOTICES.md` and applicable files in `licenses/` when redistributing covered material.

Report suspected security vulnerabilities through the process in [SECURITY.md](SECURITY.md). Do not publish exploit details or sensitive data in an ordinary issue.
