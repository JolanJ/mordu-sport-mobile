import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { ChevronRight } from 'lucide-react-native'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface MatchCardProps {
  match: Match
  onPress?: (matchId: string) => void
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const handlePress = () => {
    onPress?.(match.id)
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
    switch (match.status) {
      case 'live':
        return match.time
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
      {/* Ligne en haut : Bell Centre à gauche, Heure à droite */}
      <View style={styles.headerRow}>
        <Text style={styles.venueText}>Bell Centre</Text>
        <View style={styles.spacer} />
        <Text style={styles.timeText}>{getStatusText()}</Text>
      </View>

      <View style={styles.teamsSection}>
        {/* Équipe Visiteur (Away) */}
        <View style={styles.teamRow}>
          {/* Colonne 1: Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: match.awayTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          
          {/* Colonne 2: Nom */}
          <Text style={styles.teamName}>{match.awayTeam.abbr}</Text>
          
          {/* Colonne 3: Score */}
          <View style={styles.scoreContainer}>
            {match.awayTeam.score !== undefined ? (
              <Text style={getScoreStyle(match.awayTeam.score, match.homeTeam.score)}>
                {match.awayTeam.score}
              </Text>
            ) : (
              <Text style={styles.scoreNormal}>-</Text>
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
            <Image
              source={{ uri: match.homeTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          
          {/* Colonne 2: Nom */}
          <Text style={styles.teamName}>{match.homeTeam.abbr}</Text>
          
          {/* Colonne 3: Score */}
          <View style={styles.scoreContainer}>
            {match.homeTeam.score !== undefined ? (
              <Text style={getScoreStyle(match.homeTeam.score, match.awayTeam.score)}>
                {match.homeTeam.score}
              </Text>
            ) : (
              <Text style={styles.scoreNormal}>-</Text>
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
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
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