import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useMatches } from '@/hooks/useMatches'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { useRef } from 'react'
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from 'react-native'

interface MatchListProps {
  selectedDate?: Date
}

export function MatchList({ selectedDate }: MatchListProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const router = useRouter()

  // Récupérer les matchs NHL depuis l'API
  const queryDate = selectedDate || new Date()
  const { data: matches = [], isLoading, isError } = useMatches({
    date: queryDate,
  })

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  // État de chargement
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.neonGreen} />
        <Text style={styles.loadingText}>Chargement des matchs...</Text>
      </View>
    )
  }

  // État d'erreur
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Erreur de chargement</Text>
        <Text style={styles.errorText}>Impossible de charger les matchs. Vérifiez votre connexion.</Text>
      </View>
    )
  }

  // Afficher les matchs NHL
  if (matches.length === 0) {
    const dateStr = queryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Aucun match prévu</Text>
        <Text style={styles.emptySubtitle}>
          Aucun match NHL prévu pour le {dateStr}
        </Text>
      </View>
    )
  }

  const handleMatchPress = (matchId: string) => {
    router.push(`/(tabs)/match/${matchId}` as any)
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
          matches={matches}
          onMatchPress={handleMatchPress}
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
