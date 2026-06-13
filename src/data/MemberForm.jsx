import React, { useEffect, useState } from "react";
import "./MemberForm.css";

const CATEGORIES = ["出社", "ハイブリッド", "在宅"];

/**
 * メンバーの新規追加 / 編集用モーダルフォーム。
 *
 * props:
 *   mode: "create" | "edit"
 *   initial: { id, name, site, lat, lng, category }
 *   onSave(member): async
 *   onCancel(): void
 */
function MemberForm({ mode, initial, onSave, onCancel }) {
  const [name, setName] = useState(initial.name ?? "");
  const [site, setSite] = useState(initial.site ?? "");
  const [category, setCategory] = useState(initial.category ?? "出社");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // ESC で閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    const trimmedSite = site.trim();
    if (!trimmedName || !trimmedSite) {
      setError("名前と現場の入力は必須です。");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onSave({
        id: initial.id,
        name: trimmedName,
        site: trimmedSite,
        lat: initial.lat,
        lng: initial.lng,
        category,
      });
    } catch (err) {
      console.error(err);
      setError(err.message ?? "保存に失敗しました");
      setBusy(false);
    }
  };

  const titleText = mode === "create" ? "メンバーを追加" : "メンバーを編集";
  const saveText = mode === "create" ? "追加" : "保存";

  return (
    <div
      className="member-form__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <form className="member-form__card" onSubmit={handleSubmit}>
        <header className="member-form__header">
          <h2 className="member-form__title">{titleText}</h2>
          <button
            type="button"
            className="member-form__close"
            onClick={onCancel}
            disabled={busy}
            aria-label="閉じる"
          >
            ×
          </button>
        </header>

        <div className="member-form__field">
          <label htmlFor="mf-name">名前</label>
          <input
            id="mf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            autoFocus
            disabled={busy}
          />
        </div>

        <div className="member-form__field">
          <label htmlFor="mf-site">現場</label>
          <input
            id="mf-site"
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="本社オフィス / 在宅勤務（◯◯） など"
            disabled={busy}
          />
        </div>

        <div className="member-form__field">
          <label htmlFor="mf-category">働き方</label>
          <select
            id="mf-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <p className="member-form__coords">
          位置: {initial.lat.toFixed(5)}, {initial.lng.toFixed(5)}
          <span className="member-form__id">ID: {initial.id}</span>
        </p>

        {error && (
          <p className="member-form__error" role="alert">{error}</p>
        )}

        <footer className="member-form__actions">
          <button
            type="button"
            className="member-form__button member-form__button--secondary"
            onClick={onCancel}
            disabled={busy}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="member-form__button member-form__button--primary"
            disabled={busy}
          >
            {busy ? "保存中…" : saveText}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default MemberForm;
