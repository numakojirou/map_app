// 管理者向け: members を CSV / JSON でダウンロードするユーティリティ。

const FIELDS = [
  "id",
  "name",
  "email",
  "site",
  "lat",
  "lng",
  "address",
  "category",
  "updatedAt",
];

// updatedAt は ISO 文字列 / Firestore Timestamp / Date を ISO 文字列に統一
const isoUpdatedAt = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const escapeCSV = (value) => {
  if (value == null || value === "") return "";
  const str = typeof value === "string" ? value : String(value);
  // カンマ / 引用符 / 改行を含むときは "..." で囲み、内部の " は "" にエスケープ
  if (/[,"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const toCSV = (members) => {
  const header = FIELDS.join(",");
  const rows = members.map((m) =>
    FIELDS.map((f) => {
      const v = f === "updatedAt" ? isoUpdatedAt(m[f]) : m[f];
      return escapeCSV(v);
    }).join(",")
  );
  // Excel で開いたとき日本語が文字化けしないよう先頭に BOM を入れる
  return "﻿" + [header, ...rows].join("\r\n");
};

export const toJSON = (members) => {
  const serializable = members.map((m) => {
    const out = {};
    for (const f of FIELDS) {
      const v = f === "updatedAt" ? isoUpdatedAt(m[f]) : m[f];
      if (v !== undefined && v !== "") out[f] = v;
    }
    return out;
  });
  return JSON.stringify(serializable, null, 2);
};

const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const pad = (n) => String(n).padStart(2, "0");

const dateStamp = (d = new Date()) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}`;

export const exportCSV = (members) => {
  downloadBlob(
    toCSV(members),
    `members-${dateStamp()}.csv`,
    "text/csv"
  );
};

export const exportJSON = (members) => {
  downloadBlob(
    toJSON(members),
    `members-${dateStamp()}.json`,
    "application/json"
  );
};
