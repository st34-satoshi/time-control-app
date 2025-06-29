import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { styles } from './App.styles';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Text>Hello World</Text>
      </View>
      
      <Footer />
      
      <StatusBar style="auto" />
    </View>
  );
}
