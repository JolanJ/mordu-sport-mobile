import { useRegister } from '@/contexts/RegisterContext'
import { registerTranslations } from '@/lib/registerTranslations'
import { statesProvinces } from '@/lib/statesProvinces'
import { colors } from '@/theme/colors'
import { Link, useRouter } from 'expo-router'
import { Check, ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegisterStep1() {
  const router = useRouter()
  const { data, updateData } = useRegister()

  const [email, setEmail] = useState(data.email)
  const [password, setPassword] = useState(data.password)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stateProvince, setStateProvince] = useState(data.stateProvince)
  const [is18Plus, setIs18Plus] = useState(data.is18Plus)
  const [locale, setLocale] = useState<'fr' | 'en'>(data.preferredLocale)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const handleLocaleChange = (newLocale: 'fr' | 'en') => {
    setLocale(newLocale)
    updateData({ preferredLocale: newLocale })
  }

  const t = registerTranslations[locale]
  const selectedStateLabel = statesProvinces.find(sp => sp.value === stateProvince)?.label || ''

  const handleContinue = () => {
    setError('')

    if (!email || !password || !confirmPassword) {
      setError(t.errorFillFields)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t.errorInvalidEmail)
      return
    }

    if (password.length < 6) {
      setError(t.errorPasswordLength)
      return
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMatch)
      return
    }

    if (!stateProvince) {
      setError(t.errorSelectState)
      return
    }

    if (!is18Plus) {
      setError(t.errorAge)
      return
    }

    updateData({ email, password, stateProvince, is18Plus, preferredLocale: locale })
    router.push('/(auth)/register/step2')
  }

  const renderStateItem = ({ item }: { item: typeof statesProvinces[0] }) => (
    <Pressable
      style={[styles.pickerItem, stateProvince === item.value && styles.pickerItemSelected]}
      onPress={() => {
        setStateProvince(item.value)
        setShowPicker(false)
      }}
    >
      <Text style={[styles.pickerItemText, stateProvince === item.value && styles.pickerItemTextSelected]}>
        {item.label}
      </Text>
      {stateProvince === item.value && <Check size={20} color={colors.neonGreen} />}
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Language Toggle */}
        <View style={styles.localeToggleContainer}>
          <Pressable
            style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}
            onPress={() => handleLocaleChange('fr')}
          >
            <Text style={[styles.localeButtonText, locale === 'fr' && styles.localeButtonTextActive]}>FR</Text>
          </Pressable>
          <Pressable
            style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}
            onPress={() => handleLocaleChange('en')}
          >
            <Text style={[styles.localeButtonText, locale === 'en' && styles.localeButtonTextActive]}>EN</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{t.createAccount}</Text>
          <Text style={styles.subtitle}>{t.step1of3}</Text>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.email} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.password} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.passwordPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.confirmPassword} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.confirmPasswordPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          {/* State/Province Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.stateProvince} *</Text>
            <Pressable style={styles.pickerButton} onPress={() => setShowPicker(true)}>
              <Text style={[styles.pickerButtonText, !stateProvince && styles.pickerButtonPlaceholder]}>
                {selectedStateLabel || t.stateProvincePlaceholder}
              </Text>
              <ChevronDown size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* 18+ Checkbox */}
          <Pressable style={styles.checkboxRow} onPress={() => setIs18Plus(!is18Plus)}>
            <View style={[styles.checkbox, is18Plus && styles.checkboxChecked]}>
              {is18Plus && <Check size={16} color={colors.background} />}
            </View>
            <Text style={styles.checkboxLabel}>{t.ageConfirmation} *</Text>
          </Pressable>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>{t.continue}</Text>
          </Pressable>

          {/* Legal mention */}
          <Text style={styles.legalText}>
            {t.legalMention}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.alreadyAccount}</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.linkText}>{t.login}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* State/Province Modal Picker */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.stateProvince}</Text>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text style={styles.modalClose}>{t.close}</Text>
              </Pressable>
            </View>
            <FlatList
              data={statesProvinces}
              keyExtractor={(item) => item.value}
              renderItem={renderStateItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
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
    paddingVertical: 32,
  },
  localeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  localeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  localeButtonActive: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  localeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  localeButtonTextActive: {
    color: colors.background,
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
    gap: 20,
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
  pickerButton: {
    height: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.foreground,
  },
  pickerButtonPlaceholder: {
    color: colors.mutedForeground,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.foreground,
    flex: 1,
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
  legalText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  modalClose: {
    fontSize: 16,
    color: colors.neonGreen,
    fontWeight: '600',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerItemSelected: {
    backgroundColor: colors.muted,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.foreground,
  },
  pickerItemTextSelected: {
    color: colors.neonGreen,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
})
