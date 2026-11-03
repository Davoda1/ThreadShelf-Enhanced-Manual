# Security policy

This repository contains a static documentation website and its build/preview tools. It does not run the ThreadShelf Enhanced archive server, AI providers, speech engines or credential store. Security issues in those application components should follow the [ThreadShelf Enhanced security policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md).

## Scope

Relevant issues here include executable content introduced through documentation rendering, unsafe navigation or asset URLs, preview-server filesystem exposure, build/dependency compromises and publication-workflow permission errors.

The handbook is a trusted build input. The renderer escapes raw HTML and rejects executable URL schemes, but those protections do not make arbitrary third-party source safe to build or publish without review. Review dependency and workflow changes along with application code.

Documentation search runs in the browser, and the site stores its theme preference in browser local storage. The website has no conversation database or provider-key entry flow. Do not add private server exports, environment files, credentials or recordings as documentation fixtures.

## Report a vulnerability

Use [GitHub private vulnerability reporting for this repository](https://github.com/Davoda1/ThreadShelf-Enhanced-Manual/security/advisories/new) **if it is enabled**.

If private reporting is unavailable, open an issue asking the maintainers for a private reporting channel. Do not include exploit details, credentials, private records or sensitive paths in that initial issue. No separate security email address is designated by this policy.

A useful private report identifies the affected commit, component, prerequisites, expected boundary, observed behavior and a minimal synthetic reproduction. Include relevant platform or browser details and any proposed fix. Keep real conversation data and account information out of the reproduction.

Ordinary content errors and non-security interface bugs can use the repository's normal issue process with synthetic examples.

## Development and preview

Use the locked dependencies and run `npm run verify` before submitting a candidate. Review any failed public-content, rendering, filesystem-boundary or dependency check; do not hide it by dropping the check.

The preview server binds to loopback by default and is intended for local inspection of generated static output. It is not an authentication service. If a different host is explicitly selected, access is governed by the surrounding machine and network configuration. Serve only the intended static output directory.

Tests involving symbolic links may be skipped where the operating system or account cannot create them. A skip is a coverage limit, not a successful security assertion. See [TESTING.md](TESTING.md).

## Publishing

CI validation and build artifacts do not publish a live site. Pages publication is a separate manual workflow: its `publish` input defaults to `false`, and deployment requires `publish=true`, the `master` branch and an already-public repository. The workflow does not change repository visibility.

Before deliberate publication, review generated content, source provenance, bundled assets, dependency notices and workflow permissions. Never place private archives or secrets in `public/` or `dist/`; a static host can serve those files directly.

Security maintenance targets the current `master` source. This policy does not promise a response deadline or separate maintenance branches for older snapshots.
