# architecture — 技術スタックと構成

## 技術スタック

| レイヤ | 採用技術 | バージョン | 備考 |
|---|---|---|---|
| UI フレームワーク | React | 19.2.0 | CRA 雛形上で動作 |
| ビルド／開発サーバ | react-scripts (Create React App) | 5.0.1 | webpack ベース |
| 地図描画 | react-leaflet | 5.0.0 | React ラッパー |
| 地図ライブラリ | Leaflet | 1.9.4 | 本体 |
| タイル | OpenStreetMap | — | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| ホスティング | Firebase Hosting | — | `build/` を静的配信 |

## ディレクトリ構成

```
map-app/
├── public/
│   ├── index.html, favicon.ico, manifest.json, robots.txt
│   └── markers.json          ← メンバー配置データ。アプリ起動時に fetch される
├── src/
│   ├── index.js              ← エントリ。React ルート + Leaflet CSS 読み込み
│   ├── index.css             ← グローバル CSS（CSS 変数・フォント・基本スタイル）
│   ├── App.js                ← レイアウト本体（Header + Map + Legend）
│   ├── App.css               ← アプリレイアウト・マーカーピン・ポップアップカード
│   ├── Header.jsx            ← トップヘッダー（タイトル + メンバー数）
│   ├── Header.css            ← ヘッダー専用スタイル
│   ├── Legend.jsx            ← 地図右上の凡例（カテゴリ別色）
│   ├── Legend.css            ← 凡例専用スタイル
│   ├── markerIcon.js         ← カテゴリ別 L.divIcon 生成
│   ├── reportWebVitals.js, setupTests.js
├── build/                    ← `npm run build` 出力（gitignore）
├── .firebase/                ← Firebase デプロイキャッシュ（gitignore）
├── firebase.json             ← Hosting 設定
├── .firebaserc               ← デプロイ先プロジェクト固定
├── package.json
└── docs/                     ← 本ドキュメント群
```

## データフロー

```
public/markers.json  ─┐
                      │ fetch("/markers.json")
                      ▼
              App.js (useState: spots)
                      │ spots.map
                      ▼
       <Marker position={[lat, lng]}> + <Popup>{name}/{category}</Popup>
                      │
                      ▼
     <MapContainer> (中心: 東京駅, zoom: 14) + <TileLayer> (OSM)
```

ポイント：
- マーカー情報は **静的 JSON のフェッチ** で読み込んでいる（DB やバックエンド API は使っていない）
- 地図中心は `App.js:28` で東京駅にハードコード
- マーカー画像は Leaflet 同梱のものを `L.Icon.Default.mergeOptions` で再バインド（`App.js:9-13`） — CRA + Leaflet で必要な定型対応

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/index.js` | React 19 の `createRoot` でマウント。Leaflet CSS を import |
| `src/App.js` | `MapContainer` + `TileLayer` + マーカー描画。`markers.json` を fetch |
| `public/markers.json` | 表示する地点の配列 |
| `firebase.json` | Hosting 設定（公開ディレクトリ = `build`、SPA リライトあり） |

## 制約・注意点

- **永続化なし**：マーカー追加には `markers.json` をエディタで編集 → 再デプロイが必要
- **認証なし**：`build/` 以下を見られる人は全員アクセス可能
- **CRA テンプレ残骸**：`App.css`、`logo.svg`、`App.test.js`（`learn react` を探していて現状失敗）は本番に影響しないが整理候補
- **テスト未整備**：`App.test.js` のみで、地図側のテストは無い
