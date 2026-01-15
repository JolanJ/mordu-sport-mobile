import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { Bell, Search } from 'lucide-react-native'
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native'

const avatars: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/Avatar 1.png'),
  2: require('@/assets/images/Avatar 2.png'),
  3: require('@/assets/images/Avatar 3.png'),
  4: require('@/assets/images/Avatar 4.png'),
}

export function HomeHeader() {
  const { profile } = useAuth()

  const avatarSource = avatars[profile?.avatar_id || 1] || avatars[1]
  const username = profile?.username || 'Utilisateur'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Section gauche : Avatar + Username */}
        <Pressable
          style={styles.leftSection}
          onPress={() => router.push('/profile')}
        >
          <Image
            source={avatarSource}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.username}>@{username}</Text>
        </Pressable>

       

        {/* Section droite : Icônes sans fond */}
        <View style={styles.rightSection}>
          {/* Icône recherche verte (contour seulement) */}
          <Pressable 
            onPress={() => console.log('Search')} 
            style={styles.iconButton}
          >
            <Search size={24} color={colors.neonGreen} strokeWidth={2} />
          </Pressable>
          
          {/* Icône cloche bleue (contour seulement) */}
          <Pressable 
            onPress={() => console.log('Notifications')} 
            style={styles.iconButton}
          >
            <Bell size={24} color={colors.neonBlue} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
