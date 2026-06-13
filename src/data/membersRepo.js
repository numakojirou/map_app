import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../auth/firebase";

const COLLECTION = "members";

/**
 * members コレクションのリアルタイム購読。
 * @param {(members: Array, error?: Error) => void} onChange
 * @returns 解除用 unsubscribe 関数
 */
export const subscribeMembers = (onChange) => {
  const q = query(collection(db, COLLECTION), orderBy("name"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(list);
    },
    (err) => {
      console.error("members subscription error:", err);
      onChange([], err);
    }
  );
};

/**
 * メンバーを新規追加する。updatedAt は serverTimestamp で必ず上書きする。
 * @param {{id: string, name: string, site: string, lat: number, lng: number, category: string}} member
 */
export const addMember = async ({ id, ...rest }) => {
  if (!id) throw new Error("addMember: id is required");
  await setDoc(doc(db, COLLECTION, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 既存メンバーの部分更新。updatedAt は常に serverTimestamp で refresh する。
 * @param {string} id
 * @param {object} partial 変更するフィールドのみ
 */
export const updateMember = async (id, partial) => {
  if (!id) throw new Error("updateMember: id is required");
  await setDoc(
    doc(db, COLLECTION, id),
    { ...partial, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

/**
 * メンバーを削除する。
 */
export const deleteMember = async (id) => {
  if (!id) throw new Error("deleteMember: id is required");
  await deleteDoc(doc(db, COLLECTION, id));
};

/**
 * 配列をまとめて投入する。SeedPanel から呼ばれる。
 * 既存ドキュメントは上書き（merge: true）。
 */
export const seedMembers = async (members) => {
  const batch = writeBatch(db);
  for (const m of members) {
    const { id, ...rest } = m;
    batch.set(doc(db, COLLECTION, id), rest, { merge: true });
  }
  await batch.commit();
};

/**
 * `m-001` 形式の次のシーケンシャル ID を返す。
 * 既存の最大番号 + 1。ゼロ詰め 3 桁。
 *
 * 注: 同時に複数人が新規追加すると衝突する可能性あり。
 * 1〜2 人運用前提なので現状は許容、将来 Firestore transaction で
 * カウンタドキュメントを取り合う形に置換可。
 */
export const nextMemberId = (members) => {
  const nums = members
    .map((m) => /^m-(\d+)$/.exec(m.id))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `m-${String(max + 1).padStart(3, "0")}`;
};
