# Remote Control for Bridge to Fig

Review of [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) and how it applies to Bridge to Fig workflows.

## What Is Remote Control?

Remote Control lets you continue a local Claude Code session from your phone, tablet, or any browser via [claude.ai/code](https://claude.ai/code) or the Claude mobile app. The session keeps running on your machine — nothing moves to the cloud. The web/mobile interface is just a window into the local session.

- Available on Max plans (Pro plan support coming soon). Not available on Team/Enterprise plans or API keys.
- Requires `/login` authentication through claude.ai.
- Requires workspace trust (run `claude` in the project directory once to accept).

## Starting a Session

### New session

```bash
# Navigate to Bridge-to-Fig project directory, then:
claude remote-control
```

Flags:
- `--verbose` — detailed connection and session logs
- `--sandbox` / `--no-sandbox` — enable/disable sandboxing (off by default)

### From an existing session

If you're already in a Claude Code session:

```
/remote-control
```

(or `/rc` for short)

Tip: Use `/rename` before `/remote-control` to give the session a descriptive name so it's easy to find across devices.

### Always-on mode

Run `/config` inside Claude Code and set **Enable Remote Control for all sessions** to `true` to auto-enable for every session.

## Connecting from Another Device

1. **Open the session URL** shown in the terminal
2. **Scan the QR code** (press spacebar to toggle in `claude remote-control` mode)
3. **Find the session in claude.ai/code or the Claude app** — look for the computer icon with a green status dot

Use `/mobile` inside Claude Code to get a QR code for downloading the Claude app on iOS/Android.

## How It Works

- Claude Code makes **outbound HTTPS only** — no inbound ports opened on your machine
- Session registers with the Anthropic API and polls for work
- All traffic uses TLS through the Anthropic API (same security as normal Claude Code sessions)
- Multiple short-lived credentials, each scoped to a single purpose

## Why This Matters for Bridge to Fig

Remote Control is a natural fit for Bridge to Fig workflows because:

### 1. Long-running pipelines become mobile-monitored

Bridge to Fig pipelines like full design system creation (extract → detect → create → bind → validate) or website-to-Figma capture can take several minutes. With Remote Control, you can:

- Start a `createDesignSystem` pipeline at your desk
- Walk away and monitor progress from your phone
- Send follow-up commands (like `editVariable` adjustments) from the couch

### 2. Local environment stays intact

Remote Control runs on your machine, so the bridge server at `localhost:4001` and all MCP servers remain available. This is critical — Bridge to Fig requires:

- The Express + WebSocket server running locally
- The Figma plugin connected via long polling
- Puppeteer/Chrome for `extractWebsiteCSS`

None of these would work with cloud-based Claude Code on the web, but they all work through Remote Control.

### 3. Multi-device design review

After Bridge to Fig creates components or design systems, you can review the results in Figma on your desktop while sending additional commands from a mobile device. For example:

- View the Figma canvas on your desktop monitor
- Send `query` commands from your phone to inspect node properties
- Send `modify` commands from a tablet to tweak values

### 4. Collaboration with non-technical stakeholders

A designer or stakeholder can look at the Figma canvas while you drive Bridge to Fig commands from any device. The Remote Control URL can be shared so multiple people can follow along in the conversation.

## Limitations to Be Aware Of

| Limitation | Impact on Bridge to Fig |
|---|---|
| **One remote session at a time** | Can only run one Bridge to Fig workflow remotely per Claude Code instance |
| **Terminal must stay open** | The `claude` process (and the bridge server) must keep running on your machine |
| **~10 min network timeout** | If your machine loses network for >10 minutes, the remote session ends (bridge server keeps running locally, but you lose the remote connection) |
| **No inbound connections** | Not a concern — Bridge to Fig already uses outbound HTTP to `localhost:4001` |

## Remote Control vs Claude Code on the Web

| Feature | Remote Control | Claude Code on the Web |
|---|---|---|
| Where it runs | Your machine | Anthropic cloud |
| localhost:4001 bridge server | Available | Not available |
| Figma plugin connection | Works (local) | Would not work |
| Puppeteer/Chrome extraction | Works (local Chrome) | Not available |
| MCP servers | Available | Limited |
| **Use for Bridge to Fig?** | **Yes** | **No** |

**Bottom line:** Remote Control is the only remote option for Bridge to Fig. Cloud-based Claude Code on the web cannot reach `localhost:4001`.

## Recommended Workflow

```bash
# Terminal 1: Start Bridge to Fig server
cd Bridge-to-Fig && pnpm dev

# Terminal 2: Start Claude Code with Remote Control
cd Bridge-to-Fig && claude remote-control

# Then connect from phone/tablet/other browser via the session URL or QR code
```

For always-on convenience:

```bash
# One-time setup: enable Remote Control for all sessions
# Inside Claude Code, run:
/config
# Set "Enable Remote Control for all sessions" → true

# Then just start normally — Remote Control is always available
cd Bridge-to-Fig && claude
```
