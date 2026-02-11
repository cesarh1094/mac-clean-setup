import type { Accessor, Component } from "solid-js";
import { For } from "solid-js";
import { theme } from "../theme";

import Footer from "./Footer";
import type { Step } from "../types";

type SelectScreenProps = {
  steps: Accessor<Step[]>;
  cursorIdx: Accessor<number>;
  selected: Accessor<Set<string>>;
  isBrewReady: Accessor<boolean>;
  completed: Accessor<Set<string>>;
  footer: string;
};

const SelectScreen: Component<SelectScreenProps> = (props) => (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    <box
      flexGrow={1}
      borderStyle="rounded"
      borderColor={theme.highlightHigh}
      title="What would you like to install?"
      padding={1}
    >
      <For each={props.steps()}>
        {(step, i) => {
          const isCursor = () => i() === props.cursorIdx();
          const isSelected = () => props.selected().has(step.id);
          const isCompleted = () =>
            step.id !== "brew" && props.completed().has(step.id);
          const brewSelected = () => props.selected().has("brew");
          const isDisabled = () =>
            (step.requiresBrew && !brewSelected() && !props.isBrewReady()) ||
            isCompleted();
          const color = () => {
            if (isDisabled()) return theme.muted;
            if (isCursor()) return theme.foam;
            if (isSelected()) return theme.text;
            return theme.subtle;
          };
          const label = () => {
            const base = `${isSelected() ? "[x]" : "[ ]"} ${
              isCursor() ? ">" : " "
            } ${step.label}`;
            if (isCompleted()) return `${base} (completed)`;
            if (step.requiresBrew && !brewSelected() && !props.isBrewReady())
              return `${base} (requires brew)`;
            return base;
          };
          return <text content={label()} fg={color()} />;
        }}
      </For>
    </box>
    <Footer content={props.footer} marginTop={1} />
  </box>
);

export default SelectScreen;
