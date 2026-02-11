import { Locale } from '@/lib/translations'
import { colors } from '@/theme/colors'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

interface LanguagePickerModalProps {
  visible: boolean
  onSelectLocale: (locale: Locale) => void
}

export function LanguagePickerModal({ visible, onSelectLocale }: LanguagePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {'Choisis ta langue'}
          </Text>
          <Text style={styles.subtitle}>
            {'Choose your language'}
          </Text>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={styles.languageButton}
              onPress={() => onSelectLocale('fr')}
            >
              <Text style={styles.languageText}>Français</Text>
            </Pressable>

            <Pressable
              style={styles.languageButton}
              onPress={() => onSelectLocale('en')}
            >
              <Text style={styles.languageText}>English</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  languageButton: {
    height: 56,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
})
