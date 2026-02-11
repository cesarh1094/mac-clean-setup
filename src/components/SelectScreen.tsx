import type { Accessor, Component } from "solid-js";
import { createMemo, For } from "solid-js";
import { theme } from "../theme";

import Footer from "./Footer";
import type { KeyHint, Step } from "../types";

type DisplayRow =
  | { type: "header"; label: string }
  | { type: "step"; step: Step; stepIndex: number };

type SelectScreenProps = {
  steps: Accessor<Step[]>;
  cursorIdx: Accessor<number>;
  selected: Accessor<Set<string>>;
  isBrewReady: Accessor<boolean>;
  completed: Accessor<Set<string>>;
  hints: KeyHint[];
};

const SelectScreen: Component<SelectScreenProps> = (props) => {
  const rows = createMemo<DisplayRow[]>(() => {
    const result: DisplayRow[] = [];
    let lastCategory = "";
    props.steps().forEach((step, i) => {
      const cat = step.category ?? "";
      if (cat !== lastCategory) {
        result.push({ type: "header", label: cat });
        lastCategory = cat;
      }
      result.push({ type: "step", step, stepIndex: i });
    });
    return result;
  });

  const selectedCount = createMemo(
    () => props.selected().size,
  );

  const totalCount = createMemo(() => props.steps().length);

  return (
    <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
      <box
        flexGrow={1}
        borderStyle="rounded"
        borderColor={theme.highlightHigh}
        title="What would you like to install?"
        padding={1}
        flexDirection="column"
      >
        <text
          content={`${selectedCount()} of ${totalCount()} selected`}
          fg={theme.subtle}
        />
        <scrollbox
          marginTop={1}
          flexGrow={1}
          width="100%"
          focused={true}
          style={{
            scrollbarOptions: {
              showArrows: false,
              trackOptions: {
                foregroundColor: theme.iris,
                backgroundColor: theme.highlightMed,
              },
            },
          }}
        >
          <For each={rows()}>
            {(row) => {
              if (row.type === "header") {
                return (
                  <box marginTop={1} marginBottom={0}>
                    <text content={`── ${row.label} ──`} fg={theme.muted} />
                  </box>
                );
              }

              const { step, stepIndex } = row;
              const isCursor = () => stepIndex === props.cursorIdx();
              const isSelected = () => props.selected().has(step.id);
              const isCompleted = () =>
                step.id !== "brew" && props.completed().has(step.id);
              const brewSelected = () => props.selected().has("brew");
              const isDisabled = () =>
                (step.requiresBrew &&
                  !brewSelected() &&
                  !props.isBrewReady()) ||
                isCompleted();

              const color = () => {
                if (isDisabled()) return theme.muted;
                if (isCursor()) return theme.text;
                if (isSelected()) return theme.rose;
                return theme.subtle;
              };

              const checkbox = () => (isSelected() ? "◉" : "○");

              const suffix = () => {
                if (isCompleted()) return ` ✓`;
                if (
                  step.requiresBrew &&
                  !brewSelected() &&
                  !props.isBrewReady()
                )
                  return " (requires brew)";
                return "";
              };

              const label = () =>
                `  ${checkbox()} ${step.label}${suffix()}`;

              return (
                <box
                  backgroundColor={
                    isCursor() ? theme.highlightMed : undefined
                  }
                >
                  <text content={label()} fg={color()} />
                </box>
              );
            }}
          </For>
        </scrollbox>
      </box>
      <Footer hints={props.hints} marginTop={1} />
    </box>
  );
};

export default SelectScreen;
