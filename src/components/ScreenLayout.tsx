import type { Component, JSX } from "solid-js";

type ScreenLayoutProps = {
  children: JSX.Element;
};

const ScreenLayout: Component<ScreenLayoutProps> = (props) => (
  <box flexDirection="column" width="100%" height="100%" flexGrow={1}>
    {props.children}
  </box>
);

export default ScreenLayout;


