import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useMatches } from '@/hooks/useMatches'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { useMemo, useRef } from 'react'
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from 'react-native'

interface MatchListProps {
  selectedDate?: Date
}

export function MatchList({ selectedDate }: MatchListProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const { t, locale } = useTranslation()

  // Récupérer les matchs NHL depuis l'API
  const queryDate = selectedDate || new Date()
  const { data: matches = [], isLoading, isError } = useMatches({
    date: queryDate,
  })

  // Gestion des favoris
  const { isFavorite, toggleFavorite } = useFavorites()

  // Trier les matchs: favoris en premier
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const aIsFav = isFavorite(a.id) ? 1 : 0
      const bIsFav = isFavorite(b.id) ? 1 : 0
      return bIsFav - aIsFav // Favoris en premier
    })
  }, [matches, isFavorite])

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  // État de chargement
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.neonGreen} />
        <Text style={styles.loadingText}>{t('loadingMatches')}</Text>
      </View>
    )
  }

  // État d'erreur
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>{t('loadingError')}</Text>
        <Text style={styles.errorText}>{t('loadingErrorMessage')}</Text>
      </View>
    )
  }

  // TODO: REMOVE MOCK - Mock match pour tester le chat
  const MOCK_MATCH = {
    id: 'mock-chat-test',
    league: 'NHL' as const,
    status: 'live' as const,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    period: '2nd',
    timeRemaining: '12:34',
    venue: 'Centre Bell',
    awayTeam: { name: 'Toronto Maple Leafs', abbr: 'TOR', logo: 'https://wrajekuuhbuneoualiix.supabase.co/storage/v1/object/sign/usfJersey/tor.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNDk3ZGYxNS04MDcxLTQxZjQtOGZmNi00MWI3NzQyZTU2MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2ZKZXJzZXkvdG9yLnBuZyIsImlhdCI6MTc3MDc2MDM4MiwiZXhwIjozMzI3NTIyNDM4Mn0.Rr6RIdWSLEVmlxpI7edfDxgQK2DyJEUuMt-eEc4gP7U', score: 2 },
    homeTeam: { name: 'Montreal Canadiens', abbr: 'MTL', logo: 'https://wrajekuuhbuneoualiix.supabase.co/storage/v1/object/sign/usfJersey/mtl.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNDk3ZGYxNS04MDcxLTQxZjQtOGZmNi00MWI3NzQyZTU2MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2ZKZXJzZXkvbXRsLnBuZyIsImlhdCI6MTc3MDc2MDMyMiwiZXhwIjozMzI3NTIyNDMyMn0.pgDP6ymgmk-iNH6Ovk2n9bYA7vQ3-Ka9eqb9I5CtxFc', score: 3 },
  }
  const allMatches = [MOCK_MATCH, ...sortedMatches]

  // Afficher les matchs NHL
  if (matches.length === 0 && false) {
    const dateStr = queryDate.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t('noMatchesScheduled')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('noMatchesForDate', { date: dateStr })}
        </Text>
      </View>
    )
  }

  const handleMatchPress = (matchId: string, matchDate: string) => {
    // Passer la date du match pour trouver le bon match
    router.push(`/(tabs)/match/${matchId}?date=${matchDate}` as any)
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
          league="NHL"
          matches={allMatches}
          onMatchPress={handleMatchPress}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
})
