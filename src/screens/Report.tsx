import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@components/TimeRecord.styles';
import { Header } from '@components/Header';

const ReportScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="レポート" />
      <View style={styles.content}>
        <Text>レポート画面の内容をここに実装します</Text>
      </View>
    </View>
  );
};

export default ReportScreen;
