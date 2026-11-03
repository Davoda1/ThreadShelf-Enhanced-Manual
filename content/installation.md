# Installation

Install ThreadShelf Enhanced from its source release into a writable directory. The supplied setup scripts install a project-local Node.js and npm runtime, install locked dependencies, and build the web interface and server. They preserve an existing `.env` and create one from `.env.example` when needed.

## Choose a distribution

Download the source ZIP or TAR.GZ from [the latest Enhanced release](https://github.com/Davoda1/ThreadShelf-Enhanced/releases/latest). Keep the release's `SHA256SUM.txt` beside the archive and verify its matching entry before extraction. The release page identifies the current filenames and supported runtime; instructions here do not depend on a particular patch number.

A source checkout is also available:

```bash
git clone --branch master https://github.com/Davoda1/ThreadShelf-Enhanced.git
cd ThreadShelf-Enhanced
```

The branch can contain work newer than the latest release. Use a published source archive when a release's validation record is required. Enhanced is a private npm package distributed through GitHub source releases; `npx threadshelf` installs the upstream project, not this fork.

## Requirements

| Platform | Setup prerequisites |
| --- | --- |
| Linux x64 or ARM64 | Bash, `curl` or `wget`, `tar`, `sha256sum`, and system libraries compatible with the selected official Node binary |
| Windows x64 or ARM64 | PowerShell, network access for setup, and a writable extraction directory |
| Existing Node installation | Node 24 or newer plus an npm version compatible with the selected Node release and repository lockfile |

The scripts verify the Node download against the official SHA-256 checksum list and run the staged binary before replacing an existing runtime. They do not change the global Node installation or shell profile, and administrator access is not required for the project setup. Operating-system prerequisites may need separate installation; for example, the current Linux runtime requires `libatomic.so.1`.

A GPU is not required for archive search. Embeddings use CPU by default. AI generation and speech have separate model, platform, memory and download requirements; review those features after the archive works.

## Install on Linux

From the extracted source directory:

```bash
bash setup-threadshelf.sh
./threadshelf-enhanced --check-runtime
./threadshelf-enhanced
```

Open [http://localhost:3000](http://localhost:3000). For setup followed immediately by startup, use:

```bash
bash setup-threadshelf.sh --start
```

For later starts, run `./threadshelf-enhanced`. The launcher uses the compiled application and local runtime without reinstalling dependencies. It resolves the installation from its own location, including through a symlink. `THREADSHELF_ENHANCED_DIR` can select a different installation explicitly.

Press **Ctrl+C** in the server terminal to stop. The launcher waits for the child process to exit, prints `CTRL-C`, and treats an intentional interrupt as a successful stop. Startup and runtime errors retain their failure status. No terminal multiplexer is required.

## Install on Windows

Open PowerShell in the extracted source directory and run:

```powershell
.\setup-threadshelf.ps1 -Start
```

If Windows blocks a downloaded script, review it first, then unblock that file:

```powershell
Unblock-File .\setup-threadshelf.ps1
```

An organization-managed execution policy still applies. Do not disable policy globally to work around a setup failure.

For subsequent starts, the following discovers the runtime installed for the operating system's architecture without embedding a patch number:

```powershell
$tsArch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLowerInvariant()
$tsNodes = @(Get-ChildItem -Path ".\.local\node-v*-win-$tsArch\node.exe" -File)
if ($tsNodes.Count -ne 1) {
    throw 'Select the intended local node.exe explicitly; expected exactly one installed runtime.'
}
& $tsNodes[0].FullName .\dist\src\server.js
```

Run this from the installation directory. If several runtimes are present, use the complete `node.exe` path for the version selected during setup. Re-running `setup-threadshelf.ps1 -Start` is also supported, but performs dependency installation and a build before startup.

## Setup controls

| Purpose | Linux | PowerShell |
| --- | --- | --- |
| Install and start | `--start` | `-Start` |
| Install runtime only | `--runtime-only` | `-RuntimeOnly` |
| Select a Node version | `--node-version VERSION` | `-NodeVersion VERSION` |
| Select an npm version | `--npm-version VERSION` | `-NpmVersion VERSION` |

Replace `VERSION` with a complete compatible version number. The environment alternatives are `THREADSHELF_NODE_VERSION` and `THREADSHELF_NPM_VERSION`. An explicit setup argument takes precedence. The Linux launcher must use the same `THREADSHELF_NODE_VERSION` when setup used a non-default runtime. Runtime-only mode does not build the application or create its configuration.

Use the defaults shipped with the selected release unless there is a specific compatibility requirement. Node 24 is the minimum for the importer's lossless handling of large JSON integer tokens. A higher Node requirement can come from the selected npm release; the current npm 12 line requires at least Node 24.15 within Node 24.

## Use an existing compatible runtime

With Node and npm already available:

```bash
npm ci
npm run build
npm start
```

One root `npm ci` installs both server and client workspaces. Do not separately install unpinned client dependencies. To choose another port for this startup:

```bash
npm start -- 3001
```

## Verify the first start

1. Confirm the terminal reports a listening server.
2. Open the web interface and check that the archive is reachable.
3. Read [configuration](/configuration/) before changing storage or network settings.
4. Follow [Quick start](/quick-start/) with a small synthetic or non-sensitive export.
5. Allow the first embedding-model download to finish before judging indexing performance.

This is a local server application: closing its terminal stops the service. For an existing archive, follow [Backup and migration](/backup-migration/) before installing over or moving any data.

## Source references

- [Enhanced installation guide](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/README.md)
- [Linux setup script](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/setup-threadshelf.sh)
- [Windows setup script](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/setup-threadshelf.ps1)
- [Linux launcher](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/threadshelf-enhanced)
