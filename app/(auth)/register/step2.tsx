import { useRegister } from '@/contexts/RegisterContext'
import { useAvatars } from '@/hooks/useAvatars'
import { registerTranslations } from '@/lib/registerTranslations'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { ArrowLeft, Check } from 'lucide-react-native'
import { useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegisterStep2() {
  const router = useRouter()
  const { data, updateData } = useRegister()
  const { avatars } = useAvatars()

  const [username, setUsername] = useState(data.username)
  const [selectedAvatar, setSelectedAvatar] = useState(data.avatarId)
  const [error, setError] = useState('')

  const t = registerTranslations[data.preferredLocale]

  const handleContinue = () => {
    setError('')

    if (!username.trim()) {
      setError(t.errorEnterUsername)
      return
    }

    if (username.trim().length < 3) {
      setError(t.errorUsernameMin)
      return
    }

    if (username.trim().length > 20) {
      setError(t.errorUsernameMax)
      return
    }

    updateData({ username: username.trim(), avatarId: selectedAvatar })
    router.push('/(auth)/register/step3')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>{t.personalization}</Text>
          <Text style={styles.subtitle}>{t.step2of3}</Text>
        </View>

        <View style={styles.form}>
          {/* Avatar Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.chooseAvatar}</Text>
            <View style={styles.avatarGrid}>
              {avatars.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar.id && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                >
                  <Image source={{ uri: avatar.img_link }} style={styles.avatarImage} />
                  {selectedAvatar === avatar.id && (
                    <View style={styles.avatarCheck}>
                      <Check size={16} color={colors.background} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.username} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.usernamePlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              maxLength={20}
              autoComplete="username"
            />
            <Text style={styles.hint}>{t.usernameHint}</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>{t.continue}</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  input: {
    height: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  avatarOption: {
    width: '28%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  avatarSelected: {
    borderColor: colors.neonGreen,
    backgroundColor: colors.muted,
  },
  avatarImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  avatarCheck: {
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
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    height: 52,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
})
