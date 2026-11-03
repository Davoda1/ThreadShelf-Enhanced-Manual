# Local AI models

Local generation is optional and separate from the embedding model used for archive search. ThreadShelf Enhanced can manage a llama.cpp runtime and GGUF model, connect to an existing loopback llama.cpp server, or use a separately started Strata service. Downloaded models and runtimes require disk space and network access during setup; inference can then run locally.

## Choose how to run a model

| Approach | ThreadShelf manages | Appropriate when |
| --- | --- | --- |
| Guided llama.cpp setup | Approved runtime/model download and a managed model process | Setting up generation for the first time |
| Existing GGUF and llama-server executable | Model discovery and the managed process | Reusing a compatible local installation |
| Existing llama.cpp server URL | Requests to a separately managed loopback service | Custom runtime arguments or a separately controlled service |
| Strata | Health checks, model discovery and chat requests only | Strata is already running on the same machine |

Loopback refers to the computer running the ThreadShelf server. A browser on another computer does not make its own `127.0.0.1` a model endpoint for the server.

## Guided setup

1. Open **Settings → AI Models → Set up local generation**.
2. Review the detected platform, acceleration option and proposed model/quantization.
3. Inspect the download plan, including URLs, sizes, SHA-256 digests and destinations.
4. Confirm the plan and wait for verified installation. Cancel stops an in-progress transfer.
5. Select the installed provider/model and send a short test prompt.

The server reconstructs the plan before downloading. If its resolved files or detected conditions no longer match the approved fingerprint, it returns a new plan for review rather than silently fetching different artifacts. Existing verified files can be reused. A cancelled download retains a partial file for resumption; other failed transfers are cleaned up by the shared downloader.

Runtime and model installation are distinct. Installing llama.cpp alone does not download a GGUF. The combined guided plan handles both, while the runtime CLI below handles the executable only.

## Discover or install llama.cpp from the CLI

From the installed source checkout with its compatible Node/npm available:

```bash
npm run setup:llama
npm run setup:llama -- -- --check
npm run setup:llama -- -- --install
```

The first command performs local discovery. `--check` requests release metadata without downloading a runtime archive. `--install` asks for confirmation before installing the selected official build. For a deliberately unattended installation, add `--yes`.

CPU is the broad compatibility option. An accelerator variant such as `cuda`, `vulkan`, `rocm` or `sycl` requires a suitable runtime build and host drivers. Available release artifacts and platform support are determined at installation time. For example:

```bash
npm run setup:llama -- -- --check --variant vulkan
npm run setup:llama -- -- --install --variant vulkan
```

Official builds are installed side by side under `.threadshelf/tools`. Selecting an accelerator variant does not overwrite a working CPU installation. Explicit executable settings and environment overrides take priority over automatic discovery. Review updates manually; the server does not automatically replace a runtime. Older managed directories remain until deliberately removed after checking the replacement.

## Add existing GGUF files

Configure model folders in **Settings → AI Models**. The server searches configured roots recursively and also recognizes common local model locations. It skips projector files and later shards of a multipart model in the main model list; all required shards must still be present for inference.

Downloaded catalog models go to `.threadshelf/models` by default, or the configured download directory. That directory is always included in discovery. `THREADSHELF_MODELS_PATH` changes its default location. `LLAMA_MODEL_PATHS` adds environment-defined model roots, while `THREADSHELF_DISABLE_DEFAULT_MODEL_PATHS=1` disables conventional default roots. Recursive discovery does not follow symbolic-link directories.

Use the catalog to inspect quantizations, file sizes, model license and available metadata. Public Hugging Face repositories do not require a token. Gated repositories require accepting their terms and configuring `HF_TOKEN` or its supported alias. Downloaded files are checked against the repository's published LFS SHA-256 identity before activation.

The fit indicator is a planning estimate:

| Verdict | Interpretation |
| --- | --- |
| `fits` | File size is within the detected model budget, using accelerator headroom or a system-RAM fallback |
| `tight` | Above that budget but within the configured total-RAM headroom estimate |
| `too-large` | Beyond the estimated available model budget and RAM allowance |

Weights are only part of memory use. Context cache, runtime buffers, the operating system and other processes need space too. A favorable fit label does not guarantee a particular context size, generation speed or freedom from memory pressure.

## Runtime controls and performance

A managed model runs as `llama-server` on an ephemeral loopback port. ThreadShelf waits for health before sending requests and stops the managed process when switching models or exiting. The optional idle-unload setting releases an unused model; its default keeps the model loaded. An externally managed server remains under its operator's control.

Start with a modest context and one model that fits comfortably. Then adjust one setting at a time:

| Setting | Practical effect |
| --- | --- |
| Context size | Larger histories consume more cache memory and may slow generation |
| Acceleration | Choose CPU, automatic fit, a GPU profile, or explicit CPU/GPU sharing appropriate to the installed runtime |
| KV cache | Quality uses matching Q8 key/value caches; Memory saver uses matching Q4 caches when supported |
| Flash Attention | Required by the managed quantized-cache profiles; supported flags depend on the runtime |
| Speculative decoding | Uses a built-in MTP/NextN head only when both runtime and GGUF metadata support it |
| Reasoning effort | Applies a supported runtime/model control; it can change time spent before the answer |

The wrapper inspects runtime help and model metadata. Unsupported controls are skipped and logged instead of being assumed from a model's filename. Performance presets do not change sampling temperature, top-p or top-k. For a concrete diagnosis, inspect the resolved runtime profile and actual offloaded layers rather than relying on a nominal GPU setting.

## Existing servers and Strata

An existing llama.cpp URL can be set in AI Models or through `LLAMA_CPP_BASE_URL`. It must be loopback-only. This route is useful for custom runtime flags or a separately maintained service.

Start Strata separately, then choose **Strata** in the model picker. The default is `http://127.0.0.1:8080`. Set `STRATA_BASE_URL` to another loopback HTTP(S) root and, if required, `STRATA_API_KEY`. The integration checks `/health`, reads `/v1/models`, and sends `/v1/chat/completions`; it does not install, launch or unload Strata.

For a server on another machine, use the explicitly configured [OpenAI-compatible provider](/remote-providers/) instead. It is labeled off-device, including when its address is on a LAN.

## Vision models

Image input is available through the [model API](/model-api/), not the archive chat composer. Managed models need a capable runtime and a matching GGUF projector. Map full model paths to projector paths in **AI Models → Vision projectors**, or use an unambiguous directory containing one model and one projector. Projectors must be inside configured model roots. Inline PNG, JPEG, WebP and GIF are accepted subject to request limits; remote image URLs and filesystem paths are rejected.

## Source references

- [Generation setup and runtime behavior](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/GENERATION.md)
- [Configuration and environment precedence](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/config.ts)
- [Hardware inspection and fit estimates](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/hardware.ts)
- [Managed llama.cpp process](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/llama-process.ts)
- [Strata integration](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/providers/strata.ts)
- [Vision validation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/generation/vision.ts)
