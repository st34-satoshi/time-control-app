import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '@root/src/components/report/ClockChart.styles';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { DailyTimePie } from '@components/report/DailyTimePie';
import { useState, useEffect } from 'react';
import { Category } from '@app-types/Category';

type TimeSlot = {
  category: Category;
  categoryColor: string;
  startTime: Date;
  endTime: Date;
  task: string;
  durationMinutes: number;
};

interface ClockChartProps {
  timeRecords: TimeRecordDataForGet[]; // その日の時間が含まれるレコード
  categoryManager: CategoryManager | null;
  date: Date;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const ClockChart = ({ timeRecords, categoryManager, date }: ClockChartProps) => {
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして0~24時までのデータにしたレコード

  useEffect(() => {
    // 時間順にソート
    const sortedRecords = [...timeRecords].sort((a, b) => a.startTime.seconds - b.startTime.seconds);
    
    const formattedRecords: TimeSlot[] = [];
    let lastTime = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
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
      const category = categoryManager?.getAllCategories().find(cat => cat.id === record.categoryId) || { id: '', value: 'Unknown', label: 'Unknown', icon: '📋' };
      formattedRecords.push({
        category,
        categoryColor: COLORS[i % COLORS.length],
        startTime,
        endTime,
        task: record.task,
        durationMinutes: (endTime.getTime() - startTime.getTime()) / 1000 / 60
      });
      lastTime = endTime;
    }
    setFormattedTimeRecords(formattedRecords);
  }, [timeRecords]);

  const formatDurationMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 時間レコードをSegment形式に変換
  const convertToSegments = (timeSlots: TimeSlot[]) => {
    return timeSlots.map((slot, index) => {
      const startTime = slot.startTime;
      const endTime = slot.endTime;
      
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      const categoryName = slot.category?.label || 'Unknown';
      const categoryIcon = slot.category?.icon || '📋';
      
      return {
        label: `${categoryIcon} ${categoryName}`,
        start: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        end: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        color: slot.categoryColor,
      };
    });
  };

  const segments = convertToSegments(formattedTimeRecords);

  // 記録された時間スロットを取得
  const totalRecordedMinutes = formattedTimeRecords.reduce((total, slot) => total + slot.durationMinutes, 0);

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
        {formattedTimeRecords.map((slot, index) => (
          <View key={index} style={styles.timeItem}>
            <View style={styles.timeItemLeft}>
              <View style={[styles.timeColor, { backgroundColor: slot.categoryColor }]} />
              <View style={styles.timeInfo}>
                <Text style={styles.timeCategory}>
                  {slot.category.icon} {slot.category.label}
                </Text>
                {slot.task && (
                  <Text style={styles.timeTask} numberOfLines={1}>
                    {slot.task}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.timeDuration}>
              {formatDurationMinutes(slot.durationMinutes)}
            </Text>
          </View>
        ))}
        
        {/* 記録なしの時間（まとめて表示） */}
        {formattedTimeRecords.length > 0 && (
          <View style={styles.timeItem}>
            <View style={styles.timeItemLeft}>
              <View style={[styles.timeColor, { backgroundColor: '#e5e7eb' }]} />
              <View style={styles.timeInfo}>
                <Text style={styles.timeCategory}>
                  ⏰ 記録のない時間
                </Text>
              </View>
            </View>
            <Text style={styles.timeDuration}>
              {formatDurationMinutes(24 * 60 - totalRecordedMinutes)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ClockChart;
