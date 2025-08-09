import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { currentWorkStyles as styles } from '@components/CurrentWorkRecord.styles';
import { FirestoreService } from '@services/firestoreService';
import { useAuth } from '@contexts/AuthContext';
import { CategoryManager } from '@app-types/Category';

const CurrentWorkRecord = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Current recording form
  const [currentTask, setCurrentTask] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  
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
      await FirestoreService.saveTimeRecord({
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
    return CategoryManager.getAllCategories().map((category) => (
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
          {category.label}
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