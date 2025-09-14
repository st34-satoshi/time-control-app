import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { styles } from './Login.styles';

export default function Login() {
  const [loading, setLoading] = useState(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>タイムコントロール</Text>
        <Text style={styles.subtitle}>ログインしてください</Text>
        
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