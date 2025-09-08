import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '@root/src/components/report/ClockChart.styles';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { DailyTimePie } from '@components/report/DailyTimePie';

type TimeSlot = {
  hour: number;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  task: string;
  hasRecord: boolean;
  duration: number;
};

interface ClockChartProps {
  timeRecords: TimeRecordDataForGet[];
  categoryManager: CategoryManager | null;
}

const ClockChart = ({ timeRecords, categoryManager }: ClockChartProps) => {
  // 24時間の時間スロットを初期化
  const initializeTimeSlots = (): TimeSlot[] => {
    return Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      categoryId: null,
      categoryName: '記録なし',
      categoryIcon: '⏰',
      categoryColor: '#e5e7eb',
      task: '',
      hasRecord: false,
      duration: 0,
    }));
  };

  // 時間スロットに記録データをマッピング
  const mapRecordsToTimeSlots = (records: TimeRecordDataForGet[]): TimeSlot[] => {
    const timeSlots = initializeTimeSlots();
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

    records.forEach((record, recordIndex) => {
      const startTime = new Date(record.startTime.seconds * 1000);
      const endTime = new Date(record.endTime.seconds * 1000);
      const startHour = startTime.getHours();
      const endHour = endTime.getHours();

      const category = categoryManager?.getAllCategories().find(cat => cat.id === record.categoryId);
      const categoryName = category?.label || 'Unknown';
      const categoryIcon = category?.icon || '📋';
      const categoryColor = colors[recordIndex % colors.length];

      // 記録が複数時間にまたがる場合の処理
      for (let hour = startHour; hour <= endHour; hour++) {
        if (hour >= 0 && hour < 24) {
          // その時間内での作業時間を計算
          const hourStart = new Date(startTime);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(startTime);
          hourEnd.setHours(hour + 1, 0, 0, 0);
          
          const actualStart = startTime > hourStart ? startTime : hourStart;
          const actualEnd = endTime < hourEnd ? endTime : hourEnd;
          const duration = Math.max(0, (actualEnd.getTime() - actualStart.getTime()) / 1000);

          timeSlots[hour] = {
            hour,
            categoryId: record.categoryId,
            categoryName,
            categoryIcon,
            categoryColor,
            task: record.task,
            hasRecord: true,
            duration,
          };
        }
      }
    });

    return timeSlots;
  };

  const timeSlots = mapRecordsToTimeSlots(timeRecords);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // 時間レコードをSegment形式に変換
  const convertToSegments = (records: TimeRecordDataForGet[]) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    
    return records.map((record, index) => {
      const startTime = new Date(record.startTime.seconds * 1000);
      const endTime = new Date(record.endTime.seconds * 1000);
      
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      const category = categoryManager?.getAllCategories().find(cat => cat.id === record.categoryId);
      const categoryName = category?.label || 'Unknown';
      const categoryIcon = category?.icon || '📋';
      
      return {
        label: `${categoryIcon} ${categoryName}`,
        start: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        end: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        color: colors[index % colors.length],
      };
    });
  };

  const segments = convertToSegments(timeRecords);

  // 記録された時間スロットを取得
  const recordedSlots = timeSlots.filter(slot => slot.hasRecord);
  const totalRecordedTime = recordedSlots.reduce((total, slot) => total + slot.duration, 0);

  // const segments = [
  //   { label: '就寝', start: '23:30', end: '08:00', color: '#1f5d8f' },
  //   { label: '朝食', start: '08:00', end: '09:00', color: '#6aa6df' },
  //   { label: '仕事', start: '09:00', end: '12:30', color: '#e6813a' },
  //   { label: '休憩', start: '12:30', end: '13:30', color: '#9e9e9e' },
  //   { label: '仕事', start: '13:30', end: '18:30', color: '#f0b21a' },
  //   { label: '夕食', start: '18:30', end: '19:30', color: '#5fa6e0' },
  //   { label: '自由', start: '19:30', end: '23:30', color: '#6ab04c' },
  // ];

  return (
    <View style={styles.clockContainer}>
      <Text style={styles.clockTitle}>24時間の生活時間</Text>
      
      {/* SVG円グラフ */}
      <View style={styles.pieChartContainer}>
        <DailyTimePie
          size={240}
          startAt="00:00"
          segments={segments}
        />
      </View>

      {/* 時間別詳細リスト */}
      <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
        <Text style={styles.timeListTitle}>時間別詳細</Text>
        
        {/* 記録ありの時間 */}
        {recordedSlots.map((slot, index) => (
          <View key={index} style={styles.timeItem}>
            <View style={styles.timeItemLeft}>
              <View style={[styles.timeColor, { backgroundColor: slot.categoryColor }]} />
              <View style={styles.timeInfo}>
                <Text style={styles.timeHour}>{formatTime(slot.hour)}</Text>
                <Text style={styles.timeCategory}>
                  {slot.categoryIcon} {slot.categoryName}
                </Text>
                {slot.task && (
                  <Text style={styles.timeTask} numberOfLines={1}>
                    {slot.task}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.timeDuration}>
              {formatDuration(slot.duration)}
            </Text>
          </View>
        ))}
        
        {/* 記録なしの時間（まとめて表示） */}
        {timeSlots.filter(slot => !slot.hasRecord).length > 0 && (
          <View style={styles.timeItem}>
            <View style={styles.timeItemLeft}>
              <View style={[styles.timeColor, { backgroundColor: '#e5e7eb' }]} />
              <View style={styles.timeInfo}>
                <Text style={styles.timeHour}>記録なし</Text>
                <Text style={styles.timeCategory}>
                  ⏰ その他の時間
                </Text>
              </View>
            </View>
            <Text style={styles.timeDuration}>
              {formatDuration(24 * 3600 - totalRecordedTime)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ClockChart;
