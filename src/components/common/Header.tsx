import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@components/common/Header.styles';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = '時間記録' }: HeaderProps) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleSettingsPress = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={handleSettingsPress}
          >
            <Ionicons name="settings-outline" size={24} color="#495057" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 48 }} />
        </View>
      </View>
      <Sidebar visible={sidebarVisible} onClose={handleCloseSidebar} />
    </>
  );
}; 