import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { mockMatches } from '@/lib/mockData'
import { colors } from '@/theme/colors'
import { useRef } from 'react'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'

interface MatchListProps {
  selectedLeague?: string
  selectedDate?: string
}

export function MatchList({ selectedLeague = "NHL", selectedDate }: MatchListProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  // Si une ligue spécifique est sélectionnée, afficher seulement cette ligue
  if (selectedLeague && selectedLeague !== "ALL") {
    const matches = mockMatches.filter(match => match.league === selectedLeague)
    
    if (matches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun match prévu</Text>
          <Text style={styles.emptySubtitle}>
            Aucun match {selectedLeague} prévu pour le moment
          </Text>
        </View>
      )
    }

    const handleMatchPress = (matchId: string) => {
      console.log(`Match ${matchId} pressed`)
      // TODO: Navigation vers la page de détail du match
    }

    return (
      <View style={styles.container}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <LeagueSection
            league={selectedLeague}
            matches={matches}
            onMatchPress={handleMatchPress}
          />
        </Animated.ScrollView>
        <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} />
      </View>
    )
  }

  // Sinon, afficher toutes les ligues avec leurs sections
  const nhlMatches = mockMatches.filter(match => match.league === "NHL")
  const nbaMatches = mockMatches.filter(match => match.league === "NBA")
  const nflMatches = mockMatches.filter(match => match.league === "NFL")

  const handleMatchPress = (matchId: string) => {
    console.log(`Match ${matchId} pressed`)
    // TODO: Navigation vers la page de détail du match
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {nhlMatches.length > 0 && (
          <LeagueSection
            league="NHL"
            matches={nhlMatches}
            onMatchPress={handleMatchPress}
          />
        )}
        
        {nbaMatches.length > 0 && (
          <LeagueSection
            league="NBA"
            matches={nbaMatches}
            onMatchPress={handleMatchPress}
          />
        )}
        
        {nflMatches.length > 0 && (
          <LeagueSection
            league="NFL"
            matches={nflMatches}
            onMatchPress={handleMatchPress}
          />
        )}
      </Animated.ScrollView>
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adSpace: {
    width: 320,
    height: 50,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  adText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  adSubtext: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
})
