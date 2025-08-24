import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { styles } from '@components/report/Report.styles';
import { CategoryManager } from '@domain/Category';
import { Alert } from 'react-native';

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  type?: string;
};

const Report = () => {
  const { user } = useAuth();
  const [timeRecords, setTimeRecords] = useState<TimeRecordDataForGet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryManager, setCategoryManager] = useState<CategoryManager | null>(null);

  useEffect(() => {
    if (user && !categoryManager) {
      const createCategoryManager = async () => {
        const manager = await CategoryManager.create(user!.uid);
        setCategoryManager(manager);
      }
      createCategoryManager();
    }
  }, [user, categoryManager]);

  const fetchAndSortRecords = async () => {
    const records = await timeRecordService.getTimeRecords(user!.uid);
    const sortedRecords = records.sort((a, b) => {
      return b.startTime.seconds - a.startTime.seconds; // 降順（新しい順）
    });
    setTimeRecords(sortedRecords);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAndSortRecords();
    } catch (err) {
      Alert.alert('データの取得に失敗しました');
      console.error('Error refreshing time records:', err);
    } finally {
      setRefreshing(false);
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

  const getCategoryIcon = (categoryValue: string) => {
    console.log('categoryValue', categoryValue);
    console.log('user!.uid', user!.uid);
    return categoryManager?.getIconByValue(categoryValue);
  };

  const renderTimeRecord = ({ item }: { item: TimeRecordDataForGet }) => (
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

  if (timeRecords.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'empty'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>記録されたデータがありません</Text>
            <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
          </View>
        }
      />
    );
  }

  return (
  //   <Text>test</Text>
    <FlatList
      data={timeRecords}
      renderItem={renderTimeRecord}
      keyExtractor={(item) => item.id || item.startTime.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    />
  );
};

export default Report; 