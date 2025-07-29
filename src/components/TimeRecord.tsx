import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { styles } from '@components/TimeRecord.styles';
import { FirestoreService } from '@services/firestoreService';
import { useAuth } from '@contexts/AuthContext';

const TimeRecord = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Current recording form
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  
  // Past recording form
  const [pastTask, setPastTask] = useState('');
  const [pastProject, setPastProject] = useState('');
  const [pastStartTime, setPastStartTime] = useState('');
  const [pastEndTime, setPastEndTime] = useState('');
  
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
    if (!currentTask.trim() || !currentProject.trim()) {
      Alert.alert('エラー', 'タスクとプロジェクトを入力してください');
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
        project: currentProject,
        startTime,
        endTime,
      }, user.uid);
      
      Alert.alert(
        '記録完了！',
        `タスク: ${currentTask}\nプロジェクト: ${currentProject}\n時間: ${formatTime(elapsedTime)}\n\nFirestoreに保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving record:', error);
    }
    
    // Reset form
    setCurrentTask('');
    setCurrentProject('');
    setElapsedTime(0);
    setStartTime(null);
  };
  
  // Save past record to Firestore
  const savePastRecord = async () => {
    if (!pastTask.trim() || !pastProject.trim() || !pastStartTime || !pastEndTime) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }
    
    const start = new Date(`2025-06-29T${pastStartTime}`);
    const end = new Date(`2025-06-29T${pastEndTime}`);
    
    if (end <= start) {
      Alert.alert('エラー', '終了時間は開始時間より後にしてください');
      return;
    }
    
    try {
      await FirestoreService.saveTimeRecord({
        task: pastTask,
        project: pastProject,
        startTime: start,
        endTime: end,
      }, user.uid);
      
      const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
      Alert.alert(
        '記録保存完了！',
        `タスク: ${pastTask}\nプロジェクト: ${pastProject}\n時間: ${formatTime(duration)}\n\nFirestoreに保存されました！`
      );
    } catch (error) {
      Alert.alert('エラー', '記録の保存に失敗しました');
      console.error('Error saving past record:', error);
    }
    
    // Reset form
    setPastTask('');
    setPastProject('');
    setPastStartTime('');
    setPastEndTime('');
  };

  const projects = [
    { value: 'アプリ開発', label: '📱 アプリ開発' },
    { value: '勉強', label: '📚 勉強' },
    { value: '運動', label: '💪 運動' },
    { value: 'デザイン', label: '🎨 デザイン' },
    { value: '会議', label: '👥 会議' },
    { value: 'その他', label: '📋 その他' },
  ];

  const renderProjectOptions = () => {
    return projects.map((project) => (
      <TouchableOpacity
        key={project.value}
        style={[
          styles.projectOption,
          (currentProject === project.value || pastProject === project.value) && styles.projectOptionSelected
        ]}
        onPress={() => {
          if (activeTab === 'current') {
            setCurrentProject(project.value);
          } else {
            setPastProject(project.value);
          }
        }}
      >
        <Text style={[
          styles.projectOptionText,
          (currentProject === project.value || pastProject === project.value) && styles.projectOptionTextSelected
        ]}>
          {project.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.tabActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>
            🔴 現在の作業
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            📝 過去の作業
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'current' ? (
          /* Current Recording Tab */
          <View style={styles.tabContent}>
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
                <Text style={styles.label}>🏷️ プロジェクト</Text>
                <View style={styles.projectOptionsContainer}>
                  {renderProjectOptions()}
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
                <Text style={styles.recordingInfoSubtext}>{currentProject}</Text>
              </View>
            )}
          </View>
        ) : (
          /* Past Recording Tab */
          <View style={styles.tabContent}>
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
                <Text style={styles.label}>🏷️ プロジェクト</Text>
                <View style={styles.projectOptionsContainer}>
                  {renderProjectOptions()}
                </View>
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
              
              {pastStartTime && pastEndTime && (
                <View style={styles.durationDisplay}>
                  <Text style={styles.durationText}>
                    所要時間: <Text style={styles.durationValue}>
                      {(() => {
                        const start = new Date(`2025-06-29T${pastStartTime}`);
                        const end = new Date(`2025-06-29T${pastEndTime}`);
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
        )}
      </ScrollView>
    </View>
  );
};

export default TimeRecord; 