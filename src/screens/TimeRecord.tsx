import React from 'react';
import { View } from 'react-native';
import TimeRecord from '@components/TimeRecord';
import { styles } from '@components/TimeRecord.styles';
import { Text } from 'react-native';

const TimeRecordScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>時間記録</Text>
      </View>
      <TimeRecord />
    </View>
  );
};

export default TimeRecordScreen;


