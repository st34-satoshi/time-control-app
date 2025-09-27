import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { styles } from '@components/report/Chart.styles';
import { CategoryManager } from '@domain/Category';
import DateTimePicker from '@react-native-community/datetimepicker';
import ClockChart from '@components/report/ClockChart';
import { CategoryBar } from '@components/report/CategoryBar';
import { PRESET_COLORS } from '@app-types/Category';
import { TimeSlot } from '@app-types/TimeRecord';

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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecordDataForGet[]>([]); // 日付てフィルタリングされたデータ
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして0~24時までのデータにしたレコード

  // timeRecordsから日付の範囲を計算（メモ化）
  const dateRange = useMemo(() => {
    if (timeRecords.length === 0) {
      // データがない場合は今日を基準にした範囲を返す
      const today = new Date();
      return {
        minDate: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
        maxDate: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      };
    }

    let minTime = Number.MAX_SAFE_INTEGER;
    let maxTime = Number.MIN_SAFE_INTEGER;

    timeRecords.forEach(record => {
      const startTime = record.startTime.seconds * 1000;
      const endTime = record.endTime.seconds * 1000;
      
      minTime = Math.min(minTime, startTime);
      maxTime = Math.max(maxTime, endTime);
    });

    return {
      minDate: new Date(minTime),
      maxDate: new Date(maxTime)
    };
  }, [timeRecords]);

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
      // 日付が有効な範囲内かチェック
      const { minDate, maxDate } = dateRange;
      if (selectedDate >= minDate && selectedDate <= maxDate) {
        setSelectedDate(selectedDate);
      }
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
      const categoryMap = new Map<string, { totalDuration: number; categoryName: string; icon: string; color: string }>();
      
      filteredRecords.forEach(record => {
        const category = categoryManager.getAllCategories().find(cat => cat.id === record.categoryId);
        const categoryName = category?.label || 'Unknown';
        const icon = category?.icon || '📋';
        const color = category?.color || '#3b82f6'; // デフォルトカラー
        
        if (categoryMap.has(record.categoryId)) {
          const existing = categoryMap.get(record.categoryId)!;
          existing.totalDuration += record.duration;
        } else {
          categoryMap.set(record.categoryId, {
            totalDuration: record.duration,
            categoryName,
            icon,
            color
          });
        }
      });

      // フォールバック用の色配列（カテゴリに色が設定されていない場合）
      const fallbackColors = PRESET_COLORS;
      
      const data: CategoryData[] = Array.from(categoryMap.entries()).map(([categoryId, data], index) => ({
        categoryId,
        categoryName: data.categoryName,
        totalDuration: data.totalDuration,
        icon: data.icon,
        color: data.color || fallbackColors[index % fallbackColors.length]
      }));

      // 時間の長い順にソート
      data.sort((a, b) => b.totalDuration - a.totalDuration);
      setCategoryData(data);
    } else {
      setCategoryData([]);
    }
  }, [filteredRecords, categoryManager]);

  // formattedTimeRecordsを作成
  useEffect(() => {
    // 時間順にソート
    const sortedRecords = [...timeRecords].sort((a, b) => a.startTime.seconds - b.startTime.seconds);
    
    const formattedRecords: TimeSlot[] = [];
    let lastTime = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
    for (let i = 0; i < sortedRecords.length; i++) {
      const record = sortedRecords[i];
      let startTime = new Date(record.startTime.seconds * 1000);
      let endTime = new Date(record.endTime.seconds * 1000);
      if (endTime > endOfDay) {
        endTime = endOfDay;
      }
      if (endTime < lastTime) {
        continue;
      }
      if (startTime < lastTime) {
        startTime = lastTime;
      }
      const category = categoryManager?.getAllCategories().find(cat => cat.id === record.categoryId) || { id: '', value: 'Unknown', label: 'Unknown', icon: '📋', color: '#3b82f6' };
      formattedRecords.push({
        category,
        categoryColor: category.color || PRESET_COLORS[i % PRESET_COLORS.length],
        startTime,
        endTime,
        task: record.task,
        durationMinutes: (endTime.getTime() - startTime.getTime()) / 1000 / 60
      });
      lastTime = endTime;
    }
    setFormattedTimeRecords(formattedRecords);
  }, [timeRecords]);

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
            minimumDate={dateRange.minDate}
            maximumDate={dateRange.maxDate}
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
          formattedTimeRecords={formattedTimeRecords}
        />

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>カテゴリ別作業時間</Text>
          <CategoryBar 
            categoryData={categoryData} 
          />
        </View>
      </ScrollView>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={dateRange.minDate}
          maximumDate={dateRange.maxDate}
        />
      )}
    </View>
  );
};

export default Chart;
