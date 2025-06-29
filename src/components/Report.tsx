import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { styles } from '@components/Report.styles';

const Report = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reportContainer}>
          <Text style={styles.helloText}>Hello</Text>
          <Text style={styles.descriptionText}>
            レポート画面です。ここに時間記録の統計や分析が表示されます。
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Report; 