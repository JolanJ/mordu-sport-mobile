import { useAuth } from '@/contexts/AuthContext'
import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { ChevronRight, Plus, Star } from 'lucide-react-native'
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface MatchCardProps {
  match: Match
  onPress?: (matchId: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (match: Match) => void
}

export function MatchCard({ match, onPress, isFavorite = false, onToggleFavorite }: MatchCardProps) {
  const { user } = useAuth()

  // Afficher le bouton favoris si: pas terminé OU a une période (match en cours mal détecté)
  const showFavoriteButton = match.status !== 'finished' || !!match.period

  const handleFavoritePress = () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous pour ajouter des matchs en favoris',
        [{ text: 'OK', style: 'default' }]
      )
      return
    }
    onToggleFavorite?.(match)
  }
  // Vérifier si le match est d'aujourd'hui (comparer les dates en format string YYYY-MM-DD)
  const isToday = () => {
    const today = new Date()
    // Utiliser l'heure locale au lieu de UTC
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}` // Format: YYYY-MM-DD en heure locale
    return match.date === todayStr
  }

  const handlePress = () => {
    // Vérifier si le match est d'aujourd'hui
    if (isToday()) {
      // Permettre la navigation seulement si le match est d'aujourd'hui
      onPress?.(match.id)
    } else {
      // Afficher un message stylé si le match n'est pas d'aujourd'hui
      // Parser la date du match (format YYYY-MM-DD)
      const [year, month, day] = match.date.split('-').map(Number)
      const matchDate = new Date(year, month - 1, day) // month - 1 car les mois sont 0-indexés
      
      const dateStr = matchDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      
      Alert.alert(
        '🚫 Room verrouillée',
        `La room de ce match sera disponible le ${dateStr}.\n\nRevenez ce jour-là pour suivre le match en direct ! 🔥`,
        [
          {
            text: 'Compris',
            style: 'default'
          }
        ]
      )
    }
  }

  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return colors.live
      case 'upcoming':
        return colors.neonBlue
      case 'finished':
        return colors.mutedForeground
      default:
        return colors.mutedForeground
    }
  }

  const getStatusText = () => {
    // Si on a une période, le match est en cours
    if (match.period) {
      return match.period
    }

    switch (match.status) {
      case 'live':
        return 'En cours'
      case 'upcoming':
        return match.time
      case 'finished':
        return 'TERMINÉ'
      default:
        return match.time
    }
  }

  const getScoreStyle = (teamScore: number | undefined, opponentScore: number | undefined) => {
    if (teamScore === undefined || opponentScore === undefined) {
      return styles.scoreNormal
    }

    if (teamScore > opponentScore) {
      return styles.scoreWinner
    }

    return styles.scoreNormal
  }

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
    >
      {/* Ligne en haut : Venue à gauche, Heure + Favori à droite */}
      <View style={styles.headerRow}>
        <Text style={styles.venueText} numberOfLines={1}>
          {match.venue || 'Stade non disponible'}
        </Text>
        <View style={styles.spacer} />
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>{getStatusText()}</Text>
          {showFavoriteButton && (
            <Pressable
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isFavorite ? (
                <Star size={16} color={colors.accent} fill={colors.accent} />
              ) : (
                <Plus size={16} color={colors.mutedForeground} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.teamsSection}>
        {/* Équipe Visiteur (Away) */}
        <View style={styles.teamRow}>
          {/* Colonne 1: Logo */}
          <View style={styles.logoContainer}>
            {match.awayTeam.logo ? (
              <Image
                source={{ uri: match.awayTeam.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoPlaceholder}>{match.awayTeam.abbr.substring(0, 2)}</Text>
            )}
          </View>
          
          {/* Colonne 2: Nom */}
          <Text style={styles.teamName}>{match.awayTeam.abbr}</Text>
          
          {/* Colonne 3: Score */}
          <View style={styles.scoreContainer}>
            {match.status === 'upcoming' ? (
              <Text style={styles.scoreNormal}>-</Text>
            ) : (
              <Text style={getScoreStyle(match.awayTeam.score ?? 0, match.homeTeam.score ?? 0)}>
                {match.awayTeam.score ?? 0}
              </Text>
            )}
          </View>

          {/* Colonne 4: Cotes */}
          <View style={styles.oddsColumn}>
            <Text style={styles.oddsTextOrange}>1.85</Text>
          </View>
        </View>

        {/* Équipe Locale (Home) */}
        <View style={styles.teamRow}>
          {/* Colonne 1: Logo */}
          <View style={styles.logoContainer}>
            {match.homeTeam.logo ? (
              <Image
                source={{ uri: match.homeTeam.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoPlaceholder}>{match.homeTeam.abbr.substring(0, 2)}</Text>
            )}
          </View>

          {/* Colonne 2: Nom */}
          <Text style={styles.teamName}>{match.homeTeam.abbr}</Text>

          {/* Colonne 3: Score */}
          <View style={styles.scoreContainer}>
            {match.status === 'upcoming' ? (
              <Text style={styles.scoreNormal}>-</Text>
            ) : (
              <Text style={getScoreStyle(match.homeTeam.score ?? 0, match.awayTeam.score ?? 0)}>
                {match.homeTeam.score ?? 0}
              </Text>
            )}
          </View>

          {/* Colonne 4: Flèche */}
          <View style={styles.arrowColumn}>
            <ChevronRight size={20} color="#F27020" />
          </View>
        </View>
      </View>

    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    shadowColor: colors.neonBlue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spacer: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  favoriteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: colors.accent,
  },
  oddsTextOrange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F27020',
  },
  arrowColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamsSection: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neonBlue,
  },
  teamLogo: {
    width: 26,
    height: 26,
  },
  logoPlaceholder: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  teamName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
    flex: 1,
  },
  scoreContainer: {
    width: 40,
    alignItems: 'center',
  },
  scoreNormal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  scoreWinner: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neonBlue,
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  oddsColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oddsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  oddsLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginTop: 1,
  },
  venueColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  chatColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  emptyColumn: {
    width: 75,
  },
})