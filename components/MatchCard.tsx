import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { ChevronRight, Plus, Star } from 'lucide-react-native'
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface MatchCardProps {
  match: Match
  onPress?: (matchId: string, matchDate: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (match: Match) => void
}

export function MatchCard({ match, onPress, isFavorite = false, onToggleFavorite }: MatchCardProps) {
  const { user } = useAuth()
  const { t } = useTranslation()

  // Afficher le bouton favoris si: pas terminé OU a une période (match en cours mal détecté)
  const showFavoriteButton = match.status !== 'finished' || !!match.period

  const handleFavoritePress = () => {
    if (!user) {
      Alert.alert(
        t('loginRequired'),
        t('loginToAddFavorites'),
        [{ text: 'OK', style: 'default' }]
      )
      return
    }
    onToggleFavorite?.(match)
  }
  const handlePress = () => {
    // Permettre la navigation vers la room peu importe la date
    onPress?.(match.id, match.date)
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
    // Si on a un statusText (clé de traduction comme "intermission")
    if (match.statusText) {
      return t(match.statusText as any)
    }

    // Si on a une période, le match est en cours
    if (match.period) {
      return match.period
    }

    switch (match.status) {
      case 'live':
        return t('live')
      case 'upcoming':
        return match.time
      case 'finished':
        return t('finished')
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
      {/* Ligne en haut : Venue à gauche, Favori à droite */}
      <View style={styles.headerRow}>
        <Text style={styles.venueText} numberOfLines={1} ellipsizeMode="tail">
          {match.venue || t('venueNotAvailable')}
        </Text>
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

          {/* Colonne 4: Statut (période/heure/entracte) */}
          <View style={styles.statusColumn}>
            <Text style={styles.statusColumnText}>{getStatusText()}</Text>
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
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
  arrowColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusColumn: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusColumnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neonBlue,
    overflow: 'hidden',
  },
  teamLogo: {
    width: 40,
    height: 40,
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
    flex: 1,
    flexShrink: 1,
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
  emptyColumn: {
    width: 75,
  },
})
