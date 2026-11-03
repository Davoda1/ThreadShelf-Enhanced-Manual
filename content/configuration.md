# Configuration reference

ThreadShelf Enhanced separates startup environment settings from preferences managed in the web interface. The setup scripts preserve existing configuration. Review the `.env` belonging to the installation actually being started, then restart the server after changing startup values.

## Precedence and scope

An explicitly supplied process environment variable takes precedence over `.env`. A service manager, shell session or container can therefore override a value edited in the file. The command-line server port also takes precedence over `PORT`.

For a standard source installation, `.env` sits beside the setup scripts. With an explicit external data root supplied before startup, the shared path resolver also resolves configuration under that root. Keep HTTP, MCP and CLI processes pointed at the same intended data locations. Use absolute paths for external storage to avoid ambiguity between launch environments.

The HTTP server loads this file automatically. Direct MCP and CLI entry points need matching process environment variables or an explicit Node `--env-file` argument; they do not inherit the running server's configuration. See [MCP](/mcp/) and [Command-line reference](/cli/) for examples.

Preferences such as AI provider settings, speech controls and note-folder permissions are saved through the application. Prefer their supported settings screens over editing generated JSON while the server runs.

## HTTP and trusted-network access

| Variable | Default or empty behavior | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Address on which the main HTTP server listens |
| `PORT` | `3000` | Main HTTP port |
| `ALLOWED_HOSTS` | Template: `localhost,127.0.0.1`; built-in loopback hosts are also recognized | Comma-separated permitted request hostnames/IPs, without schemes or ports |
| `ALLOWED_ORIGINS` | Empty; exact same-origin browser requests accepted | Explicit full browser origins for deliberate proxy/frontend configurations |
| `ALLOW_LAN_AI` | Disabled unless the trimmed value is exactly `1` | Permit full AI/model and connected Markdown-vault management through allowed network access |
| `ALLOW_LAN_TTS` | Disabled unless the trimmed value is exactly `1` | Permit full speech management and playback through allowed network access |

The main archive UI/API has no user account system. Host/origin checks and feature permissions do not provide authentication. The optional model API has a separate listener and key policy. See [Network access](/network-access/) before enabling remote use.

## Storage paths

These defaults describe the normal source-release layout:

| Variable | Default | Stored material |
| --- | --- | --- |
| `THREADSHELF_DATA_DIR` | Source installation directory | Common data root; setting it changes the layout as explained below |
| `LANCEDB_PATH` | `.lancedb` | Archive rows, vectors, publication/job metadata and coordination sidecars |
| `UPLOADS_DIR` | `.uploads` | Browser-uploaded exports and media |
| `COLLECTIONS_PATH` | `.collections.json` | Manual collection registry |
| `GENERATION_CONFIG_PATH` | `.threadshelf/generation.json` | Generation preferences |
| `MASTER_PROMPTS_PATH` | `.threadshelf/master-prompts.json` | Saved master prompts |
| `OBSIDIAN_CONFIG_PATH` | `.threadshelf/obsidian.json` | Connected Markdown-vault configuration |
| `THREADSHELF_MODELS_PATH` | `.threadshelf/models` | Catalog-downloaded generation models |
| `THREADSHELF_TOOLS_PATH` | `.threadshelf/tools` | Managed local generation runtime builds |
| `THREADSHELF_MODEL_CACHE` | `.threadshelf/model-cache` | Search embedding-model files |
| `THREADSHELF_IMAGE_CACHE_PATH` | `.threadshelf/image-cache` | Optional disposable external-image cache |
| `GENERATION_ERROR_LOG_PATH` | `.threadshelf/generation-errors.log` | Optional rotating generation error log |

Speech uses `.threadshelf/tts` in this layout. It includes settings, installed voice assets, encrypted credentials and optional saved recordings.

**An explicit `THREADSHELF_DATA_DIR` uses a flat data layout.** Its defaults are `lancedb/`, `uploads/`, `collections.json`, `generation.json`, `master-prompts.json`, `obsidian.json`, `models/`, `tools/`, `model-cache/`, `image-cache/`, `tts/` and `.env` directly under that root. Do not assume that copying `.lancedb` and `.threadshelf` unchanged beneath a new root migrates it correctly. Individual explicit path overrides take precedence for their respective resources.

Changing a path does not copy data. Plan storage moves using [Backup and migration](/backup-migration/), including all external model and note locations.

## Import and search resources

| Variable | Default | Effect |
| --- | --- | --- |
| `EMBED_BATCH_SIZE` | `25` | Requested maximum embedding batch; governor can reduce actual work |
| `CHUNK_MAX_CHARS` | `2000` | Target chunk size, with a minimum accepted effective value of 200 |
| `CHUNK_OVERLAP_CHARS` | `100` | Text overlap between chunks |
| `THREADSHELF_MEMORY_RESERVE_MB` | Adaptive host/container reserve | Optional memory headroom override in MiB |
| `THREADSHELF_PROCESS_MEMORY_MB` | Adaptive process budget | Optional process resident-memory budget in MiB |
| `THREADSHELF_LEXICAL_CACHE` | Enabled | Set to exactly `0` to disable the disposable lexical sidecar |

The optional manual importer has its own `--heap-mb` argument (default `4096`) and `--reserve-mb` startup check. These are command-line options, separate from the server memory governor.

The memory overrides accept finite values from 128 to 1,048,576 MiB and are still clamped by effective system memory. They are not reserved allocations. Chunking changes affect future indexing; they do not rewrite existing indexed chunks simply by restarting. Keep defaults unless a measured workload justifies a change.

## Optional generation and download settings

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Environment key for optional OpenRouter generation |
| `OPENROUTER_BASE_URL` | Override the OpenRouter API base; defaults to its public API |
| `OPENAI_COMPATIBLE_BASE_URL` / `OPENAI_COMPATIBLE_API_KEY` | Endpoint and key for the configurable compatible provider |
| `STRATA_BASE_URL` / `STRATA_API_KEY` | Strata endpoint and optional key; default endpoint is `http://127.0.0.1:8080` |
| `LLAMA_CPP_SERVER` / `LLAMA_SERVER_PATH` | Explicit local llama.cpp executable selection |
| `LLAMA_MODEL_PATHS` | Additional model roots; `:` separated on Linux and `;` separated on Windows |
| `THREADSHELF_DISABLE_DEFAULT_MODEL_PATHS` | `1` disables default model-root discovery locations |
| `THREADSHELF_API_KEY` | Environment-provided key for the optional model API |
| `HF_TOKEN` / `HUGGING_FACE_HUB_TOKEN` | Token for gated Hugging Face access; normal public catalog browsing needs no token |
| `GITHUB_TOKEN` / `GH_TOKEN` | Optional higher GitHub API rate limit for runtime release discovery |

Selecting a remote generation or speech provider sends the relevant request content to that provider. Keep populated environment files and generated credential storage out of source control.

## Runtime setup settings

`THREADSHELF_NODE_VERSION` and `THREADSHELF_NPM_VERSION` select setup runtimes. Supply them in the invoking environment or use setup arguments; the launcher selects its Node binary before loading the application `.env`. `THREADSHELF_ENHANCED_DIR` selects the installation used by the Linux launcher. Setup stores its npm/cache material locally and defaults optional ONNX CUDA installation to skipped; deliberately selecting `ONNXRUNTIME_NODE_INSTALL=cuda12` changes that setup choice.

Setup and the launcher respect pre-existing `XDG_CACHE_HOME` and `HF_HOME`. External cache overrides are additional dependencies to include in storage planning; project-local runtime setup does not imply every optional integration writes only inside the extraction directory.

## Source references

- [Environment template](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/.env.example)
- [Shared data-path resolver](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/paths.ts)
- [Environment loading](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/load-env.ts)
- [Generation configuration](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/config.ts)
- [Memory governor](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/memory-governor.ts)
- [Chunking configuration](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/chunking.ts)
