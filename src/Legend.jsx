import React from "react";
import { CATEGORIES, getCategoryColor } from "./categoryColors";
import "./Legend.css";

function Legend() {
  return (
    <div className="legend" aria-label="マーカーの凡例">
      <div className="legend__title">凡例</div>
      <ul className="legend__list">
        {CATEGORIES.map((category) => (
          <li key={category} className="legend__item">
            <span
              className="legend__swatch"
              style={{ background: getCategoryColor(category) }}
              aria-hidden
            />
            <span className="legend__label">{category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Legend;
