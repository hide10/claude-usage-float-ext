import { UsageState, defaultSettings } from "@shared/types";
import { PopupMessage } from "@shared/messages";
import { resolveAuth } from "./auth";
import { fetchUsageSnapshot } from "./usageFetcher";

const STATE_KEY = "state";
const SETTINGS_KEY = "settings";
const POLL_ALARM_NAME = "poll";
const DEFAULT_WINDOW_SIZE = { width: 340, height: 260 };

let currentState: UsageState = {
  status: "loading",
  message: "Initializing...",
  settings: defaultSettings,
  snapshot: null,
};

let popupPort: chrome.runtime.Port | null = null;
let floatWindowId: number | null = null;

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

// Create float window
async function createFloatWindow(url: string, size: { width: number; height: number }) {
  const win = await chrome.windows.create({
    url,
    type: "popup",
    width: size.width,
    height: size.height,
    focused: true,
  });
  floatWindowId = win.id ?? null;
}

async function openOrFocusFloatWindow(size: { width: number; height: number }) {
  const popupUrl = chrome.runtime.getURL("popup/index.html");

  if (floatWindowId !== null) {
    try {
      await chrome.windows.update(floatWindowId, {
        width: size.width,
        height: size.height,
        focused: true,
      });
      return;
    } catch {
      floatWindowId = null;
    }
  }

  await createFloatWindow(popupUrl, size);
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

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
  await chrome.alarms.create(POLL_ALARM_NAME, { periodInMinutes: intervalMin });
}

// Extension installed or started
chrome.runtime.onInstalled.addListener(async () => {
  await loadState();
  await setupAlarm();
  await runPoll();
});

chrome.runtime.onStartup.addListener(async () => {
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

// Track window close
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === floatWindowId) {
    floatWindowId = null;
  }
});

// Action click handler - open or focus float window
chrome.action.onClicked.addListener(async () => {
  await openOrFocusFloatWindow(DEFAULT_WINDOW_SIZE);
});

// Port connection handler (for popup persistent connection)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    popupPort = port;

    port.onMessage.addListener((message: PopupMessage | unknown) => {
      const msg = message as PopupMessage;

      switch (msg.type) {
        case "GET_STATE":
          port.postMessage({ type: "STATE_UPDATE", payload: currentState });
          break;
        case "FORCE_REFRESH":
          runPoll().catch(() => {});
          break;
        case "SAVE_SETTINGS":
          currentState.settings.pollIntervalSec = msg.payload.pollIntervalSec;
          saveState().catch(() => {});
          setupAlarm().catch(() => {});
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});
