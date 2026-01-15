import { HomeHeader } from '@/components/HomeHeader'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { ArrowLeft, Check, LogOut } from 'lucide-react-native'
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

// Avatars disponibles (style cartoon sport)
const availableAvatars = [
  { id: 1, name: 'Hockey Player', source: require('@/assets/images/Avatar 1.png') },
  { id: 2, name: 'Basketball Player', source: require('@/assets/images/Avatar 2.png') },
  { id: 3, name: 'Football Player', source: require('@/assets/images/Avatar 3.png') },
  { id: 4, name: 'Soccer Player', source: require('@/assets/images/Avatar 4.png') },
]

export default function Profile() {
  const { profile, signOut, updateProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [address, setAddress] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialiser avec les données du profil
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setAddress(profile.address || '')
      setSelectedAvatar(profile.avatar_id)
    }
  }, [profile])

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    )
  }

  const handleSave = async () => {
    if (username.trim().length < 3) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }

    setSaving(true)

    const { error } = await updateProfile({
      username: username.trim(),
      address: address.trim() || null,
      avatar_id: selectedAvatar,
    })

    setSaving(false)

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('23505')) {
        Alert.alert('Erreur', 'Ce nom d\'utilisateur est déjà pris')
      } else {
        Alert.alert('Erreur', error.message)
      }
    } else {
      setIsEditing(false)
      Alert.alert('Succès', 'Profil mis à jour avec succès!')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username)
      setAddress(profile.address || '')
      setSelectedAvatar(profile.avatar_id)
    }
    setIsEditing(false)
  }

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'Récemment'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  // Affichage si pas de profil chargé
  if (!profile) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
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
          <Text style={styles.title}>Profil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Section Avatar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar</Text>
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
          <Text style={styles.sectionTitle}>Nom d'utilisateur</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={username}
              onChangeText={setUsername}
              placeholder="Votre pseudo"
              placeholderTextColor={colors.mutedForeground}
              editable={isEditing}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
        </View>

        {/* Section Adresse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              value={address}
              onChangeText={setAddress}
              placeholder="Votre adresse (optionnel)"
              placeholderTextColor={colors.mutedForeground}
              editable={isEditing}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Bouton Modifier / Sauvegarder */}
        {!isEditing ? (
          <Pressable
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
          </Pressable>
        ) : (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Informations du profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques de fan</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>{formatMemberSince(profile.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Matchs favoris</Text>
              <Text style={styles.infoValue}>0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Équipes suivies</Text>
              <Text style={styles.infoValue}>0</Text>
            </View>
          </View>
        </View>

        {/* Section compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color={colors.destructive} />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarSelected: {
    borderColor: colors.neonGreen,
    borderWidth: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  textInputDisabled: {
    opacity: 0.7,
  },
  editProfileButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  editProfileButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.foreground,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.neonGreen,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  logoutButtonText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: '600',
  },
})
