# Importing conversations

Imports turn provider exports into searchable conversations while retaining original conversation data and message metadata alongside normalized turns. Source files are read without being rewritten. Keep the original export separately: a normalized archive cannot represent every possible attachment, account field or future provider format.

## Choose an import method

| Method | Where files come from | Best use |
| --- | --- | --- |
| Browser file or folder selection | Files are transferred from the browser's computer into server upload storage | A workstation importing downloaded exports |
| ZIP import | Conversation members and supported companion media inside one archive | Keeping an export's relative layout together |
| Server-local folder | Files already readable by the server process | Large archives or headless installations |
| Linux launcher or manual importer | A server-local folder processed through the coordinated import pipeline | Terminal workflows and repeatable imports |

A manual path belongs to the **server's filesystem**. A path on a laptop is not automatically available to a server on another machine. Browser selection transfers the selected files; entering a path does not.

## Import from the web interface

1. Open **Add data** and create or select the intended collection.
2. Choose the supported export files, their containing folder, a ZIP, or a readable server-local folder.
3. Decide whether this is an additive import or an intentional replacement.
4. Start the import and keep the tab open until upload and server acceptance finish.
5. Review skipped files, warnings and errors in the job status.
6. Open several imported threads and test both exact and semantic search.

After acceptance, parsing and indexing continue on the server when the browser disconnects. Use the explicit cancellation action to stop work. [Background jobs](/background-jobs/) explains retry, replacement and cleanup.

## Supported export families

| Provider or format | Supported input shape and relevant limits |
| --- | --- |
| ChatGPT | Native conversation mappings, including supported exported JSON and HTML representations |
| Claude | Supported top-level and project conversation exports |
| Google AI Studio | Supported chunked and Imagen exports; recognized files may have no extension |
| OpenRouter | Supported JSON, including exports created by the repository's browser-console scripts |
| LM Studio | Selected conversation formats and versions; inspect a sample because the format is not a stable public contract |
| Grok / xAI | Supported account-export conversations, including `prod-grok-backend.json` |
| Meta AI | Recognized labeled transcript exports |
| Gemini / Takeout | Supported activity JSON and native Takeout HTML |
| Venice | Supported console JSON and native unencrypted version 4 backups; multipart backups require an unambiguous matching manifest |
| ThreadShelf / Local Reader | Supported normalized conversation turns |
| Converted exports | Compatible conversation JSON, `conversations-index.json`, and embedded `chat-index.html` conversation data |

HTML is parsed as data. The importer does not execute an export viewer's scripts. Provider recognition is based on supported structures, not a guarantee that every file with a `.json` or `.html` extension is a conversation.

Mixed-provider folders are supported. Unrelated documents, known account metadata, unsupported shapes and empty auxiliary files can be skipped without blocking valid conversations. A recognized but malformed export, corrupt ZIP data, unsupported recognized format version or changed input is a source failure.

## Avoid duplicate representations

A ChatGPT ZIP can contain both `conversations.json` and `chat.html`. Importing both representations can create duplicate conversations. Select one conversation representation and keep its necessary companion images. The importer does not assume that different source representations refer to the same archive.

Similarly, importing a native export alongside a converted copy can produce separate source identities. First test a small collection to determine which representation best preserves the content needed.

## Preserve images and attachments

Keep companion image paths intact. Supported PNG, JPEG, GIF and WebP files explicitly referenced by a conversation can be resolved inside the selected source directory or ZIP. Browser folder uploads include supported image companions.

The resolver rejects unsafe traversal, external directory symlinks, ambiguous filenames, invalid image signatures and active SVG/HTML content. Imported images have a 5 MiB per-image and 32 MiB per-source resolution budget. An absent or rejected attachment leaves a placeholder instead of allowing arbitrary server files to become web resources.

Remote images are not fetched during import. They follow the reader's click-to-load or automatic-loading setting and the separate [image cache](/reader/). Upload cleanup can remove original files or media that still support legacy source fallbacks, so retain originals before deleting server uploads.

## Add or replace a collection

An additive import can retain successfully completed files even if another file fails. Existing ThreadShelf-authored continuations are preserved according to the source identity rules.

**Clear collection first** and the launcher's `--clear` request replacement. The server stages the candidate archive and its search data before publishing them together; it does not empty the collection at the start. Existing published data remains readable while replacement runs.

A recognized malformed export, integrity failure, no valid conversations, preparation failure or cancellation before publication prevents replacement. Skipped auxiliary files alone do not prevent a valid selection from replacing the collection. Check the selected folder carefully: a valid but incomplete selection is still the replacement you requested.

## Terminal import

On Linux, from the installation directory:

```bash
./threadshelf-enhanced --index /path/to/exports archive
```

For an intentional replacement:

```bash
./threadshelf-enhanced --index /path/to/exports archive --clear
```

The optional interactive wrapper adds a review screen, readiness checks, resource controls and explicit source-copy choices:

```bash
bash manual-importer.sh
bash manual-importer.sh --help
```

These use the same coordination and storage pipeline as web imports. Source files in a server-local import folder are not deleted by a successful replacement.

## Input ceilings

| Resource | Declared ceiling |
| --- | --- |
| Browser upload | 4 GiB per file; 1,000 files per request |
| One streamed JSON record | 64 MiB |
| One normalized staging record | 128 MiB |
| Whole-document formats | 512 MiB, with additional available-memory checks |
| Streamed input / expanded archive set | 256 GiB; up to 2,000,000 records |
| ZIP input | 1 TiB compressed; up to 100,000 entries |
| Folder nesting | 64 levels |

Some adapters are stricter: native Gemini HTML has a 64 MiB limit, and native Venice backup databases have a 2 GiB expanded limit. These are rejection ceilings, not memory requirements or guaranteed capacities. A smaller whole-document export may still be rejected when projected memory use is unsafe. Supported UTF-8 conversation-array JSON is preferable for large inputs.

JSONL and encrypted Venice backups are unsupported. Renaming a JSONL file to `.json` does not convert it. Request a supported document export or convert it into a supported format first.

## Source references

- [Import adapters and their limits](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/enhanced-import/vendor/README.md)
- [Compatibility and preservation contract](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/ENHANCED_COMPATIBILITY.md)
- [Media resolution](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/enhanced-import/media.ts)
- [Upload transport](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/ingest.ts)
