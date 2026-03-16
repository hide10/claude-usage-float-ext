# Release Checklist v1.0.0

✅ **完了した項目**
- [x] コード実装完成
- [x] デバッグログ削除
- [x] アイコン作成（16/48/128 PNG）
- [x] Privacy Policy 作成
- [x] ストア説明文作成
- [x] Version 1.0.0 設定
- [x] ビルド確認
- [x] dist フォルダ最適化

---

## 📋 Chrome Web Store リリース手順

### 1. Developer Account 登録
- [ ] Google アカウント開く
- [ ] [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) にアクセス
- [ ] 支払い方法登録（$5）
- [ ] Developer Profile 設定

### 2. 拡張機能アップロード

**準備物:**
- dist フォルダ（すべてのファイル）
- STORE_DESCRIPTION.md の内容
- Privacy Policy URL: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`

**手順:**
1. Dashboard で「新しいアイテム」をクリック
2. dist フォルダを ZIP 化（またはそのままアップロード）
3. 以下を入力:
   - **Name**: Claude Usage Float
   - **Description**: (STORE_DESCRIPTION.md の "Short Description" をコピー)
   - **Category**: Productivity
   - **Language**: 日本語（後で英語版も追加可能）

4. 画像をアップロード:
   - Icon (128x128)
   - Screenshot (1 or more) - ウィンドウのスクリーンショット

5. 追加情報:
   - **Support email**: `hide10@gmail.com`
   - **Privacy policy**: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`
   - **Permissions justification**: 下記参照

### 3. Permissions Justification
以下をテキストフィールドに入力:
```
- alarms: Used to schedule periodic API polling
- storage: Used to cache usage data and settings locally
- cookies: Used to read your sessionKey from claude.ai
- host_permissions: Used to call Claude's official API
```

### 4. 提出 & 審査
- [ ] すべての情報を確認
- [ ] Submit
- [ ] メール確認
- [ ] 審査待機（1-3 日）

---

## 📋 Edge Add-ons リリース手順

### 1. Developer Account 登録
- [ ] Microsoft アカウント開く
- [ ] [Edge Add-ons Developer Portal](https://partner.microsoft.com/en-us/dashboard/microsoftedge) にアクセス
- [ ] Developer Profile 設定

### 2. 拡張機能アップロード

**手順:**
1. "新しい拡張機能" をクリック
2. dist フォルダを ZIP 化してアップロード
3. 以下を入力:
   - **Name**: Claude Usage Float
   - **説明**: (STORE_DESCRIPTION.md の Short Description)
   - **カテゴリ**: Developer Tools / Productivity
   - **言語**: 日本語

4. スクリーンショット & ロゴ:
   - Extension logo (44x44 minimum)
   - Screenshots (1 or more)

5. **プライバシー情報**:
   - Privacy policy URL: `https://hide10.github.io/claude-usage-float-ext/privacy-policy.html`
   - Permissions 説明: Chrome Web Store と同じ

### 3. 提出 & 審査
- [ ] 情報確認
- [ ] Submit
- [ ] 審査待機（24 時間 - 数日）

---

## 🎯 テスト確認

リリース前に以下をテスト:

```bash
# 最新ビルド確認
npm run build

# dist フォルダが以下を含むことを確認
ls -R dist/
# background/serviceWorker.js
# manifest.json
# icons/icon*.png
# popup/index.html, index.js, index.css
```

---

## 📸 スクリーンショット撮影（推奨）

Chrome でインストール後:
1. 拡張機能アイコンをクリックしてメイン画面を表示
2. 使用量バーが見えている状態でスクリーンショット撮影（1280x800 推奨）
3. 設定画面を開いてスクリーンショット撮影
4. 必要なら未ログイン状態やエラー表示も追加で撮影

---

## 🔗 リソース

- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)
- [Edge Add-ons Publishing](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)

---

## ⚠️ 注意事項

1. **プライバシー**: プライバシーポリシーは必須
2. **Permissions**: 必要最小限の権限のみ使用していることを説明
3. **Terminology**: "extension" vs "add-on" - 各ストアで用語が異なる
4. **リジェクト対応**: 却下されても再提出可能（フィードバック確認して修正）

---

**更新日**: 2026-03-17
**版**: 1.0.0
