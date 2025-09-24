import type { LogEntry } from "../types";

const TAG_COLORS: Record<string, string> = {
  "[ERROR]": "#FF5555",
  "[WARNING]": "#FFFF00",
  "[SUCCESS]": "#00FF00",
  "[INFO]": "#00FFFF"
};

const ANSI_COLOR_MAP: Record<number, string> = {
  30: "#000000",
  31: "#FF5555",
  32: "#00FF00",
  33: "#FFFF00",
  34: "#00AAFF",
  35: "#FF00FF",
  36: "#00FFFF",
  37: "#FFFFFF",
  90: "#666666",
  91: "#FF6E6E",
  92: "#69FF69",
  93: "#FFFF88",
  94: "#33BBFF",
  95: "#FF66FF",
  96: "#66FFFF",
  97: "#FFFFFF"
};

export function stripAnsiCodes(input: string): string {
  return input.replace(/\x1B\[[0-9;]*m/g, "");
}

function getAnsiFgColor(input: string): string | undefined {
  const matches = [...input.matchAll(/\x1B\[([0-9;]+)m/g)];
  if (!matches.length) {return undefined;}
  const last = matches[matches.length - 1]?.[1];
  if (!last) {return undefined;}
  const code = last
    .split(";")
    .map(Number)
    .find((c) => (c >= 30 && c <= 37) || (c >= 90 && c <= 97));
  return code !== undefined ? ANSI_COLOR_MAP[code] : undefined;
}

function getTagColor(input: string): string | undefined {
  for (const [tag, color] of Object.entries(TAG_COLORS)) {
    if (input.includes(tag)) {return color;}
  }
  return undefined;
}

export function hydrateLogEntry(rawLine: string): LogEntry {
  const fg = getTagColor(rawLine) ?? getAnsiFgColor(rawLine) ?? "#BBBBBB";
  const dim = /^\s{4}/.test(rawLine);
  const text = stripAnsiCodes(rawLine).replace(/\n$/, "");
  return { text, fg, dim };
}


