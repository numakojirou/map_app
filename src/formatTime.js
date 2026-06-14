// updatedAt 用の時刻整形ユーティリティ。
// 受け入れる入力: ISO 文字列 / Firestore Timestamp / Date

export const toDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

const pad = (n) => String(n).padStart(2, "0");

// "2026/04/15 09:00" 形式
export const formatAbsolute = (value) => {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// "今" / "3分前" / "5日前" / "2026/04/15" 形式
export const formatRelative = (value, now = Date.now()) => {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return "";
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return "今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / (86400 * 7))}週前`;
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};
