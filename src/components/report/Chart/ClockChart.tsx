import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '@root/src/components/report/Chart/ClockChart.styles';
import { TimePie } from '@root/src/components/report/Chart/TimePie';
import { TimeSlot } from '@app-types/TimeRecord';

interface ClockChartProps {
  formattedTimeRecords: TimeSlot[];
}

export const ClockChart = ({ formattedTimeRecords }: ClockChartProps) => {

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
        <TimePie
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
