import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header";
import Legend from "./Legend";
import { createMarkerIcon } from "./markerIcon";
import "./App.css";

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
    <div className="app">
      <Header memberCount={members.length} />
      <main className="app__map">
        <MapContainer
          center={[35.681236, 139.767125]}
          zoom={10}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {members.map((member) => (
            <Marker
              key={member.id}
              position={[member.lat, member.lng]}
              icon={createMarkerIcon(member.category)}
            >
              <Popup>
                <div className="popup-card">
                  <h3 className="popup-card__name">{member.name}</h3>
                  <p className="popup-card__site">{member.site}</p>
                  <p className="popup-card__updated">
                    最終更新: {formatUpdatedAt(member.updatedAt)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <Legend />
      </main>
    </div>
  );
}

export default App;
