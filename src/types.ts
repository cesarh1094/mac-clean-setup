// Shared type definitions for the Machine Setup TUI

export type StepStatus = "idle" | "running" | "ok" | "fail";

export type Step = {
  id: string;
  label: string;
  script: string;
  status: StepStatus;
  durationMs?: number;
  requiresBrew?: boolean;
  category?: string;
};

export type LogEntry = {
  text: string;
  fg?: string;
  dim?: boolean;
};

export type Screen = "welcome" | "select" | "run" | "summary";

export type AppStore = {
  steps: Step[];
  completedIds: string[];
  lastRunIds: string[];
  activeRunIds: string[];
};


