import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export function HomeHeader() {
  const { profile } = useAuth()
  const { locale, setLocale, t } = useTranslation()
  const { getAvatarUrl } = useAvatars()

  const avatarUrl = getAvatarUrl(profile?.avatar_id || 1)
  const username = profile?.username || t('visitor')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Section gauche : Avatar + Username */}
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
