import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext'; // ✅ Make sure path is correct
import { NotificationProvider } from '../contexts/NotificationContext';
import './global.css'; // tailwind css

export default function RootLayout() {
  return (
    <PaperProvider>
      <NotificationProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}
