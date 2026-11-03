# Privacy and security

ThreadShelf Enhanced stores and searches conversation archives locally. Parsing, embeddings and the main search path do not require a cloud vector database or external embedding API. Optional remote generation, speech, image loading and setup downloads introduce separate network boundaries that should be understood before enabling them.

## What stays local and what can leave

| Feature | Data boundary |
| --- | --- |
| Import, archive storage and search | Processed on the ThreadShelf server; initial embedding-model download may require network access |
| Managed llama.cpp or loopback Strata | Inference on the server computer |
| OpenRouter/custom remote generation | Selected prompt, user/assistant history, master prompt and enabled tool context can go to that provider |
| Pocket/Kokoro speech after installation | Synthesis on the server CPU |
| Self-hosted or external speech | Selected speech text goes to the configured endpoint |
| External images | Contact their host when clicked or when automatic image loading is explicitly enabled |
| Runtime/model setup | Requests release metadata and approved downloads from the relevant distribution services |
| MCP | Connected clients can read the archive and any enabled note scope exposed by its tools |

A LAN provider is off-device even when both computers are on the same trusted network. Local processing describes where work happens, not automatic encryption at rest or authenticated multi-user access.

## Keep the network boundary deliberate

The supplied configuration binds the main server to `127.0.0.1`. For use on one computer, retain that setting. Changing `HOST` to a network-facing address makes archive routes reachable subject to the host/origin checks and surrounding network policy.

`ALLOWED_HOSTS` validates the requested hostname or IP address; it is not a list of authenticated people or permitted client source addresses. Browser requests normally require the exact server origin. An explicit `ALLOWED_ORIGINS` list can support a deliberate proxy/frontend arrangement, but it is not a replacement for login or network controls.

The separate model API has its own enable switch, listener settings and key. Its key does not add authentication to the archive interface or main archive API.

| Setting | Permission granted when explicitly enabled |
| --- | --- |
| `ALLOW_LAN_AI=1` | Full AI management, including chat, model setup, folder browsing and connected-vault controls |
| `ALLOW_LAN_TTS=1` | Full speech management, including setup, provider credentials, recordings and playback |

Both default to disabled, and only the value `1` enables them. Restart after editing configuration; an exported process variable can override `.env`. These flags are independent and are neither authentication nor subnet filters. Use a trusted network or authenticated access boundary appropriate to everyone who can reach the admitted server address. The [network guide](/network-access/) distinguishes the archive interface, management controls and `/v1` listener in detail.

## Protect local files and backups

Real exports, uploaded sources, databases, `.collections.json`, `.threadshelf`, `.env`, logs and temporary data can contain conversation text, file paths or credentials. Keep them out of public repositories and bug-report attachments. Derived lexical caches and saved speech recordings also contain private archive information.

A complete backup must preserve the configured data locations and associated metadata, not only a selected LanceDB table. Stop server, MCP, importer and watcher processes first; active writers can leave an inconsistent copied snapshot. Keep configuration and external Markdown vault backups alongside the archive backup policy. Follow [backup and migration](/backup-migration/) for the actual stopped-copy procedure.

Protect the data directory using operating-system access controls and, where required, encrypted storage. Speech credential encryption is narrowly scoped; it does not encrypt conversations, uploads, the full settings directory or every key the application can store.

## Credentials and private chat

Generation provider keys supplied in Settings are held for the server session; environment keys can persist through deployment configuration. The public settings response reports whether a key exists rather than returning its value. A custom compatible provider's session key is bound to its configured endpoint, so changing that endpoint does not reuse the previous session key.

Optional saved speech credentials use AES-256-GCM with a scrypt-derived passphrase key. The passphrase is not stored and saved credentials lock after restart. Keep `.env` and saved API configuration protected even when a separate speech key store is encrypted.

Private conversations keep message history, draft and interrupted-response recovery in browser memory and disappear on a full reload or tab close. Private speech bypasses recording caches. This mode does not stop an external provider from receiving a request sent to it, and it does not undo a separately approved edit to a Markdown note.

## Imported content and images

Imported HTML is parsed as data instead of executed as an export script. The renderer supports known rich structures and retains readable fallbacks for unsupported content. Local image resolution is confined to supported image companions within the selected source/ZIP and rejects unsafe paths and unsupported content.

Remote images contact an external host when loading is requested by a click or the automatic-loading preference. Server-side retrieval validates public HTTP(S) destinations, redirects and image signatures/sizes; it does not forward browser cookies, credentials or referrers. Optional image-cache bytes remain separate from the archive. Loading an image still makes a request to its host and may reveal the server's network address.

Retain original exports. Normalization does not promise to preserve every future provider feature or attachment in a fully renderable form, and an inert fallback is preferable to executing unknown exported content.

## Notes, tools and untrusted source text

Archive tools are read-only and bounded. Markdown folders must be connected explicitly and start with writes disabled. Interactive chat changes require persistent folder write permission plus an exact-content browser approval; revision checks prevent silently overwriting a newer note. Source text cannot grant itself permission to write.

MCP create/edit uses the current persistent vault write policy without the browser approval step. Connect only clients intended to receive that access, and leave writes off for reading-only integrations. Enabled tool results may be transmitted to a remote generation provider as request context. See [Markdown notes](/markdown-notes/) and [MCP](/mcp/) for scope and recovery details.

## Report an issue safely

For an ordinary bug, provide reproduction steps, the affected operation, relevant application/runtime versions and a small synthetic example in [GitHub Issues](https://github.com/Davoda1/ThreadShelf-Enhanced/issues). Reproduce with test data before sharing logs or screenshots. Remove secrets and private content rather than relying on a large archive to explain the problem.

For a suspected vulnerability, use [private vulnerability reporting](https://github.com/Davoda1/ThreadShelf-Enhanced/security/advisories/new) if available. Otherwise request a private reporting channel without publishing exploit details or sensitive data. The repository's security policy remains authoritative for reporting.

## Source references

- [Repository security and privacy policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md)
- [Independent feature-management permissions](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/feature-access.ts)
- [Host and browser-origin checks](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/local-origin.ts)
- [Generation configuration and credential handling](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/config.ts)
- [Server image-cache boundary](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/image-cache.ts)
- [Speech storage and access behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/TTS.md)
