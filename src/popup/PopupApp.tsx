import { FormEvent, useEffect, useState } from "react";
import { ClaudeUsageSettings, UsageWindow, defaultSettings, UsageState } from "@shared/types";
import { StateUpdateMessage } from "@shared/messages";

export function PopupApp() {
  const [state, setState] = useState<UsageState>({
    status: "loading",
    message: "Initializing...",
    settings: defaultSettings,
    snapshot: null,
  });
  const [draft, setDraft] = useState<ClaudeUsageSettings>(defaultSettings);
  const [view, setView] = useState<"main" | "settings">("main");

  useEffect(() => {
    // Get initial state from background
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
      if (response?.state) {
        setState(response.state);
        setDraft(response.state.settings);
      }
    });

    // Listen for state updates from background
    const listener = (message: StateUpdateMessage | unknown) => {
      const msg = message as StateUpdateMessage;
      if (msg.type === "STATE_UPDATE") {
        setState(msg.payload);
        setDraft(msg.payload.settings);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (view === "settings") {
    return <SettingsView state={state} draft={draft} setDraft={setDraft} onBack={() => setView("main")} />;
  }

  return <MainView state={state} onSettings={() => setView("settings")} />;
}

function MainView({ state, onSettings }: { state: UsageState; onSettings: () => void }) {
  const handleRefresh = () => {
    chrome.runtime.sendMessage({ type: "FORCE_REFRESH" }, () => {
      console.log("Refresh triggered");
    });
  };

  return (
    <div className="shell">
      <main className="panel compact-panel">
        <section className="topline">
          <div>
            <p className="eyebrow">Claude Usage</p>
            <p className="timestamp">
              {state.snapshot ? formatTime(state.snapshot.fetchedAt) : compactStatus(state.status)}
            </p>
          </div>
          <div className="toolbar">
            <button className="ghost mini" onClick={handleRefresh} title="Refresh now">
              ↻
            </button>
            <button className="ghost mini" onClick={onSettings} title="Settings">
              ⚙
            </button>
          </div>
        </section>

        {state.status === "needs-config" ? (
          <section className="stack compact-stack">
            <div className="usage-card compact-card">
              <p className="card-label">Not Logged In</p>
              <p className="timestamp" style={{ marginTop: "8px", color: "#ffd2c2" }}>
                Please visit{" "}
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#fff2e3" }}>
                  claude.ai
                </a>{" "}
                and log in to use this extension.
              </p>
            </div>
          </section>
        ) : (
          <section className="stack compact-stack">
            <UsageCard window={state.snapshot?.fiveHour ?? null} />
            <UsageCard window={state.snapshot?.sevenDay ?? null} />
          </section>
        )}
      </main>
    </div>
  );
}

function SettingsView({
  state,
  draft,
  setDraft,
  onBack,
}: {
  state: UsageState;
  draft: ClaudeUsageSettings;
  setDraft: React.Dispatch<React.SetStateAction<ClaudeUsageSettings>>;
  onBack: () => void;
}) {
  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    chrome.runtime.sendMessage(
      {
        type: "SAVE_SETTINGS",
        payload: { pollIntervalSec: draft.pollIntervalSec },
      },
      () => {
        console.log("Settings saved");
        onBack();
      },
    );
  }

  return (
    <div className="shell">
      <main className="panel settings-panel">
        <section className="topline">
          <div>
            <p className="eyebrow">Settings</p>
            <p className="timestamp">{state.message}</p>
          </div>
        </section>
        <section className="settings no-margin">
          <form onSubmit={onSubmit}>
            <label>
              Poll interval (sec)
              <input
                type="number"
                min={10}
                max={300}
                value={draft.pollIntervalSec}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    pollIntervalSec: Number(event.target.value),
                  }))
                }
              />
            </label>

            <div className="settings-actions">
              <button type="submit" className="primary">
                Save
              </button>
              <button type="button" className="ghost" onClick={onBack}>
                Back
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function UsageCard({ window }: { window: UsageWindow | null }) {
  const usedPercent = clampPercent(window?.usedPercent ?? null);
  const elapsedPercent = clampPercent(window?.elapsedPercent ?? null);
  const advice = judgeUsage(usedPercent, elapsedPercent);

  return (
    <section className="usage-card compact-card">
      <p className="card-label">{window?.label ?? "--"}</p>
      <div className="bar-card">
        <div className="bar-track">
          <div className="bar-time" style={{ width: `${elapsedPercent ?? 0}%` }} />
          <div className="bar-usage" style={{ width: `${usedPercent ?? 0}%` }} />
          {elapsedPercent != null ? (
            <div className="bar-marker-notch" style={{ left: `calc(${elapsedPercent}% - 6px)` }} />
          ) : null}
          <div className="bar-overlay">
            <span className="usage-value">{usedPercent == null ? "" : `${usedPercent.toFixed(0)}%`}</span>
          </div>
        </div>
      </div>
      <div className="meta-row">
        <p className={`advice-line ${advice.tone}`}>{advice.label}</p>
        <p className="time-meta">
          {elapsedPercent == null ? "time --" : `time ${elapsedPercent.toFixed(0)}%`}
        </p>
      </div>
    </section>
  );
}

function compactStatus(status: UsageState["status"]) {
  switch (status) {
    case "needs-config":
      return "setup";
    case "loading":
      return "loading";
    case "ready":
      return "updated";
    case "error":
      return "retrying";
    default:
      return "--";
  }
}

function judgeUsage(usedPercent: number | null, elapsedPercent: number | null) {
  if (usedPercent == null || elapsedPercent == null) {
    return { label: "--", tone: "neutral" as const };
  }
  if (usedPercent > elapsedPercent + 5) {
    return { label: "Slow down", tone: "warn" as const };
  }
  if (usedPercent + 5 < elapsedPercent) {
    return { label: "Use more", tone: "good" as const };
  }
  return { label: "On pace", tone: "neutral" as const };
}

function clampPercent(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(0, Math.min(100, value));
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
