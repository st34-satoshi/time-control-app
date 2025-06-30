import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase設定（実際のプロジェクトでは環境変数から取得）
const firebaseConfig = {
  apiKey: "", // TODO: 環境変数から取得
  authDomain: "time-control-app.firebaseapp.com",
  projectId: "time-control-app",
  storageBucket: "time-control-app.firebasestorage.app",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestoreインスタンス
export const db = getFirestore(app);

export default app;