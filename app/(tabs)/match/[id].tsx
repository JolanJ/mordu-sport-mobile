import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMatches } from '@/hooks/useMatches'
import { useState, useEffect } from 'react'
import { Match } from '@/lib/types'

export default function MatchRoom() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { profile } = useAuth()
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

      {/* Match Info - Compact */}
      <View style={styles.matchInfoCompact}>
        <View style={styles.teamCompact}>
          {match.awayTeam.logo ? (
            <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogoSmall} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholderSmall}>
              <Text style={styles.logoPlaceholderTextSmall}>{match.awayTeam.abbr}</Text>
            </View>
          )}
          <Text style={styles.teamNameCompact}>{match.awayTeam.abbr}</Text>
          {match.awayTeam.score !== undefined && (
            <Text style={styles.teamScoreCompact}>{match.awayTeam.score}</Text>
          )}
        </View>

        <View style={styles.matchStatus}>
          <Text style={[styles.statusBadge, {
            backgroundColor: match.status === 'live' ? colors.live :
                           match.status === 'finished' ? colors.muted :
                           colors.primary
          }]}>
            {match.status === 'live' ? 'LIVE' :
             match.status === 'finished' ? 'FIN' :
             match.time || 'À venir'}
          </Text>
          {match.venue && <Text style={styles.venueText}>{match.venue}</Text>}
        </View>

        <View style={styles.teamCompact}>
          {match.homeTeam.logo ? (
            <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogoSmall} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholderSmall}>
              <Text style={styles.logoPlaceholderTextSmall}>{match.homeTeam.abbr}</Text>
            </View>
          )}
          <Text style={styles.teamNameCompact}>{match.homeTeam.abbr}</Text>
          {match.homeTeam.score !== undefined && (
            <Text style={styles.teamScoreCompact}>{match.homeTeam.score}</Text>
          )}
        </View>
      </View>

      {/* Chat Room */}
      <ChatRoom
        matchId={match.id}
        username={profile?.username || 'Fan'}
        avatarId={profile?.avatar_id || 1}
      />
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
  // Match Info Compact
  matchInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamCompact: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  teamLogoSmall: {
    width: 40,
    height: 40,
  },
  logoPlaceholderSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  teamNameCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  teamScoreCompact: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  matchStatus: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
    overflow: 'hidden',
  },
  venueText: {
    fontSize: 10,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  // Loading & Error states
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

