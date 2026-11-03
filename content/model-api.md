# Local model API

The `/v1` API lets compatible clients use the local llama.cpp runtime through OpenAI-style and Anthropic-style requests. It also exposes optional installed local speech engines. This interface does not search the archive: use the [archive HTTP API](/http-api/) or [MCP](/mcp/) for retrieval.

## Choose the correct base URL

On the server machine, the OpenAI-compatible base is normally `http://localhost:3000/v1`. Anthropic-compatible clients commonly take `http://localhost:3000` as their base and append `/v1/messages` themselves. Check the client's base-URL convention to avoid duplicating `/v1`.

The API is enabled by default, restricted to the server machine, with no key configured. **Settings → Server → Local model API** controls these choices. A client that insists on a key can use an arbitrary placeholder only while no real key is configured. Once a key is set, every `/v1` request must present it using `Authorization: Bearer ...` or `x-api-key`.

`THREADSHELF_API_KEY` overrides the saved key. The setting is independent of archive access: it does not authenticate `/api` or the web interface.

## Discover models before calling them

```bash
curl 'http://localhost:3000/v1/models'
```

The response follows the list shape `{ "object": "list", "data": [...] }`. GGUF entries include a public `id`, `object`, `owned_by`, `loaded`, and a top-level `vision` flag when known. Use the returned ID exactly; do not send a local filesystem path.

Managed model IDs usually derive from the GGUF filename without its extension. Colliding names gain folder qualifiers and, if necessary, a deterministic digest suffix. An existing configured llama-server retains its own model IDs. Discovery reports available models; it does not mean that every model is already loaded or fits available memory.

## Supported routes

| Method and path | Role |
| --- | --- |
| `GET /v1/models` | List local inference models and enabled, installed speech models. |
| `GET /v1/models/:id` | Retrieve one model; IDs can include a folder separator. |
| `POST /v1/chat/completions` | OpenAI-style chat. |
| `POST /v1/completions` | Text completion. |
| `POST /v1/responses` | Responses-style inference. |
| `POST /v1/messages` | Anthropic-style messages. |
| `POST /v1/messages/count_tokens` | Anthropic-style token-count request. |
| `POST /v1/models/unload` | Unload the managed model between requests. |
| `GET /v1/audio/voices` | List installed local English voices. |
| `POST /v1/audio/speech` | Generate local speech. |

The inference routes relay to llama-server after validating the request and resolving its public model ID. Tool calls, structured output, sampling options and streaming depend on the installed llama.cpp build and model template. This is protocol compatibility, not a promise to implement every hosted-provider feature. There are no `/v1/embeddings`, speech-recognition, image-generation or Ollama-native routes.

## Send a chat request

Replace `MODEL_ID_FROM_LIST` with an ID returned by discovery:

```bash
curl 'http://localhost:3000/v1/chat/completions' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "MODEL_ID_FROM_LIST",
    "messages": [
      { "role": "system", "content": "Answer concisely." },
      { "role": "user", "content": "Explain a search index." }
    ],
    "max_tokens": 160,
    "stream": false
  }'
```

Add the configured authentication header when required. For streaming, set `stream` to true and consume the runtime's event stream. Disconnecting an inference client aborts its upstream generation. This differs from accepted background imports, which continue after their observer disconnects.

Requests are limited to 32 MiB of JSON. They are not saved as ThreadShelf conversations, and the web interface's active master prompt is not added. Supply the intended system message and history in the request.

## Model lifecycle and image input

The managed runtime loads a requested GGUF on demand and holds a lease throughout the response. It cannot replace a model while that model is busy. A request requiring a conflicting model receives 503 `model_busy`; retry after the active work finishes. Runtime capacity still determines concurrency for requests using the same model.

`POST /v1/models/unload` accepts an optional `model`. With no model it attempts to unload the current managed model; specifying another known model that is not loaded is a no-op. An unknown model ID still returns `model_not_found`. An externally managed llama-server must be unloaded through its own controls.

Vision needs a capable model, a matching projector and runtime support. Supported inline image forms include OpenAI `image_url`, Responses `input_image`, and Anthropic base64 image sources. Only inline PNG, JPEG, GIF and WebP are accepted, up to four images, 8 MiB each and 16 MiB total within the body limit. Remote image URLs and filesystem paths are rejected. A projector flag alone does not establish model quality or image-understanding accuracy.

## Local speech requests

Enable [Text-to-speech](/speech/) and explicitly install a local engine first. Available models are `tts-pocket` and `tts-kokoro`; request valid voice IDs from `/v1/audio/voices`.

```json
{
  "model": "tts-kokoro",
  "input": "This is a local speech example.",
  "voice": "am_michael",
  "response_format": "wav",
  "speed": 1
}
```

Speech accepts `wav` (default) or `pcm`, with 1–100,000 input characters and provider-level limits. `speed` must be 1; change listening speed in playback. PCM is 24 kHz, mono, signed 16-bit audio and can stream when server streaming is enabled and `stream` is not false. WAV is returned after synthesis completes. These calls bypass archive/audio-cache persistence and cannot use the server's paid speech-provider credentials.

## Network access and errors

The optional network listener serves only `/v1`, normally on port 3001. Enable it in Server settings to connect from another machine, container or VM. Enabling network access does not require or generate a key automatically. Configure a key deliberately for remote clients: without one, the listener relies on its Host/Origin checks and deployment network boundary; with one, requests must present the key. `HOST`, `ALLOW_LAN_AI` and `ALLOW_LAN_TTS` do not automatically enable this listener or bypass its configured key. See [Network access](/network-access/) for the two separate access boundaries.

| Status | Typical code | Next action |
| --- | --- | --- |
| 400 | `invalid_request` | Correct the model, body, image input or unsupported parameter. |
| 401 | `invalid_api_key` | Use the configured key. |
| 403 | `forbidden` / `api_disabled` | Check the listener and access settings. |
| 404 | `model_not_found` / `unknown_endpoint` | Refresh model discovery or correct the route. |
| 413 | Body too large | Reduce the request. |
| 500 / 502 | `model_load_failed` / `upstream_unavailable` | Inspect runtime configuration and logs. |
| 503 | `model_busy` | Retry after active generation. |

Inference errors use OpenAI-style objects, or Anthropic-style objects for messages routes and requests carrying `anthropic-version`. Runtime errors retain their upstream status and message. If a stream fails after headers have been sent, the connection ends; treat the output as incomplete.

## Source references

- [Local API routes and access controls](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/local-api.ts)
- [Model IDs and runtime leases](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/local-api.ts)
- [Network listener](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/local-api-network.ts)
- [Image validation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/vision.ts)
- [Speech API implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/tts/service.ts)
