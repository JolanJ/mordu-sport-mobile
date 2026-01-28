import { useRegister } from '@/contexts/RegisterContext'
import { registerTranslations } from '@/lib/registerTranslations'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { Link, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegisterStep3() {
  const router = useRouter()
  const { data, updateData, resetData } = useRegister()

  const [newsletterChoice, setNewsletterChoice] = useState<boolean | null>(data.newsletterSubscribed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const t = registerTranslations[data.preferredLocale]

  const handleCreateAccount = async () => {
    setError('')

    if (newsletterChoice === null) {
      setError(t.errorNewsletterChoice)
      return
    }

    setLoading(true)

    // Save newsletter choice
    updateData({ newsletterSubscribed: newsletterChoice })

    // Create account with all data in user_metadata
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          avatar_id: data.avatarId,
          state_province: data.stateProvince,
          is_18_plus: data.is18Plus,
          newsletter_subscribed: newsletterChoice,
          preferred_locale: data.preferredLocale,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If user subscribed to newsletter, add them to Brevo list
    if (newsletterChoice) {
      try {
        await supabase.functions.invoke('subscribe-newsletter', {
          body: {
            email: data.email,
            locale: data.preferredLocale,
          }
        })
      } catch (newsletterError) {
        // Don't block account creation if newsletter subscription fails
        console.error('Newsletter subscription error:', newsletterError)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>{t.successTitle}</Text>
            <Text style={styles.successText}>
              {t.successMessage}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable
                style={styles.button}
                onPress={() => resetData()}
              >
                <Text style={styles.buttonText}>{t.goToLogin}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    )
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
          <Text style={styles.title}>{t.newsletter}</Text>
          <Text style={styles.subtitle}>{t.step3of3}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {t.newsletterQuestion}
            </Text>
            <Text style={styles.questionHint}>
              {t.newsletterHint}
            </Text>
          </View>

          <View style={styles.choiceContainer}>
            <Pressable
              style={[
                styles.choiceButton,
                newsletterChoice === true && styles.choiceButtonSelected,
              ]}
              onPress={() => setNewsletterChoice(true)}
            >
              <Text
                style={[
                  styles.choiceText,
                  newsletterChoice === true && styles.choiceTextSelected,
                ]}
              >
                {t.yesSubscribe}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.choiceButton,
                newsletterChoice === false && styles.choiceButtonSelected,
              ]}
              onPress={() => setNewsletterChoice(false)}
            >
              <Text
                style={[
                  styles.choiceText,
                  newsletterChoice === false && styles.choiceTextSelected,
                ]}
              >
                {t.noThanks}
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>{t.createMyAccount}</Text>
            )}
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
  questionContainer: {
    gap: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  questionHint: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  choiceContainer: {
    gap: 12,
  },
  choiceButton: {
    height: 56,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonSelected: {
    borderColor: colors.neonGreen,
    backgroundColor: colors.muted,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  choiceTextSelected: {
    color: colors.neonGreen,
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 16,
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
})
