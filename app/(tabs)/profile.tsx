import { HomeHeader } from '@/components/HomeHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { ArrowLeft, Check, LogIn, LogOut } from 'lucide-react-native'
import { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { t, locale } = useTranslation()
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Avatars disponibles (style cartoon sport)
  const availableAvatars = [
    { id: 1, name: t('avatarHockey'), source: require('@/assets/images/avatar-1.png') },
    { id: 2, name: t('avatarBasketball'), source: require('@/assets/images/avatar-2.png') },
    { id: 3, name: t('avatarFootball'), source: require('@/assets/images/avatar-3.png') },
    { id: 4, name: t('avatarSoccer'), source: require('@/assets/images/avatar-4.png') },
  ]

  // Initialiser avec les données du profil
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setSelectedAvatar(profile.avatar_id)
    }
  }, [profile])

  const handleSignOut = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    )
  }

  const handleSave = async () => {
    if (username.trim().length < 3) {
      Alert.alert(t('error'), t('usernameMinError'))
      return
    }

    setSaving(true)

    const { error } = await updateProfile({
      username: username.trim(),
      avatar_id: selectedAvatar,
    })

    setSaving(false)

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('23505')) {
        Alert.alert(t('error'), t('usernameTaken'))
      } else {
        Alert.alert(t('error'), error.message)
      }
    } else {
      setIsEditing(false)
      Alert.alert(t('success'), t('profileUpdated'))
    }
  }

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username)
      setSelectedAvatar(profile.avatar_id)
    }
    setIsEditing(false)
  }

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return t('recently')
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
  }

  // Affichage pour visiteurs non connectés
  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <LogIn size={48} color={colors.mutedForeground} />
          <Text style={styles.visitorTitle}>{t('loginRequired')}</Text>
          <Text style={styles.visitorText}>{t('loginToAccessProfile')}</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>{t('signIn')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Affichage si profil en cours de chargement
  if (!profile) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>{t('profile')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Section Avatar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('avatar')}</Text>
          <View style={styles.avatarGrid}>
            {availableAvatars.map((avatar) => (
              <Pressable
                key={avatar.id}
                style={[
                  styles.avatarContainer,
                  selectedAvatar === avatar.id && styles.avatarSelected
                ]}
                onPress={() => isEditing && setSelectedAvatar(avatar.id)}
                disabled={!isEditing}
              >
                <Image
                  source={avatar.source}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                {selectedAvatar === avatar.id && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.background} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section Nom d'utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('username')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={username}
              onChangeText={setUsername}
              placeholder={t('usernamePlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              editable={isEditing}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
        </View>

        {/* Bouton Modifier / Sauvegarder */}
        {!isEditing ? (
          <Pressable
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editProfileButtonText}>{t('editProfile')}</Text>
          </Pressable>
        ) : (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Informations du profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('fanStats')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('memberSince')}</Text>
              <Text style={styles.infoValue}>{formatMemberSince(profile.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('favoriteMatches')}</Text>
              <Text style={styles.infoValue}>0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('followedTeams')}</Text>
              <Text style={styles.infoValue}>0</Text>
            </View>
          </View>
        </View>

        {/* Section compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('email')}</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color={colors.destructive} />
            <Text style={styles.logoutButtonText}>{t('disconnect')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  visitorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  visitorText: {
    marginTop: 8,
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loginButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 32,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarSelected: {
    borderColor: colors.neonGreen,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.foreground,
  },
  textInputDisabled: {
    opacity: 0.7,
  },
  editProfileButton: {
    marginTop: 24,
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButtonText: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  infoValue: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    height: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  logoutButtonText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: '600',
  },
})
