import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { FirestoreService } from '@services/firestoreService';
import { TimeRecordData } from '../types/TimeRecord';
import { styles } from './Report.styles';

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  type?: string; // 任意（ある場合のみ）
};

const Report = () => {
  const { user } = useAuth();
  const [timeRecords, setTimeRecords] = useState<TimeRecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTimeRecords();
    }
  }, [user]);

  const loadTimeRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await FirestoreService.getTimeRecords(user!.uid);
      // start_timeでソート（新しい順）
      const sortedRecords = records.sort((a, b) => {
        return b.startTime.seconds - a.startTime.seconds; // 降順（新しい順）
      });
      setTimeRecords(sortedRecords);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Error loading time records:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: FirestoreTimestamp) => {
    const d = new Date(date.seconds * 1000);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryIcon = (category: string) => {
    // TODO: アイコンを取得する
    // return category.charAt(0).toUpperCase();
    return '🔥';
  };

  const renderTimeRecord = ({ item }: { item: TimeRecordData }) => (
    <View style={styles.recordItem}>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateTimeText}>{formatDateTime(item.startTime)}</Text>
        <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
      </View>
      
      <View style={styles.projectIconContainer}>
        <View style={styles.projectIcon}>
          <Text style={styles.projectIconText}>{getCategoryIcon(item.category)}</Text>
        </View>
      </View>
      
      <View style={styles.projectInfoContainer}>
        <Text style={styles.projectName}>{item.category}</Text>
        <Text style={styles.taskText} numberOfLines={2}>{item.task}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (timeRecords.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>記録されたデータがありません</Text>
        <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={timeRecords}
      renderItem={renderTimeRecord}
      keyExtractor={(item) => item.id || item.startTime.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default Report; 