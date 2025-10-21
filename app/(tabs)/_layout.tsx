import { colors } from '@/theme/colors';
import { Tabs } from 'expo-router';
import { Home, Star, Users } from 'lucide-react-native';
import { Image } from 'react-native';

export default function TabLayout() {
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
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Équipes',
          tabBarIcon: ({ color, focused }) => (
            <Users size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams/[id]"
        options={{
          href: null, // Cache cette route du bottom nav
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <Star size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mordusport"
        options={{
          title: 'Mordu Sport',
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('@/assets/images/Logo - Bouche Mordu (1).png')}
              style={{ 
                width: 42, 
                height: 42,
                tintColor: color,
                opacity: focused ? 1 : 0.6
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
