import { UsageState, defaultSettings } from "@shared/types";
import { PopupMessage } from "@shared/messages";
import { resolveAuth } from "./auth";
import { fetchUsageSnapshot } from "./usageFetcher";

const STATE_KEY = "state";
const SETTINGS_KEY = "settings";
const POLL_ALARM_NAME = "poll";

let currentState: UsageState = {
  status: "loading",
  message: "Initializing...",
  settings: defaultSettings,
  snapshot: null,
};

let popupPort: chrome.runtime.Port | null = null;

// Load initial state from storage
async function loadState() {
  const stored = await chrome.storage.local.get([STATE_KEY, SETTINGS_KEY]);
  if (stored[STATE_KEY]) {
    currentState = stored[STATE_KEY] as UsageState;
  }
  if (stored[SETTINGS_KEY]) {
    currentState.settings = stored[SETTINGS_KEY];
  }
}

// Save state to storage
async function saveState() {
  await chrome.storage.local.set({
    [STATE_KEY]: currentState,
    [SETTINGS_KEY]: currentState.settings,
  });
}

// Notify popup of state change via port connection
function notifyPopups() {
  if (popupPort) {
    try {
      popupPort.postMessage({
        type: "STATE_UPDATE",
        payload: currentState,
      });
    } catch (error) {
      console.error("[notify] Failed to send message to popup:", error);
      popupPort = null;
    }
  }
}

// Main polling logic
async function runPoll() {
  console.log("[poll] Starting poll cycle");

  try {
    const auth = await resolveAuth();
    const snapshot = await fetchUsageSnapshot(auth);

    currentState = {
      status: "ready",
      message: "Updated",
      settings: currentState.settings,
      snapshot,
    };

    // Update badge if limit reached
    if (snapshot.limitReached) {
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#FF6B6B" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }

    console.log("[poll] Success, state updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[poll] Error:", message);

    if (message.includes("Not logged in")) {
      currentState = {
        status: "needs-config",
        message: "Not logged in to claude.ai",
        settings: currentState.settings,
        snapshot: null,
      };
    } else {
      currentState = {
        status: "error",
        message: message,
        settings: currentState.settings,
        snapshot: currentState.snapshot,
      };
    }
  }

  await saveState();
  await notifyPopups();
}

// Setup or update alarm based on settings
async function setupAlarm() {
  const intervalMin = Math.max(0.5, currentState.settings.pollIntervalSec / 60);
  console.log(`[alarm] Setting up poll alarm every ${intervalMin} minutes`);
  await chrome.alarms.create(POLL_ALARM_NAME, { periodInMinutes: intervalMin });
}

// Extension installed or started
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[lifecycle] onInstalled: ${details.reason}`);
  await loadState();
  await setupAlarm();
  await runPoll();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("[lifecycle] onStartup");
  await loadState();
  await setupAlarm();
  await runPoll();
});

// Alarm triggered
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === POLL_ALARM_NAME) {
    await runPoll();
  }
});

// Port connection handler (for popup persistent connection)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    console.log("[port] Popup connected");
    popupPort = port;

    port.onMessage.addListener((message: PopupMessage | unknown) => {
      const msg = message as PopupMessage;
      if (msg.type === "GET_STATE") {
        port.postMessage({ type: "STATE_UPDATE", payload: currentState });
      }
      if (msg.type === "FORCE_REFRESH") {
        runPoll().catch(console.error);
      }
      if (msg.type === "SAVE_SETTINGS") {
        currentState.settings.pollIntervalSec = msg.payload.pollIntervalSec;
        saveState().catch(console.error);
        setupAlarm().catch(console.error);
      }
    });

    port.onDisconnect.addListener(() => {
      console.log("[port] Popup disconnected");
      popupPort = null;
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message: PopupMessage | unknown, _sender, sendResponse) => {
  const msg = message as PopupMessage;

  if (msg.type === "GET_STATE") {
    sendResponse({ state: currentState });
    return;
  }

  if (msg.type === "FORCE_REFRESH") {
    runPoll().catch(console.error);
    sendResponse({ ok: true });
    return;
  }

  if (msg.type === "SAVE_SETTINGS") {
    currentState.settings.pollIntervalSec = msg.payload.pollIntervalSec;
    saveState().catch(console.error);
    setupAlarm().catch(console.error);
    sendResponse({ ok: true });
    return;
  }

  sendResponse({ error: "Unknown message type" });
});
