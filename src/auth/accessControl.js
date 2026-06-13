// 認証されたユーザーがアプリを使えるかどうかを判定する。
//
// 現状: メールアドレス allowlist（個人 Gmail で検証中）
// 将来: 会社の Google Workspace ドメインが決まったら ALLOWED_DOMAINS に追加。
//       allowlist と OR 判定なので、移行期間は両方有効でよい。
//
// ⚠ これはクライアントサイドの初段ガードに過ぎない。Firestore 等の書き込み
//    リソースを足したら、サーバ側のセキュリティルールでも同様に絞ること。

const ALLOWED_EMAILS = [
  "k.kakinuma0001@gmail.com",
];

const ALLOWED_DOMAINS = [
  // "company.co.jp",  // 例: G Workspace ドメインを使うときに追加
];

export const isAllowedUser = (user) => {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  if (ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(email)) return true;
  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
};
