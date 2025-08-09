import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from '@components/TimeRecord.styles';
import CurrentWorkRecord from '@components/CurrentWorkRecord';
import PastWorkRecord from '@components/PastWorkRecord';

const TimeRecord = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

  return (
    <View style={styles.container}>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.tabActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>
            🔴 現在の作業を記録
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            📝 過去の作業を記録
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>
          {activeTab === 'current' ? (
            <CurrentWorkRecord />
          ) : (
            <PastWorkRecord />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default TimeRecord; 