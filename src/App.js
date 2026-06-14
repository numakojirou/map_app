import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header";
import Legend from "./Legend";
import MemberList from "./MemberList";
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
import { formatAbsolute } from "./formatTime";
import "./App.css";

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

// 起動直後に一度だけ、全マーカーが収まる zoom / 中心に合わせる。
// その後ユーザーがパン/ズームしても再フィットしない（操作の邪魔をしない）。
function FitBoundsOnLoad({ members }) {
  const map = useMap();
  const fittedRef = useRef(false);
  useEffect(() => {
    if (fittedRef.current) return;
    if (members.length === 0) return;
    const lats = members.map((m) => m.lat);
    const lngs = members.map((m) => m.lng);
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    fittedRef.current = true;
  }, [members, map]);
  return null;
}

// サイドバーからメンバーが選択されたら、対応するマーカーへ flyTo して
// popup を開く。selection が更新された瞬間に発火する。
function SelectionHandler({ selection, members, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!selection) return;
    const member = members.find((m) => m.id === selection.id);
    if (!member) return;
    map.flyTo([member.lat, member.lng], Math.max(map.getZoom(), 13), {
      duration: 0.6,
    });
    const marker = markerRefs.current[selection.id];
    if (marker) {
      // 短い遅延で popup を開く（flyTo の開始後でも popup は表示される）
      setTimeout(() => marker.openPopup(), 50);
    }
  }, [selection, members, map, markerRefs]);
  return null;
}

function MapView() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [formState, setFormState] = useState(null);
  const [toast, setToast] = useState(null);
  // selection: null | { id, key }   ← key で同一 id を再クリックしても useEffect が発火
  const [selection, setSelection] = useState(null);

  const markerRefs = useRef({});
  const { user } = useAuth();

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
      setAddMode(false);
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

  // サイドバーで選択された
  const handleSelectFromList = useCallback((id) => {
    setSelection({ id, key: Date.now() });
  }, []);

  const mapClassName = `app__map ${addMode ? "app__map--adding" : ""}`;

  return (
    <div className="app">
      <Header
        memberCount={members.length}
        user={user}
        addMode={addMode}
        onToggleAddMode={toggleAddMode}
      />
      <div className="app__body">
        <aside className="app__sidebar">
          <MemberList
            members={members}
            selectedId={selection?.id ?? null}
            onSelect={handleSelectFromList}
          />
        </aside>
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
            <FitBoundsOnLoad members={members} />
            <SelectionHandler
              selection={selection}
              members={members}
              markerRefs={markerRefs}
            />

            {members.map((member) => (
              <Marker
                key={member.id}
                position={[member.lat, member.lng]}
                icon={createMarkerIcon(member.category)}
                draggable
                ref={(ref) => {
                  if (ref) markerRefs.current[member.id] = ref;
                  else delete markerRefs.current[member.id];
                }}
                eventHandlers={{
                  dragend: (e) => {
                    const newPos = e.target.getLatLng();
                    const ok = window.confirm(
                      `${member.name} の位置を本当に移動しますか？`
                    );
                    if (!ok) {
                      e.target.setLatLng([member.lat, member.lng]);
                      return;
                    }
                    handleDragEnd(member, newPos);
                  },
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <h3 className="popup-card__name">{member.name}</h3>
                    <p className="popup-card__site">{member.site}</p>
                    <p className="popup-card__updated">
                      最終更新: {formatAbsolute(member.updatedAt)}
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
          {!loading && !error && members.length === 0 && <SeedPanel />}
        </main>
      </div>

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
