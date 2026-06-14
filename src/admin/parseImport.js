// CSV / JSON 入力の解析と各行のバリデーション。
//
// 出力形式:
//   { rows: ParsedRow[], format: "csv"|"json", parseError?: string }
// ParsedRow:
//   { raw, normalized: { id, name, site, category, email, address, lat?, lng? },
//     errors: string[], needsGeocode: boolean }

const REQUIRED_FIELDS = ["name", "site", "category"];
const VALID_CATEGORIES = new Set(["出社", "ハイブリッド", "在宅"]);

const stripBOM = (s) => (s.startsWith("﻿") ? s.slice(1) : s);

// --- CSV parsing ---
const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        result.push(current);
        current = "";
        i++;
        continue;
      }
      current += ch;
      i++;
    }
  }
  result.push(current);
  return result;
};

const parseCSV = (text) => {
  const t = stripBOM(text).replace(/\r\n/g, "\n").trim();
  const lines = t.split("\n");
  if (lines.length < 1) throw new Error("CSV が空です");
  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim()) continue;
    const cells = parseCSVLine(line);
    const obj = {};
    for (let ci = 0; ci < headers.length; ci++) {
      obj[headers[ci]] = (cells[ci] ?? "").trim();
    }
    rows.push(obj);
  }
  return rows;
};

// --- JSON parsing ---
const parseJSONInput = (text) => {
  const data = JSON.parse(stripBOM(text));
  if (!Array.isArray(data)) {
    throw new Error("JSON はオブジェクトの配列である必要があります");
  }
  return data.map((item) => {
    if (typeof item !== "object" || !item) return {};
    const result = {};
    for (const k of Object.keys(item)) {
      result[k] = item[k] == null ? "" : item[k];
    }
    return result;
  });
};

const detectFormat = (text) => {
  const t = stripBOM(text).trim();
  if (t.startsWith("[") || t.startsWith("{")) return "json";
  return "csv";
};

// --- per-row validation ---
const toStr = (v) => (v == null ? "" : String(v).trim());

const validateRow = (raw) => {
  const errors = [];
  const normalized = {
    id: toStr(raw.id),
    name: toStr(raw.name),
    site: toStr(raw.site),
    category: toStr(raw.category),
    email: toStr(raw.email),
    address: toStr(raw.address),
  };

  const latRaw = toStr(raw.lat);
  const lngRaw = toStr(raw.lng);
  if (latRaw) {
    const n = Number(latRaw);
    if (Number.isFinite(n) && n >= -90 && n <= 90) {
      normalized.lat = n;
    } else {
      errors.push(`lat の値「${latRaw}」が緯度として不正`);
    }
  }
  if (lngRaw) {
    const n = Number(lngRaw);
    if (Number.isFinite(n) && n >= -180 && n <= 180) {
      normalized.lng = n;
    } else {
      errors.push(`lng の値「${lngRaw}」が経度として不正`);
    }
  }

  for (const f of REQUIRED_FIELDS) {
    if (!normalized[f]) errors.push(`${f} が空`);
  }

  if (normalized.category && !VALID_CATEGORIES.has(normalized.category)) {
    errors.push("category は「出社」「ハイブリッド」「在宅」のいずれか");
  }

  if (normalized.id && !/^m-\d+$/.test(normalized.id)) {
    errors.push(`id「${normalized.id}」が m-XXX 形式ではない`);
  }

  const hasCoords =
    typeof normalized.lat === "number" && typeof normalized.lng === "number";
  const hasAddress = !!normalized.address;
  if (!hasCoords && !hasAddress) {
    errors.push("lat/lng または address のどちらかが必須");
  }

  const needsGeocode = !hasCoords && hasAddress;

  return { raw, normalized, errors, needsGeocode };
};

export const parseInput = (text) => {
  const format = detectFormat(text);
  let raws;
  try {
    raws = format === "json" ? parseJSONInput(text) : parseCSV(text);
  } catch (e) {
    return { rows: [], format, parseError: e.message };
  }
  if (raws.length === 0) {
    return { rows: [], format, parseError: "データ行が 0 件です" };
  }
  const rows = raws.map(validateRow);
  return { rows, format };
};

/**
 * id が空の行に対して、既存メンバー + 既に input 内で使われている id を
 * 避けて m-XXX 形式の連番を採番する。
 * rows を直接書き換える。
 */
export const assignNewIds = (rows, existingMembers) => {
  const used = new Set();
  for (const m of existingMembers) {
    if (m.id) used.add(m.id);
  }
  for (const r of rows) {
    if (r.normalized.id) used.add(r.normalized.id);
  }
  let maxNum = 0;
  for (const id of used) {
    const m = /^m-(\d+)$/.exec(id);
    if (m) maxNum = Math.max(maxNum, Number(m[1]));
  }
  let next = maxNum + 1;
  for (const r of rows) {
    if (!r.normalized.id) {
      r.normalized.id = `m-${String(next++).padStart(3, "0")}`;
    }
  }
};
