import React from "react";
import "./Header.css";

function Header({ memberCount }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden>📍</span>
        <h1 className="app-header__title">社員マップ</h1>
      </div>
      <div className="app-header__count">
        <span className="app-header__count-label">メンバー</span>
        <span className="app-header__count-value">{memberCount}</span>
      </div>
    </header>
  );
}

export default Header;
