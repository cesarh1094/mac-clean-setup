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
      <ascii_font text="Ces's Setup" font="block" color={theme.iris} />
      <box marginTop={1} />
      <text content="v0.0.1" fg={theme.muted} />
      <box marginTop={1} />
      <text
        content="Interactive macOS dev environment installer"
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
