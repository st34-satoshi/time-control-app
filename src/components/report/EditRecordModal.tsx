import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeRecordDataForGet, TimeRecordFormData } from '../../types/TimeRecord';
import { Category } from '../../types/Category';
import { CategoryManager } from '@domain/Category';
import { timeRecordService } from '../../services/firestore/timeRecordService';
import { useAuth } from '../../contexts/AuthContext';
import Categories from '../record/Categories';
import { styles } from './EditRecordModal.styles';

interface EditRecordModalProps {
  visible: boolean;
  record: TimeRecordDataForGet | null;
  categoryManager: CategoryManager | null;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  visible,
  record,
  categoryManager,
  userId,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TimeRecordFormData>({
    task: '',
    categoryId: '',
    startTime: new Date(),
    endTime: new Date(),
  });
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        task: record.task,
        categoryId: record.categoryId,
        startTime: new Date(record.startTime.seconds * 1000),
        endTime: new Date(record.endTime.seconds * 1000),
      });
      
      // Find and set the current category based on the record's categoryId
      if (categoryManager) {
        const categories = categoryManager.getAllCategories();
        const category = categories.find(cat => cat.id === record.categoryId);
        if (category) {
          setCurrentCategory(category);
        }
      }
    }
  }, [record, categoryManager]);

  // Update formData when currentCategory changes
  useEffect(() => {
    if (currentCategory) {
      setFormData(prev => ({
        ...prev,
        categoryId: currentCategory.id!,
      }));
    }
  }, [currentCategory]);

  const handleSave = async () => {
    if (!record ) {
      Alert.alert('エラー', 'レコードが存在しません');
      return;
    }

    if (!formData.categoryId) {
      Alert.alert('エラー', 'カテゴリを選択してください');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      Alert.alert('エラー', '終了時間は開始時間より後にしてください');
      return;
    }

    setLoading(true);
    try {
      await timeRecordService.updateTimeRecord(record.id, formData, userId);
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('エラー', 'レコードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!record) return;

    Alert.alert(
      '削除確認',
      'このレコードを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await timeRecordService.deleteTimeRecord(record.id, userId);
              onSave();
              onClose();
            } catch (error) {
              Alert.alert('エラー', 'レコードの削除に失敗しました');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  if (!record) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.title}>レコード編集</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* カテゴリ選択 */}
          <View style={styles.section}>
            <Text style={styles.label}>🏷️ カテゴリ</Text>
            <Categories
              userId={user?.uid}
              currentCategory={currentCategory?.value || ''}
              onCategorySelect={(category) => {
                setCurrentCategory(category);
              }}
            />
          </View>

          {/* タスク内容 */}
          <View style={styles.section}>
            <Text style={styles.label}>タスク内容</Text>
            <TextInput
              style={styles.textInput}
              value={formData.task}
              onChangeText={(text) => setFormData({ ...formData, task: text })}
              placeholder="タスク内容を入力"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* 開始時間 */}
          <View style={styles.section}>
            <Text style={styles.label}>開始時間</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDateTime(formData.startTime)}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={formData.startTime}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartTimePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, startTime: selectedDate });
                  }
                }}
              />
            )}
          </View>

          {/* 終了時間 */}
          <View style={styles.section}>
            <Text style={styles.label}>終了時間</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDateTime(formData.endTime)}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={formData.endTime}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndTimePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, endTime: selectedDate });
                  }
                }}
              />
            )}
          </View>

          {/* 削除ボタン */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>レコードを削除</Text>
          </TouchableOpacity>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default EditRecordModal;
