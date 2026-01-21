import { SplashScreen } from '@/components/SplashScreen'
import { colors } from '@/theme/colors'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'

const queryClient = new QueryClient()

function RootLayoutNav() {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)')
    }
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
        <FavoritesProvider>
          <RootLayoutNav />
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
