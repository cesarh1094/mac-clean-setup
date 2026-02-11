import type { Component } from "solid-js";

type FooterProps = {
  content: string;
  color?: string;
  marginTop?: number;
};

const Footer: Component<FooterProps> = (props) => (
  <box width="100%" alignItems="center" paddingTop={props.marginTop ?? 1} paddingBottom={1}>
    <box width="100%" flexDirection="row" justifyContent="center">
      <text content={props.content} fg={props.color ?? "#6666FF"} />
    </box>
  </box>
);

export default Footer;
