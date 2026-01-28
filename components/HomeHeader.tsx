import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native'

const avatars: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/avatar-1.png'),
  2: require('@/assets/images/avatar-2.png'),
  3: require('@/assets/images/avatar-3.png'),
  4: require('@/assets/images/avatar-4.png'),
}

export function HomeHeader() {
  const { profile } = useAuth()
  const { locale, setLocale, t } = useTranslation()

  const avatarSource = avatars[profile?.avatar_id || 1] || avatars[1]
  const username = profile?.username || t('visitor')

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

        {/* Section droite : Toggle langue */}
        <View style={styles.localeToggle}>
          <Pressable
            style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}
            onPress={() => setLocale('fr')}
          >
            <Text style={[styles.localeButtonText, locale === 'fr' && styles.localeButtonTextActive]}>FR</Text>
          </Pressable>
          <Pressable
            style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}
            onPress={() => setLocale('en')}
          >
            <Text style={[styles.localeButtonText, locale === 'en' && styles.localeButtonTextActive]}>EN</Text>
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
  localeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 2,
  },
  localeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  localeButtonActive: {
    backgroundColor: colors.neonGreen,
  },
  localeButtonText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  localeButtonTextActive: {
    color: colors.background,
  },
})
