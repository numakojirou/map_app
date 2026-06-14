import React, { useEffect, useMemo, useRef, useState } from "react";
import { assignNewIds, parseInput } from "./parseImport";
import { geocodeAddress } from "./geocode";
import { bulkUpsertMembers } from "../data/membersRepo";
import "./BulkImport.css";

const CSV_TEMPLATE =
  "name,site,category,email,lat,lng,address\n" +
  "山田 太郎,本社オフィス,出社,yamada@example.com,35.6812,139.7671,\n" +
  "佐藤 花子,新宿支店,ハイブリッド,sato@example.com,,,東京都新宿区西新宿\n";

/**
 * 管理者用の一括登録モーダル。
 * 入力 → 解析 → プレビュー → (ジオコーディング) → 投入 → 完了
 *
 * props:
 *   existingMembers: 現在の Firestore メンバー一覧（ID 重複避け / 新規 ID 採番に使用）
 *   onClose(): モーダルを閉じる
 *   onComplete(message): 投入成功時に親に通知（トースト用）
 */
function BulkImport({ existingMembers, onClose, onComplete }) {
  // phase: "input" | "preview" | "geocoding" | "submitting" | "done"
  const [phase, setPhase] = useState("input");
  const [text, setText] = useState("");
  const [parseResult, setParseResult] = useState(null); // { rows, format, parseError? }
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const [done, setDone] = useState(null); // { success, failed, errorMessage? }
  const fileInputRef = useRef(null);

  // ESC で閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && phase !== "submitting" && phase !== "geocoding") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  // プレビュー集計
  const summary = useMemo(() => {
    if (!parseResult?.rows) return { ok: 0, needGeocode: 0, error: 0 };
    let ok = 0;
    let needGeocode = 0;
    let error = 0;
    for (const r of parseResult.rows) {
      if (r.errors.length > 0) error++;
      else if (r.needsGeocode) needGeocode++;
      else ok++;
    }
    return { ok, needGeocode, error };
  }, [parseResult]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setText(text);
    } catch (err) {
      console.error(err);
    }
    e.target.value = "";
  };

  const handleParse = () => {
    if (!text.trim()) return;
    const result = parseInput(text);
    if (!result.parseError) {
      assignNewIds(result.rows, existingMembers);
    }
    setParseResult(result);
    setPhase("preview");
  };

  const handleBackToInput = () => {
    setParseResult(null);
    setPhase("input");
  };

  const handleGeocode = async () => {
    if (!parseResult?.rows) return;
    const rows = parseResult.rows;
    const toResolve = rows.filter((r) => r.needsGeocode);
    if (toResolve.length === 0) return;

    setPhase("geocoding");
    setGeocodeProgress({ done: 0, total: toResolve.length });

    for (let i = 0; i < toResolve.length; i++) {
      const r = toResolve[i];
      try {
        const { lat, lng } = await geocodeAddress(r.normalized.address);
        r.normalized.lat = lat;
        r.normalized.lng = lng;
        r.needsGeocode = false;
      } catch (err) {
        r.errors.push(`ジオコーディング失敗: ${err.message}`);
      }
      setGeocodeProgress({ done: i + 1, total: toResolve.length });
    }
    // 再描画
    setParseResult({ ...parseResult, rows: [...rows] });
    setPhase("preview");
  };

  const handleSubmit = async () => {
    if (!parseResult?.rows) return;
    const validRows = parseResult.rows.filter(
      (r) => r.errors.length === 0 && !r.needsGeocode
    );
    if (validRows.length === 0) return;

    setPhase("submitting");
    try {
      // Firestore に送る形に整形（不要な内部キーは落とす）
      const payload = validRows.map((r) => {
        const out = {
          id: r.normalized.id,
          name: r.normalized.name,
          site: r.normalized.site,
          category: r.normalized.category,
          lat: r.normalized.lat,
          lng: r.normalized.lng,
        };
        if (r.normalized.email) out.email = r.normalized.email;
        if (r.normalized.address) out.address = r.normalized.address;
        return out;
      });
      await bulkUpsertMembers(payload);
      setDone({ success: validRows.length, failed: 0 });
      onComplete?.(`${validRows.length} 件を登録しました`);
      setPhase("done");
    } catch (err) {
      console.error(err);
      setDone({
        success: 0,
        failed: validRows.length,
        errorMessage:
          err?.code === "permission-denied"
            ? "権限がありません（管理者のみ実行可）"
            : err.message ?? "投入に失敗しました",
      });
      setPhase("done");
    }
  };

  const overlayClick = (e) => {
    if (e.target !== e.currentTarget) return;
    if (phase === "submitting" || phase === "geocoding") return;
    onClose();
  };

  return (
    <div className="bulk-import__overlay" onMouseDown={overlayClick}>
      <div className="bulk-import__card">
        <header className="bulk-import__header">
          <h2 className="bulk-import__title">一括登録</h2>
          <button
            type="button"
            className="bulk-import__close"
            onClick={onClose}
            disabled={phase === "submitting" || phase === "geocoding"}
            aria-label="閉じる"
          >
            ×
          </button>
        </header>

        {phase === "input" && (
          <section className="bulk-import__body">
            <p className="bulk-import__hint">
              CSV または JSON を貼り付け、もしくはファイルを選択。
              <br />
              <strong>name</strong> / <strong>site</strong> /{" "}
              <strong>category</strong> は必須。
              位置は <code>lat,lng</code> または <code>address</code> のどちらか。
            </p>
            <details className="bulk-import__sample">
              <summary>CSV サンプルを開く</summary>
              <pre>{CSV_TEMPLATE}</pre>
            </details>
            <textarea
              className="bulk-import__textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ここに CSV / JSON を貼り付け…"
              rows={10}
            />
            <div className="bulk-import__file-row">
              <button
                type="button"
                className="bulk-import__file-button"
                onClick={() => fileInputRef.current?.click()}
              >
                ファイルを選択
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span className="bulk-import__file-note">
                .csv / .json / .txt（UTF-8）
              </span>
            </div>
            <footer className="bulk-import__actions">
              <button
                type="button"
                className="bulk-import__button bulk-import__button--secondary"
                onClick={onClose}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="bulk-import__button bulk-import__button--primary"
                onClick={handleParse}
                disabled={!text.trim()}
              >
                解析
              </button>
            </footer>
          </section>
        )}

        {phase === "preview" && parseResult && (
          <section className="bulk-import__body">
            {parseResult.parseError ? (
              <div className="bulk-import__parse-error">
                解析失敗: {parseResult.parseError}
              </div>
            ) : (
              <>
                <div className="bulk-import__summary">
                  <span>形式: {parseResult.format.toUpperCase()}</span>
                  <span>✅ {summary.ok}</span>
                  <span>⏳ {summary.needGeocode}</span>
                  <span>❌ {summary.error}</span>
                </div>
                <div className="bulk-import__table-wrap">
                  <table className="bulk-import__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>状態</th>
                        <th>id</th>
                        <th>名前</th>
                        <th>メアド</th>
                        <th>現場</th>
                        <th>区分</th>
                        <th>位置 / 住所</th>
                        <th>エラー</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.rows.map((r, idx) => {
                        const state =
                          r.errors.length > 0
                            ? "error"
                            : r.needsGeocode
                            ? "needGeocode"
                            : "ok";
                        const icon =
                          state === "ok"
                            ? "✅"
                            : state === "needGeocode"
                            ? "⏳"
                            : "❌";
                        const loc =
                          typeof r.normalized.lat === "number"
                            ? `${r.normalized.lat.toFixed(4)}, ${r.normalized.lng.toFixed(4)}`
                            : r.normalized.address || "—";
                        return (
                          <tr key={idx} className={`bulk-import__row--${state}`}>
                            <td>{idx + 1}</td>
                            <td>{icon}</td>
                            <td>{r.normalized.id}</td>
                            <td>{r.normalized.name}</td>
                            <td>{r.normalized.email || "—"}</td>
                            <td>{r.normalized.site}</td>
                            <td>{r.normalized.category}</td>
                            <td>{loc}</td>
                            <td>{r.errors.join(" / ")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <footer className="bulk-import__actions">
              <button
                type="button"
                className="bulk-import__button bulk-import__button--secondary"
                onClick={handleBackToInput}
              >
                入力に戻る
              </button>
              {summary.needGeocode > 0 && (
                <button
                  type="button"
                  className="bulk-import__button bulk-import__button--secondary"
                  onClick={handleGeocode}
                >
                  住所をジオコーディング（{summary.needGeocode}件）
                </button>
              )}
              <button
                type="button"
                className="bulk-import__button bulk-import__button--primary"
                onClick={handleSubmit}
                disabled={summary.ok === 0 || summary.error > 0 || summary.needGeocode > 0}
                title={
                  summary.error > 0
                    ? "エラー行を解消してください"
                    : summary.needGeocode > 0
                    ? "ジオコーディングを実行してください"
                    : ""
                }
              >
                {summary.ok} 件を投入
              </button>
            </footer>
          </section>
        )}

        {phase === "geocoding" && (
          <section className="bulk-import__body bulk-import__body--center">
            <div className="bulk-import__spinner" />
            <p className="bulk-import__progress-text">
              住所をジオコーディング中… {geocodeProgress.done}/{geocodeProgress.total}
            </p>
            <p className="bulk-import__progress-note">
              Nominatim のレート制限のため 1 件あたり約 1 秒かかります。
              閉じずにお待ちください。
            </p>
          </section>
        )}

        {phase === "submitting" && (
          <section className="bulk-import__body bulk-import__body--center">
            <div className="bulk-import__spinner" />
            <p className="bulk-import__progress-text">Firestore に投入中…</p>
          </section>
        )}

        {phase === "done" && done && (
          <section className="bulk-import__body">
            {done.failed > 0 ? (
              <div className="bulk-import__result bulk-import__result--error">
                <p>❌ 投入失敗</p>
                <p>{done.errorMessage}</p>
              </div>
            ) : (
              <div className="bulk-import__result bulk-import__result--success">
                <p>✅ {done.success} 件を登録しました</p>
                <p>サイドバーと地図に反映されているはずです。</p>
              </div>
            )}
            <footer className="bulk-import__actions">
              <button
                type="button"
                className="bulk-import__button bulk-import__button--primary"
                onClick={onClose}
              >
                閉じる
              </button>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}

export default BulkImport;
