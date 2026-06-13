import React, { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header";
import Legend from "./Legend";
import Toast from "./Toast";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { isAllowedUser } from "./auth/accessControl";
import LoginPage from "./auth/LoginPage";
import AccessDenied from "./auth/AccessDenied";
import AuthLoading from "./auth/AuthLoading";
import SeedPanel from "./data/SeedPanel";
import MemberForm from "./data/MemberForm";
import {
  addMember,
  deleteMember,
  nextMemberId,
  subscribeMembers,
  updateMember,
} from "./data/membersRepo";
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

// 地図クリックを拾うための子コンポーネント。
// addMode が true のときだけクリック位置を親に渡す。
function ClickHandler({ enabled, onPick }) {
  useMapEvents({
    click: (e) => {
      if (enabled) onPick(e.latlng);
    },
  });
  return null;
}

function MapView() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMode, setAddMode] = useState(false);
  // formState: null | { mode: "create" | "edit", initial: {...} }
  const [formState, setFormState] = useState(null);
  // toast: null | { key, message }
  const [toast, setToast] = useState(null);

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

  const showToast = useCallback((message) => {
    setToast({ key: Date.now(), message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const toggleAddMode = useCallback(() => {
    setAddMode((prev) => !prev);
    setFormState(null);
  }, []);

  const handleMapClick = useCallback(
    (latlng) => {
      if (!addMode) return;
      setFormState({
        mode: "create",
        initial: {
          id: nextMemberId(members),
          name: "",
          site: "",
          category: "出社",
          lat: latlng.lat,
          lng: latlng.lng,
        },
      });
      setAddMode(false); // 配置位置が決まったら追加モードを抜ける
    },
    [addMode, members]
  );

  const handleEdit = useCallback((member) => {
    setFormState({ mode: "edit", initial: { ...member } });
  }, []);

  const handleDelete = useCallback(
    async (member) => {
      const ok = window.confirm(`${member.name} を削除しますか？`);
      if (!ok) return;
      try {
        await deleteMember(member.id);
        showToast(`${member.name} を削除しました`);
      } catch (e) {
        console.error(e);
        showToast("削除に失敗しました");
      }
    },
    [showToast]
  );

  const handleSave = useCallback(
    async (member) => {
      if (formState?.mode === "create") {
        await addMember(member);
        showToast(`${member.name} を追加しました`);
      } else {
        await updateMember(member.id, {
          name: member.name,
          site: member.site,
          category: member.category,
        });
        showToast(`${member.name} を更新しました`);
      }
      setFormState(null);
    },
    [formState, showToast]
  );

  const handleCancelForm = useCallback(() => {
    setFormState(null);
  }, []);

  const handleDragEnd = useCallback(
    async (member, latlng) => {
      try {
        await updateMember(member.id, { lat: latlng.lat, lng: latlng.lng });
        showToast(`${member.name} の位置を更新しました`);
      } catch (e) {
        console.error(e);
        showToast("位置の更新に失敗しました");
      }
    },
    [showToast]
  );

  const mapClassName = `app__map ${addMode ? "app__map--adding" : ""}`;

  return (
    <div className="app">
      <Header
        memberCount={members.length}
        user={user}
        addMode={addMode}
        onToggleAddMode={toggleAddMode}
      />
      <main className={mapClassName}>
        <MapContainer
          center={[35.681236, 139.767125]}
          zoom={10}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler enabled={addMode} onPick={handleMapClick} />

          {members.map((member) => (
            <Marker
              key={member.id}
              position={[member.lat, member.lng]}
              icon={createMarkerIcon(member.category)}
              draggable
              eventHandlers={{
                dragend: (e) => handleDragEnd(member, e.target.getLatLng()),
              }}
            >
              <Popup>
                <div className="popup-card">
                  <h3 className="popup-card__name">{member.name}</h3>
                  <p className="popup-card__site">{member.site}</p>
                  <p className="popup-card__updated">
                    最終更新: {formatUpdatedAt(member.updatedAt)}
                  </p>
                  <div className="popup-card__actions">
                    <button
                      type="button"
                      className="popup-card__action"
                      onClick={() => handleEdit(member)}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      className="popup-card__action popup-card__action--danger"
                      onClick={() => handleDelete(member)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <Legend />
        {/* 初回起動時：データが無ければシードパネルを表示 */}
        {!loading && !error && members.length === 0 && <SeedPanel />}
      </main>

      {formState && (
        <MemberForm
          mode={formState.mode}
          initial={formState.initial}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          onDone={dismissToast}
        />
      )}
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
