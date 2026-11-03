# Glossary

Use these terms to distinguish the archive's data model from generation, speech, and network configuration. The same word can have a different meaning in a provider's export or a client application; the definitions here describe ThreadShelf Enhanced.

## Archive vocabulary

| Term | Meaning |
| --- | --- |
| Export | A file or archive produced by an AI service or a supported converter; the input to import |
| Collection | A named namespace for conversations and their searchable content |
| Conversation / thread | A complete discussion identified by collection, source file, and conversation key |
| Turn | A normalized user, thinking, or assistant text entry, with available metadata |
| Chunk / passage | A searchable portion of a turn; long turns can create several chunks |
| Source file | The stored identity of the input containing a conversation, not necessarily a file the reader must reopen for every view |
| Conversation key | The identity that distinguishes conversations within a source; clients should retain the returned value |
| Raw data | The retained original conversation structure alongside normalized turns; not a guarantee of byte-identical input restoration |
| Continuation | New ThreadShelf-authored turns appended to an imported conversation |
| Protected collection | An application-reserved collection with restrictions on bulk clearing or deletion |

See [Collections and insights](/collections/) for counts and lifecycle behavior and [Compatibility](/compatibility/) for identity contracts.

## Search vocabulary

| Term | Meaning |
| --- | --- |
| Embedding | A numerical representation of a passage or query used for semantic retrieval |
| Semantic search | Retrieval by similarity between local query and passage embeddings |
| Exact / keyword search | Literal text matching; Exact is the interface label and `keyword` is the API/CLI mode name |
| Hybrid search | Independent lexical and semantic retrieval combined into a ranked result list |
| Lexical cache | A disposable local SQLite search cache derived from published conversation content |
| Distance | A semantic retrieval value; a lower cosine distance indicates a closer vector, not a factual accuracy score |
| Origin filter | A filter distinguishing imported archive turns from ThreadShelf-authored turns |
| Reader snapshot | A bounded, expiring result snapshot used by the compatible paginated Reader API |

A search result is a passage, so several results can open the same thread. [Search and discovery](/search/) explains practical mode choice and ranking.

## Import and storage vocabulary

**Transfer** moves browser-selected file bytes to the server. **Acceptance** is the point at which the server has taken responsibility for a durable import job. These are separate events: do not close the upload tab before acceptance.

**Staging** is temporary disk-backed preparation of a candidate import. **Publication** makes a matching archive/index generation active. Here, “generation” means a storage revision, not text produced by an AI model.

**Replacement** publishes a complete new input selection for a collection after preparation. **Additive import** can add or refresh sources without treating that selection as the entire collection. **Cancellation** explicitly asks a job to stop; closing an observer connection does not cancel an already accepted job.

**RSS** is resident process memory, including memory beyond JavaScript's heap. The **memory governor** considers process and host/container budgets at work boundaries. Increasing the JavaScript heap alone does not create more physical RAM or guarantee that native allocations fit.

See [Import jobs](/background-jobs/) and [Architecture](/architecture/).

## AI and speech vocabulary

| Term | Meaning |
| --- | --- |
| Provider | A generation or speech backend; it may run locally, on a self-hosted service, or through an external API |
| Runtime | The software that executes a local model, such as a supported llama.cpp runtime |
| GGUF | A model-file format used by supported local generation workflows |
| Context window | The input-and-output token capacity available to a model request; it is distinct from total archive size |
| Master prompt | A saved system prompt selected for generation; it is not rewritten into every stored thread |
| Private chat | A tab-scoped conversation kept in browser memory instead of the ordinary saved-chat workflow |
| Tool | A bounded capability, such as archive search or an approved note edit, available to a model/client within configured scope |
| Vault | A connected live Markdown folder with its own identity and read/write policy |
| TTS | Text-to-speech: converting selected text into audio |
| Pinned recording | Saved audio protected from ordinary cache eviction and replacement policies |
| Streaming | Delivering text or audio incrementally; it does not by itself mean that a complete result was saved |

Private mode changes local persistence. It does not make a remote provider local, bypass access checks, or revoke a separately approved note write. See [Privacy and security](/privacy-security/).

## Network vocabulary

**Loopback** addresses, such as `127.0.0.1`, refer to the machine making the request. **Bind address** determines where the server listens. **Allowed host** validates the requested hostname or address, while **browser origin** includes scheme, host, and port. None of these alone identifies a person.

**LAN feature permission** enables a corresponding group of AI or speech controls at allowed server addresses. It is not an account system. A **local model API key** protects the separate inference API according to its configured policy; it is not a universal login for the archive web interface.

**MCP stdio** connects a client and a locally launched tool process over standard input/output. It is different from the HTTP archive API and the OpenAI-compatible `/v1` inference routes.

For setup and examples, see [Network access](/network-access/), [Archive HTTP API](/http-api/), [Local model API](/model-api/), and [MCP](/mcp/).

## Source references

- [Architecture](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/ARCHITECTURE.md)
- [Turn and collection validation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/validation.ts)
- [Import job contract](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/IMPORT-JOBS.md)
- [Enhanced search contract](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/SEARCH-1.4.0.md)
- [Independent feature access](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/feature-access.ts)
