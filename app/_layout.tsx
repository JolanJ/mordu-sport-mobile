import { SplashScreen } from '@/components/SplashScreen'
import { UpdateRequiredModal } from '@/components/UpdateRequiredModal'
import { colors } from '@/theme/colors'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { TranslationProvider } from '@/contexts/TranslationContext'
import { prefetchTeamLogos } from '@/hooks/useTeamsWithLogos'
import { prefetchTodayMatches } from '@/hooks/useMatches'
import { useVersionCheck } from '@/hooks/useVersionCheck'

// QueryClient en dehors pour être accessible pendant le prefetch
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
    },
  },
})

function RootLayoutNav() {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    // Si l'utilisateur est connecté et sur les pages auth, rediriger vers l'app
    if (user && inAuthGroup) {
      router.replace('/(tabs)')
    }
    // Mode visiteur: on ne force plus la connexion
  }, [user, loading, segments])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)
  const [isDataReady, setIsDataReady] = useState(false)
  const prefetchStarted = useRef(false)

  // Vérification de version
  const { needsUpdate, requiredVersion, currentVersion, loading: versionLoading } = useVersionCheck()

  // Prefetch des données pendant le splash
  useEffect(() => {
    if (prefetchStarted.current) return
    prefetchStarted.current = true

    const prefetchData = async () => {
      try {
        // Lancer les deux en parallèle
        await Promise.all([
          // Matchs: charge le cache instantanément, puis fetch en arrière-plan
          prefetchTodayMatches(queryClient),
          // Équipes depuis Supabase DB
          prefetchTeamLogos(),
        ])
      } catch (error) {
        // Erreur silencieuse - on continue quand même
      } finally {
        setIsDataReady(true)
      }
    }

    prefetchData()
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SplashScreen onFinish={handleSplashFinish} isDataReady={isDataReady} />
      </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TranslationProvider>
          <FavoritesProvider>
            <RootLayoutNav />
            {/* Modal bloquant si mise à jour requise */}
            <UpdateRequiredModal
              visible={needsUpdate && !versionLoading}
              currentVersion={currentVersion}
              requiredVersion={requiredVersion || ''}
            />
          </FavoritesProvider>
        </TranslationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
