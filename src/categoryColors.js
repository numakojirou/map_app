// 働き方カテゴリと色の対応。マーカー / 凡例 / メンバーリストの 3 箇所で参照。

export const CATEGORY_COLORS = {
  出社: "#2563eb",       // blue-600
  ハイブリッド: "#ea580c", // orange-600
  在宅: "#16a34a",       // green-600
};

export const FALLBACK_COLOR = "#64748b"; // slate-500

export const CATEGORIES = Object.keys(CATEGORY_COLORS);

export const getCategoryColor = (category) =>
  CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
