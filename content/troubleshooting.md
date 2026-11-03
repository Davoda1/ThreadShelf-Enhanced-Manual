# Troubleshooting

Start with the smallest failing operation and its first concrete error. Distinguish startup, access, import, search, rendering and optional AI/speech problems: a healthy archive server does not imply that every optional model or provider is configured.

## Establish a baseline

From a browser on the server machine, open [http://localhost:3000/api/health](http://localhost:3000/api/health). A running server returns:

```json
{"ok":true}
```

On Linux, from the source installation:

```bash
./threadshelf-enhanced --check-runtime
```

This checks the selected local runtime and compiled entry points without starting a service. It does not test a remote provider, download an embedding model or validate every archived record.

Keep the terminal visible while reproducing the problem. Record the exact operation, affected provider/format, selected collection and first error. Remove sensitive text and paths before sharing diagnostics.

## Startup and setup

| Symptom | Likely check and next action |
| --- | --- |
| Missing `.env` | Run setup or copy `.env.example` beside the setup scripts, then review its settings |
| Launcher requests setup | Confirm the local runtime, compiled server/importer and installation directory; rerun the release's setup |
| Runtime works in setup but launcher cannot find it | Use the same `THREADSHELF_NODE_VERSION` if setup selected a non-default version |
| Downloaded Node cannot run | Check architecture and required OS libraries; a successful download is not proof of runtime compatibility |
| Windows script is blocked | Review and unblock the specific script; organization-managed policy still applies |
| Address already in use | Stop the existing listener or choose another port; do not start a second HTTP server on the same database |
| Database already owned | Stop the other HTTP server and inspect shared storage paths; changing only the port does not create an independent instance |
| Dependency or build failure | Keep the release's lockfile, use its setup runtime, and resolve the first installation/build error before starting |

A Linux runtime may need `libatomic.so.1` or other compatible system libraries. The project setup does not install operating-system packages. Do not fix a dependency problem by copying an unrelated `node_modules` directory from another machine.

## Browser and LAN access

A refused connection usually means no listener, a loopback-only bind, wrong address/port or a network boundary. A JSON 403 from the application means the request reached it but failed an access check.

| Message or behavior | Check |
| --- | --- |
| `Forbidden host` | Put the URL's actual hostname/IP in `ALLOWED_HOSTS`, without scheme or port |
| `Forbidden origin` | Check scheme, hostname and port; configure an explicit origin only for an intended proxy/frontend |
| Controls require localhost or `ALLOW_LAN_AI=1` | Enable the AI flag only for trusted access, then restart the correct server |
| Speech controls require localhost or `ALLOW_LAN_TTS=1` | Review the independent speech flag; the AI flag does not enable speech management |
| `.env` change appears ignored | Check exported variables, service-manager settings and which installation was restarted |
| `/v1` works but archive UI lacks a login | The model API key is separate; it does not authenticate the archive UI/API |

The localhost address in a remote browser belongs to that browser's machine. Read [Network access](/network-access/) for a complete headless setup.

## Imports and persistent jobs

**The browser closed but indexing continued.** This is expected after server acceptance. Return to Add data to observe the job or cancel it explicitly. Closing during upload is different: the transfer may not have completed.

**A file was skipped.** Read its reason. Unsupported structures, auxiliary account metadata and empty non-conversation exports can be skipped. A `.json` extension alone does not make a file supported. JSONL and encrypted Venice backups are unsupported.

**Duplicates appeared.** Check whether both `conversations.json` and `chat.html`, or native and converted copies, were imported. They can create distinct source representations. Test the intended representation separately before replacing an important collection.

**A replacement did not happen.** Inspect recognized malformed exports, integrity failures, cancellation and no-valid-conversation diagnostics. The previous collection is deliberately retained when preparation fails. A skipped auxiliary file alone does not stop an otherwise valid replacement.

**A large input failed or paused.** Check disk headroom, current `/api/memory` status and the format's whole-document/record limits. Reduce competing workloads or use supported conversation-array JSON. Raising the JavaScript heap limit is not a complete fix for process or host memory pressure.

**Upload cleanup is locked.** Active/interrupted work and some incompletely snapshotted failed jobs protect their inputs. Finish, cancel or explicitly abandon the corresponding retry through its job-history action before deleting uploads.

## Search and archive content

If results are empty, confirm the collection, completed job state, source/provider filters and enabled roles. Compare a known phrase in **Exact** mode with a broader topic in **Semantic** mode. Search hits are chunks; opening the thread provides the surrounding conversation.

First semantic indexing/search may need the embedding model to download and initialize. Optional AI chat models are separate from this search model; downloading a GGUF does not prepare archive embeddings.

For a search error about too many pending or invalid index entries (internally `INDEX_RECOVERY_REQUIRED`), inspect pending or invalid index diagnostics. Keep the server running for normal pending recovery, resolve the underlying issue and retain a backup before damaged-row investigation. Selecting another healthy collection can isolate the problem. Do not delete sidecars or the database to suppress the error. See [Background jobs](/background-jobs/).

## Images, generation and speech

| Problem | Action |
| --- | --- |
| Image remains a placeholder | Check click-to-load settings, preserved companion paths, supported raster format and size limits; external hosts can also be unavailable |
| Imported HTML widget does not behave like its original viewer | Export scripts are not executed; unsupported interactive content remains inert/readable |
| Local generation model is missing | Verify configured model roots and download location in AI Models; do not confuse embeddings with generation models |
| External provider rejects a request | Check endpoint, selected model, key and provider response; do not paste the key into a public report |
| CPU Audio test is disabled | Install and verify that selected Pocket/Kokoro engine; enabling speech alone does not download voices |
| Saved speech credential is locked after restart | Unlock it with its passphrase; the passphrase is not stored |
| Speech settings changed but a recording stays the same | A pinned recording or preferred saved API recording can take priority; review the cache policy before regenerating |
| Private conversation disappeared after the tab closed | Private chat state is held in browser memory and is not a persistent archive |

## Report a reproducible problem

Include the application version, operating system/architecture, import method or affected feature, exact steps, expected outcome and actual diagnostic. Use a tiny synthetic fixture preserving the relevant structure. Never attach a real conversation archive, populated `.env`, database, saved credentials or private screenshots to a public issue.

Report ordinary bugs in [GitHub Issues](https://github.com/Davoda1/ThreadShelf-Enhanced/issues). For a vulnerability, follow [the repository's security policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md) and request a private reporting channel when needed.

## Source references

- [Installation and network guide](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/README.md)
- [Job and recovery behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/IMPORT-JOBS.md)
- [Health endpoints](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/health.ts)
- [Speech lifecycle](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/TTS.md)
- [Security policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md)
