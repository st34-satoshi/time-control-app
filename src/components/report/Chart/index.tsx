import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { TimeRecordDataForGet } from '../../../types/TimeRecord';
import { styles } from '@root/src/components/report/Chart/index.styles';
import { CategoryManager } from '@domain/Category';
import { PeriodType, PeriodSelector } from '@components/report/Chart/PeriodSelector';
import { DailyData } from '@components/report/Chart/DailyData';

interface ChartProps {
  timeRecords: TimeRecordDataForGet[];
  categoryManager: CategoryManager | null;
  onRefresh: () => void;
}

export const Chart = (props: ChartProps) => {
  const { timeRecords, categoryManager, onRefresh } = props;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day'); // 期間選択の状態

  // timeRecordsから日付の範囲を計算（メモ化）
  const dateRange = useMemo(() => {
    if (timeRecords.length === 0) {
      // データがない場合は今日を基準にした範囲を返す
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      minDate.setHours(0, 0, 0, 0);
      const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      maxDate.setHours(23, 59, 59, 999);
      return {
        minDate,
        maxDate
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

    const minDate = new Date(minTime);
    minDate.setHours(0, 0, 0, 0);
    const maxDate = new Date(maxTime);
    maxDate.setHours(23, 59, 59, 999);

    return {
      minDate,
      maxDate
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

  return (
    <View style={styles.container}>
      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        setSelectedPeriod={setSelectedPeriod} 
      />
      <DailyData 
        dateRange={dateRange}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        timeRecords={timeRecords}
        onRefresh={onRefresh}
        categoryManager={categoryManager}
      />
    </View>
  );
};
