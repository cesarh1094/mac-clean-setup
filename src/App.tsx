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


