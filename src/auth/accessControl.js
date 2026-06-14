// 認証されたユーザーがアプリを使えるかどうかを判定する。
//
// 現状: メールアドレス allowlist（個人 Gmail で検証中）
// 将来: 会社の Google Workspace ドメインが決まったら ALLOWED_DOMAINS に追加。
//
// ⚠ これはクライアントサイドの初段ガード。Firestore のセキュリティルールも
//   同じ判定を持つ（firestore.rules）。両方を必ず揃えて変更すること。

const ALLOWED_EMAILS = [
  "k.kakinuma0001@gmail.com",
];

const ALLOWED_DOMAINS = [
  // "company.co.jp",  // 例: G Workspace ドメインを使うときに追加
];

// 管理者（admin）。全員のレコードを編集・削除、一括登録、エクスポートが可能。
// allowlist のサブセットになるべき（admin は必ず allowlist にも含める）。
const ALLOWED_ADMINS = [
  "k.kakinuma0001@gmail.com",
];

const normalize = (email) => (email ?? "").trim().toLowerCase();

export const isAllowedUser = (user) => {
  if (!user?.email) return false;
  const email = normalize(user.email);
  if (ALLOWED_EMAILS.map(normalize).includes(email)) return true;
  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
};

export const isAdmin = (user) => {
  if (!user?.email) return false;
  return ALLOWED_ADMINS.map(normalize).includes(normalize(user.email));
};

/**
 * このユーザーが対象 member を編集してよいか。
 * - admin: 全員編集可
 * - 通常: 自分の email と一致する member のみ編集可
 */
export const canEditMember = (user, member) => {
  if (!user?.email) return false;
  if (isAdmin(user)) return true;
  if (!member?.email) return false;
  return normalize(user.email) === normalize(member.email);
};
