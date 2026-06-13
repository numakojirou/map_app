import React from "react";
import { useAuth } from "./AuthProvider";
import "./LoginPage.css";

function LoginPage() {
  const { signIn, error } = useAuth();

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__logo" aria-hidden>📍</div>
        <h1 className="login__title">社員マップ</h1>
        <p className="login__lead">
          社員の現場配置を共有する社内向けマップです。
          <br />
          Google アカウントでログインしてください。
        </p>
        <button
          className="login__button"
          type="button"
          onClick={signIn}
        >
          <span className="login__google-g" aria-hidden>G</span>
          Google でログイン
        </button>
        {error && <p className="login__error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
