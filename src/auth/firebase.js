import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Console → Project settings → General → Your apps → Config の値。
//
// 注意: これらは Firebase Web SDK 用の公開設定であり、シークレットではない。
// 実際のアクセス制御は Auth プロバイダ／allowlist／Firestore セキュリティ
// ルールで行う。
//
// measurementId は Google Analytics 用。現状 Analytics は初期化しない
// （必要になったら firebase/analytics の getAnalytics(firebaseApp) を呼ぶ）。
const firebaseConfig = {
  apiKey: "AIzaSyAFvvxN5LQj6gd2q02YUXGxhYke20C6Oow",
  authDomain: "shared-map-app-21793.firebaseapp.com",
  projectId: "shared-map-app-21793",
  storageBucket: "shared-map-app-21793.firebasestorage.app",
  messagingSenderId: "274122656774",
  appId: "1:274122656774:web:14ed62a161e349a1f1c787",
  measurementId: "G-T78X61JKX1",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
