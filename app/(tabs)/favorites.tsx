import { HomeHeader } from '@/components/HomeHeader'
import { MatchCard } from '@/components/MatchCard'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { Star } from 'lucide-react-native'
import { useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  Image,
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

  const { favorites, loading, isFavorite, toggleFavorite, isAuthenticated } = useFavorites()

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleMatchPress = (matchId: string) => {
    router.push(`/(tabs)/match/${matchId}` as any)
  }

  // Non connecté
  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />

        <View style={styles.adSpace}>
          <Image
            source={require('@/assets/images/ROC-Display-320x50-FR (1).jpg')}
            style={styles.adImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.emptyState}>
          <Star size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>Connexion requise</Text>
          <Text style={styles.emptySubtext}>
            Connectez-vous pour sauvegarder vos matchs favoris
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

        <View style={styles.adSpace}>
          <Image
            source={require('@/assets/images/ROC-Display-320x50-FR (1).jpg')}
            style={styles.adImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>Chargement des favoris...</Text>
        </View>
      </SafeAreaView>
    )
  }

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
            {favorites.length} match{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
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
            contentContainerStyle={styles.matchesContainer}
          >
            {favorites.map((favorite) => (
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
