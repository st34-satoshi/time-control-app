import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase設定を環境変数から取得
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 環境変数が正しく設定されているかチェック
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase設定の環境変数が正しく設定されていません。.envファイルを確認してください。');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firebase Auth を一度だけ初期化（2回目は getAuth を使う）
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();

export default app;