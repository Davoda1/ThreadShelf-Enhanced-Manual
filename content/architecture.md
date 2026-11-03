# Architecture

ThreadShelf Enhanced combines a local conversation archive, several retrieval interfaces and optional generation and speech services. The archive remains useful without an LLM: import processing, local embeddings, storage and search form an independent path.

## The archive pipeline

| Stage | Responsibility | Main implementation |
| --- | --- | --- |
| Input detection | Recognize supported JSON, HTML and ZIP exports and their companion media. | `src/parser.ts`, `src/enhanced-import/` |
| Normalization | Convert provider-specific messages into turns while retaining source identity and available raw conversation data. | Parser and import adapters |
| Staging | Bound memory use through disk-backed records, replay and controlled batches. | `src/import-storage-stage.ts` |
| Chunking | Create focused search documents from normalized turns. | `src/chunking.ts` |
| Embedding | Generate multilingual vectors locally. | `src/embedding.ts` |
| Publication | Expose a matching archive generation and vector table together. | `src/storage-publication.ts` |
| Retrieval | Serve search results, complete threads and statistics. | `src/store.ts`, `src/services/` |

The embedding model is `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, producing 384-dimensional vectors. First use may download its files. Once available, the model executes locally. Its identity includes model inputs so embedding reuse is not assumed merely because a filename or dimension matches.

## Conversations and search chunks

A normalized turn carries one of the text roles `user`, `thinking` or `ai`, plus available metadata. A conversation is identified by its collection, source file and conversation key. The collection is a logical namespace; internal physical tables can have generation-specific names.

LanceDB stores both vectors and normalized conversation records. The internal thread store allows complete conversations to remain readable after original exports move or disappear. Older collections can still need their original files until reindexed. Listing conversations starts from both normalized thread records and indexed sources, so a conversation can appear before its search chunks are ready.

Raw data and source identity are retained separately from the rendered view. This improves preservation without making normalized exports byte-for-byte reproductions. Unknown widgets, unselected branches or attachments may have no complete visual representation; the original export remains the authoritative source backup.

## Durable jobs and atomic publication

Accepted imports are persisted as jobs with progress, cancellation and recovery state. The browser's progress stream is an observer, not ownership of the work. Closing the tab after acceptance does not cancel processing; the explicit Cancel action does. See [Background jobs](/background-jobs/).

Replacement imports prepare a new archive/index generation while the existing published collection remains readable. A small SQLite transaction updates the active mapping only when the replacement can be published. Readers take publication snapshots, and read leases protect retired generations still in use. These mechanisms prevent an unfinished replacement from appearing as a complete new archive.

SQLite also supplies durable job metadata, staging and operating-system-backed coordination. It does not replace LanceDB as the conversation/vector store. Sidecars are part of a consistent installation: copying only visible LanceDB table directories is insufficient for backup.

The memory governor considers heap, native/process memory and effective host or container headroom. It can adjust work, pause or fail explicitly. Bounded processing does not guarantee an import will fit on every host; replacement data, staging and retained generations require free disk space as well as memory.

## Search execution

Semantic search performs exact cosine retrieval over eligible chunks. Keyword mode finds case-insensitive literal substrings. Hybrid runs independent lexical and semantic branches, fuses their ranking and applies conversation diversity. Filters are applied before candidate selection; all-collection search shares one query embedding and publication snapshot.

Hybrid's SQLite lexical sidecar is derived data under the configured database directory. If the cache is unavailable, corrupt, busy or over budget, retrieval falls back to a complete lexical scan. The cache contains archive text, so it remains private data even though it is rebuildable.

The ordinary HTTP search response is bounded to 50 results. Reader search is a separate compatibility contract with stable cached snapshots, exact totals and cursor pages. It retains semantic/keyword modes. Neither a top-result count nor a similarity score should be presented as a measure of archive completeness or answer accuracy.

## Interfaces and process boundaries

| Interface | How it runs | Primary responsibility |
| --- | --- | --- |
| React web client | Browser assets served by the main server | Import, search, read, configure and interact with optional services. |
| `/api` | Express on the main port | Archive and application operations. |
| `/v1` | Main-port loopback access; optional separate network listener | Local model inference and installed local speech. |
| MCP | A separate stdio process | Archive tools and connected Markdown-note tools. |
| CLI | Local Node processes | Parse, import, search and maintenance operations. |

All store users must resolve the same paths and use a compatible build. One HTTP server and one active indexing operation are allowed per database. Collection reservations prevent conflicting mutations during a clear import; unrelated collections remain available. Lock acquisition waits only within bounded limits and fails explicitly if ownership cannot be obtained. Network-mounted database storage is not a validated deployment mode.

Stop the HTTP server, MCP clients, importers and watchers together for upgrades or backups. See [Compatibility](/compatibility/) and [Backup and migration](/backup-migration/).

## Optional services

Conversation generation uses provider adapters. Managed llama.cpp runs on a loopback port, while selected external providers receive the approved request context. Saved-chat writes use per-chat coordination and persist completed responses; private browser conversations remain in memory. The local `/v1` relay does not save requests as chats or automatically apply the web master prompt.

Markdown vaults remain live filesystem notes rather than imported conversation tables. Reads, writes, revisions and browser approvals follow their own policy. Speech has independent settings, engine assets and caches. Optional remote images use a constrained proxy and a separate image cache. These paths have different persistence and network boundaries, explained in [Privacy and security](/privacy-security/).

## Source references

- [Repository architecture notes](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/ARCHITECTURE.md)
- [Embedding implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/embedding.ts) and [storage](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/store.ts)
- [Publication snapshots](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/storage-publication.ts) and [read leases](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/storage-read-leases.ts)
- [Import jobs](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/import-jobs.ts) and [index coordination](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/indexing-coordinator.ts)
- [Search service](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/services/search.ts) and [lexical cache](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/lexical-sidecar.ts)
