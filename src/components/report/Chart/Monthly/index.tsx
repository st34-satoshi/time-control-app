import { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { TimeSlot } from '@root/src/types/TimeRecord';
import { FormatTimeRecords } from '@domain/Report/Chart/TimeRecordFormatter';
import { useEffect } from "react";
import { TimeRecordDataForGet } from '@root/src/types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { MonthPicker } from './MonthPicker';
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

interface MonthlyDataProps {
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

export const MonthlyData = (
  { dateRange, 
  refreshing, handleRefresh, 
  timeRecords, onRefresh, categoryManager
  }: MonthlyDataProps) => {
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして指定した期間のデータにしたレコード
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    today.setDate(10);
    return today;
  }); // 31日などは怪しいので10日を設定する
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]); // formattedTimeRecordsからカテゴリ別のデータを作成

  // 前月に移動
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    newDate.setDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate()); // 今月の最終日を取得
    newDate.setHours(23, 59, 59, 999);
    if (newDate >= dateRange.minDate) {
      newDate.setDate(10);
      setSelectedMonth(newDate);
      onRefresh();
    }
  };

  // 翌月に移動
  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(1);
    newDate.setHours(0, 0, 0, 0);
    if (newDate <= dateRange.maxDate) {
      newDate.setDate(10);
      setSelectedMonth(newDate);
      onRefresh();
    }
  };

  useEffect(() => {
    // 月の最初の日と最後の日を計算
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const formattedRecords = FormatTimeRecords(timeRecords, categoryManager, startOfMonth, endOfMonth);
    setFormattedTimeRecords(formattedRecords);
  }, [timeRecords, selectedMonth, categoryManager]);

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
    const totalSeconds = getMonthTotalHours() * 3600; // その月の総秒数
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

  // 月の総時間を計算（その月の日数 × 24時間）
  const getMonthTotalHours = () => {
    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    return daysInMonth * 24;
  };

  if (formattedTimeRecords.length === 0) {
    return (
      <View>
        <MonthPicker
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          selectedMonth={selectedMonth}
        />
        <EmptyData />
      </View>
    );
  }

  return (
    <View>
      <MonthPicker
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        selectedMonth={selectedMonth}
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
          <Text style={styles.summaryTitle}>
            {selectedMonth.getMonth() + 1}月({getMonthTotalHours()}時間)の記録時間合計
          </Text>
          <Text style={styles.summaryDuration}>
            {formatDuration(getTotalDurationMinutes() * 60)} ({((getTotalDurationMinutes() * 60) / (getMonthTotalHours() * 3600) * 100).toFixed(1)}%)
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
