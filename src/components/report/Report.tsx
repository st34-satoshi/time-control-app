import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from '@root/src/components/common/HeaderTab.styles';
import ReportList from '@components/report/List';
import Chart from '@components/report/Chart';

const Report = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');

  return (
    <View style={styles.container}>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            📋 リスト表示
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chart' && styles.tabActive]}
          onPress={() => setActiveTab('chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>
            📊 グラフ表示
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>
          {activeTab === 'list' ? (
            <ReportList />
          ) : (
            <Chart />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Report; 