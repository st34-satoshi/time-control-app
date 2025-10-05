import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@components/report/Chart/DailyData.styles';
import { TimeRecordDataForGet } from '@root/src/types/TimeRecord';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView, RefreshControl } from 'react-native';
import { ClockChart } from '@components/report/Chart/ClockChart';
import { CategoryBar } from '@components/report/Chart/CategoryBar';
import { TimeSlot } from '@root/src/types/TimeRecord';

export type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDurationSeconds: number;
  icon: string;
  color: string;
};

interface DailyDataProps {
  filteredRecords: TimeRecordDataForGet[];
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
  refreshing: boolean;
  handleRefresh: () => void;
  formattedTimeRecords: TimeSlot[];
  categoryData: CategoryData[];
  formatDateForDisplay: (date: Date) => string;
  formatDuration: (duration: number) => string;
  getTotalDurationMinutes: () => number;
}

export const DailyData = (
  { filteredRecords, goToPreviousDay, goToNextDay, setShowDatePicker, selectedDate, showDatePicker, onDateChange, dateRange, 
  refreshing, handleRefresh, formattedTimeRecords, categoryData, formatDateForDisplay, formatDuration, getTotalDurationMinutes
  }: DailyDataProps) => {
  if (filteredRecords.length === 0) {
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
  }

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
          <Text style={styles.summaryTitle}>{formatDateForDisplay(selectedDate)}</Text>
          <Text style={styles.summaryDuration}>{formatDuration(getTotalDurationMinutes() * 60)}</Text>
        </View>

        <ClockChart 
          formattedTimeRecords={formattedTimeRecords}
        />

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>カテゴリ別作業時間</Text>
          <CategoryBar 
            categoryData={categoryData} 
          />
        </View>
      </ScrollView>
    </View>
  );
};