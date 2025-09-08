import { View, Text } from 'react-native';
import { styles } from '@components/report/CategoryBar.styles';

type CategoryData = {
  categoryId: string;
  categoryName: string;
  totalDuration: number;
  icon: string;
  color: string;
};

interface CategoryBarProps {
  categoryData: CategoryData[];
}

export const CategoryBar = ({ categoryData }: CategoryBarProps) => {
  const getTotalDuration = () => {
    return categoryData.reduce((total, category) => total + category.totalDuration, 0);
  };
  const totalDayTime = 24 * 3600; // 24時間を秒で表現
  const totalRecordedTime = getTotalDuration();
  const unrecordedTime = Math.max(0, totalDayTime - totalRecordedTime);
  
  // 記録された時間の割合（24時間全体に対する）
  const recordedPercentage = (category: CategoryData) => {
    return totalDayTime > 0 ? (category.totalDuration / totalDayTime) * 100 : 0;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  return (
    <>
      {categoryData.map((category, index) => (
        <View key={`category-${category.categoryId}-${index}`} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.categoryName}</Text>
            </View>
            <Text style={styles.categoryDuration}>{formatDuration(category.totalDuration)}</Text>
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
    </>
  );
};