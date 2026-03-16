# Privacy Policy

## Claude Usage Float Extension

### Data Collection

This extension **does NOT collect or transmit any personal data**.

### How It Works

1. **Authentication**: The extension reads your `sessionKey` cookie from Claude.ai (stored in your browser by Claude.ai)
2. **API Calls**: Uses your sessionKey to call Claude's public `/api/organizations` and `/api/organizations/{id}/usage` endpoints
3. **Storage**: Caches your organization ID and usage data locally in your browser using `chrome.storage.local` and `chrome.storage.session`

### Data Storage

- **sessionKey**: Cached locally in `chrome.storage.session` for 5 minutes (auto-expires)
- **Usage Data**: Cached in `chrome.storage.local` and updated on polling interval
- **Settings**: Poll interval stored in `chrome.storage.local`

### Data Transmission

- ✅ Calls made TO: `https://claude.ai/api/organizations*` (Claude's official API)
- ❌ No data sent to third-party services
- ❌ No analytics or tracking
- ❌ No telemetry

### Permissions Used

- `alarms`: For polling interval timer
- `storage`: For caching data locally
- `cookies`: To read your sessionKey from claude.ai
- `host_permissions:https://claude.ai/*`: To call Claude's API

### What We Cannot Access

- ❌ Your password (Claude stores sessionKey in cookies, extension only reads it)
- ❌ Conversation history
- ❌ Personal information beyond usage statistics
- ❌ Other websites or extensions

### Data Retention

All data is stored **only in your browser** and cleared when:
- Browser cache is cleared
- Extension is uninstalled
- You log out of claude.ai (sessionKey expires)

### Changes to This Policy

This extension is open source. Any changes to data handling will be reflected in the code.

---

**Last Updated**: 2026-03-17

For questions, contact: hide10@gmail.com
