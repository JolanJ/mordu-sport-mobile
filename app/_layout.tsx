import mobileAds from 'react-native-google-mobile-ads'
import { BannedModal } from '@/components/BannedModal'
import { SplashScreen } from '@/components/SplashScreen'
import { UpdateRequiredModal } from '@/components/UpdateRequiredModal'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { TranslationProvider, useTranslation } from '@/contexts/TranslationContext'
import { prefetchTodayMatches } from '@/hooks/useMatches'
import { prefetchTeamLogos } from '@/hooks/useTeamsWithLogos'
import { useVersionCheck } from '@/hooks/useVersionCheck'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as ExpoSplashScreen from 'expo-splash-screen'
import * as Updates from 'expo-updates'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, View } from 'react-native'

// Keep native splash visible until we're ready
ExpoSplashScreen.preventAutoHideAsync()

// Initialize the Google Mobile Ads SDK
mobileAds()
  .initialize()
  .catch((e: unknown) => console.log('AdMob init error:', e))

// QueryClient en dehors pour être accessible pendant le prefetch
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
    },
  },
})

function RootLayoutNav() {
  const { user, loading, isBanned, clearBanned } = useAuth()
  const { isLocaleLoaded } = useTranslation()
  const segments = useSegments()
  const router = useRouter()
  const isResetFlow = useRef(false)

  // Handle deep links (auth callback, reset password)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      // Extract tokens from URL hash (Supabase sends them as fragments)
      const hash = url.split('#')[1]
      if (hash) {
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (type === 'recovery') {
            isResetFlow.current = true
            router.replace('/(auth)/reset-password')
            return
          }

          // Signup confirmation or magic link — go to main app
          router.replace('/(tabs)')
          return
        }
      }

      // Fallback: URL-based reset password redirect
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        isResetFlow.current = true
        router.replace('/(auth)/reset-password')
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url)
    })

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url)
    })

    return () => subscription.remove()
  }, [])

  useEffect(() => {
    if (loading) return
    if (isResetFlow.current) return

    const inAuthGroup = segments[0] === '(auth)'

    // Si l'utilisateur est connecté et sur les pages auth, rediriger vers l'app
    // Exception: reset-password doit rester accessible même avec une session active
    if (user && inAuthGroup && !(segments as string[]).includes('reset-password')) {
      router.replace('/(tabs)')
    }
    // Mode visiteur: on ne force plus la connexion
  }, [user, loading, segments])

  if (loading || !isLocaleLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <BannedModal visible={isBanned} onDismiss={clearBanned} />
    </>
  )
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)
  const prefetchStarted = useRef(false)

  // Vérification de version
  const { needsUpdate, requiredVersion, currentVersion, loading: versionLoading } = useVersionCheck()

  // Tell React Query when app is focused so it refetches on foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active')
    })
    return () => subscription.remove()
  }, [])

  // Check for OTA updates on launch and when app comes to foreground
  useEffect(() => {
    if (__DEV__) return

    const checkForOTAUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync()
          await Updates.reloadAsync()
        }
      } catch (e) {
        console.log('OTA update check failed:', e)
      }
    }

    checkForOTAUpdate()

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkForOTAUpdate()
      }
    })

    return () => subscription.remove()
  }, [])

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
        // prefetch terminé en arrière-plan
      }
    }

    prefetchData()
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        onLayout={() => ExpoSplashScreen.hideAsync()}
      >
        <SplashScreen onFinish={handleSplashFinish} />
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
