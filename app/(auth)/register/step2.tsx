import { useRegister } from '@/contexts/RegisterContext'
import { useAvatars } from '@/hooks/useAvatars'
import { registerTranslations } from '@/lib/registerTranslations'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { ArrowLeft, Check, X } from 'lucide-react-native'
import { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const t = registerTranslations[data.preferredLocale]

  useEffect(() => {
    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setUsernameStatus('idle')
      return
    }
    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', trimmed)
        .maybeSingle()
      setUsernameStatus(existing ? 'taken' : 'available')
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

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

    if (usernameStatus === 'taken') {
      setError(t.errorUsernameTaken)
      return
    }

    if (usernameStatus === 'checking') {
      return
    }

    updateData({ username: username.trim(), avatarId: selectedAvatar })
    router.push('/(auth)/register/step3')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.username} *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  usernameStatus === 'available' && styles.inputAvailable,
                  usernameStatus === 'taken' && styles.inputTaken,
                ]}
                placeholder={t.usernamePlaceholder}
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={20}
                autoComplete="username"
              />
              <View style={styles.statusIcon}>
                {usernameStatus === 'checking' && (
                  <ActivityIndicator size="small" color={colors.mutedForeground} />
                )}
                {usernameStatus === 'available' && (
                  <Check size={20} color={colors.neonGreen} />
                )}
                {usernameStatus === 'taken' && (
                  <X size={20} color={colors.destructive} />
                )}
              </View>
            </View>

            {usernameStatus === 'available' && (
              <Text style={styles.hintAvailable}>{t.usernameAvailable}</Text>
            )}
            {usernameStatus === 'taken' && (
              <Text style={styles.hintTaken}>{t.errorUsernameTaken}</Text>
            )}
            {usernameStatus === 'idle' && username.trim().length > 0 && username.trim().length < 3 && (
              <Text style={styles.hintTaken}>{t.errorUsernameMin}</Text>
            )}
            {usernameStatus === 'idle' && username.trim().length === 0 && (
              <Text style={styles.hint}>{t.usernameHint}</Text>
            )}
          </View>

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
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  hintAvailable: {
    fontSize: 12,
    color: colors.neonGreen,
  },
  hintTaken: {
    fontSize: 12,
    color: colors.destructive,
  },
  inputRow: {
    position: 'relative',
  },
  inputFlex: {
    width: '100%',
  },
  inputAvailable: {
    borderColor: colors.neonGreen,
  },
  inputTaken: {
    borderColor: colors.destructive,
  },
  statusIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
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
