import { SplashScreen } from '@/components/SplashScreen'
import { colors } from '@/theme/colors'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { TranslationProvider } from '@/contexts/TranslationContext'

const queryClient = new QueryClient()

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

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          </FavoritesProvider>
        </TranslationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
