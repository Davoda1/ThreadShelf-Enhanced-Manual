# OpenRouter and compatible providers

ThreadShelf Enhanced supports optional external generation alongside local engines. OpenRouter has a dedicated provider. Other services can be configured through an explicit OpenAI-compatible API base URL. Choose a provider intentionally: requests can include the selected conversation, a master prompt and enabled knowledge-tool results.

## Understand what leaves the server

| Request component | Included when |
| --- | --- |
| New user prompt | A generation is sent |
| Previous user and assistant turns | Continuing the selected archived or created conversation |
| Selected master prompt | A master prompt is active |
| Archive excerpts | Archive tools are enabled and retrieve content |
| Markdown note excerpts | Notes tools are enabled for a connected folder and retrieve content |
| Archived thinking turns | Excluded from replayed provider context |

An off-device label means the endpoint is outside the ThreadShelf server's loopback interface. A LAN inference server falls into this category even if it is under the same operator's control. Private chat prevents local transcript persistence but does not change this transmission boundary. External provider retention, billing and availability remain governed by the selected service.

The web-chat composer accepts text rather than arbitrary image attachments. The separate [local model API](/model-api/) has its own supported inline-image contract. Do not assume that enabling an external chat provider adds vision to the archive composer.

## Configure OpenRouter

1. Open **Settings → AI Models** and locate OpenRouter.
2. Supply a provider API key for the current server session, or configure `OPENROUTER_API_KEY` in the server environment for use after restart.
3. Select OpenRouter in the model picker and choose a model from the live catalog.
4. Review its off-device indicator and any enabled archive/notes scopes.
5. Send a short nonsensitive test prompt before relying on a longer continuation.

A key entered in Settings overrides the environment key for the current server process. It is not written to generation settings and is not returned in settings responses. Restarting clears a session-only key. For persistent configuration, edit the active server's existing `.env` rather than replacing the file with a new template, then restart the server. Its location follows the [configuration rules](/configuration/), including an explicitly configured data root. Explicit parent-process variables take precedence over `.env` loading.

The model catalog is queried live rather than maintained as a fixed list in the application. Search, favorites, popularity/newest sorting and the Free-only filter help navigate it. A catalog entry or free designation does not guarantee that the account has a usable route, that quotas are available, or that the provider can satisfy a particular privacy policy.

## Routing restrictions

**ZDR-only routing** is an optional per-request control and can also be configured as a saved default. When enabled, ThreadShelf adds `provider.zdr=true` to the OpenRouter request. A separate saved option denies data collection. Both restrictions are opt-in and can reduce the set of eligible endpoints.

If a request fails with a message about no endpoints matching the data policy, first check the selected model and these routing settings. Change the route only after deciding that the resulting policy is acceptable. Neither option makes a remote request local, and the application cannot provide guarantees beyond the service's current implementation and terms.

The repository links to OpenRouter's own [data collection documentation](https://openrouter.ai/docs/guides/privacy/data-collection), [ZDR guidance](https://openrouter.ai/docs/guides/features/zdr) and [provider routing reference](https://openrouter.ai/docs/guides/routing/provider-selection). Consult those primary service documents when selecting a policy.

## Configure another compatible server

In **Settings → AI Models → OpenAI-compatible server**, enter a descriptive label and the API base URL. For a service on the same server computer, a typical example is:

```text
http://127.0.0.1:1234/v1
```

The integration appends `/models` and `/chat/completions`. Supply the API base, not the final chat endpoint, and include `/v1` when the chosen service requires it. The URL must use HTTP or HTTPS and cannot contain embedded credentials, a query string or a fragment.

The label and endpoint are saved. A key entered through Settings lasts for the server session and is tied to that endpoint. Changing the endpoint does not forward the previous endpoint's session key. Environment variables `OPENAI_COMPATIBLE_BASE_URL` and `OPENAI_COMPATIBLE_API_KEY` override saved/session values. Keep credentials in the key field or environment, never in a URL.

The server must implement the compatible operations used by ThreadShelf. A familiar API shape does not guarantee identical behavior for streaming, model metadata, reasoning or tool calls. Archive and note tools additionally depend on the selected model and endpoint handling the tool protocol. Unsupported provider behavior should be diagnosed with a minimal text-only request before enabling more features.

## Streaming, errors and operational checks

Generation connections refuse redirects, enforce idle/size bounds and propagate cancellation. A redirect response therefore needs a corrected endpoint; it is not followed silently with conversation content or credentials.

| Symptom | Check |
| --- | --- |
| No models appear | Base URL, required `/v1` prefix, credentials, endpoint availability and returned model-list format |
| Unauthorized response | Key validity, endpoint association, account access and environment overrides |
| A saved endpoint changes after restart | An environment value may be overriding the stored setting |
| Plain chat works but tools fail | Model/provider tool support and the specific reported protocol error |
| Long continuation fails | Context limits, output budget, retrieved content size and provider limits |
| A private chat used a remote service | Private mode controls storage; the selected provider controls where inference runs |

ThreadShelf does not install or launch a custom compatible service. Keep that service's own authentication and transport configuration appropriate to its network location. See [network access](/network-access/) for the distinct controls governing who can use the ThreadShelf interface, and [privacy and security](/privacy-security/) for data storage boundaries.

## Source references

- [Generation providers and privacy behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/GENERATION.md)
- [Compatible endpoint and key validation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/config.ts)
- [Compatible server operations](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/providers/compatible.ts)
- [OpenRouter provider implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/providers/openrouter.ts)
- [Provider transport bounds](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/transport.ts)
