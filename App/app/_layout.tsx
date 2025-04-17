// import { Stack } from 'expo-router';
// import { useEffect, useRef } from 'react';
// import * as Notifications from 'expo-notifications';
// import { registerForPushNotificationsAsync } from '../utils/fcm';
// import { NotificationProvider, useNotifications } from '../contexts/NotificationContext';
// import Toast from 'react-native-toast-message';
// import { SafeAreaView, View } from 'react-native';
// import './global.css'; // tailwind classes

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// function WithFCM() {
//   const { setFcmToken, setNotifications, setUnreadCount } = useNotifications();
//   const notificationListener = useRef<Notifications.Subscription | null>(null);
//   const responseListener = useRef<Notifications.Subscription | null>(null);

//   useEffect(() => {
//     // Request FCM token on app load
//     registerForPushNotificationsAsync().then(token => {
//       if (token) setFcmToken(token);
//     });

//     // Listen for foreground notifications
//     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
//       const title = notification.request.content.title ?? 'Notification';
//       const body = notification.request.content.body ?? '';

//       setNotifications((prev: any[]) => [notification, ...prev]);
//       setUnreadCount((prev: number) => prev + 1);

//       Toast.show({
//         type: 'info',
//         text1: title,
//         text2: body,
//       });
//     });

//     // Handle taps on notifications
//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log('Notification tapped:', response);
//     });

//     return () => {
//       Notifications.removeNotificationSubscription(notificationListener.current!);
//       Notifications.removeNotificationSubscription(responseListener.current!);
//     };
//   }, []);

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <View className="flex-1">
//         <Stack screenOptions={{ headerShown: false }} />
//         <Toast />
//       </View>
//     </SafeAreaView>
//   );
// }

// export default function Layout() {
//   return (
//     <NotificationProvider>
//       <WithFCM />
//     </NotificationProvider>
//   );
// }


import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // ✅ Make sure path is correct
import './global.css'; // tailwind css

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}


