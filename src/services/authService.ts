import { 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged, 
  User, 
  signInWithCredential, 
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings
} from 'firebase/auth';
import { auth } from '@root/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  },

  // Email link認証の設定
  getActionCodeSettings(): ActionCodeSettings {
    return {
      url: `https://${Constants.expoConfig?.extra?.firebase?.authDomain || 'time-control-app.web.app'}`,
      handleCodeInApp: true,
      iOS: {
        bundleId: Constants.expoConfig?.ios?.bundleIdentifier || 'com.stu345.time-control-app-24'
      },
      android: {
        packageName: Constants.expoConfig?.android?.package || 'com.stu345.time-control-app-24',
        installApp: true,
        minimumVersion: '12'
      }
    };
  },

  // Email link認証のメール送信
  async sendSignInLinkToEmail(email: string): Promise<void> {
    try {
      const actionCodeSettings = this.getActionCodeSettings();
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // メールアドレスをローカルストレージに保存（リンククリック時に使用）
      await AsyncStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.error('Email link送信エラー:', error);
      throw error;
    }
  },

  // Email link認証の確認
  async isSignInWithEmailLink(link: string): Promise<boolean> {
    return isSignInWithEmailLink(auth, link);
  },

  // Email link認証でサインイン
  async signInWithEmailLink(email: string, link: string): Promise<void> {
    try {
      await signInWithEmailLink(auth, email, link);
      // 成功したらローカルストレージからメールアドレスを削除
      await AsyncStorage.removeItem('emailForSignIn');
    } catch (error) {
      console.error('Email link認証エラー:', error);
      throw error;
    }
  },

  // 保存されたメールアドレスを取得
  async getEmailForSignIn(): Promise<string | null> {
    return await AsyncStorage.getItem('emailForSignIn');
  }
}; 