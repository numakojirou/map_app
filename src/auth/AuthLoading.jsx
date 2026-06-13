import React from "react";
import "./AuthLoading.css";

function AuthLoading() {
  return (
    <div className="auth-loading" role="status" aria-label="読み込み中">
      <div className="auth-loading__spinner" />
    </div>
  );
}

export default AuthLoading;
