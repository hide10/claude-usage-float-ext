import { UsageSnapshot, UsageWindow } from "@shared/types";
import { ResolvedAuth } from "./auth";

const API_BASE = "https://claude.ai/api/organizations";

type JsonRecord = Record<string, unknown>;

export async function fetchUsageSnapshot(auth: ResolvedAuth): Promise<UsageSnapshot> {
  const url = `${API_BASE}/${auth.organizationId}/usage`;

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      cookie: `sessionKey=${auth.sessionKey}`,
      referer: "https://claude.ai/",
      "user-agent": "Mozilla/5.0 Claude Usage Float",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude Web API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as JsonRecord;
  const primaryWindow = asRecord(data.rate_limit)?.primary_window;
  const secondaryWindow = asRecord(data.rate_limit)?.secondary_window;

  const fiveHour = extractWindow(data, "5-hour", [
    ["five_hour"],
    ["rate_limit", "primary_window"],
    ["primary_window"],
  ]);
  const sevenDay = extractWindow(data, "7-day", [
    ["seven_day"],
    ["rate_limit", "secondary_window"],
    ["secondary_window"],
  ]);
  const sevenDayOpus = extractWindow(data, "7-day Opus", [["seven_day_opus"]]);

  return {
    fetchedAt: new Date().toISOString(),
    planType: asString(data.plan_type),
    limitReached: readBoolean(data, [
      ["rate_limit", "limit_reached"],
      ["five_hour", "limit_reached"],
      ["primary_window", "limit_reached"],
    ]),
    fiveHour,
    sevenDay,
    sevenDayOpus,
    raw: {
      plan_type: data.plan_type,
      rate_limit: asRecord(data.rate_limit),
      five_hour: asRecord(data.five_hour) ?? asRecord(primaryWindow),
      seven_day: asRecord(data.seven_day) ?? asRecord(secondaryWindow),
      seven_day_opus: asRecord(data.seven_day_opus),
    },
  };
}

function extractWindow(
  data: JsonRecord,
  label: string,
  candidatePaths: string[][],
): UsageWindow | null {
  for (const path of candidatePaths) {
    const candidate = readRecord(data, path);
    if (!candidate) {
      continue;
    }

    const resetAt = readString(candidate, [["resets_at"], ["reset_at"], ["reset_time"]]);
    const windowSeconds =
      readNumber(candidate, [["limit_window_seconds"], ["window_seconds"]]) ??
      fallbackWindowSeconds(label);
    const remainingDebug = computeRemainingPercentDebug(resetAt, windowSeconds);

    return {
      label,
      usedPercent: readNumber(candidate, [
        ["utilization"],
        ["used_percent"],
        ["percentage"],
        ["utilization_percentage"],
      ]),
      resetAt,
      windowSeconds,
      elapsedPercent: remainingDebug.elapsedPercent,
      usedTokens: readNumber(candidate, [["used_tokens"], ["tokens_used"], ["used"]]),
      maxTokens: readNumber(candidate, [["max_tokens"], ["token_limit"], ["limit"]]),
    };
  }

  return null;
}

function readRecord(root: JsonRecord, path: string[]) {
  let current: unknown = root;
  for (const key of path) {
    const record = asRecord(current);
    if (!record || !(key in record)) {
      return null;
    }
    current = record[key];
  }
  return asRecord(current);
}

function readNumber(root: JsonRecord, candidates: string[][]) {
  for (const path of candidates) {
    const value = readPath(root, path);
    if (value == null || value === "") {
      continue;
    }

    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return null;
}

function readString(root: JsonRecord, candidates: string[][]) {
  for (const path of candidates) {
    const value = readPath(root, path);
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
}

function readBoolean(root: JsonRecord, candidates: string[][]) {
  for (const path of candidates) {
    const value = readPath(root, path);
    if (typeof value === "boolean") {
      return value;
    }
  }
  return null;
}

function readPath(root: JsonRecord, path: string[]) {
  let current: unknown = root;
  for (const key of path) {
    const record = asRecord(current);
    if (!record || !(key in record)) {
      return null;
    }
    current = record[key];
  }
  return current;
}

function asRecord(value: unknown): JsonRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function computeRemainingPercentDebug(resetAt: string | null, windowSeconds: number | null) {
  if (!resetAt || !windowSeconds) {
    return { elapsedPercent: null };
  }

  const resetMs = parseClaudeDate(resetAt);
  if (resetMs == null) {
    return { elapsedPercent: null };
  }

  const remainingSeconds = (resetMs - Date.now()) / 1000;
  const remainingPercent = (remainingSeconds / windowSeconds) * 100;
  if (!Number.isFinite(remainingPercent)) {
    return { elapsedPercent: null };
  }

  const elapsedPercent = Math.max(0, Math.min(100, 100 - remainingPercent));
  return { elapsedPercent };
}

function parseClaudeDate(value: string) {
  const match = value
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/,
    );
  if (!match) {
    const fallback = new Date(value).getTime();
    return Number.isNaN(fallback) ? null : fallback;
  }

  const [, y, mo, d, h, mi, s, fraction = "0", tz] = match;
  const ms = Number(fraction.slice(0, 3).padEnd(3, "0"));
  const utcMs = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
    ms,
  );

  if (tz === "Z") {
    return utcMs;
  }

  const sign = tz.startsWith("+") ? 1 : -1;
  const [tzHour, tzMinute] = tz.slice(1).split(":").map(Number);
  const offsetMs = sign * ((tzHour * 60 + tzMinute) * 60 * 1000);
  return utcMs - offsetMs;
}

function fallbackWindowSeconds(label: string) {
  if (label === "5-hour") {
    return 5 * 60 * 60;
  }

  if (label === "7-day") {
    return 7 * 24 * 60 * 60;
  }

  return null;
}
