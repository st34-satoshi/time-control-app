import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@components/common/Header.styles';
interface HeaderProps {
  title?: string;
}

export const Header = ({ title = '時間記録' }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        {/* <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#495057" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}; 