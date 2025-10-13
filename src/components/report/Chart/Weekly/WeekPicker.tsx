import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '@root/src/components/report/Chart/Weekly/WeekPicker.styles';

interface WeekPickerProps {
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  setShowWeekPicker: (show: boolean) => void;
  selectedWeekEndDate: Date;
  showWeekPicker: boolean;
  onWeekEndDateChange: (selectedDate: Date) => void;
  dateRange: {
    minDate: Date;
    maxDate: Date;
  };
}

export const WeekPicker = ({ 
  goToPreviousWeek, 
  goToNextWeek, 
  setShowWeekPicker, 
  selectedWeekEndDate, 
  showWeekPicker, 
  onWeekEndDateChange, 
  dateRange 
}: WeekPickerProps) => {
  // 一週間の開始日（7日前）を計算
  const getWeekStartDate = (endDate: Date) => {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    return startDate;
  };

  const weekStartDate = getWeekStartDate(selectedWeekEndDate);

  // 週の範囲を表示するテキストを生成
  const getWeekRangeText = (startDate: Date, endDate: Date) => {
    const startStr = startDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <View>
      <View style={styles.weekSelectorContainer}>
        <View style={styles.weekSelectorRow}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToPreviousWeek}
          >
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.weekSelector}
            onPress={() => setShowWeekPicker(true)}
          >
            <Text style={styles.weekSelectorText}>
              📅 {selectedWeekEndDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.weekRangeText}>
              {getWeekRangeText(weekStartDate, selectedWeekEndDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToNextWeek}
          >
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={showWeekPicker}
          mode="date"
          onConfirm={(selectedDate) => {
            setShowWeekPicker(false);
            onWeekEndDateChange(selectedDate);
          }}
          onCancel={() => setShowWeekPicker(false)}
          date={selectedWeekEndDate}
          minimumDate={dateRange.minDate}
          maximumDate={dateRange.maxDate}
          locale="ja"
          confirmTextIOS="決定"
          cancelTextIOS="キャンセル"
        />
      </View>
    </View>
  );
};
