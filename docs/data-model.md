# data-model — メンバーデータの形式と運用

## データの場所

**Cloud Firestore**（プロジェクト `shared-map-app-21793`、データベース `(default)`、リージョン `asia-northeast1`）

```
firestore: shared-map-app-21793 / (default)
└── members/
    ├── m-001 { name: "山田 太郎", site: ..., lat, lng, category, updatedAt }
    ├── m-002 ...
    └── m-006 ...
```

`src/data/membersRepo.js` がアプリ側のデータ層。`subscribeMembers` で
`onSnapshot` を張り、リアルタイムに更新が反映される。

## スキーマ

各ドキュメントのフィールド：

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | ✅ | メンバー名（例: `"山田 太郎"`） |
| `site` | string | ✅ | 配置先の現場・拠点名（例: `"新宿支店"`） |
| `lat` | number | ✅ | マーカーを立てる緯度 |
| `lng` | number | ✅ | マーカーを立てる経度 |
| `category` | string | ✅ | 働き方区分。`"出社"` / `"在宅"` / `"ハイブリッド"` のいずれか |
| `updatedAt` | string \| Firestore Timestamp | ✅ | 最終更新日時 |

> **ドキュメント ID** は `m-001` / `m-002` の形式。Firestore の auto-ID では
> なく明示的に与えている（人間が読みやすい・既存データと整合）。

### `updatedAt` の型に関する注意

- **シード投入時**: `seedMembers.json` の ISO 文字列がそのまま入る（例: `"2026-04-15T09:00"`）
- **アプリから新規 / 編集時**: `serverTimestamp()` を経由するため Firestore の
  Timestamp 型になる
- **表示時**: `App.js` の `formatUpdatedAt` が ISO 文字列 / Timestamp / Date の
  いずれにも対応し、`YYYY/MM/DD HH:mm` に整形する

将来的にすべて Timestamp に揃えるなら、シード時に `Timestamp.fromDate(new Date(iso))` で変換する。

## サンプル

```jsonc
// Firestore のドキュメント例（Console 画面で見える形）
{
  "name": "山田 太郎",
  "site": "本社オフィス",
  "lat": 35.681236,
  "lng": 139.767125,
  "category": "出社",
  "updatedAt": "2026-04-15T09:00"
}
```

## 表示への反映

`App.js` の `MapView` で `subscribeMembers` を購読し、配列を `<Marker>` に展開。
`<Popup>` の構成は：

```
<strong>{name}</strong>
現場: {site}
最終更新: 2026/04/15 09:00   ← formatUpdatedAt で整形
```

`category` は **アイコン色とポップアップ色分け** に使う（テキストとしては
ポップアップに出さない）。

## 運用フロー

1. アプリにログインしてメンバーを編集（Phase 3-A 完了後）
2. 編集はリアルタイムに全員へ反映される（Firestore `onSnapshot` の特性）
3. 「メンバー数」「マーカー位置」「最終更新時刻」が即座に更新される

> 日次運用ではなく、**メンバーの現場移動契機で編集される**運用を想定。
> `updatedAt` は数日〜数週間前の値が入っているのが普通。

## セキュリティルール

`firestore.rules` でサーバ側にも allowlist 判定を持つ（defense-in-depth）：

```javascript
function isAllowed() {
  return request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.token.email in ["k.kakinuma0001@gmail.com"];
}

match /members/{memberId} {
  allow read, write: if isAllowed();
}
```

クライアント側の `src/auth/accessControl.js` と二重で守る構成。将来ドメイン縛り
に切り替えるときは **両方**を修正する必要がある。

## 初期データ投入（seed）

Firestore が空のとき `SeedPanel` が地図中央に表示される。「サンプルデータを
投入」ボタンを押すと `src/data/seedMembers.json` の 6 件が `writeBatch` で
一括投入される。

> ⚠️ Phase 3-A で編集 UI が入ったあとは、誤投入リスクの観点で SeedPanel に
> ガード（dev 専用 or 確認ダイアログ）を入れる予定。

## 今後のスキーマ拡張候補

- `role` … 役職（部長・課長など）。一覧表示や絞り込みに使う
- `phone` / `slack` … 連絡先。ポップアップから即連絡できるように
- `avatar` … 画像 URL。ポップアップに顔写真を出す
- `notes` … 自由記入欄（特記事項）
- `historicLocations` … 履歴（過去どこに居たか）
