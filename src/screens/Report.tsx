import React from 'react';
import { View } from 'react-native';
import { styles as baseStyles } from '@root/src/components/record/TimeRecord.styles';
import { Header } from '@root/src/components/common/Header';
import Report from '@root/src/components/report/Report';

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
