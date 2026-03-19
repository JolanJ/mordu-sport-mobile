import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useMatches } from '@/hooks/useMatches'
import { fetchMatchDetails, fetchTeamStats } from '@/lib/services/api'
import { colors } from '@/theme/colors'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Match } from '@/lib/types'
import { useMemo, useRef, useState, useCallback } from 'react'
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

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

  const allMatches = sortedMatches

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

  const queryClient = useQueryClient()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const handleMatchPress = useCallback((matchId: string, matchDate: string) => {
    const match = allMatches.find(m => m.id === matchId)

    // Start prefetching everything immediately
    const date = new Date(matchDate + 'T12:00:00')
    queryClient.prefetchQuery({
      queryKey: ['matchDetails', matchId, matchDate],
      queryFn: () => fetchMatchDetails(matchId, date),
    })

    // Prefetch season stats for both teams
    if (match?.homeTeam.teamId) {
      queryClient.prefetchQuery({
        queryKey: ['teamSeasonStats', match.homeTeam.teamId, match.awayTeam.teamId],
        queryFn: () => Promise.all([
          fetchTeamStats(match.homeTeam.teamId!),
          fetchTeamStats(match.awayTeam.teamId!),
        ]).then(([home, away]) => ({ home, away })),
      })
    }

    // Show confirmation dialog
    if (match) setSelectedMatch(match)
  }, [allMatches, queryClient])

  const handleConfirmEnter = () => {
    if (!selectedMatch) return
    router.push(`/(tabs)/match/${selectedMatch.id}?date=${selectedMatch.date}` as any)
    setSelectedMatch(null)
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

      {/* Match confirmation modal */}
      <Modal visible={!!selectedMatch} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMatch && (
              <>
                <Text style={styles.modalTitle}>{t('enterMatchRoom')}</Text>
                <Text style={styles.modalMatchup}>
                  {selectedMatch.awayTeam.name}
                </Text>
                <Text style={styles.modalVs}>VS</Text>
                <Text style={styles.modalMatchup}>
                  {selectedMatch.homeTeam.name}
                </Text>
                <Pressable style={styles.modalButton} onPress={handleConfirmEnter}>
                  <Text style={styles.modalButtonText}>{t('enter')}</Text>
                </Pressable>
                <Pressable style={styles.modalCancelButton} onPress={() => setSelectedMatch(null)}>
                  <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginBottom: 16,
  },
  modalMatchup: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
  },
  modalVs: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonGreen,
    marginVertical: 8,
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 8,
  },
  modalCancelText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
})
