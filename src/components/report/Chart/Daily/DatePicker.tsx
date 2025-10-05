import DateTimePicker from '@react-native-community/datetimepicker';
import { View } from 'react-native';
import { styles } from '@root/src/components/report/Chart/Daily/DatePicker.styles';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native';


interface DatePickerProps {
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  setShowDatePicker: (show: boolean) => void;
  selectedDate: Date;
  showDatePicker: boolean;
  onDateChange: (event: any, selectedDate?: Date) => void;
  dateRange: {
    minDate: Date;
    maxDate: Date;
  };
}

export const DatePicker = ({ goToPreviousDay, goToNextDay, setShowDatePicker, selectedDate, showDatePicker, onDateChange, dateRange }: DatePickerProps) => {
  return (
    <View>
      <View style={styles.dateSelectorContainer}>
        <View style={styles.dateSelectorRow}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToPreviousDay}
          >
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              📅 {selectedDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToNextDay}
          >
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={dateRange.minDate}
            maximumDate={dateRange.maxDate}
          />
        )}
      </View>
    </View>
  );
};