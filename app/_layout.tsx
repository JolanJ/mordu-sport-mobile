import { SplashScreen } from '@/components/SplashScreen'
import { colors } from '@/theme/colors'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
