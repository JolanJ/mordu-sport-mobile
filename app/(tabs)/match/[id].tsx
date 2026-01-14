import { colors } from '@/theme/colors'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { useMatches } from '@/hooks/useMatches'
import { useState, useEffect } from 'react'
import { fetchMatches } from '@/lib/services/api'
import { Match } from '@/lib/types'

export default function MatchRoom() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Normaliser l'ID en string pour éviter les problèmes de comparaison
  const normalizedId = id ? String(id).trim() : null
  
  // Essayer d'abord avec les matchs d'aujourd'hui
  const { data: todayMatches = [] } = useMatches({ withLogos: true })
  
  useEffect(() => {
    if (!normalizedId) {
      setIsLoading(false)
      return
    }
    
    // Chercher uniquement dans les matchs d'aujourd'hui
    const foundMatch = todayMatches.find(m => String(m.id).trim() === normalizedId)
    if (foundMatch) {
      // Vérifier que le match est bien d'aujourd'hui (comparer les dates en format string YYYY-MM-DD)
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD
      
      if (foundMatch.date === todayStr) {
        setMatch(foundMatch)
      }
      setIsLoading(false)
      return
    }
    
    // Si pas trouvé dans les matchs d'aujourd'hui, ne pas chercher ailleurs
    setIsLoading(false)
  }, [normalizedId, todayMatches])

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle}>Room du Match</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>Chargement du match...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!match) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle}>Room du Match</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Match non trouvé</Text>
          <Pressable onPress={() => router.back()} style={styles.backButtonPressable}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Room du Match</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Duel - Les deux équipes */}
        <View style={styles.duelContainer}>
          <View style={styles.teamCard}>
            {match.awayTeam.logo ? (
              <Image
                source={{ uri: match.awayTeam.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>{match.awayTeam.abbr}</Text>
              </View>
            )}
            <Text style={styles.teamName}>{match.awayTeam.name}</Text>
            {match.awayTeam.score !== undefined && (
              <Text style={styles.teamScore}>{match.awayTeam.score}</Text>
            )}
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.teamCard}>
            {match.homeTeam.logo ? (
              <Image
                source={{ uri: match.homeTeam.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>{match.homeTeam.abbr}</Text>
              </View>
            )}
            <Text style={styles.teamName}>{match.homeTeam.name}</Text>
            {match.homeTeam.score !== undefined && (
              <Text style={styles.teamScore}>{match.homeTeam.score}</Text>
            )}
          </View>
        </View>

        {/* Infos du match */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                // Parser la date du match (format YYYY-MM-DD) pour éviter les problèmes de timezone
                const [year, month, day] = match.date.split('-').map(Number)
                const matchDate = new Date(year, month - 1, day) // month - 1 car les mois sont 0-indexés
                return matchDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              })()}
            </Text>
          </View>
          
          {match.time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Heure:</Text>
              <Text style={styles.infoValue}>{match.time}</Text>
            </View>
          )}
          
          {match.venue && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lieu:</Text>
              <Text style={styles.infoValue}>{match.venue}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={[styles.infoValue, styles.statusText, {
              color: match.status === 'live' ? colors.live : 
                     match.status === 'finished' ? colors.mutedForeground : 
                     colors.neonBlue
            }]}>
              {match.status === 'live' ? 'En direct' : 
               match.status === 'finished' ? 'Terminé' : 
               'À venir'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  duelContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 24,
  },
  teamCard: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.neonBlue,
  },
  teamLogo: {
    width: 80,
    height: 80,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neonBlue,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.mutedForeground,
  },
  infoContainer: {
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  infoValue: {
    fontSize: 16,
    color: colors.foreground,
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.foreground,
    marginBottom: 20,
  },
  backButtonPressable: {
    padding: 12,
    backgroundColor: colors.neonBlue,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
})

