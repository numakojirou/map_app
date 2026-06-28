# map-app

社内メンバーの現場配置を地図で共有する内部向け Web アプリ。
「誰が、今、どの現場にいるか」を地図上のマーカーで可視化する。

公開 URL: https://shared-map-app-21793.web.app/

## 何ができるか

### 認証・権限
- Google サインインによる認証（`accessControl.js` の allowlist に登録されたメアドのみ）
- **管理者（admin）** と **一般ユーザー（member）** の 2 ロール
  - 一般ユーザーは **自分のレコードのみ** 編集可（`email` が自分のメアドと一致するもの）
  - 管理者は **全員のレコード編集 + 削除 + 追加 + 一括登録 + 一覧出力**
- クライアント側の判定とサーバ側（`firestore.rules`）の両方で同等のガード

### 地図 UI
- 関東一円を中心に地図を表示（OpenStreetMap タイル）
- 起動時に **全マーカーが収まる範囲に自動 fit bounds**
- メンバー単位の **色付きマーカー**（出社=青 / ハイブリッド=橙 / 在宅=緑）
- 右上に **凡例**
- マーカークリック → **名前 / 現場名 / 最終更新時刻** をポップアップ表示
- ポップアップから **編集 / 削除**（権限ある人のみ）
- マーカーを **ドラッグ → 確認ダイアログ → 位置と `updatedAt` を自動更新**
- 管理者は **「+ メンバー追加」** で地図クリック → 新規追加

### サイドバー（PC は常時表示、モバイルは drawer 化）
- メンバー一覧
- 名前 / 現場での **部分一致検索**
- カテゴリ（出社・ハイブリッド・在宅）の **チップ絞り込み**
- 行クリックで地図がそのマーカーへ flyTo + popup 自動オープン

### 管理者パネル（admin のみ）
- **一覧エクスポート**: CSV / JSON ダウンロード（CSV は Excel 文字化け対策の BOM 付き）
- **一括登録**: textarea 貼り付け or ファイル選択 → プレビュー → 投入
  - CSV / JSON 自動判定
  - `lat,lng` または `address` のどちらかで位置指定可
  - **住所のみの場合は Nominatim でジオコーディング**（1.1 秒/件）
  - エラー行は投入前にプレビューで分かる

### データ
- **Cloud Firestore** にリアルタイム同期。他メンバーの編集が即座に反映される
- リージョン: `asia-northeast1`（東京）、コレクション: `members`

## 技術スタック

- React 19 (Create React App 5.0.1)
- react-leaflet 5 + Leaflet 1.9（地図）
- Firebase Authentication（Google サインイン）
- Cloud Firestore（永続化 / リアルタイム同期）
- Firebase Hosting（配信）

詳細は `docs/architecture.md` を参照。

## ディレクトリ構成（要点）

```
map-app/
├── public/                   ← 静的ファイル（index.html, favicon 等）
├── src/
│   ├── index.js              ← React エントリ
│   ├── App.js                ← AuthProvider > Gate > MapView の本体
│   ├── Header.{jsx,css}      ← トップヘッダー
│   ├── MemberList.{jsx,css}  ← 左サイドバー
│   ├── Legend.{jsx,css}      ← 凡例
│   ├── Toast.{jsx,css}       ← 通知
│   ├── markerIcon.js         ← カテゴリ別 L.divIcon
│   ├── categoryColors.js     ← 色の共通定義
│   ├── formatTime.js         ← 時刻整形ユーティリティ
│   ├── auth/                 ← 認証関連（LoginPage / accessControl / AuthProvider 等）
│   ├── data/                 ← Firestore データ層 / フォーム / Seed / SeedPanel
│   └── admin/                ← 管理者パネル / エクスポート / 一括登録 / ジオコーディング
├── firebase.json             ← Hosting + Firestore ルール設定
├── firestore.rules           ← Firestore セキュリティルール（allowlist + 所有者制御）
├── .firebaserc               ← デプロイ先プロジェクト固定（shared-map-app-21793）
└── docs/                     ← 仕様・設計ドキュメント
```

## ドキュメント

- [docs/overview.md](docs/overview.md) — 用途・想定ユーザー・ユースケース
- [docs/architecture.md](docs/architecture.md) — 技術構成とデータフロー
- [docs/data-model.md](docs/data-model.md) — Firestore `members` のスキーマ
- [docs/deployment.md](docs/deployment.md) — Firebase へのデプロイ手順
- [docs/roadmap.md](docs/roadmap.md) — 完了 Phase と残タスク（最新）

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
# 本番ビルド
npm run build

# アプリ本体（Hosting）
firebase deploy --only hosting

# Firestore セキュリティルールだけ反映したいとき
firebase deploy --only firestore:rules

# まとめて
firebase deploy
```

詳細は [docs/deployment.md](docs/deployment.md) を参照。

## ユーザーの追加（参考）

新しい人を allowlist に入れたい場合、コードを 2 箇所修正してデプロイ：

1. `src/auth/accessControl.js` の `ALLOWED_EMAILS` に追加
2. `firestore.rules` の `isAllowed()` 内のメアド一覧に追加
3. `firebase deploy`（両方反映）

ドメイン縛り（例: `@company.co.jp`）に変えるなら、`ALLOWED_DOMAINS` と `firestore.rules` の `isAllowed()` をドメイン判定に書き換える。

管理者を追加したい場合は同じ要領で `ALLOWED_ADMINS` と `firestore.rules` の `isAdmin()` を更新。

## ライセンス

社内利用想定の private プロジェクト。
