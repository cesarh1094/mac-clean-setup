## SolidJS + OpenTUI TUI: Implementation Plan (Top-Level TUI, `scripts/` for Bash)

### Decision
- Make the TUI the top-level project and nest all Bash scripts under `scripts/`.
- Why:
  - Keeps a clean root Node app for the TUI while preserving proven Bash logic.
  - Consolidates shell scripts; stable, path-safe execution regardless of CWD.
  - Maintains idempotency and consistent logging via `scripts/colors.sh`.

### Scope
- Use `@opentui/solid` and `@opentui/core` to render a terminal UI.
- Orchestrate `scripts/setup.sh` (primary) or individual scripts in the same order.
- Provide:
  - Step selection and run-all
  - Per-step status and durations
  - Recent inline logs + toggleable console overlay
  - Keybindings for navigation and control

### Repository layout
```
machine-setup/
├── scripts/             # All Bash scripts
│   ├── setup.sh         # Main orchestration (path-safe)
│   ├── colors.sh        # Shared logging
│   └── *.sh             # Individual installers
├── package.json         # Top-level TUI (Solid + OpenTUI)
├── tsconfig.json        # TS config
├── index.tsx            # TUI entrypoint
├── src/                 # TUI sources
├── AGENTS.md            # Agent guidelines
├── README.md            # Docs
└── planned/             # Plans and notes
```

### Migration steps
1) Move all `*.sh` into `scripts/`:
   - `git mv *.sh scripts/`
2) Harden `scripts/setup.sh` paths:
   - `DIR="$(cd "$(dirname "$0")" && pwd)"`
   - Call steps via `"$DIR/<script>.sh"`
3) Ensure execute bits:
   - `find "$DIR" -name "*.sh" -type f -exec chmod +x {} \;`
4) Update docs to use `bash scripts/setup.sh` and `bash scripts/<tool>.sh`.

### Step order (source of truth) — `scripts/setup.sh`
```bash
#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/colors.sh"

find "$DIR" -name "*.sh" -type f -exec chmod +x {} \;

log_info "Machine setup starting"

# Foundation
"$DIR/brew.sh" || { log_error "Homebrew installation failed"; exit 1; }

# Runtimes
"$DIR/nvm.sh" || { log_error "NVM installation failed"; exit 1; }
"$DIR/node.sh" || { log_error "Node.js installation failed"; exit 1; }
"$DIR/bun.sh"  || { log_error "Bun installation failed"; exit 1; }
"$DIR/go.sh"   || { log_error "Go installation failed"; exit 1; }

# Productivity
"$DIR/karabiner-elements.sh" || { log_error "Karabiner Elements installation failed"; exit 1; }
"$DIR/raycast.sh"            || { log_error "Raycast installation failed"; exit 1; }

# Terminal & Editors
"$DIR/ghostty.sh" || { log_error "Ghostty installation failed"; exit 1; }
"$DIR/cursor.sh"  || { log_error "Cursor installation failed"; exit 1; }
"$DIR/neovim.sh"  || { log_error "Neovim setup failed"; exit 1; }
"$DIR/zellij.sh"  || { log_error "Zellij installation failed"; exit 1; }

# CLI Tools
"$DIR/github-cli.sh"   || { log_error "GitHub CLI installation failed"; exit 1; }
"$DIR/claude-code.sh"  || { log_error "Claude Code installation failed"; exit 1; }
"$DIR/open-code.sh"    || { log_error "OpenCode TUI installation failed"; exit 1; }
"$DIR/cursor-agent.sh" || { log_error "Cursor Agent CLI installation failed"; exit 1; }

log_success "Machine setup completed"
```

### TUI app (top-level Node project)

#### package.json (root)
```json
{
  "name": "machine-setup-tui",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "description": "SolidJS + OpenTUI wrapper for scripts/",
  "scripts": {
    "dev": "tsx index.tsx",
    "setup": "bash scripts/setup.sh"
  },
  "dependencies": {
    "@opentui/core": "latest",
    "@opentui/solid": "latest",
    "solid-js": "latest"
  },
  "devDependencies": {
    "tsx": "latest"
  }
}
```

#### tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "solid-js",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "types": []
  },
  "include": ["./index.tsx", "./src/**/*"]
}
```

#### index.tsx (root)
```ts
// @ts-nocheck
import { render } from "@opentui/solid";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import App from "./src/App";

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 35,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF5555",
    startInDebugMode: false
  }
});

await render(() => <App renderer={renderer} />, { renderer });
```

#### src/App.tsx (root)
```tsx
// @ts-nocheck
import { For, createSignal, onCleanup, onMount } from "solid-js";
import { Box, Text } from "@opentui/solid";
import { getKeyHandler } from "@opentui/core";
import { spawn } from "node:child_process";
import path from "node:path";

type Step = {
  id: string;
  label: string;
  script: string; // absolute path
  status: "idle" | "running" | "ok" | "fail";
  durationMs?: number;
};

export default function App(props: { renderer: any }) {
  const repoRoot = process.cwd();
  const base = (p: string) => path.join(repoRoot, p);

  const [steps, setSteps] = createSignal<Step[]>([
    { id: "brew", label: "Homebrew", script: base("scripts/brew.sh"), status: "idle" },
    { id: "nvm", label: "NVM", script: base("scripts/nvm.sh"), status: "idle" },
    { id: "node", label: "Node.js", script: base("scripts/node.sh"), status: "idle" },
    { id: "bun", label: "Bun", script: base("scripts/bun.sh"), status: "idle" },
    { id: "go", label: "Go", script: base("scripts/go.sh"), status: "idle" },
    { id: "karabiner", label: "Karabiner Elements", script: base("scripts/karabiner-elements.sh"), status: "idle" },
    { id: "raycast", label: "Raycast", script: base("scripts/raycast.sh"), status: "idle" },
    { id: "ghostty", label: "Ghostty", script: base("scripts/ghostty.sh"), status: "idle" },
    { id: "cursor", label: "Cursor", script: base("scripts/cursor.sh"), status: "idle" },
    { id: "neovim", label: "Neovim", script: base("scripts/neovim.sh"), status: "idle" },
    { id: "zellij", label: "Zellij", script: base("scripts/zellij.sh"), status: "idle" },
    { id: "gh", label: "GitHub CLI", script: base("scripts/github-cli.sh"), status: "idle" },
    { id: "claude", label: "Claude Code", script: base("scripts/claude-code.sh"), status: "idle" },
    { id: "opencode", label: "OpenCode TUI", script: base("scripts/open-code.sh"), status: "idle" },
    { id: "cursor-agent", label: "Cursor Agent", script: base("scripts/cursor-agent.sh"), status: "idle" }
  ]);

  const [cursorIdx, setCursorIdx] = createSignal(0);
  const [selected, setSelected] = createSignal<Set<string>>(new Set());
  const [running, setRunning] = createSignal(false);
  const [logs, setLogs] = createSignal<string[]>([]);

  function appendLog(line: string) {
    setLogs(prev => {
      const next = [...prev, line];
      if (next.length > 300) next.shift();
      return next;
    });
    if (/\[ERROR\]/.test(line)) console.error(line);
    else if (/\[WARNING\]/.test(line)) console.warn(line);
    else if (/\[SUCCESS\]/.test(line)) console.info(line);
    else console.log(line);
  }

  async function runScript(absPath: string): Promise<number> {
    return new Promise(resolve => {
      const child = spawn("/bin/bash", [absPath], { cwd: repoRoot, env: process.env });
      child.stdout.on("data", d => appendLog(String(d).trimEnd()));
      child.stderr.on("data", d => appendLog(String(d).trimEnd()));
      child.on("close", code => resolve(code ?? 1));
      child.on("error", err => { appendLog(`[ERROR] ${String(err)}`); resolve(1); });
    });
  }

  async function runSelectedInOrder() {
    if (running()) return;
    setRunning(true);
    const ids = selected().size ? [...selected()] : steps().map(s => s.id);
    const order = steps().filter(s => ids.includes(s.id));

    for (const step of order) {
      const start = Date.now();
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: "running" } : s));
      const code = await runScript(step.script);
      const durationMs = Date.now() - start;
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: code === 0 ? "ok" : "fail", durationMs } : s));
      if (code !== 0) break;
    }

    setRunning(false);
  }

  function toggleSelection(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function selectAll() { setSelected(new Set(steps().map(s => s.id))); }
  function clearSelection() { setSelected(new Set()); }
  function retryFailed() { setSelected(new Set(steps().filter(s => s.status === "fail").map(s => s.id))); }

  onMount(() => {
    const keys = getKeyHandler();
    keys.on("keypress", (key) => {
      const name = String(key.name || "").toLowerCase();
      if (key.ctrl && name === "c") process.exit(0);
      if (name === "escape" || name === "q") process.exit(0);
      if (name === "up") setCursorIdx(i => Math.max(0, i - 1));
      if (name === "down") setCursorIdx(i => Math.min(steps().length - 1, i + 1));
      if (name === "space") toggleSelection(steps()[cursorIdx()].id);
      if (name === "a") selectAll();
      if (name === "n") clearSelection();
      if (name === "r") retryFailed();
      if (name === "c") props.renderer.console.toggle();
      if (name === "return" || name === "enter") runSelectedInOrder();
    });
    onCleanup(() => { try { keys.removeAllListeners?.("keypress"); } catch {} });
  });

  return (
    <Box flexDirection="row" width="100%" height="100%">
      <Box id="left" width={40} height="100%" borderStyle="double" title="Steps" padding={1}>
        <For each={steps()}>
          {(s, i) => {
            const isCursor = () => i() === cursorIdx();
            const isSel = () => selected().has(s.id);
            const statusColor = () => s.status === "ok" ? "#00FF00" : s.status === "fail" ? "#FF5555" : s.status === "running" ? "#00FFFF" : "#CCCCCC";
            return (
              <Text content={`${isSel() ? "[x]" : "[ ]"} ${isCursor() ? ">" : " "} ${s.label} ${s.durationMs ? `(${Math.round(s.durationMs/1000)}s)` : ""}`} fg={statusColor()} />
            );
          }}
        </For>
      </Box>
      <Box id="right" flexGrow={1} height="100%" borderStyle="double" title="Logs" padding={1}>
        <For each={logs()}>{(line) => <Text content={line} fg="#BBBBBB" />}</For>
        <Text content={running() ? "Running..." : "Idle"} fg={running() ? "#00FFFF" : "#888888"} />
        <Text content={"Keys: ↑/↓ move  • Space select  • Enter run  • a all  • n none  • r retry fail  • c console  • q/Esc quit"} fg="#6666FF" />
      </Box>
    </Box>
  );
}
```

### Keybindings
- Enter: Run selected (or all if none)
- Space: Toggle selection
- a / n: Select all / none
- r: Retry failed
- c: Toggle console
- q / Esc / Ctrl+C: Exit

### How to run locally
- `bash scripts/setup.sh` to run the full setup headlessly
- `npm install`
- `npm run dev` to launch the TUI

### Notes
- Each script continues to `source "$(dirname "$0")/colors.sh"` unchanged after moving to `scripts/`.
- Keep standardized logging and verification patterns consistent across scripts.
## SolidJS + OpenTUI TUI: Implementation Plan (Top-Level TUI, `scripts/` for Bash)

### Decision
- **Make the TUI the top-level project** and **nest all Bash scripts under `scripts/`**.
- **Why**:
  - Keeps a clean root Node app for the TUI while preserving proven Bash logic.
  - Consolidates shell scripts in one place; paths are stable regardless of CWD.
  - Maintains idempotency and consistent logging using `scripts/colors.sh`.

### Scope
- Use `@opentui/solid` and `@opentui/core` to render a terminal UI.
- Orchestrate `scripts/setup.sh` (primary) or individual scripts in the same order.
- Provide:
  - Step selection and run-all
  - Per-step status and durations
  - Recent inline logs + full console overlay
  - Keybindings for navigation and control

### Repository layout (after refactor)
- Top-level TUI app files: `package.json`, `tsconfig.json`, `index.tsx`, `src/`
- Bash scripts moved to `scripts/`: all `*.sh` including `setup.sh`, `colors.sh`
- Keep `planned/`, `README.md`, `AGENTS.md`, `.gitignore`, etc.

### Migration steps
1) Create `scripts/` and move scripts:
   - `git mv *.sh scripts/`
2) Harden `scripts/setup.sh` to be path-safe:
   - Use `DIR="$(cd "$(dirname "$0")" && pwd)"`
   - Call steps via `"$DIR/<script>.sh"`
3) Ensure execute bits inside `scripts/setup.sh`:
   - `chmod +x "$DIR"/*.sh`
4) Update docs to call `bash scripts/setup.sh`.

### Step order (source of truth) — `scripts/setup.sh`
```bash
#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/colors.sh"

chmod +x "$DIR"/*.sh

log_info "Machine setup starting"

# Foundation - Install package manager first
"$DIR/brew.sh" || { log_error "Homebrew installation failed"; exit 1; }

# Programming languages and runtimes (NVM first for Node management)
"$DIR/nvm.sh" || { log_error "NVM installation failed"; exit 1; }
"$DIR/node.sh" || { log_error "Node.js installation failed"; exit 1; }
"$DIR/bun.sh" || { log_error "Bun installation failed"; exit 1; }
"$DIR/go.sh" || { log_error "Go installation failed"; exit 1; }

# System and productivity tools
"$DIR/karabiner-elements.sh" || { log_error "Karabiner Elements installation failed"; exit 1; }
"$DIR/raycast.sh" || { log_error "Raycast installation failed"; exit 1; }

# Terminal and editors
"$DIR/ghostty.sh" || { log_error "Ghostty installation failed"; exit 1; }
"$DIR/cursor.sh" || { log_error "Cursor installation failed"; exit 1; }
"$DIR/neovim.sh" || { log_error "Neovim setup failed"; exit 1; }
"$DIR/zellij.sh" || { log_error "Zellij installation failed"; exit 1; }

# CLI tools (depend on above runtimes)
"$DIR/github-cli.sh" || { log_error "GitHub CLI installation failed"; exit 1; }
"$DIR/claude-code.sh" || { log_error "Claude Code installation failed"; exit 1; }
"$DIR/open-code.sh" || { log_error "OpenCode TUI installation failed"; exit 1; }
"$DIR/cursor-agent.sh" || { log_error "Cursor Agent CLI installation failed"; exit 1; }

log_success "Machine setup completed"
```

### TUI app (top-level Node project)

#### package.json (root)
```json
{
  "name": "machine-setup-tui",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "description": "SolidJS + OpenTUI wrapper for scripts/",
  "scripts": {
    "dev": "tsx index.tsx",
    "setup": "bash scripts/setup.sh"
  },
  "dependencies": {
    "@opentui/core": "latest",
    "@opentui/solid": "latest",
    "solid-js": "latest"
  },
  "devDependencies": {
    "tsx": "latest"
  }
}
```

#### tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "types": []
  },
  "include": ["./index.tsx", "./src/**/*"]
}
```

#### index.tsx (root)
```ts
// @ts-nocheck
import { render } from "@opentui/solid";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import App from "./src/App";

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 35,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF5555",
    startInDebugMode: false
  }
});

await render(() => <App renderer={renderer} />, { renderer });
```

#### src/App.tsx (root)
```tsx
// @ts-nocheck
import { For, createSignal, onCleanup, onMount } from "solid-js";
import { Box, Text } from "@opentui/solid";
import { getKeyHandler } from "@opentui/core";
import { spawn } from "node:child_process";
import path from "node:path";

type Step = {
  id: string;
  label: string;
  script: string; // absolute path
  status: "idle" | "running" | "ok" | "fail";
  durationMs?: number;
};

export default function App(props: { renderer: any }) {
  const repoRoot = process.cwd();
  const base = (p: string) => path.join(repoRoot, p);

  const [steps, setSteps] = createSignal<Step[]>([
    { id: "brew", label: "Homebrew", script: base("scripts/brew.sh"), status: "idle" },
    { id: "nvm", label: "NVM", script: base("scripts/nvm.sh"), status: "idle" },
    { id: "node", label: "Node.js", script: base("scripts/node.sh"), status: "idle" },
    { id: "bun", label: "Bun", script: base("scripts/bun.sh"), status: "idle" },
    { id: "go", label: "Go", script: base("scripts/go.sh"), status: "idle" },
    { id: "karabiner", label: "Karabiner Elements", script: base("scripts/karabiner-elements.sh"), status: "idle" },
    { id: "raycast", label: "Raycast", script: base("scripts/raycast.sh"), status: "idle" },
    { id: "ghostty", label: "Ghostty", script: base("scripts/ghostty.sh"), status: "idle" },
    { id: "cursor", label: "Cursor", script: base("scripts/cursor.sh"), status: "idle" },
    { id: "neovim", label: "Neovim", script: base("scripts/neovim.sh"), status: "idle" },
    { id: "zellij", label: "Zellij", script: base("scripts/zellij.sh"), status: "idle" },
    { id: "gh", label: "GitHub CLI", script: base("scripts/github-cli.sh"), status: "idle" },
    { id: "claude", label: "Claude Code", script: base("scripts/claude-code.sh"), status: "idle" },
    { id: "opencode", label: "OpenCode TUI", script: base("scripts/open-code.sh"), status: "idle" },
    { id: "cursor-agent", label: "Cursor Agent", script: base("scripts/cursor-agent.sh"), status: "idle" }
  ]);

  const [cursorIdx, setCursorIdx] = createSignal(0);
  const [selected, setSelected] = createSignal<Set<string>>(new Set());
  const [running, setRunning] = createSignal(false);
  const [logs, setLogs] = createSignal<string[]>([]);

  function appendLog(line: string) {
    setLogs(prev => {
      const next = [...prev, line];
      if (next.length > 300) next.shift();
      return next;
    });
    if (/\[ERROR\]/.test(line)) console.error(line);
    else if (/\[WARNING\]/.test(line)) console.warn(line);
    else if (/\[SUCCESS\]/.test(line)) console.info(line);
    else console.log(line);
  }

  async function runScript(absPath: string): Promise<number> {
    return new Promise(resolve => {
      const child = spawn("/bin/bash", [absPath], { cwd: repoRoot, env: process.env });
      child.stdout.on("data", d => appendLog(String(d).trimEnd()));
      child.stderr.on("data", d => appendLog(String(d).trimEnd()));
      child.on("close", code => resolve(code ?? 1));
      child.on("error", err => { appendLog(`[ERROR] ${String(err)}`); resolve(1); });
    });
  }

  async function runSelectedInOrder() {
    if (running()) return;
    setRunning(true);
    const ids = selected().size ? [...selected()] : steps().map(s => s.id);
    const order = steps().filter(s => ids.includes(s.id));

    for (const step of order) {
      const start = Date.now();
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: "running" } : s));
      const code = await runScript(step.script);
      const durationMs = Date.now() - start;
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: code === 0 ? "ok" : "fail", durationMs } : s));
      if (code !== 0) break;
    }

    setRunning(false);
  }

  function toggleSelection(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function selectAll() { setSelected(new Set(steps().map(s => s.id))); }
  function clearSelection() { setSelected(new Set()); }
  function retryFailed() { setSelected(new Set(steps().filter(s => s.status === "fail").map(s => s.id))); }

  onMount(() => {
    const keys = getKeyHandler();
    keys.on("keypress", (key) => {
      const name = String(key.name || "").toLowerCase();
      if (key.ctrl && name === "c") process.exit(0);
      if (name === "escape" || name === "q") process.exit(0);
      if (name === "up") setCursorIdx(i => Math.max(0, i - 1));
      if (name === "down") setCursorIdx(i => Math.min(steps().length - 1, i + 1));
      if (name === "space") toggleSelection(steps()[cursorIdx()].id);
      if (name === "a") selectAll();
      if (name === "n") clearSelection();
      if (name === "r") retryFailed();
      if (name === "c") props.renderer.console.toggle();
      if (name === "return" || name === "enter") runSelectedInOrder();
    });
    onCleanup(() => { try { keys.removeAllListeners?.("keypress"); } catch {} });
  });

  return (
    <Box flexDirection="row" width="100%" height="100%">
      <Box id="left" width={40} height="100%" borderStyle="double" title="Steps" padding={1}>
        <For each={steps()}>
          {(s, i) => {
            const isCursor = () => i() === cursorIdx();
            const isSel = () => selected().has(s.id);
            const statusColor = () => s.status === "ok" ? "#00FF00" : s.status === "fail" ? "#FF5555" : s.status === "running" ? "#00FFFF" : "#CCCCCC";
            return (
              <Text content={`${isSel() ? "[x]" : "[ ]"} ${isCursor() ? ">" : " "} ${s.label} ${s.durationMs ? `(${Math.round(s.durationMs/1000)}s)` : ""}`} fg={statusColor()} />
            );
          }}
        </For>
      </Box>
      <Box id="right" flexGrow={1} height="100%" borderStyle="double" title="Logs" padding={1}>
        <For each={logs()}>{(line) => <Text content={line} fg="#BBBBBB" />}</For>
        <Text content={running() ? "Running..." : "Idle"} fg={running() ? "#00FFFF" : "#888888"} />
        <Text content={"Keys: ↑/↓ move  • Space select  • Enter run  • a all  • n none  • r retry fail  • c console  • q/Esc quit"} fg="#6666FF" />
      </Box>
    </Box>
  );
}
```

### How to run locally
- At repo root:
  - `npm install`
  - `npm run dev`
  - `npm run setup` to run the full setup headlessly

---

## References
- OpenTUI docs digest (console, key handling, layout, components): [OpenTUI via Context7](https://context7.com/sst/opentui/llms.txt)


