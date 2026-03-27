import SplashLogo from '@/assets/images/splashscreen.svg'
import { colors } from '@/theme/colors'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface SplashScreenProps {
  onFinish: () => void
}

const SPLASH_DURATION = 2500

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))
  const hasStartedExit = useRef(false)

  const startExitAnimation = useCallback(() => {
    if (hasStartedExit.current) return
    hasStartedExit.current = true

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish()
    })
  }, [fadeAnim, scaleAnim, onFinish])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(() => {
      startExitAnimation()
    }, SPLASH_DURATION)

    return () => clearTimeout(timer)
  }, [fadeAnim, scaleAnim, startExitAnimation])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <SplashLogo width={250} height={250} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
