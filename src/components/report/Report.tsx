import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { styles } from '@root/src/components/common/HeaderTab.styles';
import ReportList from '@components/report/List';
import { Chart } from '@root/src/components/report/Chart/index';
import { useAuth } from '@contexts/AuthContext';
import { TimeRecordDataForGet } from '../../types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { timeRecordService } from '@root/src/services/firestore/timeRecordService';
import { Alert } from 'react-native';

const Report = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');

  const { user } = useAuth();
  const [timeRecords, setTimeRecords] = useState<TimeRecordDataForGet[]>([]);
  const [categoryManager, setCategoryManager] = useState<CategoryManager | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !categoryManager) {
      const createCategoryManager = async () => {
        const manager = await CategoryManager.create(user!.uid);
        setCategoryManager(manager);
      }
      createCategoryManager();
    }
  }, [user, categoryManager]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const initializeData = async () => {
          setIsLoading(true);
          try {
            // カテゴリマネージャーを再取得
            const manager = await CategoryManager.create(user!.uid);
            setCategoryManager(manager);
            // タイムレコードも取得
            await fetchAndSortRecords();
          } finally {
            setIsLoading(false);
          }
        }
        initializeData();
      }
    }, [user])
  );

  const onRefresh = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const manager = await CategoryManager.create(user.uid);
        setCategoryManager(manager);
      }
      await fetchAndSortRecords();
    } catch (err) {
      Alert.alert('データの取得に失敗しました');
      console.error('Error refreshing time records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndSortRecords = async () => {
    const records = await timeRecordService.getTimeRecords(user!.uid);
    const sortedRecords = records.sort((a, b) => {
      return b.startTime.seconds - a.startTime.seconds; // 降順（新しい順）
    });
    setTimeRecords(sortedRecords);
  };

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
      
      <View style={styles.content}>
        <View style={styles.tabContent}>
          {activeTab === 'list' ? (
            <ReportList 
              timeRecords={timeRecords} 
              categoryManager={categoryManager} 
              onRefresh={onRefresh} 
              userId={user?.uid || ''} 
              isLoading={isLoading}
            />
          ) : (
            <Chart timeRecords={timeRecords} categoryManager={categoryManager} onRefresh={onRefresh} />
          )}
        </View>
      </View>
    </View>
  );
};

export default Report; 