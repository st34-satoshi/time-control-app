import { View } from 'react-native';
import { styles } from './App.styles';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';
import TimeRecordScreen from '@components/TimeRecordScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <TimeRecordScreen />
      <Footer />
    </View>
  );
}
