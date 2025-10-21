import { colors } from '@/theme/colors'
import { ArrowUp } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'

interface ScrollToTopButtonProps {
  scrollY: Animated.Value
  onPress: () => void
}

export function ScrollToTopButton({ scrollY, onPress }: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setVisible(value > 300) // Afficher après 300px de scroll
    })

    return () => {
      scrollY.removeListener(listener)
    }
  }, [scrollY])

  if (!visible) return null

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <ArrowUp size={20} color={colors.mutedForeground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 16, // Collé au bottom nav
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.card}E6`, // 90% opacity
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
})

