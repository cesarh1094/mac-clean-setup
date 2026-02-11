import type { Accessor, Component } from "solid-js";
import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import { theme } from "../theme";

import Footer from "./Footer";
import type { KeyHint, LogEntry, Step } from "../types";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type RunScreenProps = {
  steps: Accessor<Step[]>;
  activeRunIds: Accessor<string[]>;
  logs: Accessor<LogEntry[]>;
  hints: KeyHint[];
};

const RunScreen: Component<RunScreenProps> = (props) => {
  const dims = useTerminalDimensions();
  const isNarrow = () => dims().width < 60;
  const sidebarWidth = () => (dims().width < 100 ? 25 : 40);

  const [frame, setFrame] = createSignal(0);
  const interval = setInterval(() => {
    setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
  }, 80);
  onCleanup(() => clearInterval(interval));

  const spinner = () => SPINNER_FRAMES[frame()]!;

  const activeSteps = createMemo(() =>
    props.steps().filter((s) => props.activeRunIds().includes(s.id)),
  );

  const runningStep = createMemo(() =>
    activeSteps().find((s) => s.status === "running"),
  );

  const completedCount = createMemo(
    () => activeSteps().filter((s) => s.status === "ok" || s.status === "fail").length,
  );

  const progressText = createMemo(() => {
    const running = runningStep();
    if (running) {
      return `${spinner()} Step ${completedCount() + 1} of ${activeSteps().length} — Installing ${running.label}...`;
    }
    const allDone = activeSteps().every(
      (s) => s.status === "ok" || s.status === "fail",
    );
    if (allDone && activeSteps().length > 0) return "✓ All steps complete";
    return `${spinner()} Waiting...`;
  });

  const progressColor = createMemo(() => {
    if (runningStep()) return theme.text;
    const allDone = activeSteps().every(
      (s) => s.status === "ok" || s.status === "fail",
    );
    if (allDone && activeSteps().length > 0) return theme.foam;
    return theme.muted;
  });

  const statusIcon = (step: Step) => {
    switch (step.status) {
      case "ok":
        return "✓";
      case "fail":
        return "✗";
      case "running":
        return spinner();
      default:
        return "·";
    }
  };

  const statusColor = (step: Step) => {
    switch (step.status) {
      case "ok":
        return theme.foam;
      case "fail":
        return theme.love;
      case "running":
        return theme.iris;
      default:
        return theme.muted;
    }
  };

  return (
    <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
      <box marginBottom={1}>
        <text content={progressText()} fg={progressColor()} />
      </box>
      <box
        flexGrow={1}
        flexDirection={isNarrow() ? "column" : "row"}
        width="100%"
        gap={1}
      >
        <box
          width={isNarrow() ? "100%" : sidebarWidth()}
          height={isNarrow() ? 10 : "100%"}
          borderStyle="rounded"
          borderColor={theme.highlightHigh}
          title="Steps"
          padding={1}
        >
          <For each={activeSteps()}>
            {(step) => {
              const duration = step.durationMs
                ? ` (${Math.round(step.durationMs / 1000)}s)`
                : "";
              const label = `${statusIcon(step)} ${step.label}${duration}`;
              return <text content={label} fg={statusColor(step)} />;
            }}
          </For>
        </box>
        <box
          flexGrow={1}
          height="100%"
          borderStyle="rounded"
          borderColor={theme.highlightHigh}
          title="Logs"
          padding={1}
        >
          <scrollbox height="100%" width="100%" padding={1} focused stickyScroll>
            <For each={props.logs()}>
              {(entry) => {
                if (entry.separator) {
                  return (
                    <text
                      content="────────────────────────────"
                      fg={theme.highlightMed}
                    />
                  );
                }
                const indent = entry.dim ? "  " : "";
                if (entry.icon && entry.iconColor && entry.iconColor !== entry.fg) {
                  return (
                    <box flexDirection="row">
                      <text
                        content={`${indent}${entry.icon} `}
                        fg={entry.iconColor}
                      />
                      <text content={entry.text} fg={entry.fg} />
                    </box>
                  );
                }
                const prefix = entry.icon ? `${entry.icon} ` : "";
                return (
                  <text
                    content={`${indent}${prefix}${entry.text}`}
                    fg={entry.fg}
                  />
                );
              }}
            </For>
          </scrollbox>
        </box>
      </box>
      <Footer hints={props.hints} marginTop={1} />
    </box>
  );
};

export default RunScreen;
