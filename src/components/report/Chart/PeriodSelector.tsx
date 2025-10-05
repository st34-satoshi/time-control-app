import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@root/src/components/report/Chart/PeriodSelector.styles';

export type PeriodType = 'day' | 'week' | 'month';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
}

export const PeriodSelector = ({ selectedPeriod, setSelectedPeriod }: PeriodSelectorProps) => {
  return (
    <View style={styles.periodSelectorContainer}>
      <View style={styles.periodSelectorRow}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'day' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('day')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'day' && styles.periodButtonTextActive
          ]}>
            1日
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'week' && styles.periodButtonTextActive
          ]}>
            1週間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'month' && styles.periodButtonTextActive
          ]}>
            1ヶ月
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};