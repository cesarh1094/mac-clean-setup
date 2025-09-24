import type { Accessor, Component } from "solid-js";
import { For } from "solid-js";

import Footer from "./Footer";
import type { Step } from "../types";

type SummaryScreenProps = {
  steps: Accessor<Step[]>;
  lastRunIds: Accessor<string[]>;
  completed: Accessor<Set<string>>;
  footer: string;
};

const SummaryScreen: Component<SummaryScreenProps> = (props) => (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    <box flexGrow={1} flexDirection="row" width="100%">
      <box width={40} height="100%" borderStyle="double" title="Results" padding={1}>
        <For each={props.steps().filter(step => props.lastRunIds().includes(step.id))}>
          {(step) => {
            const statusColor = step.status === "ok" ? "#00FF00" : step.status === "fail" ? "#FF5555" : "#CCCCCC";
            const seconds = step.durationMs ? Math.max(1, Math.round(step.durationMs / 1000)) : undefined;
            const label = `${step.label}${seconds ? ` (${seconds}s)` : ""}`;
            return <text content={label} fg={statusColor} />;
          }}
        </For>
      </box>
      <box flexGrow={1} height="100%" borderStyle="double" title="Next Steps" padding={1}>
        <text
          content={props.completed().size ? "Completed installers will be skipped next time. Press Enter to go back." : "Press Enter to go back."}
          fg="#BBBBBB"
        />
        <box marginTop={1} flexDirection="column" gap={1}>
          <text content={`Completed: ${[...props.completed()].length ? [...props.completed()].join(", ") : "Homebrew"}`} fg="#66FF66" />
          <text content={`Failed: ${props.steps().filter(step => step.status === "fail").map(step => step.label).join(", ") || "None"}`} fg="#FF7777" />
        </box>
      </box>
    </box>
    <Footer content={props.footer} marginTop={1} />
  </box>
);

export default SummaryScreen;


