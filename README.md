# Claude Usage Float - Chrome/Edge Extension

A browser extension for real-time Claude API usage monitoring on Chrome/Edge with auto-authentication.

## Features

- **Auto-Auth**: Automatically extracts sessionKey and organizationId from browser cookies
- **Real-time Monitoring**: Polls Claude API every 30 seconds (configurable)
- **Usage Visualization**: Beautiful usage bars for 5-hour and 7-day windows
- **Badge Alerts**: Extension badge shows "!" when rate limit is reached
- **Minimal Setup**: No manual configuration needed - just log in to claude.ai

## Installation

### Development Build

```bash
npm install
npm run build
```

### Load in Chrome/Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` directory from this repo

## Architecture

- **Background Service Worker** (`src/background/`)
  - `serviceWorker.ts`: Main event handler, alarms, state management
  - `auth.ts`: Cookie extraction and organization selection
  - `usageFetcher.ts`: Anthropic API integration (ported from Electron version)

- **Popup** (`src/popup/`)
  - React UI with usage visualization
  - Settings panel for poll interval configuration
  - Refresh button for manual polling

- **Shared** (`src/shared/`)
  - Type definitions
  - Message contracts between popup and service worker

## Configuration

Visit the extension popup and click the settings icon to configure:
- **Poll Interval**: How often to check usage (10-300 seconds, default 30)

## Development

```bash
# Watch both service worker and popup
npm run dev:sw &
npm run dev:popup &
```

Then reload the extension in `chrome://extensions/` after changes.

## Error Handling

- **Not Logged In**: Shows prompt to visit claude.ai and log in
- **Network Error**: Displays error message, retries on next poll
- **Invalid Org**: Automatically picks the best organization (claude_pro → chat → first)

## License

MIT
