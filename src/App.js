import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header";
import Legend from "./Legend";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { isAllowedUser } from "./auth/accessControl";
import LoginPage from "./auth/LoginPage";
import AccessDenied from "./auth/AccessDenied";
import AuthLoading from "./auth/AuthLoading";
import SeedPanel from "./data/SeedPanel";
import { subscribeMembers } from "./data/membersRepo";
import { createMarkerIcon } from "./markerIcon";
import "./App.css";

// 表示用：ISO 文字列 / Firestore Timestamp / Date を「YYYY/MM/DD HH:mm」に整形
const formatUpdatedAt = (value) => {
  if (!value) return "";
  let d;
  if (typeof value === "string") {
    d = new Date(value);
  } else if (typeof value?.toDate === "function") {
    d = value.toDate(); // Firestore Timestamp
  } else if (value instanceof Date) {
    d = value;
  } else {
    return String(value);
  }
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function MapView() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Firestore の members コレクションを購読
  useEffect(() => {
    const unsub = subscribeMembers((list, err) => {
      if (err) setError(err);
      setMembers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="app">
      <Header memberCount={members.length} user={user} />
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
        {/* 初回起動時：データが無ければシードパネルを表示 */}
        {!loading && !error && members.length === 0 && <SeedPanel />}
      </main>
    </div>
  );
}

// 認証状態を見て、ログイン画面 / 拒否画面 / 本体 を振り分ける
function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <LoginPage />;
  if (!isAllowedUser(user)) return <AccessDenied />;
  return <MapView />;
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
