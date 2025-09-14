import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Sidebar.styles';
import { useAuth } from '@contexts/AuthContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>設定</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#495057" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={48} color="#6c757d" />
              <Text style={styles.userEmail}>
                {user?.email || 'ゲストユーザー'}
              </Text>
            </View>

            {/* <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="person-outline" size={20} color="#495057" />
                <Text style={styles.menuText}>プロフィール</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
