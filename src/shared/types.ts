export type ClaudeUsageSettings = {
  sessionKey: string;
  organizationId: string;
  pollIntervalSec: number;
};

export type UsageWindow = {
  label: string;
  usedPercent: number | null;
  elapsedPercent: number | null;
  resetAt: string | null;
  windowSeconds: number | null;
  usedTokens: number | null;
  maxTokens: number | null;
};

export type UsageSnapshot = {
  fetchedAt: string;
  planType: string | null;
  limitReached: boolean | null;
  fiveHour: UsageWindow | null;
  sevenDay: UsageWindow | null;
  sevenDayOpus: UsageWindow | null;
  raw: Record<string, unknown>;
};

export type UsageState =
  | {
      status: "needs-config";
      message: string;
      settings: ClaudeUsageSettings;
      snapshot: null;
    }
  | {
      status: "loading" | "ready" | "error";
      message: string;
      settings: ClaudeUsageSettings;
      snapshot: UsageSnapshot | null;
    };

export const defaultSettings: ClaudeUsageSettings = {
  sessionKey: "",
  organizationId: "",
  pollIntervalSec: 30,
};
