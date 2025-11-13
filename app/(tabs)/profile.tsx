import { HomeHeader } from '@/components/HomeHeader'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { ArrowLeft, Check } from 'lucide-react-native'
import { useState } from 'react'
import {
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
  const [username, setUsername] = useState('@Luxevo')
  const [selectedAvatar, setSelectedAvatar] = useState(3) // Avatar par défaut
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    if (username.trim().length < 3) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }

    if (!username.startsWith('@')) {
      setUsername('@' + username.replace('@', ''))
    }

    setIsEditing(false)
    Alert.alert('Succès', 'Profil mis à jour avec succès!')
  }

  const handleCancel = () => {
    setUsername('@Luxevo') // Reset to default
    setSelectedAvatar(3)
    setIsEditing(false)
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
                onPress={() => setSelectedAvatar(avatar.id)}
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
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="@nom_utilisateur"
              placeholderTextColor={colors.mutedForeground}
              editable={isEditing}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Annuler' : 'Modifier'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Boutons d'action */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </Pressable>
          </View>
        )}

        {/* Informations du profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques de fan</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>Janvier 2025</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Matchs favoris</Text>
              <Text style={styles.infoValue}>12</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Équipes suivies</Text>
              <Text style={styles.infoValue}>5</Text>
            </View>
          </View>
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
    marginBottom: 32,
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neonGreen,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
})
