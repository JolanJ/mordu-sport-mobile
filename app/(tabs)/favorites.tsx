import { AdBanner } from '@/components/AdBanner'
import { HomeHeader } from '@/components/HomeHeader'
import { MatchCard } from '@/components/MatchCard'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useMatches } from '@/hooks/useMatches'
import { Match } from '@/lib/types'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { Star } from 'lucide-react-native'
import { useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Favorites() {
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const { t, locale } = useTranslation()

  const { favorites, loading, isFavorite, toggleFavorite, isAuthenticated } = useFavorites()

  // Charger les matchs d'aujourd'hui pour avoir les données à jour
  const { data: todayMatches = [] } = useMatches({ date: new Date(), withLogos: true })

  // Créer une map des matchs d'aujourd'hui pour accès rapide
  const todayMatchesMap = useMemo(() => {
    const map = new Map<string, Match>()
    todayMatches.forEach(match => map.set(match.id, match))
    return map
  }, [todayMatches])

  // Fusionner les données favorites avec les données live
  const favoritesWithLiveData = useMemo(() => {
    return favorites.map(favorite => {
      const liveMatch = todayMatchesMap.get(favorite.match_id)
      return {
        ...favorite,
        match_data: liveMatch || favorite.match_data
      }
    })
  }, [favorites, todayMatchesMap])

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleMatchPress = (matchId: string, matchDate: string) => {
    router.push(`/(tabs)/match/${matchId}?date=${matchDate}` as any)
  }

  const getFavoritesCountText = () => {
    const count = favorites.length
    if (locale === 'fr') {
      return `${count} match${count > 1 ? 's' : ''} favori${count > 1 ? 's' : ''}`
    }
    return `${count} favorite match${count !== 1 ? 'es' : ''}`
  }

  // Non connecté
  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />

          <View style={styles.emptyState}>
          <Star size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>{t('loginRequired')}</Text>
          <Text style={styles.emptySubtext}>
            {t('loginToSaveFavorites')}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Chargement
  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>{t('loadingFavorites')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      {/* Titre de la page */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Star size={20} color={colors.accent} fill={colors.accent} />
          <Text style={styles.title}>{getFavoritesCountText()}</Text>
        </View>
      </View>

      {favoritesWithLiveData.length === 0 ? (
        <View style={styles.emptyState}>
          <Star size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>{t('noFavorites')}</Text>
          <Text style={styles.emptySubtext}>
            {t('addFavoritesHint')}
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
            contentContainerStyle={styles.matchesContainer}
          >
            {favoritesWithLiveData.map((favorite) => (
              <MatchCard
                key={favorite.id}
                match={favorite.match_data}
                onPress={handleMatchPress}
                isFavorite={isFavorite(favorite.match_id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </Animated.ScrollView>
          <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} />
        </View>
      )}
      <AdBanner />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  matchesContainer: {
    paddingVertical: 8,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
})
