import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { styles } from '@components/report/Chart.styles';
import { CategoryManager } from '@domain/Category';
import DateTimePicker from '@react-native-community/datetimepicker';
import ClockChart from '@components/report/ClockChart';

type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDuration: number;
  icon: string;
  color: string;
};

interface ChartProps {
  timeRecords: TimeRecordDataForGet[];
  categoryManager: CategoryManager | null;
  onRefresh: () => void;
}

const Chart = (props: ChartProps) => {
  const { timeRecords, categoryManager, onRefresh } = props;
  const [refreshing, setRefreshing] = useState(false);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecordDataForGet[]>([]);

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

  // 選択した日付でレコードをフィルタリング
  const filterRecordsByDate = (records: TimeRecordDataForGet[], date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return records.filter(record => {
      const recordStartDate = new Date(record.startTime.seconds * 1000);
      const recordEndDate = new Date(record.endTime.seconds * 1000);
      return recordStartDate <= endOfDay && recordEndDate >= startOfDay;
    });
  };

  // 日付が変更されたときにレコードをフィルタリング
  useEffect(() => {
    const filtered = filterRecordsByDate(timeRecords, selectedDate);
    setFilteredRecords(filtered);
  }, [timeRecords, selectedDate]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDateForDisplay = (date: Date) => {
    if (isToday(date)) {
      return '今日の総作業時間';
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日の総作業時間`;
  };

  // カテゴリ別の集計データを計算
  useEffect(() => {
    if (filteredRecords.length > 0 && categoryManager) {
      const categoryMap = new Map<string, { totalDuration: number; categoryName: string; icon: string }>();
      
      filteredRecords.forEach(record => {
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
    } else {
      setCategoryData([]);
    }
  }, [filteredRecords, categoryManager]);

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
    const totalDayTime = 24 * 3600; // 24時間を秒で表現
    const totalRecordedTime = getTotalDuration();
    const unrecordedTime = Math.max(0, totalDayTime - totalRecordedTime);
    
    // 記録された時間の割合（24時間全体に対する）
    const recordedPercentage = totalDayTime > 0 ? (category.totalDuration / totalDayTime) * 100 : 0;
    
    return (
      <View key={`category-${category.categoryId}-${index}`} style={styles.categoryItem}>
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
                width: `${recordedPercentage}%`,
                backgroundColor: category.color
              }
            ]} 
          />
        </View>
        
        <Text style={styles.percentageText}>{recordedPercentage.toFixed(1)}%</Text>
      </View>
    );
  };

  if (filteredRecords.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.dateSelectorContainer}>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              📅 {selectedDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>記録されたデータがありません</Text>
          <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateSelectorText}>
            📅 {selectedDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{formatDateForDisplay(selectedDate)}</Text>
          <Text style={styles.summaryDuration}>{formatDuration(getTotalDuration())}</Text>
        </View>

        <ClockChart 
          timeRecords={filteredRecords} 
          categoryManager={categoryManager} 
        />

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>カテゴリ別作業時間</Text>
          {categoryData.map((category, index) => renderCategoryBar(category, index))}
        </View>
      </ScrollView>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default Chart;
