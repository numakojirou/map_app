import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ISO 文字列を「YYYY/MM/DD HH:mm」形式に整形
const formatUpdatedAt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function App() {
  const [members, setMembers] = useState([]);

  // markers.json を読み込む
  useEffect(() => {
    fetch("/markers.json")
      .then((response) => response.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("JSON load error:", err));
  }, []);

  return (
    <MapContainer
      center={[35.681236, 139.767125]}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {members.map((member) => (
        <Marker key={member.id} position={[member.lat, member.lng]}>
          <Popup>
            <strong>{member.name}</strong>
            <br />
            現場: {member.site}
            <br />
            最終更新: {formatUpdatedAt(member.updatedAt)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default App;
