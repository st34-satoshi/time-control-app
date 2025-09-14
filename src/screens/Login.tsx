import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { styles } from './Login.styles';
import { authService } from '../services/authService';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { signInAnonymously }: { 
    signInAnonymously: () => Promise<void>;
  } = useAuth();

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously();
    } catch (error) {
      Alert.alert('エラー', 'ログインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await authService.signInWithEmailAndPassword(email, password);
      } else {
        await authService.createUserWithEmailAndPassword(email, password);
      }
    } catch (error: any) {
      let errorMessage = 'ログインに失敗しました。もう一度お試しください。';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスは登録されていません。';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが正しくありません。';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています。';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードは6文字以上で入力してください。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '正しいメールアドレス形式で入力してください。';
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>タイムコントロール</Text>
        <Text style={styles.subtitle}>
          {isLoginMode ? 'ログインしてください' : 'アカウントを作成してください'}
        </Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.emailButton, loading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.emailButtonText}>
              {isLoginMode ? 'ログイン' : 'アカウント作成'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={toggleMode}
          disabled={loading}
        >
          <Text style={styles.switchModeText}>
            {isLoginMode ? 'アカウントを作成する' : 'ログインする'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAnonymousLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>匿名でログイン</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}