import React from 'react';
import { View } from 'react-native';
import { styles as baseStyles } from '@components/TimeRecord.styles';
import { Header } from '@components/Header';
import Report from '@components/Report';

const ReportScreen = () => {
  return (
    <View style={baseStyles.container}>
      <Header title="レポート" />
      <View style={baseStyles.content}>
        <Report />
      </View>
    </View>
  );
};

export default ReportScreen;
