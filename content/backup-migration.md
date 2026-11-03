# Backup and migration

A reliable backup includes the complete stopped data store and its configuration. Conversation rows, vectors, job/publication metadata and coordination sidecars form one storage system. Copying selected LanceDB tables is not a consistent installation backup.

## What to preserve

For the standard source-release layout, include:

| Location | Contents |
| --- | --- |
| `.lancedb/` | Complete database, publication/job metadata, retained staging and SQLite sidecars |
| `.uploads/` | Browser-uploaded originals and media |
| `.collections.json` | Collection registry and associated sidecars where present |
| `.threadshelf/` | Generation configuration, master prompts, models/tools, embedding cache, image cache, speech settings/assets/recordings and note configuration |
| `.env` | Startup configuration and optional credentials |
| External configured locations | Any separately stored database, uploads, models, caches, executable paths and Markdown vaults |

An explicit `THREADSHELF_DATA_DIR` uses a different, flat layout. Individual path overrides can also point outside the installation. Inventory actual settings before copying; the list above is not a substitute for checking [configuration](/configuration/).

Backups can contain private conversation text, API credentials and recordings. Store and share them accordingly. Do not add an installation backup to a source repository.

## Make a consistent backup

1. Stop every HTTP server, importer, watcher and MCP writer using the data.
2. Confirm that no service manager is automatically restarting them.
3. Copy the complete data directories and configuration, including sidecars.
4. Preserve original exports and external note/model locations separately where required.
5. Keep the stopped copy until a restored or migrated installation has been verified.

Do not remove lock or SQLite sidecar files to make a running backup appear cleaner. A lock coordinates active processes; it is not evidence of disposable data. The supported storage contract assumes a local filesystem with working operating-system locks. Network-mounted databases are not a tested deployment mode.

## Use the verified migration helper

The repository includes `scripts/migrate-installation.mjs` for standard repository-layout installations. It copies selected data into a fresh installation, verifies copied bytes with SHA-256 and audits configuration/symlinks for dependencies on the old directory. Both source and target paths are required; the tool has no machine-specific defaults and never deletes the source.

Prepare the target first:

1. Extract the current source release into a separate, non-nested directory.
2. Run its setup without `--start` or `-Start`.
3. Do not start the new server before migration.
4. Confirm that both installations and all shared writers are stopped.

The destination must not contain any selected data entry. A setup-created `.env` is the only replacement exception: it is saved to a timestamped backup before the source `.env` replaces it.

## Run on Linux

From the new installation, select its local runtime. This version-neutral example requires exactly one matching runtime for the current architecture:

```bash
case "$(uname -m)" in
  x86_64) ts_arch=x64 ;;
  aarch64|arm64) ts_arch=arm64 ;;
  *) printf 'Unsupported architecture\n' >&2; exit 1 ;;
esac
shopt -s nullglob
ts_nodes=(.local/node-v*-linux-"$ts_arch"/bin/node)
if ((${#ts_nodes[@]} != 1)); then
  printf 'Select the intended local Node runtime explicitly.\n' >&2
else
  "${ts_nodes[0]}" scripts/migrate-installation.mjs \
    --stopped --source /path/to/old-installation \
    --target /path/to/new-installation
fi
```

Replace both example paths. If several runtime versions exist, use the explicit binary selected during setup. A compatible system `node` can also run the helper.

## Run on Windows

From the new installation directory:

```powershell
$tsArch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLowerInvariant()
$tsNodes = @(Get-ChildItem -Path ".\.local\node-v*-win-$tsArch\node.exe" -File)
if ($tsNodes.Count -ne 1) {
    throw 'Select the intended local Node runtime explicitly.'
}
& $tsNodes[0].FullName scripts\migrate-installation.mjs `
    --stopped --source 'C:\Apps\ThreadShelf-Old' `
    --target 'C:\Apps\ThreadShelf-New'
```

`--stopped` records the operator's confirmation. Linux process inspection is an additional best-effort safeguard; it cannot prove every possible writer has stopped.

## Copy behavior and custom layouts

The normal copy includes `.lancedb`, `.uploads`, `.collections.json`, `.threadshelf` and `.env` when present. `--include-caches` additionally selects `.cache`, `.config`, `.home` and `.local/share`. Speech assets and recordings inside `.threadshelf` are already included without that option.

The helper excludes old application code, dependencies, Node binaries and generated builds. Interrupted copying, changed source data or failed verification aborts the operation and rolls back committed entries. A successful copy can still report unresolved external dependencies.

Custom common data roots, custom database paths and database symlinks require a separately planned copy of the real data roots. The helper refuses unsupported layouts instead of claiming they are complete. It does not copy external Markdown vaults or rewrite stored source identities and attachment references.

## Audit before retiring the old installation

Review the copied `.env`, especially absolute paths, hosts/origins and the independent LAN feature flags. Editing a fresh target template before migration does not change the old configuration that replaces it.

Use a compatible Node runtime to repeat the read-only audit:

```bash
node scripts/migrate-installation.mjs --audit-only \
  --source /path/to/old-installation \
  --target /path/to/new-installation
```

Exit status `0` means the inspected configuration/symlink locations are clear; `2` means old-directory dependencies remain. The report includes local paths and should stay private. A clean audit is not proof that every stored source reference or attachment is independent of the old directory.

Start the new installation and check collection counts, representative threads, every search mode, media, AI models, notes, speech and connected desktop clients. Preserve the original server URL and source paths where bookmarks or identities depend on them. Only retire the old installation after verification and resolution of dependency warnings.

## Upgrade and rollback rules

Upgrade every process sharing a writable store together. Generation/publication metadata introduced in Enhanced 1.3.0 changed the internal storage protocol; older executables must not open a store written with that protocol as a downgrade strategy.

Existing data does not require a mandatory reimport just because the application is upgraded, though pending index recovery may run at startup. Once a new server has written the store, rollback means restoring the complete stopped backup with its matching software and configuration.

## Source references

- [Migration guide](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/MIGRATION.md)
- [Verified migration implementation](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/scripts/migrate-installation.mjs)
- [Storage compatibility](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/docs/ENHANCED_COMPATIBILITY.md)
- [Data layout](https://github.com/Davoda1/ThreadShelf-Enhanced/blob/master/src/paths.ts)
