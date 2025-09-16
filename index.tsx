// @ts-nocheck
import { render } from "@opentui/solid";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import App from "./src/App";

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 35,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF5555",
    startInDebugMode: false
  }
});

await render(() => <App renderer={renderer} />, { renderer });


