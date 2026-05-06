# data-model — マーカーデータの形式と運用

## ファイル位置

`public/markers.json`

CRA は `public/` 配下を静的配信するため、ブラウザからは `GET /markers.json` でそのまま取得できる。`App.js` の `useEffect` 内 `fetch("/markers.json")` がここを叩いている。

## スキーマ

JSON 配列。各要素は次のフィールドを持つ：

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | ✅ | ポップアップ見出し（例: `"東京駅"`） |
| `lat` | number | ✅ | 緯度（例: `35.681236`） |
| `lng` | number | ✅ | 経度（例: `139.767125`） |
| `category` | string | ✅ | 種別ラベル。現状は `"station"` / `"smoking"` などの自由文字列 |

### サンプル（現状の中身そのまま）

```json
[
  { "name": "東京駅",       "lat": 35.681236, "lng": 139.767125, "category": "station" },
  { "name": "有楽町駅",     "lat": 35.675069, "lng": 139.763328, "category": "station" },
  { "name": "銀座の喫煙所", "lat": 35.6719,   "lng": 139.7653,   "category": "smoking" }
]
```

## 表示への反映

`App.js:36-44` で配列を回し、各要素を 1 つの `<Marker>` として描画。`<Popup>` には `name` と `category` を表示する。

```
<strong>{name}</strong>
カテゴリ: {category}
```

## 運用フロー（現状）

1. `public/markers.json` を直接編集
2. `npm start` で目視確認
3. `npm run build` → `firebase deploy --only hosting`

→ 編集 UI が無いため、**現場配置の更新はファイル編集 + 再デプロイが必要**。これは本来の用途（社内メンバーの配置共有）にとっては運用負荷が高く、`roadmap.md` の主要な改善対象。

## 用途に合わせた今後のスキーマ案

「メンバーの現場配置共有」を本格化する場合、以下のような拡張が想定される（あくまで案）：

```jsonc
{
  "id": "member-001",
  "name": "山田 太郎",          // メンバー名
  "site": "新宿現場 A",         // 配置先の現場名
  "lat": 35.690921,
  "lng": 139.700258,
  "category": "field",          // field / office / off など
  "updatedAt": "2026-05-06T08:00:00+09:00"
}
```

- `id` を持たせると React の `key` を index ではなく安定 ID にできる
- `site` と `name` を分けるとポップアップで「誰が／どこに」を別行で出せる
- `updatedAt` があると古い情報の判別ができる

実装する場合は `App.js` 側のレンダリングと、永続化先（後述の Firestore など）の両方を合わせて変更する必要がある。
