import React, { useState } from "react";
import seedMembersData from "./seedMembers.json";
import { seedMembers } from "./membersRepo";
import "./SeedPanel.css";

/**
 * Firestore の members コレクションが空のとき、地図中央に表示するパネル。
 * クリックすると seedMembers.json の中身を一括投入する。
 * 投入後は subscription が更新されて自動的に消える（呼び出し側で出し分け）。
 */
function SeedPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setBusy(true);
    setError(null);
    try {
      await seedMembers(seedMembersData);
    } catch (e) {
      console.error(e);
      setError(e.message ?? "投入に失敗しました");
      setBusy(false);
    }
  };

  return (
    <div className="seed-panel">
      <div className="seed-panel__card">
        <div className="seed-panel__icon" aria-hidden>🌱</div>
        <h2 className="seed-panel__title">まだメンバーが登録されていません</h2>
        <p className="seed-panel__lead">
          検証用のサンプルデータ（架空メンバー {seedMembersData.length} 名）
          を Firestore に投入できます。
        </p>
        <button
          className="seed-panel__button"
          type="button"
          onClick={handleSeed}
          disabled={busy}
        >
          {busy ? "投入中…" : "サンプルデータを投入"}
        </button>
        {error && <p className="seed-panel__error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default SeedPanel;
