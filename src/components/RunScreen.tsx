import type { Accessor, Component } from "solid-js";
import { For } from "solid-js";

import Footer from "./Footer";
import type { LogEntry, Step } from "../types";

type RunScreenProps = {
  steps: Accessor<Step[]>;
  activeRunIds: Accessor<string[]>;
  logs: Accessor<LogEntry[]>;
  footer: string;
};

const RunScreen: Component<RunScreenProps> = (props) => (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    <box flexGrow={1} flexDirection="row" width="100%" gap={1}>
      <box
        width={40}
        height="100%"
        borderStyle="double"
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
                ? "#00FF00"
                : step.status === "fail"
                ? "#FF5555"
                : step.status === "running"
                ? "#00FFFF"
                : "#CCCCCC";
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
        borderStyle="double"
        title="Logs"
        padding={1}
      >
        <scrollbox height="100%" width="100%" padding={1}>
          <For each={props.logs()}>
            {(entry) => <text content={entry.text} fg={entry.fg} />}
          </For>
        </scrollbox>
      </box>
    </box>
    <Footer content={props.footer} marginTop={1} />
  </box>
);

export default RunScreen;
