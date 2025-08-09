import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

  // Helper function to format date in JST (Japan Standard Time)
  const formatDateToJST = (date: Date) => {
    // Create a new date in JST (UTC+9)
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // Add 9 hours for JST
    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize past date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDateToJST(today);
    setPastDate(formattedDate);
  }, []);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to format time to HH:MM
  const formatTimeHHMM = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

  // Date picker state
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date: Date) => {
    const formattedDate = formatDateToJST(date);
    setPastDate(formattedDate);
    hideDatePicker();
  };

  // Time picker states
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (time: Date) => {
    const formattedTime = formatTimeHHMM(time);
    setPastStartTime(formattedTime);
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (time: Date) => {
    const formattedTime = formatTimeHHMM(time);
    setPastEndTime(formattedTime);
    hideEndTimePicker();
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
          <TouchableOpacity style={styles.textInput} onPress={showDatePicker}>
            <Text style={pastDate ? styles.dateText : styles.placeholderText}>
              {pastDate || 'YYYY-MM-DD'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()} // 今日以前の日付のみ選択可能
            locale="ja"
            confirmTextIOS="決定"
            cancelTextIOS="キャンセル"
          />
        </View>
        
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 開始時間</Text>
            <TouchableOpacity style={styles.textInput} onPress={showStartTimePicker}>
              <Text style={pastStartTime ? styles.dateText : styles.placeholderText}>
                {pastStartTime || '09:00'}
              </Text>
            </TouchableOpacity>
          </View>
        
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 終了時間</Text>
            <TouchableOpacity style={styles.textInput} onPress={showEndTimePicker}>
              <Text style={pastEndTime ? styles.dateText : styles.placeholderText}>
                {pastEndTime || '10:30'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Time Picker */}
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="time"
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
          is24Hour={true}
          locale="ja"
          confirmTextIOS="決定"
          cancelTextIOS="キャンセル"
        />

        {/* End Time Picker */}
        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="time"
          onConfirm={handleEndTimeConfirm}
          onCancel={hideEndTimePicker}
          is24Hour={true}
          locale="ja"
          confirmTextIOS="決定"
          cancelTextIOS="キャンセル"
        />
        
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