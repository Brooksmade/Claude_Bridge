# Bridge to Fig Desktop

A Tauri v2 system tray app that runs the Bridge to Fig server as a background process. This is the downloadable companion app that lets Figma plugin users connect to the bridge server without running Node.js manually.

## Features

- System tray icon with three states: connected (green), waiting (yellow), stopped (grey)
- Bridge server runs as a sidecar binary (no Node.js required for end users)
- Status window showing server health, plugin connection, and recent activity
- Auto-updater via GitHub Releases
- Process tree cleanup on exit (kills server + child processes like Chrome)

## Prerequisites

- **Rust** (1.70+)
- **Node.js** (20+)
- **pnpm** (9+)

### Install Rust

**macOS / Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Windows:**
Download and run the installer from [rustup.rs](https://rustup.rs/).

### Install Tauri CLI

```bash
cargo install tauri-cli --version "^2"
```

## Development

### 1. Install workspace dependencies

From the project root:
```bash
pnpm install
```

### 2. Generate icons (first time only)

```bash
cd desktop
npx --yes sharp  # Ensure sharp is available
node generate-icons.mjs
```

### 3. Place sidecar binary for development

For local development, you need a bridge-server binary in the sidecar location. The simplest approach is to bundle the server and use Node to run it:

```bash
# From project root
pnpm --filter @bridge-to-fig/server bundle

# The Tauri dev server will look for the sidecar at:
# desktop/src-tauri/binaries/bridge-server-{target-triple}[.exe]
#
# For development, you can skip the sidecar and run the bridge server separately:
cd bridge-server && pnpm dev
```

### 4. Run in development mode

```bash
cd desktop
cargo tauri dev
```

This starts the Tauri app with hot-reload for the frontend. The bridge server sidecar will attempt to start automatically. If it fails (no sidecar binary), run the bridge server manually in a separate terminal.

## Building for Production

### Build the app

```bash
cd desktop
cargo tauri build
```

The built installer will be in `desktop/src-tauri/target/release/bundle/`.

### Generate signing keys (for auto-updater)

```bash
cargo tauri signer generate -- -w ~/.tauri/bridge-to-fig.key
```

Store the private key as `TAURI_SIGNING_PRIVATE_KEY` in GitHub Secrets. The public key goes in `tauri.conf.json` under `plugins.updater.pubkey`.

## Architecture

```
desktop/
├── src/                    # Frontend (vanilla HTML/CSS/JS, no build step)
│   ├── index.html          # Status page UI
│   ├── styles.css          # Dark theme styling
│   └── main.js             # Health polling, UI updates
├── src-tauri/              # Tauri/Rust backend
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri app configuration
│   ├── capabilities/       # Permission definitions
│   ├── icons/              # Tray and app icons (generated)
│   └── src/
│       ├── main.rs         # Entry point
│       └── lib.rs          # App logic: tray, sidecar, health polling
├── generate-icons.mjs      # Icon generation script (sharp)
└── package.json            # Frontend dependencies (@tauri-apps/api)
```

### How it works

1. On startup, the Tauri app spawns the bridge-server as a sidecar process
2. A background thread polls `http://localhost:4001/health` every 3 seconds
3. The tray icon updates based on the server response:
   - **Green**: Server running and plugin connected
   - **Yellow**: Server running, waiting for Figma plugin
   - **Grey/Red**: Server stopped or unreachable
4. Left-clicking the tray icon shows the status window
5. On quit, the app kills the sidecar and any child processes (Chrome, etc.)

## CI/CD

The release workflow (`.github/workflows/release.yml`) handles:

1. **Sidecar build**: Bundles bridge-server with esbuild, then compiles to a standalone binary with `@yao-pkg/pkg`
2. **Tauri build**: Downloads sidecar, builds the Tauri app, signs with updater keys, publishes as a draft GitHub Release

Trigger a release by pushing a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```
