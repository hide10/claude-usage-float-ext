# Implementation Notes

## Architecture Overview

This is a Chrome/Edge MV3 extension that ports the Electron desktop widget to a browser extension with auto-authentication.

### Key Design Decisions

1. **Auto-Auth**: The extension automatically extracts `sessionKey` from browser cookies and fetches organizations from the Claude API. No manual input needed.

2. **Service Worker as State Manager**: `chrome.storage.local` holds persistent state (last snapshot, settings), `chrome.storage.session` holds temporary cache (auth with 5-min TTL).

3. **Message-Based Communication**: Popup and service worker communicate via `chrome.runtime.sendMessage` with typed message contracts in `messages.ts`.

4. **Polling via Alarms**: Instead of `setTimeout`, we use `chrome.alarms` which respects extension lifecycle (won't run if user switches tabs frequently).

## File Structure

```
src/
├── shared/
│   ├── types.ts       # Shared type definitions
│   └── messages.ts    # Typed message contracts
├── background/
│   ├── serviceWorker.ts  # Main event handler
│   ├── auth.ts           # Auto-extract sessionKey + organizationId
│   └── usageFetcher.ts   # Anthropic API client (ported from original)
└── popup/
    ├── index.html        # Popup HTML
    ├── popup.tsx         # React entry point
    ├── PopupApp.tsx      # Main UI component
    └── styles.css        # Styles (copied from original, no drag rules)
```

## Service Worker Lifecycle

```
chrome.runtime.onInstalled (reason: install/update)
  ↓
loadState() → loadSettings()
setupAlarm(pollIntervalSec / 60)  // e.g. 30s → 0.5min
runPoll()  // Fetch usage immediately
  ↓
chrome.alarms.onAlarm (triggered every 0.5min)
  ↓
runPoll()
  ├─ resolveAuth()  // Get sessionKey + org from cookies/API
  ├─ fetchUsageSnapshot(auth)  // Call Claude usage API
  ├─ setState() → saveState()  // Persist to chrome.storage.local
  └─ notifyPopups()  // Send STATE_UPDATE to all popups
```

## Message Flow

### GET_STATE (Popup → Service Worker)
```typescript
// Popup on mount:
chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
  setState(response.state);
});

// Service Worker:
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GET_STATE") {
    sendResponse({ state: currentState });
  }
});
```

### STATE_UPDATE (Service Worker → Popup)
```typescript
// Service Worker after runPoll():
for (const tab of tabs) {
  chrome.tabs.sendMessage(tab.id, {
    type: "STATE_UPDATE",
    payload: currentState,
  });
}

// Popup listener:
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STATE_UPDATE") {
    setState(message.payload);
  }
});
```

### SAVE_SETTINGS (Popup → Service Worker)
```typescript
chrome.runtime.sendMessage(
  {
    type: "SAVE_SETTINGS",
    payload: { pollIntervalSec: 60 },
  },
  () => { /* callback */ }
);

// Service Worker:
currentState.settings.pollIntervalSec = msg.payload.pollIntervalSec;
saveState();
setupAlarm();  // Re-create alarm with new interval
```

## Known Limitations & TODOs

1. **Icons**: Placeholder icons are not included. Create 16x16, 48x48, 128x128 PNG files and place in `public/icons/`.

2. **Settings Validation**: Poll interval is not validated on the popup side (relies on HTML `min`/`max`).

3. **Error Recovery**: Network errors show "retrying" but don't have exponential backoff.

4. **Badge Text**: Only shows "!" when limit reached. Could show remaining time or quota percentage.

5. **Popup Window Size**: Fixed to popup dimensions. Could add option to expand.

## Testing

### Manual Testing Checklist

- [ ] Install extension in Chrome/Edge
- [ ] Click extension icon → see "loading" status
- [ ] Log into claude.ai in a separate tab
- [ ] Wait for extension to auto-fetch usage (should update within 30 sec)
- [ ] Verify usage bars display correctly
- [ ] Click refresh button → usage updates immediately
- [ ] Open settings, change poll interval to 10 sec, save
- [ ] Verify alarm re-creates with new interval (check service worker logs)
- [ ] Log out of claude.ai
- [ ] Verify extension shows "Not logged in" message

### Browser DevTools

**Service Worker Console:**
```
chrome://extensions/ → Claude Usage Float → "Inspect views" → "service worker"
```

**Popup Console:**
```
chrome://extensions/ → Claude Usage Float → "Inspect" (popup must be open)
```

## Debugging Tips

1. **Storage Inspection**:
   ```javascript
   // In service worker console:
   chrome.storage.local.get(null, console.log);
   chrome.storage.session.get(null, console.log);
   ```

2. **Message Testing**:
   ```javascript
   // In popup console:
   chrome.runtime.sendMessage({ type: "GET_STATE" }, console.log);
   ```

3. **Cookies**:
   ```javascript
   // In service worker console:
   chrome.cookies.get({ url: "https://claude.ai", name: "sessionKey" }, console.log);
   ```

## Future Enhancements

1. **Persistent Notification**: Show notification when limit is reached
2. **History Graph**: Track usage over time
3. **Multiple Orgs**: Support switching between organizations
4. **Dark/Light Theme**: Respect system preference
5. **Keyboard Shortcut**: Open popup with hotkey (requires manifest `commands`)
