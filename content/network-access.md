# Network and headless access

The default installation listens on loopback and is intended for one trusted user. A headless server can expose the web interface on a trusted network, with separate permissions for AI and speech management. Configure the listening address, host checks and feature permissions together.

## Three independent boundaries

| Boundary | Controls | Does not do |
| --- | --- | --- |
| Main HTTP listener | Whether the archive UI/API can be reached beyond the host | Create accounts or authenticate visitors |
| AI and speech flags | Whether non-loopback web clients may use full feature-management controls | Restrict access to a particular subnet or enable `/v1` network inference |
| Optional model API | OpenAI/Anthropic-compatible inference access, its key and separate network listener | Add authentication to the archive UI/API |

A model API key protects the model API according to its own configuration. It does not secure every route served by ThreadShelf Enhanced. The application is not a multi-tenant service.

## Default local-only configuration

For access from a browser on the same machine:

```dotenv
HOST=127.0.0.1
PORT=3000
ALLOWED_HOSTS=localhost,127.0.0.1
ALLOWED_ORIGINS=
ALLOW_LAN_AI=0
ALLOW_LAN_TTS=0
```

Open [http://localhost:3000](http://localhost:3000). Loopback refers to the machine on which the browser runs. From a laptop, `localhost` refers to the laptop, not a separate server.

## Configure a trusted LAN

Edit the active installation's `.env`. This example uses the documentation-only address `192.0.2.10`; replace it with the server's actual reachable address before use:

```dotenv
HOST=0.0.0.0
PORT=3000
ALLOWED_HOSTS=localhost,127.0.0.1,192.0.2.10
ALLOWED_ORIGINS=
ALLOW_LAN_AI=1
ALLOW_LAN_TTS=1
```

Then restart the server and open `http://SERVER_ADDRESS:3000`, substituting its real address. The host allowlist entries have no URL scheme or port. `HOST=0.0.0.0` means listen on all IPv4 interfaces; it is not the address to type into the browser.

Set either feature flag to `0` if that management surface is not needed. Only the trimmed value `1` enables a flag; `true`, `yes`, unset and other values leave it disabled. An exported process variable overrides the `.env` entry, so inspect the service or shell environment if a restart does not apply the expected behavior.

All clients able to reach an allowed address receive the enabled management permission without a separate login. Use a trusted network boundary or an authenticated access layer. `ALLOWED_HOSTS` is a request-host check, not a list of permitted client IP addresses.

## What the flags grant

`ALLOW_LAN_AI=1` permits the AI management surface, including conversation generation, model setup/download controls, model-directory browsing and connected Markdown-vault management. Enabling it therefore grants more than permission to send a chat prompt.

`ALLOW_LAN_TTS=1` permits speech setup, provider and credential controls, saved audio, cache management and playback. It does not itself turn speech on or download any voice engine. Open **Settings → Text-to-Speech**, enable and save speech, then explicitly review **Download local voices** if local CPU synthesis is wanted.

Speech permission is independent of AI permission. A headless installation can allow speech while keeping AI/model management localhost-only.

## Browser origins and reverse proxies

The main API checks the request's host. Browser requests that send `Origin` must also match the server's exact origin, including scheme and port, unless explicitly listed in `ALLOWED_ORIGINS`.

A browser page at `http://localhost:5173` is a different origin from `http://localhost:3000`. Merely adding `localhost` to `ALLOWED_HOSTS` does not authorize every local web application to drive the management API.

For a deliberate HTTPS reverse proxy, a configuration may include:

```dotenv
ALLOWED_HOSTS=localhost,127.0.0.1,archive.example.org
ALLOWED_ORIGINS=https://archive.example.org
```

`archive.example.org` is an example hostname. Preserve the intended Host header and configure authentication at the proxy. The application does not automatically trust forwarded headers to infer HTTPS, so an explicit externally visible browser origin may be required. An allowlisted origin permits the application's origin check; it does not by itself implement a complete cross-origin frontend deployment or add authentication.

Native desktop clients usually omit the browser `Origin` header and do not need a browser-origin entry. Host checks still apply. Preserve the server URL used by clients when migrating, because bookmarks and thread identity can depend on it.

## Restricted authenticated LAN speech

When `ALLOW_LAN_TTS` remains disabled, the separate **Allow authenticated LAN speech** setting offers a narrower path. It requires enabled speech, an enabled local model API and a configured nonempty `/v1` API key.

This path uses installed local CPU voices. It does not expose the server's paid-provider credentials, and server speech-cache access is disabled. The browser retains its key in memory. Runtime installation, credential changes and other management remain localhost-only.

The restricted option does not reduce the full trusted-LAN authority granted by `ALLOW_LAN_TTS=1`. Choose the access model intentionally; do not expect both settings to combine into an extra authentication layer for full management.

## Diagnose a blocked connection

1. Confirm the service is running and local `/api/health` succeeds.
2. Check that `HOST` listens on the intended interface.
3. Check the actual URL hostname/IP against `ALLOWED_HOSTS`.
4. Check firewall rules and any proxy routing.
5. For a browser 403, inspect whether the error names the host, origin or feature permission.
6. For AI or speech controls, confirm the independent flag and restart the correct installation.
7. For `/v1`, use its separately configured listener, key and API settings.

Avoid enabling broad access just to hide a configuration error. Match the required address and feature to the intended clients. See [Model API](/model-api/) and [Privacy and security](/privacy-security/) for the respective contracts.

## Source references

- [Network security policy](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/SECURITY.md)
- [Feature permission checks](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/feature-access.ts)
- [Host and browser-origin checks](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/routes/local-origin.ts)
- [Speech network access](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/TTS.md)
- [Model API access](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/LOCAL_API.md)
