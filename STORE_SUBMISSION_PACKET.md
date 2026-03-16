# Store Submission Packet

## Release Artifact

- ZIP: `release/claude-usage-float-ext-v1.0.0.zip`
- Unpacked folder: `dist/`
- Version: `1.0.0`
- Recommended repo name: `claude-usage-float-ext`

## Chrome Web Store

### Name
`Claude Usage Float`

### Short Description
Preferred Japanese:
`Claude使用量をリアルタイムで確認`

English fallback:
`Real-time Claude API usage monitoring`

### Single Purpose
`Show Claude usage and rate-limit status in a compact browser popup using the user's existing Claude session.`

### Category
`Productivity`

### Detailed Description
Use the Japanese full description in `STORE_DESCRIPTION.md`.

If the dashboard requires English fallback text, the English section in `STORE_DESCRIPTION.md` can be used.

### Permission Justification
- `alarms`: Used to schedule periodic polling of Claude usage data.
- `storage`: Used to cache usage data and user settings locally in the browser.
- `cookies`: Used to read the `sessionKey` cookie from `claude.ai` so the extension can authenticate the user's existing session.
- `host_permissions (https://claude.ai/*)`: Used to call Claude's official web API endpoints for organizations and usage data.

### Privacy Practices Notes
Use these as the basis for the Privacy practices tab. Verify each answer against the current dashboard wording before you submit.

- Single purpose: usage monitoring for Claude.
- Data is used only for the extension's core user-facing feature.
- Data is not sold.
- Data is not transferred to unrelated third parties.
- Data is only sent to `claude.ai`.
- Data is stored locally in browser storage.
- The extension reads authentication data from the browser cookie jar for `claude.ai`.
- The extension reads usage/account data from Claude endpoints after authentication.

### Required Fields You Must Fill
- Support email: `hide10@gmail.com`
- Public HTTPS privacy policy URL: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`
- Optional support page URL: `https://hide10.github.io/claude-usage-float-ext/`

## Microsoft Edge Add-ons

### Name
`Claude Usage Float`

### Category
`Productivity`

### Description
Use the short or full description from `STORE_DESCRIPTION.md` as needed by the form.

### Properties Notes
- Support contact details: email or support URL
- Website URL: `https://hide10.github.io/claude-usage-float-ext/`
- Privacy policy URL: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`

## Screenshot Set

Required minimum:
- Main usage display
- Settings panel

Optional:
- Not logged in state

## Final Values

- Support email: `hide10@gmail.com`
- Support page: `https://hide10.github.io/claude-usage-float-ext/`
- Privacy policy URL: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`
