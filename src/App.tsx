// @ts-nocheck
import { For, createSignal, onCleanup, onMount } from "solid-js";
import { getKeyHandler } from "@opentui/core";
import { useRenderer, useTerminalDimensions } from "@opentui/solid";
import { spawn } from "node:child_process";
import path from "node:path";

type Step = {
  id: string;
  label: string;
  script: string; // absolute path
  status: "idle" | "running" | "ok" | "fail";
  durationMs?: number;
  requiresBrew?: boolean;
};

export default function App() {
  const renderer = useRenderer();
  const term = useTerminalDimensions();
  const repoRoot = process.cwd();
  const base = (p: string) => path.join(repoRoot, p);

  const [steps, setSteps] = createSignal<Step[]>([
    { id: "brew", label: "Homebrew", script: base("scripts/brew.sh"), status: "idle" },
    { id: "nvm", label: "NVM", script: base("scripts/nvm.sh"), status: "idle" },
    { id: "node", label: "Node.js", script: base("scripts/node.sh"), status: "idle" },
    { id: "bun", label: "Bun", script: base("scripts/bun.sh"), status: "idle", requiresBrew: true },
    { id: "go", label: "Go", script: base("scripts/go.sh"), status: "idle", requiresBrew: true },
    { id: "karabiner", label: "Karabiner Elements", script: base("scripts/karabiner-elements.sh"), status: "idle", requiresBrew: true },
    { id: "raycast", label: "Raycast", script: base("scripts/raycast.sh"), status: "idle", requiresBrew: true },
    { id: "ghostty", label: "Ghostty", script: base("scripts/ghostty.sh"), status: "idle", requiresBrew: true },
    { id: "cursor", label: "Cursor", script: base("scripts/cursor.sh"), status: "idle", requiresBrew: true },
    { id: "neovim", label: "Neovim", script: base("scripts/neovim.sh"), status: "idle", requiresBrew: true },
    { id: "zellij", label: "Zellij", script: base("scripts/zellij.sh"), status: "idle", requiresBrew: true },
    { id: "gh", label: "GitHub CLI", script: base("scripts/github-cli.sh"), status: "idle", requiresBrew: true },
    { id: "claude", label: "Claude Code", script: base("scripts/claude-code.sh"), status: "idle" },
    { id: "opencode", label: "OpenCode TUI", script: base("scripts/open-code.sh"), status: "idle", requiresBrew: true },
    { id: "cursor-agent", label: "Cursor Agent", script: base("scripts/cursor-agent.sh"), status: "idle" }
  ]);

  const [screen, setScreen] = createSignal<"welcome" | "select" | "run" | "summary">("welcome");
  const [cursorIdx, setCursorIdx] = createSignal(0);
  const [selected, setSelected] = createSignal<Set<string>>(new Set(["brew"]));
  const [running, setRunning] = createSignal(false);
  const [logs, setLogs] = createSignal<{ text: string; fg?: string; dim?: boolean }[]>([]);
  const [completed, setCompleted] = createSignal<Set<string>>(new Set());
  const [lastRunIds, setLastRunIds] = createSignal<string[]>([]);
  const [activeRunIds, setActiveRunIds] = createSignal<string[]>([]);
  const isBrewReady = () => steps().find(s => s.id === "brew")?.status === "ok";

  function stripAnsiCodes(input: string): string {
    return input.replace(/\x1B\[[0-9;]*m/g, "");
  }

  function getAnsiFgColor(input: string): string | undefined {
    const matches = [...input.matchAll(/\x1B\[([0-9;]+)m/g)];
    if (!matches.length) return undefined;
    const last = matches[matches.length - 1][1];
    const parts = last.split(";").map(Number);
    const code = parts.find(c => (c >= 30 && c <= 37) || (c >= 90 && c <= 97));
    const map: Record<number, string> = {
      30: "#000000", 31: "#FF5555", 32: "#00FF00", 33: "#FFFF00",
      34: "#00AAFF", 35: "#FF00FF", 36: "#00FFFF", 37: "#FFFFFF",
      90: "#666666", 91: "#FF6E6E", 92: "#69FF69", 93: "#FFFF88",
      94: "#33BBFF", 95: "#FF66FF", 96: "#66FFFF", 97: "#FFFFFF"
    };
    return code ? map[code] : undefined;
  }

  function getTagColor(input: string): string | undefined {
    if (/\[ERROR\]/.test(input)) return "#FF5555";
    if (/\[WARNING\]/.test(input)) return "#FFFF00";
    if (/\[SUCCESS\]/.test(input)) return "#00FF00";
    if (/\[INFO\]/.test(input)) return "#00FFFF";
    return undefined;
  }

  function appendLog(rawLine: string) {
    const fg = getTagColor(rawLine) ?? getAnsiFgColor(rawLine) ?? "#BBBBBB";
    const dim = /^\s{4}/.test(rawLine);
    const line = stripAnsiCodes(rawLine).replace(/\n$/, "");
    setLogs(prev => {
      const next = [...prev, { text: line, fg, dim }];
      if (next.length > 300) next.shift();
      return next;
    });
    if (/\[ERROR\]/.test(rawLine)) console.error(rawLine);
    else if (/\[WARNING\]/.test(rawLine)) console.warn(rawLine);
    else if (/\[SUCCESS\]/.test(rawLine)) console.info(rawLine);
    else console.log(rawLine);
  }

  async function runScript(absPath: string): Promise<number> {
    return new Promise(resolve => {
      const child = spawn("/bin/bash", [absPath], {
        cwd: repoRoot,
        env: { ...process.env, FORCE_COLOR: "1", TERM: "xterm-256color", COLORTERM: "truecolor" }
      });
      child.stdout.on("data", d => {
        const chunk = String(d);
        for (const part of chunk.split(/\r?\n/)) {
          if (part.length === 0) continue;
          appendLog(part);
        }
        try { renderer.console.write(chunk); } catch {}
      });
      child.stderr.on("data", d => {
        const chunk = String(d);
        for (const part of chunk.split(/\r?\n/)) {
          if (part.length === 0) continue;
          appendLog(part);
        }
        try { renderer.console.write(chunk); } catch {}
      });
      child.on("close", code => resolve(code ?? 1));
      child.on("error", err => { appendLog(`[ERROR] ${String(err)}`); resolve(1); });
    });
  }

  async function runSelectedInOrder() {
    if (running()) return;
    setRunning(true);
    setScreen("run");
    const ids = selected().size ? [...selected()] : steps().map(s => s.id);
    const brewSelected = selected().has("brew");
    const brewReady = isBrewReady();
    const order = steps()
      .filter(s => ids.includes(s.id))
      .filter(s => !s.requiresBrew || brewSelected || brewReady);
    setActiveRunIds(order.map(s => s.id));
    const executedIds: string[] = [];

    for (const step of order) {
      executedIds.push(step.id);
      const start = Date.now();
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: "running" } : s));
      const code = await runScript(step.script);
      const durationMs = Date.now() - start;
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: code === 0 ? "ok" : "fail", durationMs } : s));
      if (code !== 0) break;
    }

    setRunning(false);
    setLastRunIds(executedIds);
    const snapshot = steps();
    const successfulIds = snapshot
      .filter(s => executedIds.includes(s.id) && s.status === "ok" && s.id !== "brew")
      .map(s => s.id);
    const failedIds = snapshot
      .filter(s => executedIds.includes(s.id) && s.status === "fail")
      .map(s => s.id);
    setCompleted(prev => {
      const next = new Set(prev);
      for (const id of successfulIds) next.add(id);
      return next;
    });
    const nextSelected = new Set<string>(["brew"]);
    for (const id of failedIds) {
      if (!completed().has(id)) nextSelected.add(id);
    }
    setSelected(nextSelected);
    setCursorIdx(0);
    setActiveRunIds([]);
    setScreen("summary");
  }

  function toggleSelection(id: string) {
    const brewSelected = selected().has("brew");
    const step = steps().find(s => s.id === id);
    const brewReady = isBrewReady();
    const isDisabled = step?.requiresBrew && !brewSelected && !brewReady;
    if (id !== "brew" && isDisabled) {
      appendLog("[WARNING] Step requires Homebrew. Select or install 'Homebrew' first.");
      return;
    }
    if (step && step.id !== "brew" && completed().has(id)) {
      appendLog("[WARNING] Step already completed. Restart TUI to rerun.");
      return;
    }
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // If Homebrew got deselected, drop all brew-dependent selections
      if (!next.has("brew")) {
        for (const s of steps()) {
          if (s.requiresBrew) next.delete(s.id);
        }
      }
      return next;
    });
  }
  function selectAll() {
    const brewSelected = selected().has("brew");
    const brewReady = isBrewReady();
    const ids = steps()
      .filter(s => !s.requiresBrew || brewSelected || brewReady)
      .map(s => s.id)
      .filter(id => id === "brew" || !completed().has(id));
    setSelected(new Set(ids));
  }
  function clearSelection() { setSelected(new Set(["brew"])); }
  function retryFailed() {
    const brewReady = isBrewReady();
    const ids = steps()
      .filter(s => s.status === "fail")
      .map(s => s.id)
      .filter(id => id === "brew" || (!completed().has(id) && (!steps().find(s => s.id === id)?.requiresBrew || brewReady)));
    setSelected(new Set(ids.length ? ids : ["brew"]));
  }

  onMount(() => {
    const keys = getKeyHandler();
    keys.on("keypress", (key) => {
      const name = String(key.name || "").toLowerCase();
      if (key.ctrl && name === "c") process.exit(0);
      if (name === "escape" || name === "q") process.exit(0);
      if (screen() === "select") {
        if (name === "up") setCursorIdx(i => Math.max(0, i - 1));
        if (name === "down") setCursorIdx(i => Math.min(steps().length - 1, i + 1));
        if (name === "space") toggleSelection(steps()[cursorIdx()].id);
        if (name === "a") selectAll();
        if (name === "n") clearSelection();
        if (name === "r") retryFailed();
      }
      if (name === "c") renderer.console.toggle();
      if (name === "return" || name === "enter") {
        if (screen() === "welcome") setScreen("select");
        else if (screen() === "select") runSelectedInOrder();
        else if (screen() === "summary") {
          setScreen("welcome");
        }
      }
    });
    onCleanup(() => { try { keys.removeAllListeners?.("keypress"); } catch {} });
  });

  function center(content: string) {
    const { width } = term();
    const pad = Math.max(0, Math.floor((width - content.length) / 2));
    return `${" ".repeat(pad)}${content}`;
  }

  const footerWelcome = () => center("Enter start  • c console  • q/Esc quit");
  const footerSelect = () => center("↑/↓ move  • Space select  • Enter run  • a all  • n none  • r retry fail  • c console  • q/Esc quit");
  const footerRun = () => center("c console  • q/Esc quit");
  const footerSummary = () => center("Enter home  • c console  • q/Esc quit");

  return (
    <box flexDirection="column" width="100%" height="100%">
      {screen() === "welcome" && (
        <box flexDirection="column" width="100%" height="100%" padding={1}>
          <box flexGrow={1} justifyContent="center" alignItems="center">
            <box flexDirection="column" gap={1}>
              <text content="Machine Setup TUI" fg="#FFFFFF" />
              <text content="Welcome! This tool helps you install your dev environment." fg="#BBBBBB" />
              <text content="Press Enter to choose what to install, or q to quit." fg="#888888" />
            </box>
          </box>
          <box paddingTop={1}>
            <text content={footerWelcome()} fg="#6666FF" />
          </box>
        </box>
      )}

      {screen() === "select" && (
        <box flexDirection="column" width="100%" height="100%">
          <box flexGrow={1} borderStyle="double" title="What would you like to install?" padding={1}>
            <For each={steps()}>
              {(s, i) => {
                const isCursor = () => i() === cursorIdx();
                const isSel = () => selected().has(s.id);
                const brewSelected = selected().has("brew");
                const isCompleted = () => s.id !== "brew" && completed().has(s.id);
                const isDisabled = () => (s.requiresBrew && !brewSelected && !isBrewReady()) || isCompleted();
                const statusColor = () => {
                  if (isDisabled()) return "#777777";
                  if (isCursor()) return "#00FFFF";
                  if (isSel()) return "#FFFFFF";
                  return "#CCCCCC";
                };
                const label = () => {
                  const base = `${isSel() ? "[x]" : "[ ]"} ${isCursor() ? ">" : " "} ${s.label}`;
                  if (isCompleted()) return `${base} (completed)`;
                  if (s.requiresBrew && !brewSelected && !isBrewReady()) return `${base} (requires brew)`;
                  return base;
                };
                return (
                  <text content={label()} fg={statusColor()} />
                );
              }}
            </For>
          </box>
          <box paddingTop={1}>
            <text content={footerSelect()} fg="#6666FF" />
          </box>
        </box>
      )}

      {screen() === "run" && (
        <box flexDirection="column" width="100%" height="100%">
          <box flexGrow={1} flexDirection="row" width="100%">
            <box id="left" width={40} height="100%" borderStyle="double" title="Selected Steps" padding={1}>
              <For each={steps().filter(s => activeRunIds().includes(s.id))}>
                {(s) => {
                  const color = s.status === "ok" ? "#00FF00" : s.status === "fail" ? "#FF5555" : s.status === "running" ? "#00FFFF" : "#CCCCCC";
                  const label = `${s.label}${s.durationMs ? ` (${Math.round(s.durationMs/1000)}s)` : ""}`;
                  return <text content={label} fg={color} />;
                }}
              </For>
            </box>
            <box id="right" flexGrow={1} height="100%" borderStyle="double" title="Logs" padding={1}>
              <scrollbox height="100%" width="100%" padding={1}>
                <For each={logs()}>{(l) => <text content={l.text} fg={l.fg} style={{ dim: l.dim }} />}</For>
              </scrollbox>
            </box>
          </box>
          <box paddingTop={1}>
            <text content={footerRun()} fg="#6666FF" />
          </box>
        </box>
      )}
      {screen() === "summary" && (
        <box flexDirection="column" width="100%" height="100%">
          <box flexGrow={1} flexDirection="row" width="100%">
            <box width={40} height="100%" borderStyle="double" title="Results" padding={1}>
              <For each={steps().filter(s => lastRunIds().includes(s.id))}>
                {(s) => {
                  const statusColor = s.status === "ok" ? "#00FF00" : s.status === "fail" ? "#FF5555" : "#CCCCCC";
                  const seconds = s.durationMs ? Math.max(1, Math.round(s.durationMs / 1000)) : undefined;
                  const label = `${s.label}${seconds ? ` (${seconds}s)` : ""}`;
                  return <text content={label} fg={statusColor} />;
                }}
              </For>
            </box>
            <box flexGrow={1} height="100%" borderStyle="double" title="Next Steps" padding={1}>
              <text
                content={completed().size ? "Completed installers will be skipped next time. Press Enter to go back." : "Press Enter to go back."}
                fg="#BBBBBB"
              />
              <box marginTop={1} flexDirection="column" gap={1}>
                <text content={`Completed: ${[...completed()].length ? [...completed()].join(", ") : "Homebrew"}`} fg="#66FF66" />
                <text content={`Failed: ${steps().filter(s => s.status === "fail").map(s => s.label).join(", ") || "None"}`} fg="#FF7777" />
              </box>
            </box>
          </box>
          <box paddingTop={1}>
            <text content={footerSummary()} fg="#6666FF" />
          </box>
        </box>
      )}
    </box>
  );
}


