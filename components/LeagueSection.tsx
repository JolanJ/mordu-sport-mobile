import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { Image, StyleSheet, Text, View } from 'react-native'
import { MatchCard } from './MatchCard'

interface LeagueSectionProps {
  league: string
  matches: Match[]
  onMatchPress?: (matchId: string, matchDate: string) => void
  isFavorite?: (matchId: string) => boolean
  onToggleFavorite?: (match: Match) => void
}

const getLeagueLogo = (league: string) => {
  switch (league) {
    case 'NHL':
      return require('@/assets/images/NHL-Logo.png')
    case 'NBA':
      return require('@/assets/images/nba-logo-transparent.png')
    case 'NFL':
      return require('@/assets/images/National_Football_League_logo.svg.png')
    default:
      return null
  }
}

export function LeagueSection({ league, matches, onMatchPress, isFavorite, onToggleFavorite }: LeagueSectionProps) {
  const logo = getLeagueLogo(league)

  if (matches.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Pill avec logo */}
      <View style={styles.pillContainer}>
        <View style={styles.pill}>
          {logo && (
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
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
    padding: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    width: 50,
    height: 50,
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
