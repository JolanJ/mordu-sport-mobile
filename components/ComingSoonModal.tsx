import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { Lock } from 'lucide-react-native'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

interface ComingSoonModalProps {
  visible: boolean
  league: string
  onClose: () => void
}

export function ComingSoonModal({ visible, league, onClose }: ComingSoonModalProps) {
  const { locale } = useTranslation()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Lock size={32} color={colors.neonBlue} />
          </View>

          <Text style={styles.title}>
            {locale === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
          </Text>

          <Text style={styles.message}>
            {locale === 'fr'
              ? `La ${league} sera disponible prochainement!`
              : `${league} will be available soon!`}
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neonBlue,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 174, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
  },
})
