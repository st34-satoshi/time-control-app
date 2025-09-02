import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { pastWorkStyles as styles } from '@components/record/PastWorkRecord.styles';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { useAuth } from '@contexts/AuthContext';
import Categories from '@components/record/Categories';

const PastWorkRecord = () => {
  const { user } = useAuth();
  
  // Past recording form
  const [pastTask, setPastTask] = useState('');
  const [pastCategory, setPastCategory] = useState('');
  const [pastStartDateTime, setPastStartDateTime] = useState<Date | null>(null);
  const [pastEndDateTime, setPastEndDateTime] = useState<Date | null>(null);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to format date time to readable format
  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  // Save past record to Firestore
  const savePastRecord = async () => {
    if (!pastCategory.trim()) {
      Alert.alert('エラー', 'カテゴリを選択してください');
      return;
    }
    if (!pastStartDateTime) {
      Alert.alert('エラー', '開始時間を選択してください');
      return;
    }
    if (!pastEndDateTime) {
      Alert.alert('エラー', '終了時間を選択してください');
      return;
    }
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }
    
    if (pastEndDateTime <= pastStartDateTime) {
      Alert.alert('エラー', '終了時間は開始時間より後にしてください');
      return;
    }
    
    try {
      await timeRecordService.saveTimeRecord({
        task: pastTask,
        category: pastCategory,
        startTime: pastStartDateTime,
        endTime: pastEndDateTime,
      }, user.uid);
      
      const duration = Math.floor((pastEndDateTime.getTime() - pastStartDateTime.getTime()) / 1000);
      Alert.alert(
        '記録を保存しました！',
        `タスク: ${pastTask}\nカテゴリ: ${pastCategory}\n時間: ${formatTime(duration)}\n\n保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving past record:', error);
    }
    
    // Reset form
    setPastTask('');
    setPastCategory('');
    setPastStartDateTime(null);
    setPastEndDateTime(null);
  };

  // DateTime picker states
  const [isStartDateTimePickerVisible, setStartDateTimePickerVisibility] = useState(false);
  const [isEndDateTimePickerVisible, setEndDateTimePickerVisibility] = useState(false);

  const showStartDateTimePicker = () => {
    setStartDateTimePickerVisibility(true);
  };

  const hideStartDateTimePicker = () => {
    setStartDateTimePickerVisibility(false);
  };

  const showEndDateTimePicker = () => {
    setEndDateTimePickerVisibility(true);
  };

  const hideEndDateTimePicker = () => {
    setEndDateTimePickerVisibility(false);
  };

  const handleStartDateTimeConfirm = (dateTime: Date) => {
    setPastStartDateTime(dateTime);
    
    // Auto-sync end date to match start date, but preserve time if already set
    if (pastEndDateTime) {
      const newEndDateTime = new Date(dateTime);
      newEndDateTime.setHours(pastEndDateTime.getHours());
      newEndDateTime.setMinutes(pastEndDateTime.getMinutes());
      setPastEndDateTime(newEndDateTime);
    }
    
    hideStartDateTimePicker();
  };

  const handleEndDateTimeConfirm = (dateTime: Date) => {
    setPastEndDateTime(dateTime);
    hideEndDateTimePicker();
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
          <Categories
            userId={user?.uid}
            currentCategory={pastCategory}
            onCategorySelect={setPastCategory}
          />
        </View>
        
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 開始日時</Text>
            <TouchableOpacity style={styles.textInput} onPress={showStartDateTimePicker}>
              <Text style={pastStartDateTime ? styles.dateText : styles.placeholderText}>
                {pastStartDateTime ? formatDateTime(pastStartDateTime) : 'YYYY-MM-DD HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>🕐 終了日時</Text>
            <TouchableOpacity style={styles.textInput} onPress={showEndDateTimePicker}>
              <Text style={pastEndDateTime ? styles.dateText : styles.placeholderText}>
                {pastEndDateTime ? formatDateTime(pastEndDateTime) : 'YYYY-MM-DD HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start DateTime Picker */}
        <DateTimePickerModal
          isVisible={isStartDateTimePickerVisible}
          mode="datetime"
          onConfirm={handleStartDateTimeConfirm}
          onCancel={hideStartDateTimePicker}
          is24Hour={true}
          locale="ja"
          confirmTextIOS="決定"
          cancelTextIOS="キャンセル"
          maximumDate={new Date()} // 今日以前の日時のみ選択可能
        />

        {/* End DateTime Picker */}
        <DateTimePickerModal
          isVisible={isEndDateTimePickerVisible}
          mode="datetime"
          onConfirm={handleEndDateTimeConfirm}
          onCancel={hideEndDateTimePicker}
          is24Hour={true}
          locale="ja"
          confirmTextIOS="決定"
          cancelTextIOS="キャンセル"
          maximumDate={new Date()} // 今日以前の日時のみ選択可能
        />
        
        {pastStartDateTime && pastEndDateTime && (
          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>
              所要時間: <Text style={styles.durationValue}>
                {(() => {
                  if (pastEndDateTime > pastStartDateTime) {
                    const duration = Math.floor((pastEndDateTime.getTime() - pastStartDateTime.getTime()) / 1000);
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