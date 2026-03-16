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
    url: url,
    type: "popup",
    width: size.width,
    height: size.height,
    focused: true,
  });
  floatWindowId = win.id ?? null;
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
chrome.runtime.onInstalled.addListener(async (details) => {
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
  const popupUrl = chrome.runtime.getURL("popup/index.html");
  const windowSize = { width: 340, height: 260 };

  // If window already exists, focus it
  if (floatWindowId !== null) {
    try {
      await chrome.windows.update(floatWindowId, { focused: true });
      return;
    } catch (err) {
      floatWindowId = null;
    }
  }

  // Create new window
  await createFloatWindow(popupUrl, windowSize);
});

// Port connection handler (for popup persistent connection)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    popupPort = port;

    port.onMessage.addListener((message: PopupMessage | unknown) => {
      const msg = message as PopupMessage;
      if (msg.type === "GET_STATE") {
        port.postMessage({ type: "STATE_UPDATE", payload: currentState });
      }
      if (msg.type === "FORCE_REFRESH") {
        runPoll().catch(() => {});
      }
      if (msg.type === "SAVE_SETTINGS") {
        currentState.settings.pollIntervalSec = msg.payload.pollIntervalSec;
        saveState().catch(() => {});
        setupAlarm().catch(() => {});
      }
    });

    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const msg = message as PopupMessage & { type: string; payload?: unknown };

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
    currentState.settings.pollIntervalSec = (msg.payload as { pollIntervalSec: number }).pollIntervalSec;
    saveState().catch(console.error);
    setupAlarm().catch(console.error);
    sendResponse({ ok: true });
    return;
  }

  if (msg.type === "ADJUST_HEIGHT") {
    const payload = msg.payload as { height: number };
    if (floatWindowId !== null) {
      chrome.windows.update(floatWindowId, {
        height: payload.height,
      }).catch(console.error);
    }
    sendResponse({ ok: true });
    return;
  }

  if (msg.type === "OPEN_WINDOW") {
    const payload = msg.payload as { width: number; height: number };
    const popupUrl = chrome.runtime.getURL("popup/index.html");

    // If window already exists, resize it
    if (floatWindowId !== null) {
      chrome.windows.update(floatWindowId, {
        width: payload.width,
        height: payload.height,
        focused: true,
      }).catch(() => {
        floatWindowId = null;
        createFloatWindow(popupUrl, payload);
      });
    } else {
      createFloatWindow(popupUrl, payload);
    }
    sendResponse({ ok: true });
    return;
  }

  sendResponse({ error: "Unknown message type" });
});
