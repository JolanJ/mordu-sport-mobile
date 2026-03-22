import { LeagueSection } from '@/components/LeagueSection'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useMatches } from '@/hooks/useMatches'
import { api } from '@/lib/services/api'
import { colors } from '@/theme/colors'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Match } from '@/lib/types'
import { useMemo, useRef, useState, useCallback } from 'react'
import { ActivityIndicator, Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface MatchListProps {
  selectedDate?: Date
}

export function MatchList({ selectedDate }: MatchListProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const { t, locale } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

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

  const allMatches = sortedMatches

  const handleMatchPress = useCallback((matchId: string, matchDate: string) => {
    const match = allMatches.find(m => m.id === matchId)

    // Start prefetching everything immediately
    const date = new Date(matchDate + 'T12:00:00')
    queryClient.prefetchQuery({
      queryKey: ['matchDetails', matchId, matchDate],
      queryFn: () => api.fetchMatchDetails(matchId, date),
    })

    // Prefetch season stats for both teams
    if (match?.homeTeam.teamId) {
      queryClient.prefetchQuery({
        queryKey: ['teamSeasonStats', match.homeTeam.teamId, match.awayTeam.teamId],
        queryFn: () => Promise.all([
          api.fetchTeamStats(match.homeTeam.teamId!),
          api.fetchTeamStats(match.awayTeam.teamId!),
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
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedMatch(null)}>
          <View style={styles.modalContent}>
            {selectedMatch && (
              <>
                <Text style={styles.modalTitle}>{t('enterMatchRoom')}</Text>

                <View style={styles.modalTeams}>
                  <View style={styles.modalTeam}>
                    {selectedMatch.awayTeam.logo ? (
                      <View style={styles.modalLogoContainer}>
                        <Image source={{ uri: selectedMatch.awayTeam.logo }} style={styles.modalLogo} resizeMode="contain" />
                      </View>
                    ) : null}
                    <Text style={styles.modalTeamName}>{selectedMatch.awayTeam.abbr}</Text>
                  </View>

                  <Text style={styles.modalVs}>VS</Text>

                  <View style={styles.modalTeam}>
                    {selectedMatch.homeTeam.logo ? (
                      <View style={styles.modalLogoContainer}>
                        <Image source={{ uri: selectedMatch.homeTeam.logo }} style={styles.modalLogo} resizeMode="contain" />
                      </View>
                    ) : null}
                    <Text style={styles.modalTeamName}>{selectedMatch.homeTeam.abbr}</Text>
                  </View>
                </View>

                <Pressable style={styles.modalButton} onPress={handleConfirmEnter}>
                  <Text style={styles.modalButtonText}>{t('enter')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  modalTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  modalTeam: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalLogo: {
    width: 48,
    height: 48,
  },
  modalTeamName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  modalVs: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
})
