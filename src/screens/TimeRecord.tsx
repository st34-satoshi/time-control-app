import React from 'react';
import { View } from 'react-native';
import TimeRecord from '@components/TimeRecord';
import { styles } from '@components/TimeRecord.styles';
import { Header } from '@components/Header';

const TimeRecordScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="記録" />
      <TimeRecord />
    </View>
  );
};

export default TimeRecordScreen;


