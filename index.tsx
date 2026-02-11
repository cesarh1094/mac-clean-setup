import { render } from "@opentui/solid";
import { ConsolePosition } from "@opentui/core";
import App from "./src/App";

await render(() => <App />, {
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 35,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF5555",
    startInDebugMode: false,
  },
});


