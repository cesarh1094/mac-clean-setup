import { batch, createMemo, createSignal, Match, Switch } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { spawn } from "node:child_process";
import path from "node:path";

import ScreenLayout from "./components/ScreenLayout";
import WelcomeScreen from "./components/WelcomeScreen";
import SelectScreen from "./components/SelectScreen";
import RunScreen from "./components/RunScreen";
import SummaryScreen from "./components/SummaryScreen";
import { hydrateLogEntry } from "./utils/logging";

import type { AppStore, LogEntry, Screen, Step, StepStatus } from "./types";

const repoRoot = process.cwd();
const base = (p: string) => path.join(repoRoot, p);
const initialSteps: Step[] = [
  {
    id: "brew",
    label: "Homebrew",
    script: base("scripts/brew.sh"),
    status: "idle",
  },
  { id: "nvm", label: "NVM", script: base("scripts/nvm.sh"), status: "idle" },
  {
    id: "node",
    label: "Node.js",
    script: base("scripts/node.sh"),
    status: "idle",
  },
  {
    id: "bun",
    label: "Bun",
    script: base("scripts/bun.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "go",
    label: "Go",
    script: base("scripts/go.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "karabiner",
    label: "Karabiner Elements",
    script: base("scripts/karabiner-elements.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "raycast",
    label: "Raycast",
    script: base("scripts/raycast.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "ghostty",
    label: "Ghostty",
    script: base("scripts/ghostty.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "cursor",
    label: "Cursor",
    script: base("scripts/cursor.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "neovim",
    label: "Neovim",
    script: base("scripts/neovim.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "zellij",
    label: "Zellij",
    script: base("scripts/zellij.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "gh",
    label: "GitHub CLI",
    script: base("scripts/github-cli.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "claude",
    label: "Claude Code",
    script: base("scripts/claude-code.sh"),
    status: "idle",
  },
  {
    id: "opencode",
    label: "OpenCode TUI",
    script: base("scripts/open-code.sh"),
    status: "idle",
    requiresBrew: true,
  },
  {
    id: "cursor-agent",
    label: "Cursor Agent",
    script: base("scripts/cursor-agent.sh"),
    status: "idle",
  },
];

export default function App() {
  const renderer = useRenderer();

  const [state, setState] = createStore<AppStore>({
    steps: initialSteps,
    completedIds: [],
    lastRunIds: [],
    activeRunIds: [],
  });

  const steps = () => state.steps;
  const activeRunIds = () => state.activeRunIds;
  const lastRunIds = () => state.lastRunIds;
  const completedSet = () => new Set(state.completedIds);

  const completedAccessor = () => completedSet();

  const updateStep = (id: string, updater: (step: Step) => void) => {
    setState(
      "steps",
      (step) => step.id === id,
      produce<Step>((step) => {
        updater(step);
      })
    );
  };

  const [screen, setScreen] = createSignal<Screen>("welcome");
  const [cursorIdx, setCursorIdx] = createSignal(0);
  const [selected, setSelected] = createSignal<Set<string>>(new Set(["brew"]));
  const [logs, setLogs] = createSignal<LogEntry[]>([]);
  const isBrewReady = () =>
    steps().find((s) => s.id === "brew")?.status === "ok";

  function appendLog(rawLine: string) {
    setLogs((prev) => {
      const next = [...prev, hydrateLogEntry(rawLine)];
      if (next.length > 300) next.shift();
      return next;
    });

    if (/\[ERROR\]/.test(rawLine)) {
      console.error(rawLine);
    } else if (/\[WARNING\]/.test(rawLine)) {
      console.warn(rawLine);
    } else if (/\[SUCCESS\]/.test(rawLine)) {
      console.info(rawLine);
    } else {
      console.log(rawLine);
    }
  }

  async function runScript(absPath: string): Promise<number> {
    return new Promise((resolve) => {
      const child = spawn("/bin/bash", [absPath], {
        cwd: repoRoot,
        env: {
          ...process.env,
          FORCE_COLOR: "1",
          TERM: "xterm-256color",
          COLORTERM: "truecolor",
        },
      });
      child.stdout.on("data", (d) => {
        const chunk = String(d);
        for (const part of chunk.split(/\r?\n/)) {
          if (part.length === 0) {
            continue;
          }
          appendLog(part);
        }
      });
      child.stderr.on("data", (d) => {
        const chunk = String(d);
        for (const part of chunk.split(/\r?\n/)) {
          if (part.length === 0) {
            continue;
          }

          appendLog(part);
        }
      });
      child.on("close", (code) => resolve(code ?? 1));
      child.on("error", (err) => {
        appendLog(`[ERROR] ${String(err)}`);
        resolve(1);
      });
    });
  }

  async function runSelectedInOrder() {
    if (activeRunIds().length) {
      return;
    }

    setScreen("run");

    const ids = selected().size ? [...selected()] : steps().map((s) => s.id);
    const brewSelected = selected().has("brew");
    const brewReady = isBrewReady();
    const order = steps()
      .filter((s) => ids.includes(s.id))
      .filter((s) => !s.requiresBrew || brewSelected || brewReady);

    setState(
      "activeRunIds",
      order.map((s) => s.id)
    );

    const executedIds: string[] = [];

    for (const step of order) {
      executedIds.push(step.id);
      const start = Date.now();

      updateStep(step.id, (s) => {
        s.status = "running";
        s.durationMs = undefined;
      });

      const code = await runScript(step.script);
      const durationMs = Date.now() - start;
      const status: StepStatus = code === 0 ? "ok" : "fail";

      updateStep(step.id, (s) => {
        s.status = status;
        s.durationMs = durationMs;
      });

      if (code !== 0) {
        break;
      }
    }

    setState("lastRunIds", executedIds);

    const snapshot = steps();
    const successfulIds = snapshot
      .filter(
        (s) =>
          executedIds.includes(s.id) && s.status === "ok" && s.id !== "brew"
      )
      .map((s) => s.id);

    const failedIds = snapshot
      .filter((s) => executedIds.includes(s.id) && s.status === "fail")
      .map((s) => s.id);

    batch(() => {
      const updatedCompleted = new Set(completedSet());

      for (const id of successfulIds) {
        updatedCompleted.add(id);
      }

      setState("completedIds", Array.from(updatedCompleted));

      const nextSelected = new Set<string>(["brew"]);

      for (const id of failedIds) {
        if (!updatedCompleted.has(id)) {
          nextSelected.add(id);
        }
      }

      setSelected(nextSelected);
      setCursorIdx(0);
      setState("activeRunIds", []);
      setScreen("summary");
    });
  }

  function toggleSelection(id: string) {
    const brewSelected = selected().has("brew");
    const step = steps().find((s) => s.id === id);
    const brewReady = isBrewReady();
    const isDisabled = step?.requiresBrew && !brewSelected && !brewReady;

    if (id !== "brew" && isDisabled) {
      appendLog(
        "[WARNING] Step requires Homebrew. Select or install 'Homebrew' first."
      );
      return;
    }

    if (step && step.id !== "brew" && completedSet().has(id)) {
      appendLog("[WARNING] Step already completed. Restart TUI to rerun.");
      return;
    }

    setSelected((prev) => {
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
    const completed = completedSet();
    const ids = steps()
      .filter((s) => !s.requiresBrew || brewSelected || brewReady)
      .map((s) => s.id)
      .filter((id) => id === "brew" || !completed.has(id));

    setSelected(new Set(ids));
  }

  function clearSelection() {
    setSelected(new Set(["brew"]));
  }

  function retryFailed() {
    const brewReady = isBrewReady();
    const completed = completedSet();
    const ids = steps()
      .filter((s) => s.status === "fail")
      .map((s) => s.id)
      .filter(
        (id) =>
          id === "brew" ||
          (!completed.has(id) &&
            (!steps().find((s) => s.id === id)?.requiresBrew || brewReady))
      );

    setSelected(new Set(ids.length ? ids : ["brew"]));
  }

  useKeyboard((key) => {
    const name = String(key.name || "").toLowerCase();

    if (name === "escape" || name === "q") {
      renderer.destroy();
      process.exit(0);
    }

    if (screen() === "select") {
      if (name === "up") {
        setCursorIdx((i) => Math.max(0, i - 1));
      }

      if (name === "down") {
        setCursorIdx((i) => Math.min(steps().length - 1, i + 1));
      }

      if (name === "space") {
        const current = steps()[cursorIdx()];

        if (current) {
          toggleSelection(current.id);
        }
      }

      if (name === "a") {
        selectAll();
      }
      if (name === "n") {
        clearSelection();
      }

      if (name === "r") {
        retryFailed();
      }
    }

    if (name === "c") {
      renderer.console.toggle();
    }

    if (name === "return" || name === "enter") {
      if (screen() === "welcome") {
        setScreen("select");
      } else if (screen() === "select") {
        runSelectedInOrder();
      } else if (screen() === "summary") {
        setScreen("welcome");
      }
    }
  });

  const footerWelcome = () => "Enter start  • c console  • q/Esc quit";
  const footerSelect = () =>
    "↑/↓ move  • Space select  • Enter run  • a all  • n none  • r retry fail  • c console  • q/Esc quit";
  const footerRun = () => "c console  • q/Esc quit";
  const footerSummary = () => "Enter home  • c console  • q/Esc quit";

  const currentFooter = createMemo(() => {
    switch (screen()) {
      case "welcome":
        return footerWelcome();
      case "select":
        return footerSelect();
      case "run":
        return footerRun();
      case "summary":
        return footerSummary();
    }
  });

  return (
    <ScreenLayout>
      <Switch>
        <Match when={screen() === "welcome"}>
          <WelcomeScreen footer={currentFooter()} />
        </Match>
        <Match when={screen() === "select"}>
          <SelectScreen
            steps={steps}
            cursorIdx={cursorIdx}
            selected={selected}
            isBrewReady={isBrewReady}
            completed={completedAccessor}
            footer={currentFooter()}
          />
        </Match>
        <Match when={screen() === "run"}>
          <RunScreen
            steps={steps}
            activeRunIds={activeRunIds}
            logs={logs}
            footer={currentFooter()}
          />
        </Match>
        <Match when={screen() === "summary"}>
          <SummaryScreen
            steps={steps}
            lastRunIds={lastRunIds}
            completed={completedAccessor}
            footer={currentFooter()}
          />
        </Match>
      </Switch>
    </ScreenLayout>
  );
}
