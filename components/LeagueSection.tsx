import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { Image, StyleSheet, Text, View } from 'react-native'
import { MatchCard } from './MatchCard'

interface LeagueSectionProps {
  league: string
  matches: Match[]
  onMatchPress?: (matchId: string) => void
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

export function LeagueSection({ league, matches, onMatchPress }: LeagueSectionProps) {
  const logo = getLeagueLogo(league)

  if (matches.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Header de la section avec logo et nom */}
      <View style={styles.header}>
        {logo && (
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <Text style={styles.leagueName}>{league}</Text>
      </View>

      {/* Liste des matchs */}
      <View style={styles.matchesContainer}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onPress={onMatchPress}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  matchesContainer: {
    backgroundColor: colors.background,
  },
})
