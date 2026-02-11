import type { LogEntry } from "../types";
import { theme } from "../theme";

const TAG_COLORS: Record<string, string> = {
  "[ERROR]": theme.love,
  "[WARNING]": theme.gold,
  "[SUCCESS]": theme.foam,
  "[INFO]": theme.pine,
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

export function stripAnsiCodes(input: string): string {
  return input.replace(/\x1B\[[0-9;]*m/g, "");
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

function getTagColor(input: string): string | undefined {
  for (const [tag, color] of Object.entries(TAG_COLORS)) {
    if (input.includes(tag)) {
      return color;
    }
  }

  return undefined;
}

export function hydrateLogEntry(rawLine: string): LogEntry {
  const fg = getTagColor(rawLine) ?? getAnsiFgColor(rawLine) ?? theme.subtle;
  const dim = /^\s{4}/.test(rawLine);
  const text = stripAnsiCodes(rawLine).replace(/\n$/, "");

  return { text, fg, dim };
}
