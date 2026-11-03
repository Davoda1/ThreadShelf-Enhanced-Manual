# Background jobs and resource limits

An import becomes a persistent server job after its inputs have been transferred and accepted. The browser observes that job; it does not own the parsing and indexing process. This allows a large import to continue through a closed tab or a temporary connection loss.

## Understand the two stages

**Transfer and acceptance:** keep the page open while files travel from the browser to the server. A closed tab can interrupt an unfinished transfer. Wait until the interface confirms that the server accepted the job.

**Server processing:** accepted inputs are parsed, normalized, embedded and published by the server. Return to **Add data** to inspect progress, skipped files, errors, cancellation and retry. A disconnected progress request does not cancel the job.

| Situation | Meaning and next action |
| --- | --- |
| Queued | Another coordinated index operation is using this database; wait for its turn |
| Running | The server is processing the accepted input |
| Paused or throttled | Resource pressure or coordination is delaying progress; inspect the reason |
| Interrupted | Work ended before completion and recovery must inspect retained state |
| Completed | Publication succeeded; the job displays 100% |
| Failed or cancelled | Inspect the diagnostic; retained inputs may allow an explicit retry |

One index operation runs per database. Web imports, CLI imports, watchers and recovery share this coordination. Only one HTTP server can own a database, even if a second server would use another port. Use a separate complete data location when a truly independent instance is required.

## Replacement is staged

A replacement reserves its destination collection against conflicting writes. The already-published collection remains readable while the new data is prepared.

The server validates input into a disk spool, builds bounded batches of archive rows and vectors, and publishes matching generations through a durable metadata transaction. A failure before publication preserves the old collection. Recognized malformed exports and no-valid-conversation selections prevent replacement; unrelated skipped files do not veto otherwise valid data.

Cancellation is cooperative. A current operation may need to reach a safe boundary before stopping. Cancelling after publication cannot restore the previous collection. For rollback, use a consistent stopped backup, not a browser refresh or an attempted cancellation of a completed job.

## Recovery and retry

Interrupted jobs retain input/checkpoint information. Recovery checks source and staged-record hashes instead of trusting the last percentage. Repeated interruption eventually leaves an explicit failure for review rather than restarting forever.

When a job fails:

1. Read its first concrete diagnostic, including the affected file or resource.
2. Resolve the problem: disk space, memory, access permissions, malformed input or unavailable model files.
3. Retry retained inputs if the job offers that action.
4. Re-submit corrected source if the original input itself must change.
5. Verify collection contents after completion.

An import retry and recovery of saved conversation edits are separate mechanisms. A failed import's retry button does not repair every pending or invalid stored row.

## Finished history and uploaded files

These are three independent cleanup operations:

| Action | Removes | Preserves |
| --- | --- | --- |
| Remove finished job history | Terminal job record and disposable retained retry inputs/staging | Published conversations, search index and published source files |
| Manage uploads | Selected original exports or media in the collection's upload area | Collection, normalized archive, search index and job history |
| Clear image cache | Disposable external-image cache entries | Conversation source, uploaded attachments and search data |

Finished history can be removed individually or in bulk for one collection or all collections. Bulk clearing includes matching finished entries beyond the visible list. Queued, running, paused and interrupted jobs are protected. Once a history entry is removed, it cannot be retried; submit the source again if necessary.

**Add data → Manage uploads** lists server-uploaded relative paths and sizes. Deletion requires confirmation and never manages arbitrary server-local folders. It can still remove media or source fallbacks needed by older records. Keep a separate original-export backup.

Active imports and conflicting indexing block upload cleanup. A failed or cancelled job with an incomplete input snapshot can also block cleanup when its source overlaps those uploads. Retry that work or remove its finished history to abandon the retry before deleting the files.

## Memory is more than the JavaScript heap

Parsing and embeddings use both JavaScript and native memory. A `--max-old-space-size` limit governs part of the process, not the whole machine. The memory governor checks process RSS, heap headroom and effective host/container memory at bounded work checkpoints.

Default policy reserves about 15% of effective RAM, ordinarily bounded between 512 MiB and 2 GiB. The default process budget is about 45%, ordinarily bounded between 512 MiB and 6 GiB. Additional clamps prevent the reserve or process budget from exceeding the effective available total. Container limits can make effective memory smaller than the host's installed RAM.

Under pressure, batches shrink, work waits for headroom, or sustained pressure fails the operation safely. Explicit overrides are:

```dotenv
THREADSHELF_MEMORY_RESERVE_MB=1024
THREADSHELF_PROCESS_MEMORY_MB=4096
```

These are example budgets, not a recommendation for every machine. `EMBED_BATCH_SIZE` is the requested maximum embedding batch; the governor may reduce actual work. The manual importer defaults to a 4 GiB JavaScript old-space ceiling, configurable separately. Raising a ceiling does not reserve RAM or fix a lack of physical memory.

A memory watcher cannot guarantee survival when another program suddenly exhausts the system. Leave room for the operating system, browser and optional generation/speech engines.

## Disk staging and search recovery

Replacement requires space for accepted inputs, staged replacement data and the currently published archive. Do not estimate disk needs from only the final database size. Never delete SQLite sidecars, locks or staging files while a process may use them.

An extreme pending/invalid index backlog can exceed the bounded search exclusion expression. Search then fails with an error about too many pending or invalid index entries rather than claiming partial results are complete. The internal name is `INDEX_RECOVERY_REQUIRED`; HTTP clients should check the response status and readable error, because a JSON `code` field is not guaranteed. The archive is not deleted.

Keep the server running to allow pending-index recovery, which runs at startup and periodically, with persisted backoff. Saved-edit recovery pauses after eight failures; changing the affected thread resets that edit's retry state. There is no separate HTTP recovery endpoint. Retained unreadable rows marked invalid need diagnosis; automatic indexing or a blind reimport does not repair them. Back up first and avoid deleting database files to bypass the guard.

## Source references

- [Persistent import and resource guide](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/IMPORT-JOBS.md)
- [Memory governor](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/memory-governor.ts)
- [Job lifecycle](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/import-jobs.ts)
- [Upload cleanup](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/upload-storage.ts)
