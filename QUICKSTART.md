# Quick Start Guide

## Prerequisites

- Node.js 18+
- Chrome or Edge browser
- npm or yarn

## Installation & Testing

### 1. Build the extension

```bash
npm install
npm run build
```

Output will be in the `dist/` directory with this structure:
```
dist/
├── background/
│   └── serviceWorker.js      # Extension background script
└── popup/
    ├── index.html            # Popup HTML
    ├── index.js              # React popup UI (bundled)
    └── index.css             # Popup styles
```

### 2. Load in Chrome/Edge

#### Chrome:
1. Open `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this repo
5. You should see "Claude Usage Float" extension added

#### Edge:
1. Open `edge://extensions/`
2. Enable **"Developer mode"** (toggle on left sidebar)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this repo

### 3. Test the extension

**Before Testing:** Log into https://claude.ai in your browser to establish a session cookie.

1. **Click the extension icon** in the toolbar
   - You should see a popup with "Loading..." status
   - After ~1 second, usage bars should appear (if you're logged in)
   - Shows 5-hour and 7-day usage windows

2. **Check the status**
   - Green "Use more" = you're under pace
   - Orange "On pace" = balanced usage
   - Red "Slow down" = exceeding pace

3. **Try the refresh button** (↻ icon)
   - Usage data updates immediately
   - Check the timestamp to confirm

4. **Open Settings** (⚙ icon)
   - Change poll interval (10-300 seconds)
   - Click Save
   - Extension polls at new interval

5. **Log out of claude.ai**
   - Extension shows "Please log in to claude.ai"
   - Click link to log in
   - Extension auto-detects login and fetches usage

### 4. Verify background service worker

1. In `chrome://extensions/` (or `edge://extensions/`):
   - Find "Claude Usage Float"
   - Click **"Inspect views"** link
   - Click **"service worker"**
   - You'll see the service worker console

2. Check the console for logs:
   ```
   [lifecycle] onInstalled: install
   [alarm] Setting up poll alarm every 0.5 minutes
   [poll] Starting poll cycle
   [poll] Success, state updated
   ```

3. Verify storage:
   ```javascript
   // In service worker console, run:
   chrome.storage.local.get(null, console.log);
   chrome.storage.session.get(null, console.log);
   ```

## Troubleshooting

### Extension not updating usage
- **Check if logged in**: Extension shows "Not logged in" if sessionKey cookie is missing
- **Check console**: Open service worker console (see above) and look for errors
- **Verify network**: Check if fetch to `https://claude.ai/api/organizations` works
- **Clear cache**: Click extension icon, open DevTools, clear storage

### Popup is blank
- Open Chrome DevTools for popup (right-click popup → Inspect)
- Check Console tab for JavaScript errors
- Common issues:
  - React not loaded: Check `dist/popup/index.js` exists
  - Styles not loaded: Check `dist/popup/index.css` exists
  - Message from service worker not received: Check service worker is running

### Extension won't load
- Verify `dist/` folder exists with correct file structure
- Check manifest.json:
  ```bash
  cat manifest.json
  # Should show manifest version 3, permissions, background.service_worker path
  ```
- Reload extension: Click the reload button on the extension card

## Development

### Watch mode (rebuilds on file changes)

In two separate terminal windows:

```bash
# Terminal 1: Watch service worker
npm run dev:sw

# Terminal 2: Watch popup
npm run dev:popup
```

Then reload the extension in `chrome://extensions/` after changes.

### Test specific flows

**Test Auth Flow:**
```javascript
// In service worker console:
chrome.cookies.get({ url: "https://claude.ai", name: "sessionKey" }, console.log);
```

**Test Message Flow:**
```javascript
// In popup console:
chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
  console.log("State:", response.state);
});
```

**Manual Poll:**
```javascript
// In service worker console:
chrome.alarms.get("poll", console.log);  // Check alarm is set
chrome.runtime.sendMessage({ type: "FORCE_REFRESH" }, console.log);  // Force poll
```

## File Changes Checklist

When making changes, ensure:

- [ ] TypeScript compiles: `npm run lint`
- [ ] No unused variables or imports
- [ ] All imports have correct path aliases (@shared, @background, @popup)
- [ ] Service worker exports no named exports (only side effects)
- [ ] Popup imports are from React, @shared/types, @shared/messages

## Common Changes

### Change poll interval default
Edit `src/shared/types.ts`:
```typescript
export const defaultSettings: ClaudeUsageSettings = {
  pollIntervalSec: 60,  // was 30
  ...
};
```

### Change colors/styling
Edit `src/popup/styles.css` - all CSS is here.

### Add new message type
1. Add to `src/shared/messages.ts`: PopupMessage union
2. Add handler in `src/background/serviceWorker.ts`: chrome.runtime.onMessage
3. Add caller in `src/popup/PopupApp.tsx`: chrome.runtime.sendMessage

### Change UI layout
Edit `src/popup/PopupApp.tsx` - MainView and SettingsView components.

## Next Steps

- [ ] Create proper icons (16x16, 48x48, 128x128 PNG) in `public/icons/`
- [ ] Test on Edge browser
- [ ] Test with multiple Claude organizations
- [ ] Add keyboard shortcut via manifest `commands`
- [ ] Add notification when rate limit is reached
- [ ] Package for Chrome Web Store (requires privacy policy, etc.)
