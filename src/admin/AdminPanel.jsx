import React, { useEffect, useState } from "react";
import { exportCSV, exportJSON } from "./exportMembers";
import BulkImport from "./BulkImport";
import "./AdminPanel.css";

/**
 * 管理者専用パネル。一覧エクスポートと一括登録を提供。
 *
 * props:
 *   members: 現 Firestore メンバー一覧
 *   onClose(): モーダルを閉じる
 *   onToast(message): 親に通知（任意）
 */
function AdminPanel({ members, onClose, onToast }) {
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !bulkOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bulkOpen, onClose]);

  return (
    <>
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
            <p className="admin-panel__lead">
              CSV / JSON を貼り付け、もしくはファイルから一括投入できます。
              <br />
              住所のみで登録すると Nominatim（OSM）でジオコーディングします。
            </p>
            <div className="admin-panel__buttons">
              <button
                type="button"
                className="admin-panel__button"
                onClick={() => setBulkOpen(true)}
              >
                一括登録を開く
              </button>
            </div>
          </section>
        </div>
      </div>

      {bulkOpen && (
        <BulkImport
          existingMembers={members}
          onClose={() => setBulkOpen(false)}
          onComplete={(msg) => onToast?.(msg)}
        />
      )}
    </>
  );
}

export default AdminPanel;
