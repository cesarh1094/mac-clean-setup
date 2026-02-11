import type { Component } from "solid-js";
import { RGBA } from "@opentui/core";

import Footer from "./Footer";

type WelcomeScreenProps = {
  footer: string;
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
      <ascii_font text="Ces's Setup" font="shade" fg={RGBA.fromHex("#FFFFFF")} />
      <box marginTop={2} />
      <text
        content="Welcome! This tool helps you install your dev environment."
        fg="#BBBBBB"
      />
      <text
        content="Press Enter to choose what to install, or q to quit."
        fg="#888888"
      />
    </box>
    <Footer content={props.footer} marginTop={2} />
  </box>
);

export default WelcomeScreen;
