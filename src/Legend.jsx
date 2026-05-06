import React from "react";
import "./Legend.css";

const ITEMS = [
  { label: "出社", color: "#2563eb" },
  { label: "ハイブリッド", color: "#ea580c" },
  { label: "在宅", color: "#16a34a" },
];

function Legend() {
  return (
    <div className="legend" aria-label="マーカーの凡例">
      <div className="legend__title">凡例</div>
      <ul className="legend__list">
        {ITEMS.map((item) => (
          <li key={item.label} className="legend__item">
            <span
              className="legend__swatch"
              style={{ background: item.color }}
              aria-hidden
            />
            <span className="legend__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Legend;
