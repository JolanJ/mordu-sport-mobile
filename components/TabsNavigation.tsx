import { colors } from '@/theme/colors'
import { BarChart3, Hospital, Users } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type TabType = 'players' | 'stats' | 'injuries'

interface TabsNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  const tabs = [
    { id: 'players' as TabType, label: 'Joueurs', icon: Users, color: colors.primary },
    { id: 'stats' as TabType, label: 'Équipe', icon: BarChart3, color: colors.accent },
    { id: 'injuries' as TabType, label: 'Blessures', icon: Hospital, color: colors.destructive },
  ]

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <Pressable
            key={tab.id}
            style={[
              styles.tab,
              isActive && { 
                backgroundColor: `${tab.color}0D`, // 5% opacity
                borderBottomWidth: 2,
                borderBottomColor: tab.color 
              }
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Icon 
              size={20} 
              color={isActive ? tab.color : colors.mutedForeground} 
            />
            <Text
              style={[
                styles.tabText,
                { color: isActive ? tab.color : colors.mutedForeground }
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    minHeight: 60,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
})

