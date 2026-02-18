import { render } from "@opentui/solid";
import { ConsolePosition } from "@opentui/core";
import App from "./src/App";
import { theme } from "./src/theme";

// Suppress noisy "baseline-browser-mapping" outdated-data warning from browserslist
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";

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


