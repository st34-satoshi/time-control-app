import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@components/Footer.styles';

export const Footer = () => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerItem}>
        <Ionicons name="time" size={24} color="#495057" />
        <Text style={styles.footerText}>記録</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerItem}>
        <Ionicons name="bar-chart" size={24} color="#495057" />
        <Text style={styles.footerText}>レポート</Text>
      </TouchableOpacity>
    </View>
  );
}; 