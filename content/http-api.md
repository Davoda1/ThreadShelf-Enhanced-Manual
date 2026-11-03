# Archive HTTP API

The archive API provides collection discovery, indexed search, complete conversations and import management. Its base is the main ThreadShelf Enhanced server, normally `http://localhost:3000`. It is separate from the [local model API](/model-api/) under `/v1` and from the [MCP stdio process](/mcp/).

## Access and request conventions

The server binds to loopback by default. Requests to `/api` pass Host and browser Origin checks. The archive API has no built-in user accounts or API-key authentication: a key configured for `/v1` does not protect it. Follow [Network access](/network-access/) before exposing the main server beyond its host.

JSON requests use `Content-Type: application/json`. The ordinary JSON-body ceiling is 512 KiB; Markdown-note routes have a separate 4 MiB parser allowance, and `/v1` has its own limit. Multipart import uploads follow the [import limits](/imports/).

Collection selectors normally default to `chunks` on the archive routes. Pass `collection=all` explicitly to search or list across collections. Names are normalized to lowercase identifiers containing letters, digits, underscores and hyphens, with a maximum of 63 characters. `all` is a selector, not a creatable collection.

## Discovery and reading

| Method and path | Input | Result |
| --- | --- | --- |
| `GET /api/health` | None | `{ "ok": true }`; confirms the HTTP process responds. |
| `GET /api/memory` | None | Current memory-governor status. |
| `GET /api/collections` | None | `{ "collections": [...] }`. |
| `GET /api/collections/:name/stats` | A collection name or `all` | File, chunk, role and collection statistics. |
| `GET /api/files` | Optional `collection` | `{ "files": [...] }`, with conversation identities and summaries. |
| `GET /api/thread` | `sourceFile`; optional `collection`, `conversationKey` | Stored conversation and normalized turns. |
| `GET /api/insights` | Optional `collection` | Aggregated archive insights. |

`/api/files` expands multi-conversation exports into individual entries. Preserve the returned `sourceFile`, `conversationKey` and `collection`; do not reconstruct identities from a title. The thread loader prefers normalized stored conversations and only falls back to the original indexed source for older data. It is not an arbitrary filesystem-reading endpoint.

```bash
curl --get 'http://localhost:3000/api/files' \
  --data-urlencode 'collection=all'

curl --get 'http://localhost:3000/api/thread' \
  --data-urlencode 'collection=example_archive' \
  --data-urlencode 'sourceFile=/srv/exports/example.json' \
  --data-urlencode 'conversationKey=REPLACE_WITH_RETURNED_KEY'
```

The source path and key above are illustrative. Use the exact values returned by the server. Omitting a key for a multi-conversation source can flatten its conversations into one turn array. Supply the key when opening one particular conversation.

## Bounded search

`GET /api/search` returns `{ "results": [...] }`. It provides the best bounded result set, not cursor pagination or a total count.

| Parameter | Contract |
| --- | --- |
| `q` | Required, nonempty string; at most 4,000 characters after trimming. |
| `collection` | Collection name or `all`; default `chunks`. |
| `n` | Integer from 1 to 50; default 15. |
| `mode` | `semantic` (default), `keyword` or `hybrid`. |
| `roles` | Comma-separated subset of `user,thinking,ai`. |
| `model` | Case-insensitive substring filter on model metadata. |
| `from`, `to` | Inclusive ISO dates or timestamps. Date-only bounds expand to the start/end of the UTC day. |
| `origin` | `threadshelf` or `archive`; omit for both. |
| `keywordBoost` | Boolean; default false. Preserves the semantic exact-phrase preference. |

```bash
curl --get 'http://localhost:3000/api/search' \
  --data-urlencode 'q=cache invalidation' \
  --data-urlencode 'collection=all' \
  --data-urlencode 'mode=hybrid' \
  --data-urlencode 'roles=user,ai' \
  --data-urlencode 'n=10'
```

Each result includes a document snippet and metadata for its source and turn. Semantic results can include `distance`; a lexical-only hybrid result may omit it. Never fabricate a similarity percentage for that case. Legacy single-collection semantic/keyword responses omit `metadata.collection`; all-collection and hybrid responses retain it. Keep the requested collection when adapting older response shapes.

## Reader pagination

Discover support with `GET /api/reader/capabilities`. The integrated Reader contract advertises version 1, keyword and semantic modes, page sizes up to 50, a provider filter, exact totals and a 900-second snapshot lifetime. Hybrid is available through `/api/search`, not Reader v1.

Start `GET /api/reader/search` with the same search parameters and optionally `provider`; its default page size is 50. The response contains `results`, `total`, `hasMore` and `nextCursor`. Request the next page with the returned cursor and unchanged query/filter values. Treat the cursor as opaque. Use `DELETE /api/reader/search?cursor=...` to release a retained search session when appropriate.

Snapshots remain fixed while paging. A changed query/filter combination returns 400; an expired or evicted snapshot returns 410 and requires a new search. The cache holds at most eight snapshots within a shared 128 MiB budget. Excessive snapshot size or more than two concurrent snapshot builds produces 503 rather than a falsely complete partial result set.

## Imports and collection changes

| Method and path | Purpose |
| --- | --- |
| `POST /api/collections` | Create a named collection with `{ "name": "example_archive" }`. |
| `POST /api/collections/:name/clear` | Clear an allowed collection. |
| `DELETE /api/collections/:name` | Remove an allowed collection and its managed data. |
| `POST /api/import-jobs` | Accept `{ "folderPath": "/srv/exports", "collection": "example_archive", "clearFirst": false }`; returns 202 with `{ "job": ... }`. |
| `GET /api/import-jobs` | List jobs; optional `collection`. |
| `GET /api/import-jobs/:id` | Read one persisted job. |
| `POST /api/import-jobs/:id/cancel` | Request explicit cancellation. |
| `POST /api/import-jobs/:id/retry` | Retry eligible work. |

Direct collection clearing and deletion are destructive operations, unlike a staged replacement import. Clearing removes archived conversations and their search data while retaining the collection entry and uploaded originals. Deletion also removes the collection registry entry and that collection's managed upload directory. The `chunks` collection can be cleared but not deleted; `threadshelf_conversations` cannot be cleared or deleted through these routes. Preserve a backup before using either operation.

Browser uploads use `POST /api/import-jobs/upload` with multipart fields, including `collectionName`. Legacy `/api/ingest-upload`, `/api/ingest-upload-progress` and `/api/ingest-progress` remain available. Progress routes return NDJSON. **After acceptance, disconnecting the progress connection does not cancel the job.** See [Background jobs](/background-jobs/) for cancellation, history removal and recovery.

## Errors and client behavior

Validation usually returns 400 with `{ "error": "...", "field": "..." }`. Missing threads return 404; conflicting collection/index operations can return 409; Reader session expiry returns 410. A pending-index backlog returns a failed search with an error about too many pending or invalid index entries. The underlying condition is named `INDEX_RECOVERY_REQUIRED` internally, but these search routes do not expose it as a stable JSON `code` field. Check the HTTP failure and display the returned error instead of treating `results: []` as a successful empty search. Always check HTTP status and error fields. Keep user-visible error text and avoid repeatedly retrying invalid requests.

## Source references

- [Server mounting and body limits](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/server.ts)
- [Search route](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/search.ts) and [validation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/validation.ts)
- [Reader capabilities and pagination](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/reader-search.ts)
- [Files](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/files.ts), [thread loading](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/services/thread.ts) and [collections](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/collections.ts)
- [Import routes](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/ingest.ts)
