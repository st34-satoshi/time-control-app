import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { pastWorkStyles as styles } from '@components/PastWorkRecord.styles';
import { FirestoreService } from '@services/firestoreService';
import { useAuth } from '@contexts/AuthContext';
import { CategoryManager } from '@app-types/Category';

const PastWorkRecord = () => {
  const { user } = useAuth();
  
  // Past recording form
  const [pastTask, setPastTask] = useState('');
  const [pastCategory, setPastCategory] = useState('');
  const [pastDate, setPastDate] = useState('');
  const [pastStartTime, setPastStartTime] = useState('');
  const [pastEndTime, setPastEndTime] = useState('');

  // Initialize past date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setPastDate(formattedDate);
  }, []);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Save past record to Firestore
  const savePastRecord = async () => {
    if (!pastTask.trim() || !pastCategory.trim() || !pastDate || !pastStartTime || !pastEndTime) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }
    
    const start = new Date(`${pastDate}T${pastStartTime}`);
    const end = new Date(`${pastDate}T${pastEndTime}`);
    
    if (end <= start) {
      Alert.alert('エラー', '終了時間は開始時間より後にしてください');
      return;
    }
    
    try {
      await FirestoreService.saveTimeRecord({
        task: pastTask,
        category: pastCategory,
        startTime: start,
        endTime: end,
      }, user.uid);
      
      const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
      Alert.alert(
        '記録保存完了！',
        `タスク: ${pastTask}\nカテゴリ: ${pastCategory}\n時間: ${formatTime(duration)}\n\n保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving past record:', error);
    }
    
    // Reset form
    setPastTask('');
    setPastCategory('');
    setPastStartTime('');
    setPastEndTime('');
  };

  const renderCategoryOptions = () => {
    return CategoryManager.getAllCategories().map((category) => (
      <TouchableOpacity
        key={category.value}
        style={[
          styles.projectOption,
          pastCategory === category.value && styles.projectOptionSelected
        ]}
        onPress={() => setPastCategory(category.value)}
      >
        <Text style={[
          styles.projectOptionText,
          pastCategory === category.value && styles.projectOptionTextSelected
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>📝 過去の作業を記録</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📋 タスク内容</Text>
          <TextInput
            style={styles.textInput}
            value={pastTask}
            onChangeText={setPastTask}
            placeholder="何をしましたか？"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏷️ カテゴリ</Text>
          <View style={styles.projectOptionsContainer}>
            {renderCategoryOptions()}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 日付</Text>
          <TextInput
            style={styles.textInput}
            value={pastDate}
            onChangeText={setPastDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 開始時間</Text>
            <TextInput
              style={styles.textInput}
              value={pastStartTime}
              onChangeText={setPastStartTime}
              placeholder="09:00"
            />
          </View>
        
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 終了時間</Text>
            <TextInput
              style={styles.textInput}
              value={pastEndTime}
              onChangeText={setPastEndTime}
              placeholder="10:30"
            />
          </View>
        </View>
        
        {pastStartTime && pastEndTime && pastDate && (
          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>
              所要時間: <Text style={styles.durationValue}>
                {(() => {
                  const start = new Date(`${pastDate}T${pastStartTime}`);
                  const end = new Date(`${pastDate}T${pastEndTime}`);
                  if (end > start) {
                    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
                    return formatTime(duration);
                  }
                  return '--:--:--';
                })()}
              </Text>
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePastRecord}
        >
          <Text style={styles.saveButtonText}>💾 記録を保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PastWorkRecord;