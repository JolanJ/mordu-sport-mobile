import { BANNER_AD_UNIT_ID } from '@/lib/ads'
import { colors } from '@/theme/colors'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'

export function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false)

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={() => setAdLoaded(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
})
