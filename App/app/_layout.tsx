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


