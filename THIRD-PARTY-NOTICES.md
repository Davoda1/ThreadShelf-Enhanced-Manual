# Third-party notices

## ThreadShelf and ThreadShelf Enhanced

This handbook documents [ThreadShelf Enhanced](https://github.com/Davoda1/ThreadShelf-Enhanced), a distinct fork of [ThreadShelf](https://github.com/ChrystianSchutz/ThreadShelf). The software repository retains MIT licensing and the original copyright notice for Chrystian Schutz. Public maintainer and contributor credits remain with their respective project notices.

Enhanced modifications: Copyright (c) 2026 davoda1, licensed under the same MIT terms reproduced in `licenses/ThreadShelf-LICENSE.txt`. This supplements the original upstream copyright, as recorded in the source project's `THIRD_PARTY_NOTICES.md`.

Documentation was written against the public source identified in `SOURCE-REFERENCE.json`. Screenshots and favicon are copied from that source. The original MIT license is preserved as `licenses/ThreadShelf-LICENSE.txt`. Article-level source references identify the relevant documentation and implementation.

The upstream documentation informed the information architecture. Its site theme and prose were not copied wholesale, and its npm installation instructions do not apply to the Enhanced source distribution.

## Bundled runtime dependencies

| Component | License | Preserved notice |
| --- | --- | --- |
| React | MIT | `licenses/react-LICENSE.txt` |
| React DOM | MIT | `licenses/react-dom-LICENSE.txt` |
| Scheduler | MIT | `licenses/scheduler-LICENSE.txt` |
| Marked | MIT | `licenses/marked-LICENSE.txt` |
| Lucide React icons | ISC; MIT for Feather-derived icons | `licenses/lucide-react-LICENSE.txt` |
| Rolldown runtime helpers | MIT, with retained Rollup and esbuild notices | `licenses/rolldown-LICENSE.txt`, `licenses/rolldown-THIRD-PARTY-LICENSE.txt` |

Dependency versions and integrity hashes are recorded in `package-lock.json`. Original copyright notices are retained in the listed files. System fonts are used; no font files are distributed.

The production JavaScript includes Rolldown's CommonJS/ES-module interoperability helpers. The locked Rolldown package's own license and accompanying third-party license file are preserved verbatim because these helpers are included in the website, even though Rolldown is installed through the build toolchain.

## Build tooling

Vite is used to compile the static website. Its license and third-party build-tool notices are preserved as `licenses/vite-LICENSE.txt`. Build dependencies are installed from the lockfile and are not included as a `node_modules` directory in the source archive.

Optional ThreadShelf model engines, voice packs, and provider services have their own licenses and terms. This documentation archive does not redistribute those engines or model weights.
