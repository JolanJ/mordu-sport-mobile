import { fetchPlayerImage } from '@/lib/services/api'
import { colors } from '@/theme/colors'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'

interface PlayerAvatarProps {
  playerId: string
  playerNumber: string
  size?: number
  color: string
}

export function PlayerAvatar({ playerId, playerNumber, size = 56, color }: PlayerAvatarProps) {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadImage = async () => {
      if (!playerId) {
        setIsLoading(false)
        setHasError(true)
        return
      }

      try {
        const uri = await fetchPlayerImage(playerId)
        if (isMounted) {
          setImageUri(uri)
          setHasError(!uri)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [playerId])

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: `${color}1A`,
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator size="small" color={color} />
      </View>
    )
  }

  // Error or no image - show number
  if (hasError || !imageUri) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.numberText, { color, fontSize: size * 0.32 }]}>
          #{playerNumber}
        </Text>
      </View>
    )
  }

  // Show image
  return (
    <View style={[styles.container, containerStyle, { overflow: 'hidden' }]}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
        onError={() => setHasError(true)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: 'bold',
  },
  image: {
    borderRadius: 999,
  },
})
