import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../../utils/fcm';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { SafeAreaView, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function WithFCM() {
  // same logic from previous WithFCM (add FCM listeners + Toast)
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </View>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return null; // or redirect
  }

  return (
    <NotificationProvider>
      <WithFCM />
    </NotificationProvider>
  );
}
