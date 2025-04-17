import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-1 bg-white px-4 pt-4">{children}</View>
);

function PendingScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-lg text-gray-800">📄 All pending documents appear here.</Text>
    </ScreenWrapper>
  );
}

function ApprovedScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-lg text-gray-800">✅ Approved items listed here.</Text>
    </ScreenWrapper>
  );
}

function RejectedScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-lg text-gray-800">❌ These were rejected.</Text>
    </ScreenWrapper>
  );
}

function CorrectionScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-lg text-gray-800">✏️ Items sent back for correction.</Text>
    </ScreenWrapper>
  );
}

export default function DashboardTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        swipeEnabled: true,
        tabBarLabel: ({ color }) => {
          let label = '';
          if (route.name === 'Pending') label = 'Pending';
          if (route.name === 'Approved') label = 'Approved';
          if (route.name === 'Rejected') label = 'Rejected';
          if (route.name === 'Correction') label = 'Correction';

          return <Text style={{ color, fontWeight: 'bold', fontSize: 12 }}>{label}</Text>;
        },
        tabBarIcon: ({ color }) => {
          let iconName = 'document-text-outline';

          if (route.name === 'Pending') iconName = 'time-outline';
          if (route.name === 'Approved') iconName = 'checkmark-done-outline';
          if (route.name === 'Rejected') iconName = 'close-circle-outline';
          if (route.name === 'Correction') iconName = 'create-outline';

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={18} color={color} />;

        },
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { backgroundColor: 'blue', height: 3 },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          borderBottomColor: '#e5e5e5',
          borderBottomWidth: 0.5,
        },
      })}
    >
      <Tab.Screen name="Pending" component={PendingScreen} />
      <Tab.Screen name="Approved" component={ApprovedScreen} />
      <Tab.Screen name="Rejected" component={RejectedScreen} />
      <Tab.Screen name="Correction" component={CorrectionScreen} />
    </Tab.Navigator>
  );
}
