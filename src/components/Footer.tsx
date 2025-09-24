import type { Component } from "solid-js";

type FooterProps = {
  content: string;
  color?: string;
  marginTop?: number;
};

const Footer: Component<FooterProps> = (props) => (
  <box paddingTop={props.marginTop ?? 1}>
    <text content={props.content} fg={props.color ?? "#6666FF"} />
  </box>
);

export default Footer;
