import type { Accessor, Component } from "solid-js";
import { createMemo, For, Show } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import { theme } from "../theme";

import Footer from "./Footer";
import type { KeyHint, Step } from "../types";

type SummaryScreenProps = {
  steps: Accessor<Step[]>;
  lastRunIds: Accessor<string[]>;
  completed: Accessor<Set<string>>;
  hints: KeyHint[];
};

const SummaryScreen: Component<SummaryScreenProps> = (props) => {
  const dims = useTerminalDimensions();
  const isNarrow = () => dims().width < 60;
  const sidebarWidth = () => (dims().width < 100 ? 25 : 40);

  const ranSteps = createMemo(() =>
    props.steps().filter((s) => props.lastRunIds().includes(s.id)),
  );

  const hasFailed = createMemo(() =>
    ranSteps().some((s) => s.status === "fail"),
  );

  const totalDuration = createMemo(() => {
    const ms = ranSteps().reduce((sum, s) => sum + (s.durationMs ?? 0), 0);
    return Math.max(1, Math.round(ms / 1000));
  });

  const statusIcon = (step: Step) => (step.status === "ok" ? "✓" : step.status === "fail" ? "✗" : "·");

  const statusColor = (step: Step) =>
    step.status === "ok"
      ? theme.foam
      : step.status === "fail"
      ? theme.love
      : theme.subtle;

  return (
    <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
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
          title="Results"
          padding={1}
          flexDirection="column"
        >
          <For each={ranSteps()}>
            {(step) => {
              const seconds = step.durationMs
                ? Math.max(1, Math.round(step.durationMs / 1000))
                : undefined;
              const label = `${statusIcon(step)} ${step.label}${seconds ? ` (${seconds}s)` : ""}`;
              return <text content={label} fg={statusColor(step)} />;
            }}
          </For>
          <box marginTop={1}>
            <text content={`Total: ${totalDuration()}s`} fg={theme.subtle} />
          </box>
        </box>
        <box
          flexGrow={1}
          height="100%"
          borderStyle="rounded"
          borderColor={theme.highlightHigh}
          title="Next Steps"
          padding={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Show
            when={hasFailed()}
            fallback={
              <text content="All steps completed successfully!" fg={theme.foam} />
            }
          >
            <text content="Some steps failed." fg={theme.love} />
            <box marginTop={1}>
              <text
                content="Press r on the select screen to retry failed steps."
                fg={theme.gold}
              />
            </box>
          </Show>
          <box marginTop={2}>
            <text content="Press Enter to go back." fg={theme.muted} />
          </box>
        </box>
      </box>
      <Footer hints={props.hints} marginTop={1} />
    </box>
  );
};

export default SummaryScreen;
