import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Users, UserCircle, ShieldCheck } from 'lucide-react-native';

export default function EmployerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#113C2C',
        tabBarInactiveTintColor: '#94A39B',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8E2',
          backgroundColor: '#FFFFFF',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Requisitions',
          tabBarIcon: ({ color }) => <Briefcase size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: 'Pipeline',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Team',
          tabBarIcon: ({ color }) => <ShieldCheck size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Company',
          tabBarIcon: ({ color }) => <UserCircle size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-matching"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
