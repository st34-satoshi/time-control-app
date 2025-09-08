import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { styles } from '@root/src/components/report/List.styles';
import { CategoryManager } from '@domain/Category';

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  type?: string;
};

interface ListProps {
  timeRecords: TimeRecordDataForGet[];
  categoryManager: CategoryManager | null;
  onRefresh: () => void;
}

const ReportList = (props: ListProps) => {
  const { timeRecords, categoryManager, onRefresh } = props;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      onRefresh();
    } catch (err) {
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

  const getCategoryIcon = (categoryId: string) => {
    if (!categoryManager) return '📋';
    const category = categoryManager.getAllCategories().find(cat => cat.id === categoryId);
    return category?.icon || '📋';
  };

  const getCategoryLabel = (categoryId: string) => {
    if (!categoryManager) return 'Unknown';
    const category = categoryManager.getAllCategories().find(cat => cat.id === categoryId);
    return category?.label || 'Unknown';
  };

  const renderTimeRecord = ({ item }: { item: TimeRecordDataForGet }) => (
    <View style={styles.recordItem}>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateTimeText}>{formatDateTime(item.startTime)}</Text>
        <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
      </View>
      
      <View style={styles.projectIconContainer}>
        <View style={styles.projectIcon}>
          <Text style={styles.projectIconText}>{getCategoryIcon(item.categoryId)}</Text>
        </View>
      </View>
      
      <View style={styles.projectInfoContainer}>
        <Text style={styles.projectName}>{getCategoryLabel(item.categoryId)}</Text>
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
            onRefresh={handleRefresh}
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

export default ReportList; 