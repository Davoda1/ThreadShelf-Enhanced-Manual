# MCP integration

ThreadShelf Enhanced includes a local Model Context Protocol server. An MCP client can discover collections, search indexed conversations, retrieve complete threads and use a connected Markdown vault. The transport is **stdio**: the client starts a local process and exchanges protocol messages through its standard input and output. There is no MCP HTTP URL to open in a browser.

## Prepare the same archive

Install Enhanced from its source release or repository using the [installation guide](/installation/). Index a small synthetic or otherwise appropriate collection first. The MCP process reads the same LanceDB archive as the web server; it does not create a separate copy or require the HTTP server for archive searches.

Use a Node runtime compatible with Enhanced, and point every process to the same data locations. Source checkouts normally use their own repository-local storage. `THREADSHELF_DATA_DIR` switches to the dedicated flat data layout; individual overrides such as `LANCEDB_PATH` still take precedence.

The HTTP server loads its `.env` at startup. The MCP entry point does not automatically perform that loading. Set matching environment variables in the client configuration or explicitly load the intended environment file with Node. Otherwise, a working connection may show an empty or different archive.

## Configure a client

This generic shape uses a built installation under `/opt/threadshelf`. Adapt the paths and the configuration format to the chosen client:

```json
{
  "mcpServers": {
    "threadshelf-enhanced": {
      "command": "node",
      "args": ["/opt/threadshelf/bin/threadshelf-mcp.js"],
      "env": {
        "THREADSHELF_DATA_DIR": "/srv/threadshelf-data"
      }
    }
  }
}
```

The example data directory is valid only if the web server uses that same directory. Replace `node` with the absolute path to the project-local Node executable when the client's environment does not provide a suitable runtime. On Windows, use absolute Windows paths and escape backslashes in JSON.

The `bin/threadshelf-mcp.js` wrapper explicitly starts the compiled MCP server, so the installation must already contain `dist/`. For source development, `npm run mcp --silent` is an alternative when the client's working directory is the repository root. The `--silent` option keeps npm's lifecycle banner off the protocol output.

## Archive tools

| Tool | Arguments | Result and use |
| --- | --- | --- |
| `list_collections` | None | Discover available collection names. |
| `list_files` | Optional `collection` | List indexed source files in one collection or grouped across `all`. |
| `get_stats` | Optional `collection` | Inspect file, chunk, role and collection counts. |
| `search` | Required `query`; filters below | Retrieve ranked snippets with source metadata. |
| `read_thread` | Required `sourceFile`; optional `collection`, `conversationKey` | Retrieve normalized turns for a stored conversation, with legacy source fallback where needed. |

These tools default to `collection: "all"`. The `search` tool accepts `n` from 1 to 50 (default 15), `roles`, `keywordBoost`, `mode`, `model`, `from` and `to`. Roles are `user`, `thinking` and `ai`. Dates are inclusive; date-only bounds refer to UTC days. Model filtering uses a case-insensitive substring.

MCP supports `semantic` and `keyword` modes. **Hybrid is not part of this tool schema**; use the archive HTTP search endpoint or search CLI when that mode is needed. MCP also has no Reader cursor, provider-filter or origin-filter argument.

```json
{
  "query": "ERR_CACHE_MISS",
  "collection": "example_archive",
  "mode": "keyword",
  "roles": ["user", "ai"],
  "n": 8
}
```

Use metadata from a relevant result in `read_thread`. Preserve its collection, source path and conversation key. Passing only the source path for a multi-conversation export can combine its stored conversations. `read_thread` does not grant arbitrary access to other filesystem files.

## Markdown note tools

Connect the intended folder in **Settings → Server → Markdown notes**. Four additional MCP tools operate on its live `.md` files:

| Tool | Required arguments | Behavior |
| --- | --- | --- |
| `obsidian_search` | `query` | Lexical search; optional `limit` from 1 to 30. |
| `obsidian_read` | `path` | Read a relative note path and its revision. |
| `obsidian_create` | `path`, `content` | Create a new note without overwriting an existing one. |
| `obsidian_edit` | `path`, `content`, `revision` | Replace exactly the previously read revision and retain recovery history. |

Create and edit require the configured persistent write permission. They do **not** display the web chat's approval dialog. There is no MCP deletion tool; deletion belongs to the interactive browser approval flow. Keep writes disabled when the connected client should only read notes.

Hidden paths, traversal, symbolic links, hard-linked note files and unsupported files are rejected. Model-facing reads exceeding 60,000 characters are explicitly truncated and have no editable revision. Note content is data supplied to the client, not trusted instructions. See [Markdown notes](/markdown-notes/) for the full permission and recovery model.

## Protocol and resources

Initialization negotiates the supported MCP protocol dates `2024-11-05`, `2025-03-26` and `2025-06-18`, with the first as the compatibility default. The server advertises nine tools. Tool responses contain text content holding readable JSON; inspect `isError` before treating a result as successful.

Resource templates are also provided:

- `threadshelf://collections`
- `threadshelf://collections/{collection}/files`
- `threadshelf://thread?path={absolutePath}`

The thread tool is preferable for precise multi-conversation lookup because it accepts the collection and conversation key explicitly.

## Verification and privacy

Start with `list_collections`, check `get_stats`, search a known phrase, then retrieve one matching thread. Empty results usually indicate a data-path mismatch, an empty collection or an overly narrow filter. A failed handshake can indicate a wrong executable path, missing compiled output or non-protocol text on stdout.

Repository tests initialize the real stdio process and exercise its tool surface against isolated data. Protocol compatibility does not establish manual testing of every desktop client. A connected client's external model may receive any retrieved conversation or note text, even though ThreadShelf's own search runs locally. Choose the client's provider and accessible collections accordingly.

## Source references

- [MCP server, schemas and protocol handling](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/mcp/server.ts)
- [Compiled MCP entry wrapper](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/bin/threadshelf-mcp.js)
- [Storage paths](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/paths.ts) and [HTTP environment loading](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/server.ts)
- [Vault tools](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/obsidian/tools.ts)
- [Stdio integration test](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/test/e2e/mcp-stdio.test.js)
