// 住所 → 緯度経度の解決。Nominatim (OpenStreetMap) を使用。
//
// 利用ポリシー: https://operations.osmfoundation.org/policies/nominatim/
//   - 1 リクエスト / 秒の上限を順守
//   - 大量バルク処理は別途公開している処理向けサービスを使う
//   - User-Agent / Referer で正体を明らかにする（ブラウザは User-Agent
//     ヘッダを fetch から設定できないので、ブラウザ既定の UA に依存）

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const MIN_INTERVAL_MS = 1100; // 安全側に 1.1 秒

let lastRequestTime = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 1 件分の住所をジオコーディング。レート制限のため呼び出し側で逐次 await すること。
 * 成功時: { lat, lng }
 * 失敗時: throw Error
 */
export const geocodeAddress = async (address) => {
  const q = (address ?? "").trim();
  if (!q) throw new Error("address が空");

  // 前回呼び出しから 1.1 秒空ける
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestTime));
  if (wait > 0) await sleep(wait);
  lastRequestTime = Date.now();

  const url =
    `${NOMINATIM_URL}?q=${encodeURIComponent(q)}` +
    `&format=json&limit=1&accept-language=ja`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Nominatim HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("住所が見つかりませんでした");
  }
  const first = data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("座標の解析に失敗");
  }
  return { lat, lng };
};
