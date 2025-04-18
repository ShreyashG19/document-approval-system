import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext'; // ✅ Make sure path is correct
import { NotificationProvider, useNotifications } from '../contexts/NotificationContext';
import './global.css'; // tailwind css

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
