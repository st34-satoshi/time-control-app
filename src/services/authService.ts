import { signInAnonymously, signOut, onAuthStateChanged, User, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const authService = {
  // Googleログイン初期化
  initializeGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Firebase Consoleから取得
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // iOSクライアントIDを追加
      offlineAccess: true,
    });
  },

  // Googleログイン
  async signInWithGoogle(): Promise<void> {
    try {
      // Google Sign-Inを実行
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('Google IDトークンが取得できませんでした');
      }

      // Firebase認証情報を作成
      const credential = GoogleAuthProvider.credential(userInfo.data?.idToken);
      
      // Firebaseで認証
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Googleログインエラー:', error);
      throw error;
    }
  },

  // Googleログアウト
  async signOutFromGoogle(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Googleログアウトエラー:', error);
    }
  },

  // 匿名ログイン
  async signInAnonymously(): Promise<void> {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('認証エラー:', error);
      throw error;
    }
  },

  // ログアウト
  async signOut(): Promise<void> {
    try {
      await this.signOutFromGoogle();
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  },

  // 現在のユーザーを取得
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // 認証状態の変更を監視
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}; 