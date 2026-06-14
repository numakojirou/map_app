import React from "react";
import { useAuth } from "./auth/AuthProvider";
import "./Header.css";

function Header({
  memberCount,
  user,
  isAdmin = false,
  addMode,
  onToggleAddMode,
  onToggleSidebar,
  onOpenAdmin,
}) {
  const { signOut } = useAuth();

  // 「+ メンバー追加」と「⚙ 管理」は admin のみ
  const showAddButton = isAdmin && onToggleAddMode;
  const showAdminButton = isAdmin && onOpenAdmin;

  return (
    <header className="app-header">
      <div className="app-header__left">
        {onToggleSidebar && (
          <button
            type="button"
            className="app-header__hamburger"
            onClick={onToggleSidebar}
            aria-label="メニュー"
          >
            ☰
          </button>
        )}
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden>📍</span>
          <h1 className="app-header__title">社員マップ</h1>
        </div>
      </div>

      <div className="app-header__right">
        {showAdminButton && (
          <button
            type="button"
            className="app-header__admin"
            onClick={onOpenAdmin}
            aria-label="管理者パネル"
          >
            <span className="app-header__admin-icon" aria-hidden>⚙</span>
            <span className="app-header__admin-label">管理</span>
          </button>
        )}

        {showAddButton && (
          <button
            type="button"
            className={`app-header__add ${
              addMode ? "app-header__add--active" : ""
            }`}
            onClick={onToggleAddMode}
            aria-label={addMode ? "キャンセル" : "メンバー追加"}
          >
            <span className="app-header__add-icon">
              {addMode ? "×" : "+"}
            </span>
            <span className="app-header__add-label">
              {addMode ? "キャンセル" : "メンバー追加"}
            </span>
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
