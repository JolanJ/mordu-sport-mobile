import { useTranslation } from '@/contexts/TranslationContext'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleUrl = async (url: string) => {
      const hash = url.split('#')[1]
      if (!hash) return
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')
      if (type === 'recovery' && accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) setError(error.message)
      }
    }

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url) })
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))
    return () => subscription.remove()
  }, [])

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError(t('fillAllFields'))
      return
    }
    if (password.length < 6) {
      setError(t('resetPasswordTooShort'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('resetPasswordMismatch'))
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.replace('/(auth)/login'), 2000)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('resetPassword')}</Text>
        <Text style={styles.subtitle}>{t('resetPasswordSubtitle')}</Text>

        {done ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{t('passwordUpdated')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('newPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('passwordPlaceholder')}
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('confirmNewPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('passwordPlaceholder')}
                placeholderTextColor={colors.mutedForeground}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>{t('updatePassword')}</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 48,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
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
  successContainer: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    color: colors.neonGreen,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    height: 52,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
})
