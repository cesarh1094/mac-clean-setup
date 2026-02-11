import type { Component } from "solid-js";
import { For } from "solid-js";
import { theme } from "../theme";
import type { KeyHint } from "../types";

type FooterProps = {
  hints: KeyHint[];
  marginTop?: number;
};

const Footer: Component<FooterProps> = (props) => (
  <box
    width="100%"
    alignItems="center"
    paddingTop={props.marginTop ?? 1}
    paddingBottom={1}
  >
    <box width="100%" flexDirection="row" justifyContent="center" gap={0}>
      <For each={props.hints}>
        {(hint, i) => (
          <>
            {i() > 0 && <text content=" · " fg={theme.highlightHigh} />}
            <text content={hint.key} fg={theme.rose} />
            <text content={` ${hint.action}`} fg={theme.muted} />
          </>
        )}
      </For>
    </box>
  </box>
);

export default Footer;
