import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';

const NotificationContext = createContext<any>(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [fcmToken, setFcmToken] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Configure notification behavior
  const initializeNotifications = async () => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // 🔔 Request FCM permission and get token
      await messaging().requestPermission();
      const token = await messaging().getToken();
      console.log('✅ FCM Token:', token);
      setFcmToken(token);

      // 🔁 Handle token refresh
      messaging().onTokenRefresh((newToken) => {
        console.log('🔁 Refreshed FCM token:', newToken);
        setFcmToken(newToken);
      });

      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('📥 Foreground notification:', remoteMessage);
        const { notification } = remoteMessage;
        if (notification) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: remoteMessage.data,
            },
            trigger: null,
          });
        }
      });

      // Background message handler
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('📥 Background message:', remoteMessage);
      });

      // App opened from quit state
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('🚪 App opened from quit by notification:', initialNotification);
      }

      // App opened from background
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('🔙 App opened from background by notification:', remoteMessage);
      });

      return () => {
        unsubscribeForeground();
      };
    } catch (error) {
      console.error('❌ Notification error:', error);
    }
  };

  useEffect(() => {
    initializeNotifications();
  });

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        setFcmToken,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
