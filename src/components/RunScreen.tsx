import type { Accessor, Component } from "solid-js";
import { For } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import { theme } from "../theme";

import Footer from "./Footer";
import type { LogEntry, Step } from "../types";

type RunScreenProps = {
  steps: Accessor<Step[]>;
  activeRunIds: Accessor<string[]>;
  logs: Accessor<LogEntry[]>;
  footer: string;
};

const RunScreen: Component<RunScreenProps> = (props) => {
  const dims = useTerminalDimensions();
  const isNarrow = () => dims().width < 60;
  const sidebarWidth = () => (dims().width < 100 ? 25 : 40);

  return (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    <box flexGrow={1} flexDirection={isNarrow() ? "column" : "row"} width="100%" gap={1}>
      <box
        width={isNarrow() ? "100%" : sidebarWidth()}
        height={isNarrow() ? 10 : "100%"}
        borderStyle="rounded"
        borderColor={theme.highlightHigh}
        title="Selected Steps"
        padding={1}
      >
        <For
          each={props
            .steps()
            .filter((step) => props.activeRunIds().includes(step.id))}
        >
          {(step) => {
            const color =
              step.status === "ok"
                ? theme.foam
                : step.status === "fail"
                ? theme.love
                : step.status === "running"
                ? theme.iris
                : theme.subtle;
            const label = `${step.label}${
              step.durationMs ? ` (${Math.round(step.durationMs / 1000)}s)` : ""
            }`;
            return <text content={label} fg={color} />;
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
            {(entry) => <text content={entry.text} fg={entry.fg} />}
          </For>
        </scrollbox>
      </box>
    </box>
    <Footer content={props.footer} marginTop={1} />
  </box>
  );
};

export default RunScreen;
