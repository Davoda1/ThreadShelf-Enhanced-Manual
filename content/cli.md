# Command-line reference

Enhanced provides commands for parsing exports, importing folders, searching the archive and starting integrations. Run npm commands from the source root with a compatible Node/npm runtime. The project-local setup scripts are the recommended installation path; see [Installation](/installation/).

These instructions target Enhanced source. The upstream `npx threadshelf` package is a separate distribution and should not be used as an installation shortcut for this fork.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the main server, normally on port 3000. |
| `npm start -- 3002` | Start the main server on another port. |
| `npm run dev` | Watch server source during development. |
| `npm run dev:client` | Start the client development server. |
| `npm run build` | Compile the web client and server. |
| `npm run parse -- FILE` | Print normalized turns from one export. |
| `npm run ingest -- FOLDER COLLECTION` | Import a server-local folder. |
| `npm run search -- "QUERY"` | Search the local archive. |
| `npm run mcp --silent` | Start the MCP stdio server from the source root. |
| `npm run setup:llama` | Inspect local llama.cpp discovery. |

The first `--` after an npm script separates npm options from script arguments. The examples below retain the repository's additional `--` before CLI flags. Quote paths and queries containing spaces.

## Parse without indexing

```bash
npm run parse -- '/srv/exports/example.json'
npm run parse -- '/srv/exports/example.json' -- --no-thinking
```

The parser prints a JSON array of normalized turns to stdout. `--no-user`, `--no-thinking` and `--no-ai` exclude the corresponding roles. This command inspects a supported export without creating a collection or embedding its content. Parsing errors are written to stderr and produce exit status 1.

Use synthetic samples when diagnosing formats for public reports. Parsing successfully confirms that a particular export shape is recognized; it does not prove every attachment or display element can be represented by the reader.

## Import a folder

```bash
npm run ingest -- '/srv/exports' example_archive
npm run ingest -- '/srv/exports' example_archive -- --watch --debounce 2000
```

The collection defaults to `chunks` when omitted. Normal imports update matching source identities; they are not append-only copies. `--watch` monitors subsequent file changes after the initial import. `--debounce` sets the non-negative delay in milliseconds, with a default of 2000.

`--clear` requests replacement of the selected collection. Review the [background-job and publication rules](/background-jobs/) before using it. A valid replacement is staged before publication, while additive imports can preserve completed sources when other files fail.

Progress and diagnostics go to stderr; a completed job prints its structured result to stdout. A completed run exits 0 without reported import errors, 2 when its result includes source errors, and 1 for a failure. The underlying CLI requests explicit job cancellation on interruption. Its cancelled path prints a cancellation diagnostic to stderr, produces no final result JSON and exits 0; automation must not interpret exit 0 alone as a completed import.

## Search options

```bash
npm run search -- 'ERR_CACHE_MISS' -- --mode keyword --collection example_archive --json
npm run search -- 'How were cached answers refreshed?' -- --mode hybrid --n 12
```

| Option | Meaning |
| --- | --- |
| `--collection NAME` | Named collection or `all`; default `all`. |
| `--mode MODE` | `semantic` (default), `keyword` or `hybrid`. |
| `--roles user,ai` | Comma-separated role subset; `thinking` is also supported. |
| `--model TEXT` | Case-insensitive model substring filter. |
| `--from DATE`, `--to DATE` | Inclusive ISO timestamp or UTC date bounds. |
| `--n COUNT` | Result limit, 1–50; default 10. |
| `--json` | Return structured JSON instead of the readable list. |

The CLI uses exact-phrase boosting in semantic mode. It has no cursor-pagination option. Hybrid results can be lexical-only and lack a distance value; absence of a score is meaningful. The command exits 0 for a successful empty search and 1 on validation or execution failure. See [Search](/search/) for retrieval behavior.

## Environment loading

The HTTP server loads the installation's `.env`. The direct parse, ingest, search and MCP script entry points do not automatically do so. Export needed variables in the shell, configure them in the process manager, or use Node's explicit environment-file option with built output:

```bash
node --env-file=.env dist/src/search-cli.js 'cache failure' --mode hybrid
```

Run this from the installation root and use the installed project's Node executable when `node` is not available globally. Explicit process environment retains precedence. Match the server's data paths before importing or searching; setting a new `THREADSHELF_DATA_DIR` changes the storage layout as explained in [Configuration](/configuration/).

## Linux launcher and manual importer

After setup, the Linux launcher uses the project-local runtime and explicitly loads `.env`:

```bash
./threadshelf-enhanced --check-runtime
./threadshelf-enhanced
./threadshelf-enhanced --index '/srv/exports' example_archive
```

It also supports `--help`, `--version`, and `--clear` with `--index`. `THREADSHELF_ENHANCED_DIR` selects the installation when necessary. It starts the compiled server or importer directly; the normal launcher is not the interactive import wizard.

The optional Bash importer provides a reviewed plan and resource checks:

```bash
bash manual-importer.sh --import-dir '/srv/exports' --dry-run
bash manual-importer.sh --non-interactive \
  --import-dir '/srv/exports' --collection example_archive --no-clear --yes
```

`--health` and `--dry-run` inspect without importing. Its default heap allowance is 4096 MiB, which is not a cap on total process memory. Use `--help` for source-copy, reserve and disk-space controls. Its own interruption exit statuses differ from the underlying ingest CLI.

## Runtime setup and migration

`npm run setup:llama` performs local discovery; `npm run setup:llama -- -- --check` reads upstream release metadata. Runtime installation uses an explicit `--install` operation and its confirmation flow. See [Local models](/local-models/) before choosing accelerator builds.

Migration uses `scripts/migrate-installation.mjs` with explicit `--source` and `--target` paths. `--audit-only` inspects dependencies without copying; an actual copy requires `--stopped` after all store users have stopped. Follow [Backup and migration](/backup-migration/) rather than copying individual database tables.

## Source references

- [npm scripts](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/package.json)
- [Parse CLI](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/cli.ts), [ingest CLI](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/ingest-cli.ts) and [search CLI](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/search-cli.ts)
- [Linux launcher](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/threadshelf-enhanced) and [manual importer](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/manual-importer.sh)
- [Migration implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/scripts/migrate-installation.mjs)
