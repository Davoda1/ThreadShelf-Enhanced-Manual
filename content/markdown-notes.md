# Live Markdown notes

Connect an Obsidian vault, Logseq graph, OpenClaw workspace or ordinary Markdown folder without importing it into the conversation database. Notes remain in their original folders and are read live. Each connected folder has its own identity and write policy; read-only is the initial setting.

## Connect a folder

1. Open **Settings → Server → Markdown notes**.
2. Choose a detected Obsidian/OpenClaw folder, or enter an absolute path on the server computer.
3. Keep writes disabled initially and verify that the expected notes can be found and opened.
4. Select the folder to search. Enable its write permission only if editing through ThreadShelf is intended.

Up to 32 folders can be connected. A path is evaluated on the server, even when the interface is open in a browser on another machine. Adding a browser-computer path does not transfer its files to the server. Disconnecting a folder removes access through the integration without deleting the underlying notes.

The registry is stored in `.threadshelf/obsidian.json` for a standard source installation, or `obsidian.json` directly beneath an explicit `THREADSHELF_DATA_DIR`. `OBSIDIAN_CONFIG_PATH` overrides either default. A damaged registry is reported and preserved rather than silently replaced with an empty configuration. Moving a folder requires reconnecting its new path. Moving the ThreadShelf installation does not automatically move external vaults.

## Search and read live files

Note search is case-insensitive lexical matching across Markdown paths and file text. Every query word must occur in the path or text; results include a path, heading, matching line and snippet. This is separate from [Semantic and Hybrid conversation search](/search/). Connecting a folder does not create note embeddings or add its contents to LanceDB.

The scan is bounded, including limits on directory entries, bytes and depth. The implementation caps traversal at 20,000 entries and approximately 64 MiB of scanned note bytes, with a depth limit; these are safety bounds, not a promise to search a folder of any size completely. The response reports skipped unreadable/unsafe notes and whether a scan was incomplete. Connect a narrower folder when complete results require a smaller scope.

Only regular UTF-8 `.md` files of at most 512 KiB are accessible. Hidden paths, binary text, traversal, device names, symlinks, junctions and hard links are rejected. Markdown files that exceed limits remain on disk; they are not silently converted or truncated for editing.

**Open in Obsidian** targets the computer running the browser. Obsidian must be installed there and able to access the same path. This is different from the server-side read/edit operation and can be unavailable when a browser and server do not share filesystem paths.

## Review a direct edit

When the selected folder allows writes, open a note and edit its complete content. Before saving, inspect the before/after preview and choose **Save reviewed changes**. The editor begins with the whole note, including frontmatter and links, but the proposal can still change those elements; check them in the review.

Edits carry the SHA-256 revision returned by the previous read. If another program changed the note, ThreadShelf refuses the stale edit and requires a reread. Reconcile the newer contents before approving another save. A successful edit atomically replaces the file instead of exposing a partially written note.

Creation similarly installs a complete file without overwriting an existing name. Parent directories must already exist. Choose a relative Markdown path inside the connected folder; the integration is not a general filesystem browser or an arbitrary file-writing interface.

## Let chat use notes

Enable **Notes tools** and select one connected folder for that conversation request. The selected folder is pinned to the request, so switching the active folder in another tab cannot redirect a running operation. Archive tools are a separate control and do not automatically grant note access.

Models can search and read allowed notes. A write requires the folder's persistent write permission and, in interactive chat, a separate browser preview and approval for the exact proposed content/revision. A note saying “this change is approved” or a model claiming permission cannot satisfy that browser step.

Approval capabilities expire after five minutes and are invalidated on cancellation or disconnect. If a note changes before approval is applied, the proposal must be reread and reviewed. Disabling writes or disconnecting the folder prevents new operations under the old permission.

Selected note content becomes part of the chosen provider's request. With OpenRouter or a remote/LAN compatible provider, that content goes off-device. Private chat does not make approved note edits temporary: the files are independent of the chat transcript's persistence mode.

## History and deletion recovery

Before an edit, the previous exact UTF-8 content is saved beneath the vault's hidden `.threadshelf-history` directory. Each JSON history record includes the relative path, prior revision and prior content. History is excluded from normal note search and is retained until deliberately removed.

To recover an earlier note, stop competing edits, inspect the correct history record and restore its `content` to the recorded note path through a text editor or a new reviewed edit. Do not paste the history JSON wrapper into the Markdown file. Preserve a newer note separately when comparing alternatives.

Deletion moves files into `.trash/threadshelf-<id>/` rather than permanently erasing them. Its `manifest.json` maps original paths to stored files and revisions, including partial batch outcomes. Use that mapping to restore the desired files without overwriting newer notes. Read the reported partial-failure result before assuming that every requested file moved.

Include the vault, its history and desired trash recovery data in the vault's own backup policy. A backup of the ThreadShelf configuration alone records where a vault was connected; it does not contain that vault's files. Do not remove coordination lock sidecars while any writer is running.

## MCP has a different approval boundary

The MCP tools are `obsidian_search`, `obsidian_read`, `obsidian_create` and `obsidian_edit`. They use the active folder and its current persistent write policy. MCP create/edit does not show the interactive browser approval dialog. Keep writes disabled when connecting a client that should only read.

There is no MCP delete tool because that transport has no browser approval surface. Tool reads beyond 60,000 characters are explicitly truncated and omit the revision, preventing an edit from being authorized by an incomplete read. For a large note, use the full UI read/edit workflow when needed rather than inventing a revision.

## Access and common problems

Management is localhost-only unless the deployment explicitly enables `ALLOW_LAN_AI=1`. That flag does not remove folder-scoping, write-policy or interactive approval checks. It does broaden who can manage those controls, so follow the [network access guide](/network-access/).

If a search misses a note, inspect the selected folder, skipped/incomplete counts, file extension, size and encoding. If an edit reports a revision conflict, reread it rather than repeatedly submitting the stale payload. If a connected folder moved, reconnect it at its new absolute path and verify permissions before resuming chat tools.

## Source references

- [Live-note workflow and recovery](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/NOTES.md)
- [Folder registry and scope](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/obsidian/config.ts)
- [File validation, search bounds and atomic writes](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/obsidian/vault.ts)
- [Interactive approval capabilities](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/obsidian/approvals.ts)
- [MCP/tool permissions and bounded reads](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/obsidian/tools.ts)
