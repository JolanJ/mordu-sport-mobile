import { useTranslation } from '@/contexts/TranslationContext';
import { colors } from '@/theme/colors';
import { Tabs } from 'expo-router';
import { Gift, Home, Star, Users } from 'lucide-react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.morduBlue,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('matches'),
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t('teams'),
          tabBarIcon: ({ color, focused }) => (
            <Users size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bonus"
        options={{
          title: 'Bonus',
          tabBarIcon: ({ color }) => (
            <Gift size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="match/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="mordusport"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
