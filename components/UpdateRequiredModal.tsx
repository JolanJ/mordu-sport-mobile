import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { Linking, Modal, Platform, StyleSheet, Text, Pressable, View } from 'react-native'

interface UpdateRequiredModalProps {
  visible: boolean
  currentVersion: string
  requiredVersion: string
}

// URLs des stores (à remplacer par les vraies URLs une fois publiées)
const STORE_URLS = {
  ios: 'https://apps.apple.com/app/ultra-sports-fans/id000000000', // TODO: Remplacer par l'ID réel
  android: 'https://play.google.com/store/apps/details?id=com.ultrasportsfans.app', // TODO: Remplacer par l'ID réel
}

export function UpdateRequiredModal({ visible, currentVersion, requiredVersion }: UpdateRequiredModalProps) {
  const { t, locale } = useTranslation()

  const handleUpdate = () => {
    const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android
    Linking.openURL(url).catch((err) => console.error('Error opening store:', err))
  }

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
            {locale === 'fr' ? 'Mise à jour requise' : 'Update Required'}
          </Text>

          <Text style={styles.message}>
            {locale === 'fr'
              ? `Une nouvelle version de l'application est disponible. Veuillez mettre à jour pour continuer.`
              : `A new version of the app is available. Please update to continue.`}
          </Text>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>
              {locale === 'fr' ? 'Version actuelle' : 'Current version'}: {currentVersion}
            </Text>
            <Text style={styles.versionText}>
              {locale === 'fr' ? 'Version requise' : 'Required version'}: {requiredVersion}
            </Text>
          </View>

          <Pressable style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>
              {locale === 'fr' ? 'Mettre à jour' : 'Update'}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  versionInfo: {
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
  },
})
