import { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { TimeSlot } from '@root/src/types/TimeRecord';
import { FormatTimeRecords } from '@domain/Report/Chart/TimeRecordFormatter';
import { useEffect } from "react";
import { TimeRecordDataForGet } from '@root/src/types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { WeekPicker } from '@components/report/Chart/Weekly/WeekPicker';
import { EmptyData } from '@components/report/Chart/common/EmptyData';
import { PieChart, PieChartData } from '@root/src/components/report/Chart/common/PieChart';
import { PRESET_COLORS } from '@app-types/Category';
import { styles } from './index.styles';

export type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDurationSeconds: number;
  icon: string;
  color: string;
};

interface WeeklyDataProps {
  dateRange: {
    minDate: Date;
    maxDate: Date;
  };
  refreshing: boolean;
  handleRefresh: () => void;
  timeRecords: TimeRecordDataForGet[];
  onRefresh: () => void;
  categoryManager: CategoryManager;
}

export const WeeklyData = (
  { dateRange, 
  refreshing, handleRefresh, 
  timeRecords, onRefresh, categoryManager
  }: WeeklyDataProps) => {
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして指定した期間のデータにしたレコード
  const [selectedWeekEndDate, setSelectedWeekEndDate] = useState(() => new Date());
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]); // formattedTimeRecordsからカテゴリ別のデータを作成

  // 一週間前のデータに移動
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeekEndDate);
    newDate.setDate(newDate.getDate() - 7);
    if (newDate >= dateRange.minDate) {
      setSelectedWeekEndDate(newDate);
      onRefresh();
    }
  };

  // 一週間後のデータに移動
  const goToNextWeek = () => {
    const newDate = new Date(selectedWeekEndDate);
    newDate.setDate(newDate.getDate() + 7);
    if (newDate <= dateRange.maxDate) {
      setSelectedWeekEndDate(newDate);
      onRefresh();
    }
  };

  // 週の終了日が変更されたときの処理
  const onWeekEndDateChange = (event: any, selectedDate?: Date) => {
    setShowWeekPicker(false);
    if (selectedDate) {
      setSelectedWeekEndDate(selectedDate);
      onRefresh();
    }
  };

  useEffect(() => {
    const startDay = new Date(selectedWeekEndDate);
    startDay.setDate(startDay.getDate() - 6);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(selectedWeekEndDate);
    endDay.setHours(23, 59, 59, 999);
    const formattedRecords = FormatTimeRecords(timeRecords, categoryManager, startDay, endDay);
    setFormattedTimeRecords(formattedRecords);
  }, [timeRecords, selectedWeekEndDate, categoryManager]);

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

  const getTotalDurationMinutes = () => {
    return formattedTimeRecords.reduce((total, record) => total + record.durationMinutes, 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // PieChart用のデータを生成
  const getPieChartData = (): PieChartData[] => {
    const totalSeconds = 60 * 60 * 24 * 7; // 1週間の総秒数
    const recordedSeconds = categoryData.reduce((total, item) => total + item.totalDurationSeconds, 0);
    const unrecordedSeconds = totalSeconds - recordedSeconds;

    const data = [
      ...categoryData.map(item => ({
        ...item,
        percentage: (item.totalDurationSeconds / totalSeconds) * 100
      }))
    ];

    // 記録なしの時間を追加
    if (unrecordedSeconds > 0) {
      data.push({
        categoryId: 'unrecorded',
        categoryName: '記録なし',
        totalDurationSeconds: unrecordedSeconds,
        icon: '⚪️',
        color: '#e5e7eb',
        percentage: (unrecordedSeconds / totalSeconds) * 100
      });
    }

    return data;
  };

  if (formattedTimeRecords.length === 0) {
    return (
      <View>
        <WeekPicker
          goToPreviousWeek={goToPreviousWeek}
          goToNextWeek={goToNextWeek}
          setShowWeekPicker={setShowWeekPicker}
          selectedWeekEndDate={selectedWeekEndDate}
          showWeekPicker={showWeekPicker}
          onWeekEndDateChange={onWeekEndDateChange}
          dateRange={dateRange}
        />
        <EmptyData />
      </View>
    );
  }

  return (
    <View>
      <WeekPicker
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
        setShowWeekPicker={setShowWeekPicker}
        selectedWeekEndDate={selectedWeekEndDate}
        showWeekPicker={showWeekPicker}
        onWeekEndDateChange={onWeekEndDateChange}
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
          <Text style={styles.summaryTitle}>1週間(168時間)の総作業時間</Text>
          <Text style={styles.summaryDuration}>
            {formatDuration(getTotalDurationMinutes() * 60)} ({((getTotalDurationMinutes() * 60) / (168 * 3600) * 100).toFixed(1)}%)
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>カテゴリ別作業時間</Text>
          <PieChart 
            data={getPieChartData()}
            size={250}
          />
        </View>
      </ScrollView>
    </View>
  );
};