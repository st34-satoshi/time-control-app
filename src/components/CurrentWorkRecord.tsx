import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { currentWorkStyles as styles } from '@components/CurrentWorkRecord.styles';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { useAuth } from '@contexts/AuthContext';
import { CategoryManager } from '@domain/Category';
import { Category } from '@app-types/Category';

const CurrentWorkRecord = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Current recording form
  const [currentTask, setCurrentTask] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Load categories on component mount
  useEffect(() => {
    if(!isLoadingCategories) return;
    const loadCategories = async () => {
      if (user?.uid) {
        try {
          setIsLoadingCategories(true);
          const fetchedCategories = await CategoryManager.getAllCategories(user.uid);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error('Error loading categories:', error);
          Alert.alert('エラー', 'カテゴリの読み込みに失敗しました');
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };
    
    loadCategories();
  }, [user?.uid]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = () => {
    if (!currentTask.trim() || !currentCategory.trim()) {
      Alert.alert('エラー', 'タスクとカテゴリを入力してください');
      return;
    }
    setIsRecording(true);
    setStartTime(new Date());
    setElapsedTime(0);
  };
  
  // Stop recording and save to Firestore
  const stopRecording = async () => {
    if (!startTime || !user) return;
    
    setIsRecording(false);
    const endTime = new Date();
    
    try {
      await timeRecordService.saveTimeRecord({
        task: currentTask,
        category: currentCategory,
        startTime,
        endTime,
      }, user.uid);
      
      Alert.alert(
        '記録完了！',
        `タスク: ${currentTask}\nカテゴリ: ${currentCategory}\n時間: ${formatTime(elapsedTime)}\n\n保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving record:', error);
    }
    
    // Reset form
    setCurrentTask('');
    setCurrentCategory('');
    setElapsedTime(0);
    setStartTime(null);
  };

  const renderCategoryOptions = () => {
    if (isLoadingCategories) {
      return (
        <Text style={styles.loadingText}>カテゴリを読み込み中...</Text>
      );
    }
    
    if (categories.length === 0) {
      return (
        <Text style={styles.noCategoriesText}>カテゴリがありません</Text>
      );
    }
    
    return categories.map((category) => (
      <TouchableOpacity
        key={category.value}
        style={[
          styles.projectOption,
          currentCategory === category.value && styles.projectOptionSelected
        ]}
        onPress={() => setCurrentCategory(category.value)}
      >
        <Text style={[
          styles.projectOptionText,
          currentCategory === category.value && styles.projectOptionTextSelected
        ]}>
          {category.icon} {category.label}
        </Text>
      </TouchableOpacity>
    ));
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
          <Text style={styles.label}>📋 タスク内容</Text>
          <TextInput
            style={[styles.textInput, isRecording && styles.textInputDisabled]}
            value={currentTask}
            onChangeText={setCurrentTask}
            placeholder="何をしていますか？"
            editable={!isRecording}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏷️ カテゴリ</Text>
          <View style={styles.projectOptionsContainer}>
            {renderCategoryOptions()}
          </View>
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
      
      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingInfoText}>{currentTask}</Text>
          <Text style={styles.recordingInfoSubtext}>{currentCategory}</Text>
        </View>
      )}
    </View>
  );
};

export default CurrentWorkRecord;