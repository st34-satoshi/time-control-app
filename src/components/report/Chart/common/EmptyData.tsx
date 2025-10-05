import { View, Text } from 'react-native';
import { styles } from '@root/src/components/report/Chart/common/EmptyData.styles';

export const EmptyData = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>記録されたデータがありません</Text>
      <Text style={styles.emptySubtext}>時間記録を開始すると、ここに表示されます</Text>
    </View>
  );
};