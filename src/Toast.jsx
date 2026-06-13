import React, { useEffect } from "react";
import "./Toast.css";

/**
 * 短時間で消える通知。
 * key を変えれば再表示できる（同じ message でも消えてから再出現）。
 */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default Toast;
