import { View, Text } from 'react-native';
import { styles } from '@root/src/components/report/Chart/CategoryBar.styles';

type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDurationSeconds: number;
  icon: string;
  color: string;
};

interface CategoryBarProps {
  categoryData: CategoryData[];
}

export const CategoryBar = ({ categoryData }: CategoryBarProps) => {
  const getTotalDurationSeconds = () => {
    return categoryData.reduce((total, record) => total + record.totalDurationSeconds, 0);
  };
  const totalDayTime = 24 * 3600; // 24時間を秒で表現
  const totalRecordedTimeSeconds = getTotalDurationSeconds();
  const unrecordedTime = Math.max(0, totalDayTime - totalRecordedTimeSeconds);
  
  // 記録された時間の割合（24時間全体に対する）
  const recordedPercentage = (category: CategoryData) => {
    return totalDayTime > 0 ? (category.totalDurationSeconds / totalDayTime) * 100 : 0;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // 記録なしの時間の割合
  const unrecordedPercentage = (unrecordedTime / totalDayTime) * 100;

  return (
    <>
      {categoryData.map((category, index) => (
        <View key={`category-${category.categoryId}-${index}`} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.categoryName}</Text>
            </View>
            <Text style={styles.categoryDuration}>{formatDuration(category.totalDurationSeconds)}</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${recordedPercentage(category)}%`,
                  backgroundColor: category.color
                }
              ]} 
            />
          </View>
            
          <Text style={styles.percentageText}>{recordedPercentage(category).toFixed(1)}%</Text>
        </View>
      ))}
      
      {/* その他の時間（記録なし）を表示 */}
      {unrecordedTime > 0 && (
        <View key="unrecorded-time" style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>⏰</Text>
              <Text style={styles.categoryName}>その他の時間</Text>
            </View>
            <Text style={styles.categoryDuration}>{formatDuration(unrecordedTime)}</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${unrecordedPercentage}%`,
                  backgroundColor: '#e5e7eb'
                }
              ]} 
            />
          </View>
            
          <Text style={styles.percentageText}>{unrecordedPercentage.toFixed(1)}%</Text>
        </View>
      )}
    </>
  );
};