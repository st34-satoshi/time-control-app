import { signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebase';

export const authService = {
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