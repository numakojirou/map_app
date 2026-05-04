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

function App() {
  const [spots, setSpots] = useState([]);

  // markers.json を読み込む
  useEffect(() => {
    fetch("/markers.json")
      .then((response) => response.json())
      .then((data) => setSpots(data))
      .catch((err) => console.error("JSON load error:", err));
  }, []);

  return (
    <MapContainer
      center={[35.681236, 139.767125]}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {spots.map((spot, index) => (
        <Marker key={index} position={[spot.lat, spot.lng]}>
          <Popup>
            <strong>{spot.name}</strong>
            <br />
            カテゴリ: {spot.category}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default App;

