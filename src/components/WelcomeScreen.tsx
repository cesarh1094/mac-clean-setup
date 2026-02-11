import type { Component } from "solid-js";
import { theme } from "../theme";

import Footer from "./Footer";
import type { KeyHint } from "../types";

type WelcomeScreenProps = {
  hints: KeyHint[];
};

const WelcomeScreen: Component<WelcomeScreenProps> = (props) => (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    <box
      flexDirection="column"
      gap={1}
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
    >
      <ascii_font text="Ces's Setup" font="shade" color={theme.iris} />
      <box marginTop={2} />
      <text
        content="Welcome! This tool helps you install your dev environment."
        fg={theme.subtle}
      />
      <text
        content="Press Enter to choose what to install, or q to quit."
        fg={theme.muted}
      />
    </box>
    <Footer hints={props.hints} marginTop={2} />
  </box>
);

export default WelcomeScreen;
