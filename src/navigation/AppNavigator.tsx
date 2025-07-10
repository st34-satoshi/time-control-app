import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TimeRecord from '@screens/TimeRecord';
import Report from '@screens/Report';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'TimeRecord') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="TimeRecord" 
        component={TimeRecord}
        options={{ title: '記録' }}
      />
      <Tab.Screen 
        name="Report" 
        component={Report}
        options={{ title: 'レポート' }}
      />
    </Tab.Navigator>
  );
} 