import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { styles } from './App.styles';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Hello World</Text>
      </View>
      
      <Footer />
      
      <StatusBar style="auto" />
    </View>
  );
}
