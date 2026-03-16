# Store Listings

## Chrome Web Store & Edge Add-ons Description

### Short Description (50 chars max)
```
Real-time Claude API usage monitoring
```

### Full Description (4000 chars max)

**Claude Usage Float** is a lightweight browser extension that shows your Claude API usage at a glance.

**Why Use It?**
- Monitor your 5-hour and 7-day API rate limits in real-time
- Know when you're approaching your rate limit before hitting it
- Track usage patterns to optimize your Claude API consumption
- No manual configuration - works automatically

**How It Works**
1. Install the extension
2. Log into claude.ai once (your browser already does this)
3. Click the extension icon to see your live usage

That's it! The extension reads your Claude session from your browser and displays your usage stats.

**Features**
- ✅ Auto-authentication - reads your existing Claude session
- ✅ Real-time data - updates every 30 seconds (customizable)
- ✅ Visual progress bars - see 5-hour and 7-day windows
- ✅ Usage guidance - get feedback on your usage pace
- ✅ Floating window - compact S/M/L sizes
- ✅ Rate limit alerts - badge notification when limit is reached
- ✅ Fully private - no data collection, all cached locally

**Privacy**
This extension only reads data from claude.ai using your existing authentication. It does NOT:
- Collect any personal data
- Send data to third parties
- Track or analyze your usage
- Store anything outside your browser

See [Privacy Policy](PRIVACY.md) for details.

**Feedback & Support**
Report issues or suggest features on GitHub:
https://github.com/your-username/claude-usage-float-ext

---

## Store Metadata

### Category
Productivity

### Tags
- Claude
- API
- Monitoring
- Usage Tracking
- Developer Tools

### Permissions Justification
- `alarms`: Used for polling the API on a schedule
- `storage`: Used to cache usage data locally
- `cookies`: Used to read your sessionKey from claude.ai
- `host_permissions`: Used to call claude.ai API endpoints

### Support Links
- GitHub: https://github.com/your-username/claude-usage-float-ext
- Privacy Policy: PRIVACY.md (included)

---

## Screenshots Needed (in order)
1. Main usage display (L size window)
2. Small window (S size)
3. Settings panel
4. Usage history (future feature concept)
