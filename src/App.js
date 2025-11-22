import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet のデフォルトアイコンが出ない問題対策
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const center = [35.681236, 139.767125]; // 東京駅あたり

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>共有マップ（試作）</h1>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>ここが中心（東京駅）です。</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;

