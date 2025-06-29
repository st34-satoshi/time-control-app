import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@components/TimeRecord.styles';

const ReportScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>レポート</Text>
      </View>
      <View style={styles.content}>
        <Text>レポート画面の内容をここに実装します</Text>
      </View>
    </View>
  );
};

export default ReportScreen;
