import type { Component, JSX } from "solid-js";
import { theme } from "../theme";

type ScreenLayoutProps = {
  children: JSX.Element;
};

const ScreenLayout: Component<ScreenLayoutProps> = (props) => (
  <box
    flexDirection="column"
    width="100%"
    height="100%"
    flexGrow={1}
    paddingX={2}
    paddingY={2}
    gap={1}
    backgroundColor={theme.base}
  >
    {props.children}
  </box>
);

export default ScreenLayout;
