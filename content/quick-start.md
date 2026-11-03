# Quick start

Build a small working archive before importing a large export or enabling optional AI features. This walkthrough starts with the source release, imports one demonstration conversation, and finishes with a verified search result and a reusable export.

## 1. Install and start

Get the source ZIP or TAR.GZ from the [latest Enhanced release](https://github.com/Davoda1/ThreadShelf-Enhanced/releases/latest), verify its checksum, and extract it into a writable directory. Enhanced's setup scripts install the selected Node/npm runtime inside that directory.

On Linux, run:

```bash
bash setup-threadshelf.sh
./threadshelf-enhanced
```

On Windows, open PowerShell in the extracted directory:

```powershell
.\setup-threadshelf.ps1 -Start
```

Open [http://localhost:3000](http://localhost:3000) on the same machine. Keep the server terminal open while using the application. For prerequisites, later starts, and setup options, see [Installation](/installation/).

If the server has no local browser, configure [trusted-LAN access](/network-access/) first. A browser's `localhost` refers to the browser's computer, not a different machine running the server.

## 2. Choose a small input

Use a supported export with one or a few conversations, or [download the synthetic demonstration JSON](/examples/demo-conversation.json). The sample contains a short fictional discussion about a reading garden. It contains no account data or external media and uses the normalized ThreadShelf conversation format.

If the browser displays JSON instead of downloading it, save that document as `demo-conversation.json`. Keep original provider exports separately. A ThreadShelf archive is useful for search and reading, but original exports can contain unsupported attachments or metadata that are not represented in every view.

For a provider export, choose one conversation representation. A ZIP containing both a provider's `conversations.json` and `chat.html` can create duplicate conversations. See [Import conversations](/imports/) before uploading a complete backup.

## 3. Import a collection

1. Open **Add data** in the sidebar.
2. Choose the file-upload input and select the JSON file.
3. Select or create a collection named `walkthrough`.
4. Use the ordinary additive import for this first example. Leave replacement or clear options off.
5. Start the import and wait for the transfer to finish and the server to accept the job.
6. Follow the job until it reports completion. Check skipped-file and error details if it does not finish cleanly.

On first use, the embedding model may need to download. An import can therefore take longer the first time even with a small file. Accepted jobs persist on the server and can continue after browser disconnection, but closing the browser during file transfer can prevent acceptance. See [Import jobs](/background-jobs/) for the distinction.

## 4. Find a passage

Open **Search archive**, select `walkthrough`, and choose **Exact**. For the supplied sample, search for:

```text
reading garden
```

Leave User and Response roles enabled and remove date or model filters for this first check. A result should point to the sample conversation, **Planning a reading garden**. Open it to inspect the complete thread.

Now try a conceptual query with **Semantic**, such as `a quiet place for reading outdoors`. Compare with **Hybrid**, which combines lexical and semantic retrieval. The two modes can rank the sample differently; the exact check establishes that the content was imported, while conceptual search explores its meaning. These are illustrative queries, not a benchmark or a guaranteed ranking test.

## 5. Read and export

The reader provides separate user, reasoning, and response controls. The sample includes a table in the first answer and a maintenance checklist in the later answer. Use **Export .md** for readable Markdown, or **Export .json** for normalized turns plus the available original conversation data and source identity.

> Display filters are not export filters. Copying or exporting the conversation includes its loaded turns even if a role is hidden in the reader. Review the exported file before sharing it.

The [reader guide](/reader/) explains formatting, images, copy behavior, and the difference between an exported thread and a complete backup.

## 6. Choose the next step

| Goal | Continue with |
| --- | --- |
| Bring in a large provider export | [Imports](/imports/) and [Import jobs](/background-jobs/) |
| Organize several sources | [Collections and insights](/collections/) |
| Continue a conversation | [Chat with AI](/ai-chat/) |
| Read a response aloud | [Text-to-speech](/speech/) |
| Use a desktop reader or other client | [Compatibility](/compatibility/) |
| Preserve the archive before upgrading | [Backups and migration](/backup-migration/) |

Optional AI and speech providers are not prerequisites for archive search. Configure them separately when their behavior and data boundaries fit the intended workflow.

## Source references

- [Installation and initial configuration](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/README.md)
- [Normalized conversation importer](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/enhanced-import/vendor/importers.mjs)
- [Durable import jobs](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/IMPORT-JOBS.md)
- [Reader and export controls](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/client/src/components/ThreadReader.tsx)
