import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PendingScreen from './tabscreens/PendingScreen';
import ApprovedScreen from './tabscreens/ApprovedScreen';
import RejectedScreen from './tabscreens/RejectedScreen';
import CorrectionScreen from './tabscreens/CorrectionScreen';

const Tab = createMaterialTopTabNavigator();

export default function DashboardTabs({
  query,
  userRole,
}: {
  query: string;
  userRole: 'admin' | 'approver' | 'assistant';
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 12 },
        tabBarIndicatorStyle: { backgroundColor: '#1E88E5', height: 3 },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen name="Pending">
        {() => <PendingScreen query={query} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen name="Approved">
        {() => <ApprovedScreen query={query} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen name="Rejected">
        {() => <RejectedScreen query={query} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen name="Correction">
        {() => <CorrectionScreen query={query} userRole={userRole} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
