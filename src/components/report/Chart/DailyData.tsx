import { View, Text } from 'react-native';
import { styles } from '@components/report/Chart/DailyData.styles';
import { TimeRecordDataForGet } from '@root/src/types/TimeRecord';
import { ScrollView, RefreshControl } from 'react-native';
import { ClockChart } from '@components/report/Chart/ClockChart';
import { CategoryBar } from '@components/report/Chart/CategoryBar';
import { TimeSlot } from '@root/src/types/TimeRecord';
import { DatePicker } from '@components/report/Chart/DatePicker';
import { useState, useEffect } from 'react';
import { CategoryManager } from '@domain/Category';
import { PRESET_COLORS } from '@app-types/Category';

export type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDurationSeconds: number;
  icon: string;
  color: string;
};

interface DailyDataProps {
  dateRange: {
    minDate: Date;
    maxDate: Date;
  };
  refreshing: boolean;
  handleRefresh: () => void;
  timeRecords: TimeRecordDataForGet[];
  onRefresh: () => void;
  categoryManager: CategoryManager | null;
}

export const DailyData = (
  { dateRange, 
  refreshing, handleRefresh, 
  timeRecords, onRefresh, categoryManager
  }: DailyDataProps) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filteredRecords, setFilteredRecords] = useState<TimeRecordDataForGet[]>([]); // 日付てフィルタリングされたデータ
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして0~24時までのデータにしたレコード
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]); // formattedTimeRecordsからカテゴリ別のデータを作成
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 日付が変更されたときにレコードをフィルタリング
  useEffect(() => {
    const filtered = filterRecordsByDate(timeRecords, selectedDate);
    setFilteredRecords(filtered);
  }, [timeRecords, selectedDate]);

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
      if (startTime > endOfDay) {
        continue;
      }
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

  // カテゴリ別の集計データを計算
  useEffect(() => {
    if (formattedTimeRecords.length > 0 && categoryManager) {
      const categoryMap = new Map<string, { totalDurationSeconds: number; categoryName: string; icon: string; color: string }>();
      
      formattedTimeRecords.forEach(record => {
        const category = record.category;
        const categoryName = category?.label || 'Unknown';
        const icon = category?.icon || '📋';
        const color = category?.color || '#3b82f6'; // デフォルトカラー
        
        if (categoryMap.has(record.category.id!)) {
          const existing = categoryMap.get(record.category.id!)!;
          existing.totalDurationSeconds += record.durationMinutes * 60;
        } else {
          categoryMap.set(record.category.id!, {
            totalDurationSeconds: record.durationMinutes * 60,
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
        totalDurationSeconds: data.totalDurationSeconds,
        icon: data.icon,
        color: data.color || fallbackColors[index % fallbackColors.length]
      }));

      // 時間の長い順にソート
      data.sort((a, b) => b.totalDurationSeconds - a.totalDurationSeconds);
      setCategoryData(data);
    } else {
      setCategoryData([]);
    }
  }, [formattedTimeRecords, categoryManager]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // 日付が有効な範囲内かチェック
      const { minDate, maxDate } = dateRange;
      if (selectedDate >= minDate && selectedDate <= maxDate) {
        setSelectedDate(selectedDate);
        onRefresh();
      }
    }
  };

  // 前日に移動
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    
    const { minDate, maxDate } = dateRange;
    if (previousDay >= minDate && previousDay <= maxDate) {
      setSelectedDate(previousDay);
      onRefresh();
    }
  };

  // 後日に移動
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const { minDate, maxDate } = dateRange;
    if (nextDay >= minDate && nextDay <= maxDate) {
      setSelectedDate(nextDay);
      onRefresh();
    }
  };

  const getTotalDurationMinutes = () => {
    return formattedTimeRecords.reduce((total, record) => total + record.durationMinutes, 0);
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (filteredRecords.length === 0) {
    return (

      <View>
        <DatePicker
          goToPreviousDay={goToPreviousDay}
          goToNextDay={goToNextDay}
          setShowDatePicker={setShowDatePicker}
          selectedDate={selectedDate}
          showDatePicker={showDatePicker}
          onDateChange={onDateChange}
          dateRange={dateRange}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>記録されたデータがありません</Text>
          <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <DatePicker
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        setShowDatePicker={setShowDatePicker}
        selectedDate={selectedDate}
        showDatePicker={showDatePicker}
        onDateChange={onDateChange}
        dateRange={dateRange}
      />
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
          <Text style={styles.summaryDuration}>{formatDuration(getTotalDurationMinutes() * 60)}</Text>
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
    </View>
  );
};