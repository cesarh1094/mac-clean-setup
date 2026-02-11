import type { LogEntry } from "../types";
import { theme } from "../theme";

type TagConfig = {
  icon: string;
  iconColor: string;
  bodyColor: string;
  subBodyColor: string;
};

const TAG_CONFIG: Record<string, TagConfig> = {
  "[ERROR]": {
    icon: "✗",
    iconColor: theme.love,
    bodyColor: theme.love,
    subBodyColor: theme.love,
  },
  "[WARNING]": {
    icon: "⚠",
    iconColor: theme.gold,
    bodyColor: theme.gold,
    subBodyColor: theme.gold,
  },
  "[SUCCESS]": {
    icon: "✓",
    iconColor: theme.foam,
    bodyColor: theme.text,
    subBodyColor: theme.subtle,
  },
  "[INFO]": {
    icon: "ℹ",
    iconColor: theme.pine,
    bodyColor: theme.text,
    subBodyColor: theme.subtle,
  },
};

const ANSI_COLOR_MAP: Record<number, string> = {
  30: theme.overlay,
  31: theme.love,
  32: theme.foam,
  33: theme.gold,
  34: theme.iris,
  35: theme.rose,
  36: theme.foam,
  37: theme.text,
  90: theme.muted,
  91: theme.love,
  92: theme.foam,
  93: theme.gold,
  94: theme.iris,
  95: theme.rose,
  96: theme.foam,
  97: theme.text,
};

const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]+/gu;

export function stripAnsiCodes(input: string): string {
  return input.replace(/\x1B\[[0-9;]*m/g, "");
}

function stripEmoji(input: string): string {
  return input.replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();
}

function getAnsiFgColor(input: string): string | undefined {
  const matches = [...input.matchAll(/\x1B\[([0-9;]+)m/g)];

  if (!matches.length) {
    return undefined;
  }

  const last = matches[matches.length - 1]?.[1];

  if (!last) {
    return undefined;
  }

  const code = last
    .split(";")
    .map(Number)
    .find((c) => (c >= 30 && c <= 37) || (c >= 90 && c <= 97));

  return code !== undefined ? ANSI_COLOR_MAP[code] : undefined;
}

function findTag(input: string): { tag: string; config: TagConfig } | undefined {
  for (const [tag, config] of Object.entries(TAG_CONFIG)) {
    if (input.includes(tag)) {
      return { tag, config };
    }
  }
  return undefined;
}

const FINISHED_RE = /^Finished .+ script\.?$/i;

export function hydrateLogEntries(
  rawLine: string,
  isFirstEntry: boolean,
): LogEntry[] {
  const ansiColor = getAnsiFgColor(rawLine);
  const stripped = stripAnsiCodes(rawLine).replace(/\n$/, "");
  const isSub = /^\s{4}/.test(stripped);

  const found = findTag(stripped);

  if (found) {
    const { tag, config } = found;

    // Strip tag from text, strip emoji, clean up
    let text = stripped.replace(tag, "").trim();
    text = stripEmoji(text);

    // Collapse "Finished X install script." lines
    if (FINISHED_RE.test(text)) {
      return [];
    }

    const entries: LogEntry[] = [];

    // Add separator before top-level [INFO] lines (step boundaries)
    if (tag === "[INFO]" && !isSub && !isFirstEntry) {
      entries.push({ text: "", separator: true });
    }

    entries.push({
      text,
      fg: isSub ? config.subBodyColor : config.bodyColor,
      dim: isSub,
      icon: config.icon,
      iconColor: config.iconColor,
    });

    return entries;
  }

  // No tag — plain output from brew/npm/etc
  return [
    {
      text: stripEmoji(stripped),
      fg: ansiColor ?? theme.subtle,
      dim: isSub,
    },
  ];
}
