import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './App.styles';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Hello World</Text>
      </View>
      
      {/* Footer */}
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
      
      <StatusBar style="auto" />
    </View>
  );
}
