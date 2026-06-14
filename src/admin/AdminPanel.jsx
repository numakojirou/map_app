import React, { useEffect } from "react";
import { exportCSV, exportJSON } from "./exportMembers";
import "./AdminPanel.css";

/**
 * 管理者専用パネル。一覧エクスポート（Wave 1）と一括登録（Wave 2 で追加）の
 * セクションを持つモーダル。
 */
function AdminPanel({ members, onClose }) {
  // ESC で閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="admin-panel__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-panel__card">
        <header className="admin-panel__header">
          <h2 className="admin-panel__title">⚙ 管理者パネル</h2>
          <button
            type="button"
            className="admin-panel__close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </header>

        <section className="admin-panel__section">
          <h3 className="admin-panel__section-title">一覧エクスポート</h3>
          <p className="admin-panel__lead">
            現在 Firestore に登録されている {members.length} 件をダウンロードします。
          </p>
          <div className="admin-panel__buttons">
            <button
              type="button"
              className="admin-panel__button"
              onClick={() => exportCSV(members)}
              disabled={members.length === 0}
            >
              CSV でダウンロード
            </button>
            <button
              type="button"
              className="admin-panel__button"
              onClick={() => exportJSON(members)}
              disabled={members.length === 0}
            >
              JSON でダウンロード
            </button>
          </div>
        </section>

        <section className="admin-panel__section">
          <h3 className="admin-panel__section-title">一括登録</h3>
          <p className="admin-panel__lead admin-panel__lead--muted">
            CSV / JSON ファイルからの一括投入（Wave 2 で追加予定）。
          </p>
          <button
            type="button"
            className="admin-panel__button admin-panel__button--disabled"
            disabled
          >
            近日対応
          </button>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
