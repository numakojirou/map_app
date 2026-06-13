import {
  collection,
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
 * メンバー 1 件を upsert する。
 * Phase 3-A の編集 UI 用。Phase 3-B 時点では SeedButton が利用。
 */
export const upsertMember = async (member) => {
  const { id, ...rest } = member;
  if (!id) throw new Error("upsertMember: id is required");
  await setDoc(
    doc(db, COLLECTION, id),
    {
      ...rest,
      // updatedAt が未指定なら server 時刻を入れる
      updatedAt: rest.updatedAt ?? serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * 配列をまとめて投入する。SeedButton から呼ばれる。
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
