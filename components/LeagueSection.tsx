import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { StyleSheet, Text, View } from 'react-native'
import { MatchCard } from './MatchCard'

interface LeagueSectionProps {
  league: string
  matches: Match[]
  onMatchPress?: (matchId: string, matchDate: string) => void
  isFavorite?: (matchId: string) => boolean
  onToggleFavorite?: (match: Match) => void
}

export function LeagueSection({ league, matches, onMatchPress, isFavorite, onToggleFavorite }: LeagueSectionProps) {
  if (matches.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Pill avec nom de ligue */}
      <View style={styles.pillContainer}>
        <View style={styles.pill}>
          <Text style={styles.leagueName}>{league}</Text>
        </View>
      </View>

      {/* Liste des matchs */}
      <View style={styles.matchesContainer}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onPress={onMatchPress}
            isFavorite={isFavorite?.(match.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pillContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leagueName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  matchesContainer: {
    backgroundColor: colors.background,
  },
})
