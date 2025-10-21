import { HomeHeader } from '@/components/HomeHeader'
import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { mockFavoriteMatches } from '@/lib/mockFavorites'
import { colors } from '@/theme/colors'
import { Star } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Favorites() {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const [selectedLeague, setSelectedLeague] = useState("ALL")

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleMatchPress = (matchId: string) => {
    console.log(`Favorite match ${matchId} pressed`)
    // TODO: Navigation vers la page de détail du match
  }

  // Filtrer les matchs favoris par ligue
  const filteredMatches = selectedLeague === "ALL" 
    ? mockFavoriteMatches 
    : mockFavoriteMatches.filter(match => match.league === selectedLeague)

  // Grouper par ligue
  const nhlMatches = filteredMatches.filter(match => match.league === "NHL")
  const nbaMatches = filteredMatches.filter(match => match.league === "NBA")
  const nflMatches = filteredMatches.filter(match => match.league === "NFL")

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />
      
      {/* Espace publicitaire */}
      <View style={styles.adSpace}>
        <Image 
          source={require('@/assets/images/ROC-Display-320x50-FR (1).jpg')}
          style={styles.adImage}
          resizeMode="cover"
        />
      </View>

      {/* Titre de la page */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Star size={20} color={colors.accent} fill={colors.accent} />
          <Text style={styles.title}>
            {filteredMatches.length} match{filteredMatches.length > 1 ? 's' : ''} favori{filteredMatches.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {filteredMatches.length === 0 ? (
        <View style={styles.emptyState}>
          <Star size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des matchs à vos favoris pour les retrouver ici
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
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
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adSpace: {
    width: 325,
    height: 50,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
