# Compatibility and stable contracts

ThreadShelf Enhanced is a separately maintained fork. It preserves established archive interfaces and conversation identities while adding its own import, storage, search and reader behavior. Compatibility should be evaluated at the relevant boundary: HTTP requests, stored data, export formats and desktop applications are different contracts.

## What the compatibility tests establish

| Boundary | Documented scope |
| --- | --- |
| Archive HTTP API | Collection discovery, file lists, threads, Insights and bounded legacy search. |
| Reader pagination | Reader v1 capabilities, exact totals, stable cursors, provider filtering and semantic/keyword modes. |
| Released desktop adapters | Actual retained Local Reader and Alternative HTTP adapter fixtures run against Enhanced. |
| MCP | Real stdio initialization, tool discovery and isolated archive operations. |
| Analytics | A separate optional Reader-archive-to-Analytics integration; Analytics is not an archive-HTTP client. |
| Export adapters | Supported and tested format shapes, with explicit preservation and rejection limits. |

The retained public HTTP adapters originated in Local Suite v1.0.0 and were verified byte-identical in the recorded v1.2.0 reference. Those are historical test-provenance statements, not a claim that every later desktop release has been manually tested. The fixtures identify specific adapter files and hashes. They do not launch Electron, validate desktop installers or establish equality of all application code.

The optional Analytics integration checks public Reader storage and Analytics capture modules with synthetic archives. Enhanced does not generate or migrate Analytics' separate archive format. When diagnosing an Analytics issue, distinguish server retrieval, Reader archive publication and Analytics capture.

## Conversation identity

Clients commonly identify a conversation by server URL, collection, `sourceFile` and `conversationKey`. Preserve all four when migrating an installation or reconnecting an existing client. A title is display metadata and is not a unique key.

For ZIP imports, the physical ZIP remains the source file, and member identity contributes to the conversation key. The same visible conversation imported from a different physical source may therefore have a different identity. Import one representation of an export to avoid unintended duplicates.

The files response remains `{ "files": [...] }`. Thread responses can include an additive resolved `collection` field. Clients should retain unknown fields when practical and tolerate additive metadata without assuming it changes the conversation's identity.

## Search contracts

`/api/search` retains a maximum of 50 results and the `{ "results": [...] }` response. Semantic remains its default. Hybrid is an additive mode for this endpoint and the search CLI; lexical-only hybrid results may lack `distance`.

Reader v1 advertises its own contract at `/api/reader/capabilities`: pages up to 50, exact totals, keyword/semantic modes, provider filtering and a 900-second snapshot lifetime. A cursor is bound to the original query and filters. Expired or evicted sessions return 410, and changed filters return 400. Smart-search clients can continue using semantic retrieval with `keywordBoost`.

MCP search likewise retains keyword/semantic modes. Do not send `hybrid` to MCP or the Reader v1 endpoint. Do not interpret the ordinary bounded API result count as a full Reader total. The [HTTP reference](/http-api/) documents these differences.

Enhanced already includes the Reader pagination extension. Installing an upstream pagination patch over this fork can overwrite integrated behavior and is not part of its supported setup.

## Storage and upgrades

Preserved public APIs do not imply that an older server can safely write a store created by a newer one. Enhanced's generation publication, job reservations and coordination sidecars must be understood by every process sharing the database.

Upgrade the HTTP server, MCP processes, CLI importers and watchers together. Stop them first, back up the complete data set including external configured paths, and verify the upgraded installation before retiring the backup. Rollback means restoring a stopped, consistent backup; opening the modified store with an older executable is not a downgrade procedure.

Existing readable archives do not automatically require reimport merely because a minor application update changes. Follow actual migration notes and check collection listings, complete threads, keyword/semantic results and attachments. An index's availability is distinct from whether stored normalized conversations remain readable.

## Import lifecycle compatibility

Legacy ingest routes and NDJSON progress streams remain, but an accepted import is durable background work. Disconnecting its request no longer cancels it. Clients that formerly used request abortion as cancellation must use the job's explicit cancellation route.

Collection clearing and deletion coordinate with queued or active jobs. A conflicting writer can receive a busy response rather than silently overwrite work. A cancelled job after publication is not an undo operation. See [Background jobs](/background-jobs/) for current lifecycle behavior.

The pending-index exclusion safeguard can fail a search for an extreme or invalid backlog. The condition is named `INDEX_RECOVERY_REQUIRED` internally; the HTTP search routes return a failure status and human-readable error rather than a guaranteed JSON code field. Clients must present that failure instead of displaying a clean empty search. Repeated queries are not a substitute for repairing corrupt retained rows or recovering failed indexing.

## Format and rendering limits

Enhanced retains normalized turns, source identity and available raw conversation content. Large JSON integer tokens that JavaScript cannot safely represent become exact decimal strings in the JSON-safe normalized representation; the untouched source retains its original type. This is semantic preservation, not a byte-identical re-export guarantee.

Current known boundaries include unsupported JSONL, encrypted Venice backups and unsupported binary attachments. A ZIP containing both `conversations.json` and `chat.html` can import duplicate representations. Missing or unsupported widgets may remain source text or inert placeholders. Display preferences do not rewrite the source used for copying and exporting.

Vendor formats can change independently of Enhanced. A small synthetic reproduction and the exact failing format are more useful than assuming a provider name guarantees every export shape.

## Source references

- [Compatibility contract](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/ENHANCED_COMPATIBILITY.md)
- [Released adapter provenance](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/test/fixtures/compatibility-clients/README.md)
- [Optional Analytics integration](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/test/compatibility/README.md)
- [Reader pagination implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/reader-search.ts)
- [Enhanced search behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/SEARCH-1.4.0.md)
- [Import and recovery behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/IMPORT-JOBS.md)
