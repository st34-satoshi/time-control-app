import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '@components/report/Chart/Monthly/MonthPicker.styles';

interface MonthPickerProps {
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  selectedMonth: Date;
}

export const MonthPicker = ({ 
  goToPreviousMonth, 
  goToNextMonth, 
  selectedMonth, 
}: MonthPickerProps) => {
  // 月の範囲を表示するテキストを生成
  const getMonthRangeText = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    return `${year}年${month}月 (${daysInMonth}日間)`;
  };

  return (
    <View>
      <View style={styles.monthSelectorContainer}>
        <View style={styles.monthSelectorRow}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToPreviousMonth}
          >
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.monthSelector}>
            <Text style={styles.monthSelectorText}>
              📅 {selectedMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })}
            </Text>
            <Text style={styles.monthRangeText}>
              {getMonthRangeText(selectedMonth)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToNextMonth}
          >
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
