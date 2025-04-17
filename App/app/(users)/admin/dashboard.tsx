import { View } from 'react-native';
import DashboardTabs from '../../../components/DashboardTabs';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminDashboard() {
  const { authState } = useAuth();

  return (
    <View className="flex-1 bg-white">
      <DashboardNavbar
        label={`Welcome, Admin`}
        onProfilePress={() => console.log('Go to profile')}
      />
      <DashboardTabs />
    </View>
  );
}
