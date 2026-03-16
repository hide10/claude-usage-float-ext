# Store Listings

## Chrome Web Store / Edge Add-ons Description

### Short Description (Japanese)
```text
Claude使用量をリアルタイムで確認
```

### Short Description (English)
```text
Real-time Claude API usage monitoring
```

### Full Description (Japanese)

**Claude Usage Float** は、Claude の使用量をすばやく確認できる軽量なブラウザ拡張です。

**できること**
- 5時間ウィンドウと7日ウィンドウの使用状況をリアルタイム表示
- 上限に近づいているかを視覚的に確認
- 一定間隔で自動更新
- 必要なときに手動更新
- 既存の Claude ログイン状態を使って自動認証

**使い方**
1. 拡張機能をインストール
2. ブラウザで claude.ai にログイン
3. 拡張機能アイコンをクリックして使用量を確認

**特徴**
- 自動認証: 既存の Claude セッションを利用
- リアルタイム表示: 30秒ごとに自動更新（変更可）
- 視覚的な使用量バー: 5時間 / 7日ウィンドウを表示
- 利用ペースの目安表示
- コンパクトなポップアップUI
- 上限到達時のバッジ通知
- ローカルキャッシュのみを使用し、外部トラッキングなし

**プライバシー**
この拡張機能は、Claude の公式エンドポイントから使用量データを取得して表示するだけです。
個人情報を第三者に送信したり、広告・解析目的で利用したりすることはありません。

詳細は公開中の Privacy Policy URL を参照してください。

**サポート**
- Support email: hide10@gmail.com
- Support page: https://hide10.github.io/claude-usage-float-ext/

### Full Description (English)

**Claude Usage Float** is a lightweight browser extension for checking Claude usage at a glance.

**What it does**
- Shows real-time 5-hour and 7-day usage windows
- Helps you see when you are approaching a limit
- Refreshes automatically on a configurable interval
- Supports manual refresh
- Uses your existing Claude session for authentication

**How to use**
1. Install the extension
2. Log in to claude.ai in your browser
3. Click the extension icon to view usage

**Privacy**
This extension reads usage data from Claude's official endpoints and displays it locally. It does not send your data to unrelated third parties and does not include analytics or tracking.

**Support**
- Support email: hide10@gmail.com
- Support page: https://hide10.github.io/claude-usage-float-ext/

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
- Privacy Policy URL: https://hide10.github.io/claude-usage-float-ext/privacy-policy.html
- Support contact: hide10@gmail.com
- Website URL: https://hide10.github.io/claude-usage-float-ext/

---

## Screenshots Needed
1. Main usage display
2. Settings panel
3. Optional: not-logged-in state
