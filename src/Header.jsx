import React from "react";
import { useAuth } from "./auth/AuthProvider";
import "./Header.css";

function Header({ memberCount, user, addMode, onToggleAddMode }) {
  const { signOut } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden>📍</span>
        <h1 className="app-header__title">社員マップ</h1>
      </div>

      <div className="app-header__right">
        {onToggleAddMode && (
          <button
            type="button"
            className={`app-header__add ${
              addMode ? "app-header__add--active" : ""
            }`}
            onClick={onToggleAddMode}
          >
            {addMode ? "キャンセル" : "+ メンバー追加"}
          </button>
        )}

        <div className="app-header__count">
          <span className="app-header__count-label">メンバー</span>
          <span className="app-header__count-value">{memberCount}</span>
        </div>

        {user && (
          <div className="app-header__user">
            {user.photoURL ? (
              <img
                className="app-header__avatar"
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="app-header__avatar app-header__avatar--placeholder">
                {(user.displayName || user.email || "?").slice(0, 1)}
              </span>
            )}
            <button
              className="app-header__signout"
              type="button"
              onClick={signOut}
              title={user.email}
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
