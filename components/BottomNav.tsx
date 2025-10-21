import { colors } from '@/theme/colors'
import { Link, usePathname } from 'expo-router'
import { Home, Star, Users } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface Tab {
  id: "results" | "teams" | "favorites" | "mordu"
  route: string
  icon: React.ComponentType<any> | string
  label: string
  color: string
  glowColor: string
}

const tabs: Tab[] = [
  {
    id: "results",
    route: "/",
    icon: Home,
    label: "Accueil",
    color: "#00C4FF",
    glowColor: "rgba(0,196,255,0.5)"
  },
  {
    id: "teams",
    route: "/teams",
    icon: Users,
    label: "Équipes",
    color: "#F27020",
    glowColor: "rgba(242,112,32,0.5)"
  },
  {
    id: "favorites",
    route: "/favorites",
    icon: Star,
    label: "Favoris",
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.5)"
  },
  {
    id: "mordu",
    route: "/mordusport",
    icon: "logo",
    label: "Mordu Sport",
    color: "#9D4EDD",
    glowColor: "rgba(157,78,221,0.5)"
  }
]

export function BottomNav() {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname === "/") return "results"
    if (pathname === "/teams") return "teams"
    if (pathname === "/favorites") return "favorites"
    if (pathname === "/mordusport") return "mordu"
    return "results"
  }

  const activeTab = getActiveTab()

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const IconComponent = tab.icon as React.ComponentType<any>
          
          return (
            <Link key={tab.id} href={tab.route} asChild>
              <Pressable style={styles.tab}>
                <View style={[
                  styles.iconContainer,
                  isActive && {
                    shadowColor: tab.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 8,
                  }
                ]}>
                  {tab.icon === "logo" ? (
                    <Text style={[styles.logoText, { color: isActive ? tab.color : colors.mutedForeground }]}>
                      M
                    </Text>
                  ) : (
                    <IconComponent 
                      size={20} 
                      color={isActive ? tab.color : colors.mutedForeground} 
                    />
                  )}
                </View>
                <Text style={[
                  styles.label,
                  { color: isActive ? tab.color : colors.mutedForeground }
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            </Link>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: `${colors.card}F2`, // 95% opacity
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
})
