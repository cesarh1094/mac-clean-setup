import { render } from "@opentui/solid";
import { ConsolePosition } from "@opentui/core";
import App from "./src/App";
import { theme } from "./src/theme";

await render(() => <App />, {
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 35,
    colorInfo: theme.foam,
    colorWarn: theme.gold,
    colorError: theme.love,
    startInDebugMode: false,
  },
});


