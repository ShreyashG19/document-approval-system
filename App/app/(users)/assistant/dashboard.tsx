import { useState } from 'react';
import { View } from 'react-native';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardTabs from '@/components/DashboardTabs';
import { router } from 'expo-router';

export default function AssistantDashboard() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <DashboardNavbar
        label="Welcome, Assistant"
        userRole={'assistant'} 
        showSearch={searching}
        onToggleSearch={() => {
          if (searching) setQuery('');
          setSearching(prev => !prev);
        }}
        searchValue={query}
        onSearchChange={setQuery}
        onNavigateToProfile={() => router.push('/profile')}
        onManageUsers={() => console.log('Manage users clicked')}
        onViewAllUsers={() => console.log('View all users clicked')}
        onViewHistory={() => console.log('History clicked')}
        onLogout={() => router.replace('/')}
      />


      <DashboardTabs userRole='assistant' query={query} />
    </View>
  );
}
