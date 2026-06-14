import React, { useMemo, useState } from "react";
import { CATEGORIES, getCategoryColor } from "./categoryColors";
import { formatRelative } from "./formatTime";
import "./MemberList.css";

function MemberList({ members, selectedId, onSelect }) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(() => new Set());

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return members.filter((m) => {
      if (q) {
        const haystack = `${m.name ?? ""} ${m.site ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedCategories.size > 0 && !selectedCategories.has(m.category)) {
        return false;
      }
      return true;
    });
  }, [members, searchText, selectedCategories]);

  return (
    <div className="member-list">
      <div className="member-list__search">
        <input
          type="search"
          className="member-list__search-input"
          placeholder="名前 / 現場で検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="member-list__filters" role="group" aria-label="カテゴリで絞り込み">
        {CATEGORIES.map((c) => {
          const active = selectedCategories.has(c);
          return (
            <button
              key={c}
              type="button"
              className={`member-list__chip ${active ? "is-active" : ""}`}
              style={
                active
                  ? { background: getCategoryColor(c), borderColor: getCategoryColor(c) }
                  : undefined
              }
              onClick={() => toggleCategory(c)}
              aria-pressed={active}
            >
              <span
                className="member-list__chip-dot"
                style={{ background: getCategoryColor(c) }}
              />
              {c}
            </button>
          );
        })}
      </div>

      <div className="member-list__count">
        全 {members.length} 名中 {filtered.length} 名
      </div>

      <ul className="member-list__items">
        {filtered.map((m) => {
          const isSelected = m.id === selectedId;
          return (
            <li
              key={m.id}
              className={`member-row ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelect?.(m.id)}
            >
              <span
                className="member-row__dot"
                style={{ background: getCategoryColor(m.category) }}
                aria-hidden
              />
              <div className="member-row__main">
                <div className="member-row__name">{m.name}</div>
                <div className="member-row__site">{m.site}</div>
              </div>
              <div className="member-row__updated">
                {formatRelative(m.updatedAt)}
              </div>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="member-list__empty">該当なし</div>
      )}
    </div>
  );
}

export default MemberList;
