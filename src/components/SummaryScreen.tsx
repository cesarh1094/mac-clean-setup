import type { Accessor, Component } from "solid-js";
import { For } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import { theme } from "../theme";

import Footer from "./Footer";
import type { Step } from "../types";

type SummaryScreenProps = {
  steps: Accessor<Step[]>;
  lastRunIds: Accessor<string[]>;
  completed: Accessor<Set<string>>;
  footer: string;
};

const SummaryScreen: Component<SummaryScreenProps> = (props) => {
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
        title="Results"
        padding={1}
      >
        <For
          each={props
            .steps()
            .filter((step) => props.lastRunIds().includes(step.id))}
        >
          {(step) => {
            const statusColor =
              step.status === "ok"
                ? theme.foam
                : step.status === "fail"
                ? theme.love
                : theme.subtle;
            const seconds = step.durationMs
              ? Math.max(1, Math.round(step.durationMs / 1000))
              : undefined;
            const label = `${step.label}${seconds ? ` (${seconds}s)` : ""}`;
            return <text content={label} fg={statusColor} />;
          }}
        </For>
      </box>
      <box
        flexGrow={1}
        height="100%"
        borderStyle="rounded"
        borderColor={theme.highlightHigh}
        title="Next Steps"
        padding={1}
      >
        <text
          content={
            props.completed().size
              ? "Completed installers will be skipped next time. Press Enter to go back."
              : "Press Enter to go back."
          }
          fg={theme.subtle}
        />
        <box marginTop={1} flexDirection="column" gap={1}>
          <text
            content={`Completed: ${
              [...props.completed()].length
                ? [...props.completed()].join(", ")
                : "Homebrew"
            }`}
            fg={theme.foam}
          />
          <text
            content={`Failed: ${
              props
                .steps()
                .filter((step) => step.status === "fail")
                .map((step) => step.label)
                .join(", ") || "None"
            }`}
            fg={theme.love}
          />
        </box>
      </box>
    </box>
    <Footer content={props.footer} marginTop={1} />
  </box>
  );
};

export default SummaryScreen;
