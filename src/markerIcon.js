import L from "leaflet";

// 働き方カテゴリ → ピンの色
const CATEGORY_COLORS = {
  出社: "#2563eb",       // blue-600
  ハイブリッド: "#ea580c", // orange-600
  在宅: "#16a34a",       // green-600
};

const FALLBACK_COLOR = "#64748b"; // slate-500

/**
 * カテゴリに応じた色付きピンの divIcon を生成する。
 * 涙滴形（rotate -45deg）+ 中央の白丸 + 影で立体感。
 */
export const createMarkerIcon = (category) => {
  const color = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
  return L.divIcon({
    className: "marker-pin",
    html: `
      <div class="marker-pin__shape" style="background:${color}">
        <div class="marker-pin__dot"></div>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
};
