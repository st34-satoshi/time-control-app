import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@contexts/AuthContext';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { styles } from '@components/report/Chart.styles';
import { CategoryManager } from '@domain/Category';
import { Alert } from 'react-native';

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  type?: string;
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDuration: number;
  icon: string;
  color: string;
};

const Chart = () => {
  const { user } = useAuth();
  const [timeRecords, setTimeRecords] = useState<TimeRecordDataForGet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryManager, setCategoryManager] = useState<CategoryManager | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    if (user && !categoryManager) {
      const createCategoryManager = async () => {
        const manager = await CategoryManager.create(user!.uid);
        setCategoryManager(manager);
      }
      createCategoryManager();
    }
  }, [user, categoryManager]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const initializeData = async () => {
          // カテゴリマネージャーを再取得
          const manager = await CategoryManager.create(user!.uid);
          setCategoryManager(manager);
          // タイムレコードも取得
          await fetchAndSortRecords();
        }
        initializeData();
      }
    }, [user])
  );

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
      if (user) {
        const manager = await CategoryManager.create(user.uid);
        setCategoryManager(manager);
      }
      await fetchAndSortRecords();
    } catch (err) {
      Alert.alert('データの取得に失敗しました');
      console.error('Error refreshing time records:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // カテゴリ別の集計データを計算
  useEffect(() => {
    if (timeRecords.length > 0 && categoryManager) {
      const categoryMap = new Map<string, { totalDuration: number; categoryName: string; icon: string }>();
      
      timeRecords.forEach(record => {
        const category = categoryManager.getAllCategories().find(cat => cat.id === record.categoryId);
        const categoryName = category?.label || 'Unknown';
        const icon = category?.icon || '📋';
        
        if (categoryMap.has(record.categoryId)) {
          const existing = categoryMap.get(record.categoryId)!;
          existing.totalDuration += record.duration;
        } else {
          categoryMap.set(record.categoryId, {
            totalDuration: record.duration,
            categoryName,
            icon
          });
        }
      });

      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
      
      const data: CategoryData[] = Array.from(categoryMap.entries()).map(([categoryId, data], index) => ({
        categoryId,
        categoryName: data.categoryName,
        totalDuration: data.totalDuration,
        icon: data.icon,
        color: colors[index % colors.length]
      }));

      // 時間の長い順にソート
      data.sort((a, b) => b.totalDuration - a.totalDuration);
      setCategoryData(data);
    }
  }, [timeRecords, categoryManager]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = () => {
    return categoryData.reduce((total, category) => total + category.totalDuration, 0);
  };

  const renderCategoryBar = (category: CategoryData, index: number) => {
    const totalDuration = getTotalDuration();
    const percentage = totalDuration > 0 ? (category.totalDuration / totalDuration) * 100 : 0;
    
    return (
      <View key={category.categoryId} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.categoryName}</Text>
          </View>
          <Text style={styles.categoryDuration}>{formatDuration(category.totalDuration)}</Text>
        </View>
        
        <View style={styles.barContainer}>
          <View 
            style={[
              styles.bar, 
              { 
                width: `${percentage}%`,
                backgroundColor: category.color
              }
            ]} 
          />
        </View>
        
        <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  if (timeRecords.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <Text style={styles.emptyText}>記録されたデータがありません</Text>
        <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>総作業時間</Text>
        <Text style={styles.summaryDuration}>{formatDuration(getTotalDuration())}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>カテゴリ別作業時間</Text>
        {categoryData.map((category, index) => renderCategoryBar(category, index))}
      </View>
    </ScrollView>
  );
};

export default Chart;
