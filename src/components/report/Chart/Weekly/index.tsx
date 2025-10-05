import { useState } from "react";
import { View, Text } from "react-native";
import { TimeSlot } from '@root/src/types/TimeRecord';
import { FormatTimeRecords } from '@domain/Report/Chart/TimeRecordFormatter';
import { useEffect } from "react";
import { TimeRecordDataForGet } from '@root/src/types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { WeekPicker } from '@components/report/Chart/Weekly/WeekPicker';
import { EmptyData } from '@components/report/Chart/common/EmptyData';

interface WeeklyDataProps {
  timeRecords: TimeRecordDataForGet[];
  categoryManager: CategoryManager;
  dateRange: {
    minDate: Date;
    maxDate: Date;
  };
}

export const WeeklyData = ({ timeRecords, categoryManager, dateRange }: WeeklyDataProps) => {
  const [formattedTimeRecords, setFormattedTimeRecords] = useState<TimeSlot[]>([]); // 時間の重複などをなくして指定した期間のデータにしたレコード
  const [selectedWeekEndDate, setSelectedWeekEndDate] = useState(() => new Date());
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  // 一週間前のデータに移動
  const goToPreviousWeek = () => {
    console.log('goToPreviousWeek');
    console.log(dateRange);
    const newDate = new Date(selectedWeekEndDate);
    newDate.setDate(newDate.getDate() - 7);
    if (newDate >= dateRange.minDate) {
      setSelectedWeekEndDate(newDate);
    }
  };

  // 一週間後のデータに移動
  const goToNextWeek = () => {
    const newDate = new Date(selectedWeekEndDate);
    newDate.setDate(newDate.getDate() + 7);
    if (newDate <= dateRange.maxDate) {
      setSelectedWeekEndDate(newDate);
    }
  };

  // 週の終了日が変更されたときの処理
  const onWeekEndDateChange = (event: any, selectedDate?: Date) => {
    setShowWeekPicker(false);
    if (selectedDate) {
      setSelectedWeekEndDate(selectedDate);
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
      <Text>WeeklyData</Text>
    </View>
  );
};