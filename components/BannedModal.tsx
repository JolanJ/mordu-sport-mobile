import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

interface BannedModalProps {
  visible: boolean
  onDismiss: () => void
}

export function BannedModal({ visible, onDismiss }: BannedModalProps) {
  const { locale } = useTranslation()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>🚫</Text>
          <Text style={styles.title}>
            {locale === 'fr' ? 'Compte suspendu' : 'Account suspended'}
          </Text>
          <Text style={styles.message}>
            {locale === 'fr'
              ? 'Ton compte a été suspendu suite à une violation de nos conditions d\'utilisation.'
              : 'Your account has been suspended due to a violation of our terms of use.'}
          </Text>
          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>
              {locale === 'fr' ? 'Continuer en visiteur' : 'Continue as visitor'}
            </Text>
          </Pressable>
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
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.destructive,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.muted,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
})
