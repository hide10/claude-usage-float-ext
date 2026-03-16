# Claude Usage Float Extension - Progress

## ✅ Completed

### Phase 1: Core Implementation (完了)
- [x] MV3 manifest.json 設定
- [x] Service Worker アーキテクチャ実装
- [x] 自動認証（sessionKey + organization 自動取得）
- [x] ポーリングシステム（chrome.alarms）
- [x] React popup UI（メイン・設定ビュー）
- [x] ポート通信（popup ↔ service worker）
- [x] 使用量データ取得・解析
- [x] 状態管理（chrome.storage）

### Phase 2: UI/UX 改善 (完了)
- [x] レスポンシブズーム（S/M/L 3段階）
- [x] 浮遊ウィンドウ機能
- [x] ウィンドウサイズ管理
- [x] エラーハンドリング
- [x] デバッグログ削除

### Phase 3: Code Cleanup (完了)
- [x] console.log 削除（本番対応）
- [x] エラーハンドラー簡素化
- [x] 不要なコード削除

---

## 📋 TODO: リリース準備

### 必須タスク
1. **アイコン作成** (優先度: ⭐⭐⭐)
   - [ ] 16x16 PNG
   - [ ] 48x48 PNG
   - [ ] 128x128 PNG
   - ファイル場所: `public/icons/`

2. **プライバシーポリシー追加** (優先度: ⭐⭐⭐)
   - [ ] manifest.json に追加またはドキュメント作成
   - 内容:
     ```
     This extension collects sessionKey from browser cookies to authenticate with Claude API.
     No data is transmitted to third parties. All data is cached locally in browser storage.
     ```

3. **ストア用メタデータ** (優先度: ⭐⭐)
   - [ ] 説明文（日本語 + 英語）
   - [ ] スクリーンショット（3-5枚）
     - メイン画面
     - 複数ウィンドウサイズ
     - 設定画面
   - [ ] カテゴリ: 生産性ツール

4. **バージョン・情報更新** (優先度: ⭐)
   - [ ] manifest.json: version を 0.1.0 → 1.0.0
   - [ ] README に「リリース済み」マーク

### リリース手順
1. ビルド確認
   ```bash
   npm run build
   node build-fix.js
   ```

2. **Chrome Web Store**
   - Google アカウント登録（$5）
   - zip アップロード: `dist/` → manifest.json, serviceWorker.js, popup/*, icons
   - ストア情報入力
   - 審査待機（1-3日）

3. **Edge Add-ons**
   - Microsoft アカウント登録（無料）
   - 同内容でアップロード
   - 審査待機

4. **動作確認**
   - Chrome でインストール → 動作確認
   - Edge でインストール → 動作確認

---

## 🐛 既知の制限

1. **ウィンドウ縦リサイズ**: Chrome のポップアップ仕様。ユーザーが手動でリサイズ可能（設計上無制限）

2. **ズーム 3段階**:
   - S (240px): 0.7x ズーム
   - M (280px): 0.82x ズーム
   - L (340px): 1.0x ズーム

3. **ブラウザ依存**: ブラウザが起動していない場合、拡張機能は動作不可

---

## 📊 リリース後フェーズ（オプション）

- [ ] 使用統計追跡（要ユーザー許可）
- [ ] 歴史グラフ機能
- [ ] 複数 organization サポート
- [ ] ダークモード選択肢
- [ ] キーボードショートカット

---

## 📁 ファイル構成

```
dist/
├── manifest.json           ← リリース時に重要
├── background/serviceWorker.js
└── popup/
    ├── index.html
    ├── index.js
    └── index.css

public/icons/              ← アイコン必須
├── icon16.png
├── icon48.png
└── icon128.png
```

---

## 🔗 参考リンク

- Chrome Web Store: https://chrome.google.com/webstore/detail/
- Edge Add-ons: https://microsoftedge.microsoft.com/addons/

---

**更新日**: 2026-03-17
