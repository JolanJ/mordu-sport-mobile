import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export function HomeHeader() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const { getAvatarUrl } = useAvatars()

  const avatarUrl = getAvatarUrl(profile?.avatar_id || 1)
  const username = profile?.username || t('visitor')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.leftSection}
          onPress={() => router.push('/profile')}
        >
          {avatarUrl && <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />}
          <Text style={styles.username}>@{username}</Text>
        </Pressable>
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>BETA</Text>
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
  betaBadge: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: colors.morduBlue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  betaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.morduBlue,
    letterSpacing: 1,
  },
})
