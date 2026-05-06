# map-app

社内メンバーの現場配置を地図で共有する内部向け Web アプリ。
「誰が、今、どの現場にいるか」を地図上のマーカーで可視化する。

公開 URL: https://shared-map-app-21793.web.app/

## 何ができるか（現状）

- 関東一円を中心に地図を表示（OpenStreetMap タイル）
- メンバー単位のマーカーを描画
- マーカーをクリックすると **メンバー名 / 現場名 / 最終更新時刻** をポップアップ表示
- 配置の更新は `public/markers.json` を直接編集 → 再デプロイで反映（日次運用ではなく、現場移動契機で更新する想定）

## 技術スタック

- React 19 (Create React App 5.0.1)
- react-leaflet 5 + Leaflet 1.9（地図）
- Firebase Hosting（配信）

詳細は `docs/architecture.md` を参照。

## ディレクトリ構成（要点）

```
map-app/
├── public/markers.json   ← メンバー配置データ（編集対象）
├── src/
│   ├── index.js          ← React エントリ
│   └── App.js            ← 地図コンポーネント
├── firebase.json         ← Firebase Hosting 設定
├── .firebaserc           ← デプロイ先プロジェクト固定（shared-map-app-21793）
└── docs/                 ← 仕様・設計ドキュメント
```

## ドキュメント

- [docs/overview.md](docs/overview.md) — 用途・想定ユーザー・ユースケース
- [docs/architecture.md](docs/architecture.md) — 技術構成とデータフロー
- [docs/data-model.md](docs/data-model.md) — `markers.json` のスキーマ
- [docs/deployment.md](docs/deployment.md) — Firebase Hosting デプロイ手順
- [docs/roadmap.md](docs/roadmap.md) — 現状制約と今後の拡張計画

## 開発

```bash
# 依存インストール（初回のみ）
npm install

# 開発サーバ
npm start
# → http://localhost:3000
```

## デプロイ

```bash
npm run build
firebase deploy --only hosting
```

詳細・注意点は [docs/deployment.md](docs/deployment.md) を参照。

## ライセンス

社内利用想定の private プロジェクト。
