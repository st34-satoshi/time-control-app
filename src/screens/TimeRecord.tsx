import React from 'react';
import { View } from 'react-native';
import TimeRecord from '@root/src/components/record/TimeRecord';
import { styles } from '@root/src/components/common/HeaderTab.styles';
import { Header } from '@root/src/components/common/Header';

const TimeRecordScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="記録" />
      <TimeRecord />
    </View>
  );
};

export default TimeRecordScreen;


