import SplashLogo from '@/assets/images/splashscreen.svg'
import { colors } from '@/theme/colors'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface SplashScreenProps {
  onFinish: () => void
  isDataReady?: boolean
}

const MIN_SPLASH_DURATION = 2500 // Minimum 2.5 secondes pour l'animation
const MAX_SPLASH_DURATION = 5000 // Maximum 5 secondes d'attente

export function SplashScreen({ onFinish, isDataReady = false }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const hasStartedExit = useRef(false)

  const startExitAnimation = useCallback(() => {
    if (hasStartedExit.current) return
    hasStartedExit.current = true

    // Animation de sortie
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
    // Animation d'entrée
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

    // Timer minimum pour l'animation
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, MIN_SPLASH_DURATION)

    // Timer maximum de sécurité
    const maxTimer = setTimeout(() => {
      startExitAnimation()
    }, MAX_SPLASH_DURATION)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [fadeAnim, scaleAnim, startExitAnimation])

  // Fermer quand les données sont prêtes ET le temps minimum est écoulé
  useEffect(() => {
    if (isDataReady && minTimeElapsed) {
      startExitAnimation()
    }
  }, [isDataReady, minTimeElapsed, startExitAnimation])

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
