# Chat and continue conversations

Optional generation turns an archive into a place to continue a discussion or start a new one. ThreadShelf Enhanced can use a managed llama.cpp model, a separately running Strata service, OpenRouter, or an explicitly configured OpenAI-compatible endpoint. Archive reading and search remain available without configuring generation.

## Start a saved conversation

1. Configure a provider in **Settings → AI Models**, or follow [local model setup](/local-models/).
2. Open **Chats** and choose **New chat**.
3. Select a provider and model. Check the location indicator before sending.
4. Optionally choose a master prompt, response limit, or knowledge tools.
5. Enter a prompt and send it. Wait for the response and save status before treating the exchange as archived.

New chat starts as a draft; it does not immediately create an empty database record. The first send creates the saved conversation. Completed questions, answers and returned visible reasoning are stored locally and indexed in the protected **ThreadShelf conversations** collection, whose internal name is `threadshelf_conversations`. These chats do not create artificial source-export files.

The server loads the existing saved history itself and coordinates writes to prevent simultaneous generations from overwriting the same chat. Stopped, failed and incomplete responses are not committed as completed exchanges. If generation succeeds but saving fails, the interface can retain the answer in the current browser session and report the failure; read the status rather than assuming that visible text is durable.

## Continue an imported thread

Open a stored conversation and use its generation controls. The imported conversation remains in its original collection, and the original export file is not rewritten. Added turns carry ThreadShelf provenance, backend, model and timestamp metadata. Search can distinguish these authored turns from the imported archive.

Only newly authored content needs its generated search chunks refreshed; continuing a thread does not require re-embedding the entire original export. Reimport logic preserves ThreadShelf continuations. For older data that predates persistent stored threads, the server may ask for a collection reindex before continuation can resolve the required stored identity.

A continuation includes the selected conversation's user and assistant history, the new prompt and the selected master prompt. Imported or locally generated thinking is excluded from future provider prompts. Thinking returned by a provider can still be stored locally and displayed behind a disclosure; hiding a disclosure is a display choice, while exclusion from provider context is enforced by the server.

## Private conversations

The separate ghost-icon action opens a **Private conversation**. Its messages, draft and interrupted-response recovery live only in the current browser tab's memory. A full reload or closing the tab discards them; they are not saved to browser storage, LanceDB or the normalized thread store.

Private mode changes persistence, not the location of inference. A private request sent to OpenRouter or a remote compatible endpoint still sends the selected request context to that provider. Enabled archive or note tools can still supply context. An explicitly approved change to a connected Markdown file is a real file change even when proposed inside a private chat.

Private speech also bypasses saved recordings and both audio caches. Browser preferences such as the selected provider may still be remembered separately; remembering a preference does not store the private transcript.

## Master prompts and output limits

A master prompt is a reusable system instruction chosen for a request. Manage these from the prompt menu. Prompts are stored server-side in `.threadshelf/master-prompts.json` for a standard source installation, or `master-prompts.json` beneath an explicit `THREADSHELF_DATA_DIR`; `MASTER_PROMPTS_PATH` overrides the location. The currently selected text is prepended to generation as a system message and is not copied into the saved conversation turns. Editing a prompt therefore changes future requests without rewriting archived messages.

The response limit defaults to 4,096 tokens. The input accepts whole-number custom values in addition to presets, up to the smaller of the known model context size and the 32,768-token request safety cap. This is an output budget, not extra context capacity: the model must also accommodate the prompt, prior conversation and any retrieved tool material.

If a model spends a long time reasoning, a lower supported reasoning setting may shorten the wait. Model capabilities differ; a response budget is not a guarantee of answer length, speed or successful completion.

## Use archive and notes tools

| Control | Grants access to | Write behavior |
| --- | --- | --- |
| Archive tools | Bounded search and reading of stored conversations | Read-only |
| Notes tools | One selected connected Markdown folder for that request | Requires folder write permission and an interactive approval for proposed changes |

The controls are independent. Archive-tool responses contain source identities and original turn indices so a result can be traced back to a conversation. Notes tools pin the selected folder for the request, preventing a change in another tab from redirecting the operation.

The tool loop permits at most eight model rounds and sixteen tool calls, with bounds on arguments, responses and accumulated context. It is not an unrestricted filesystem agent. Imported text and note contents are source material, not permission to perform an operation. For note changes, the interface pauses to show the exact proposal and requires a separate browser decision; a model cannot approve its own request.

Retrieved archive and note excerpts go to the chosen generation provider. Enable only the scopes needed for a task, especially when that provider is off-device. Tool transcripts and opaque provider reasoning details are transient within the request rather than a new persistent archive schema. See [Markdown notes](/markdown-notes/) for revision checks, history and recovery.

## Streaming and cancellation

**Stream AI responses** controls whether text appears incrementally or after generation finishes. Turning streaming off does not disable tool progress or browser approval dialogs. The provider connection still has time and size limits, and cancelling a request propagates cancellation to the backend.

With a managed llama.cpp model, concurrent chats using the same model can queue. A request to switch to another GGUF while the active model is serving a generation receives a conflict instead of terminating the current response. Finish or cancel the active work before changing models.

## Provider and access boundaries

Loopback llama.cpp and Strata run on the server computer. A compatible endpoint on another LAN machine is still off-device, even if both machines are privately owned. OpenRouter is external. The provider indicator and composer hint make this distinction visible; there is no additional consent checkbox on each normal send.

AI controls are localhost-only by default. Headless deployments can deliberately enable `ALLOW_LAN_AI=1`, which grants full AI and connected-vault management to clients admitted by the server's host/origin policy. It is not authentication. See [network access](/network-access/) before enabling it.

Image input is currently a [local model API](/model-api/) feature with a capable model, matching projector and supported runtime. The archived web-chat composer does not offer general image attachment or vision input.

## Source references

- [Generation and private-chat contract](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/GENERATION.md)
- [Request context, continuation and generation routes](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/generation.ts)
- [Saved chat persistence](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/threads.ts)
- [Provider registry](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/registry.ts)
- [Browser private-chat state](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/client/src/private-chat-memory.ts)
