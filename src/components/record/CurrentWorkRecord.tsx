import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native';
import { currentWorkStyles as styles } from '@components/record/CurrentWorkRecord.styles';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { useAuth } from '@contexts/AuthContext';
import Categories from '@components/record/Categories';
import { RecordingController, RecordingState } from '../../domain/recordingController';
import { Category } from '@app-types/Category';
import { CategoryManager } from '../../domain/Category';

const CurrentWorkRecord = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Current recording form
  const [currentTask, setCurrentTask] = useState('');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryManager, setCategoryManager] = useState<CategoryManager | null>(null);
  
  // アプリの状態変化を監視
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isRecording && startTime) {
        // アプリがアクティブになった時に経過時間を再計算
        const newElapsedTime = RecordingController.calculateElapsedTime(startTime.toISOString());
        setElapsedTime(newElapsedTime);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRecording, startTime]);

  // CategoryManagerを初期化
  useEffect(() => {
    const initializeCategoryManager = async () => {
      if (user?.uid) {
        try {
          const manager = await CategoryManager.create(user.uid);
          setCategoryManager(manager);
        } catch (error) {
          console.error('Error initializing category manager:', error);
        }
      }
    };

    initializeCategoryManager();
  }, [user?.uid]);

  // コンポーネントマウント時に保存された状態を復元
  useEffect(() => {
    const restoreRecordingState = async () => {
      const savedState = await RecordingController.getRecordingState();
      if (savedState && savedState.isRecording && categoryManager) {
        setIsRecording(true);
        setCurrentTask(savedState.task);
        
        // categoryIdからCategoryオブジェクトを取得
        const category = categoryManager.getAllCategories().find(cat => cat.id === savedState.categoryId);
        if (category) {
          setCurrentCategory(category);
        }
        
        setStartTime(new Date(savedState.startTime));
        
        // 経過時間を再計算
        const newElapsedTime = RecordingController.calculateElapsedTime(savedState.startTime);
        setElapsedTime(newElapsedTime);
      }
    };

    if (categoryManager) {
      restoreRecordingState();
    }
  }, [categoryManager]);
  
  // Timer effect - レコーディング中は1秒ごとに経過時間を更新
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && startTime) {
      interval = setInterval(() => {
        const newElapsedTime = RecordingController.calculateElapsedTime(startTime.toISOString());
        setElapsedTime(newElapsedTime);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, startTime]);

  // レコーディング状態を保存
  useEffect(() => {
    if (isRecording && startTime && currentCategory) {
      const state: RecordingState = {
        isRecording,
        startTime: startTime.toISOString(),
        task: currentTask,
        categoryId: currentCategory.id!,
      };
      RecordingController.saveRecordingState(state);
    }
  }, [isRecording, startTime, currentTask, currentCategory]);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = () => {
    if (!currentCategory) {
      Alert.alert('エラー', 'カテゴリを選択してください');
      return;
    }
    setIsRecording(true);
    setStartTime(new Date());
    setElapsedTime(0);
  };
  
  // Stop recording and save to Firestore
  const stopRecording = async () => {
    if (!startTime || !user || !currentCategory) return;
    
    setIsRecording(false);
    const endTime = new Date();
    
    try {
      await timeRecordService.saveTimeRecord({
        task: currentTask,
        categoryId: currentCategory.id!,
        startTime,
        endTime,
      }, user.uid);
      
      Alert.alert(
        '記録完了！',
        `タスク: ${currentTask}\nカテゴリ: ${currentCategory.label}\n時間: ${formatTime(elapsedTime)}\n\n保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving record:', error);
    }
    
    // Reset form and clear saved state
    setCurrentTask('');
    setCurrentCategory(null);
    setElapsedTime(0);
    setStartTime(null);
    await RecordingController.clearRecordingState();
  };

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        {isRecording && (
          <Text style={styles.recordingText}>⏺ 記録中...</Text>
        )}
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏷️ カテゴリ</Text>
          <Categories
            userId={user?.uid}
            currentCategory={currentCategory?.value || ''}
            onCategorySelect={(category) => {
              setCurrentCategory(category);
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📋 タスク内容(任意)</Text>
          <TextInput
            style={[styles.textInput, isRecording && styles.textInputDisabled]}
            value={currentTask}
            onChangeText={setCurrentTask}
            placeholder="何をしていますか？"
            editable={!isRecording}
          />
        </View>
      </View>
      
      {/* Control Button */}
      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startRecording}
          >
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <Text style={styles.buttonText}>STOP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CurrentWorkRecord;