import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext'; // ✅ Make sure path is correct
import './global.css'; // tailwind css

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ PaperProvider>
  );
}


