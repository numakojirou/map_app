# deployment — Firebase Hosting へのデプロイ手順

## 構成

`firebase.json` で **`build/` ディレクトリを公開ディレクトリ**として設定済み。SPA 用に全リクエストを `/index.html` に rewrite するルールが入っている。

```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## 前提

- Firebase CLI がインストール済み（`npm install -g firebase-tools`）
- `firebase login` 済み
- 対象 Firebase プロジェクトに対する権限あり

> 実際の Firebase プロジェクト ID／プロジェクト名はこのリポジトリ内には保存されていない（`.firebaserc` が無い）。初回は `firebase use --add` で紐付ける必要があるはず。

## デプロイ手順

```bash
# 1. 本番ビルド（build/ が更新される）
npm run build

# 2. Firebase Hosting にデプロイ
firebase deploy --only hosting
```

`build/` は `.gitignore` 対象なのでリポジトリには含めない（ローカルで作って投げる）。

## ローカル動作確認

```bash
npm start
# → http://localhost:3000
```

ビルド後の状態を確認したいときは：

```bash
npm run build
firebase emulators:start --only hosting
# → http://localhost:5000 などで確認（ポートは CLI の表示に従う）
```

## デプロイ済み資産

- `.firebase/hosting.YnVpbGQ.cache` … Firebase CLI が作るデプロイキャッシュ。差分検出用なので消しても問題ないが、消すと次回フルアップロードになる
- `build/` … 直近の `npm run build` 結果。ローカル再現用に残しておいても支障なし

## 注意点

- 認証ゲートを設けていないため、**Hosting URL を知っている人は誰でも見られる**。社内利用前提なら現状でも実用できるが、外部に URL が漏れると配置情報が公開状態になる点に留意
- `public/markers.json` は静的アセットなので、デプロイ後の差し替えにも再ビルド + 再デプロイが必要
