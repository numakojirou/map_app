import React from "react";
import { useAuth } from "./AuthProvider";
import "./AccessDenied.css";

function AccessDenied() {
  const { user, signOut } = useAuth();

  return (
    <div className="denied">
      <div className="denied__card">
        <div className="denied__icon" aria-hidden>🔒</div>
        <h1 className="denied__title">アクセス権がありません</h1>
        <p className="denied__lead">
          このアプリは社内メンバー向けです。
          <br />
          <strong>{user?.email}</strong> は許可リストに含まれていません。
        </p>
        <p className="denied__hint">
          別のアカウントでログインし直すか、管理者に連絡してください。
        </p>
        <button
          className="denied__button"
          type="button"
          onClick={signOut}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;
