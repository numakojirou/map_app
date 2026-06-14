import L from "leaflet";
import { getCategoryColor } from "./categoryColors";

/**
 * カテゴリに応じた色付きピンの divIcon を生成する。
 * 涙滴形（rotate -45deg）+ 中央の白丸 + 影で立体感。
 */
export const createMarkerIcon = (category) => {
  const color = getCategoryColor(category);
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
