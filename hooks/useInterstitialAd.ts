import { AD_UNIT_IDS } from '@/lib/ads'
import { useCallback, useEffect, useRef } from 'react'
import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads'

const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL)

/**
 * Shows an interstitial ad every `frequency` calls.
 * Returns a wrapper you call before navigating — it either shows the ad
 * then runs `onDismissed`, or runs `onDismissed` immediately if the ad
 * isn't ready or it's not time yet.
 */
export function useInterstitialAd({ frequency = 3 }: { frequency?: number } = {}) {
  const countRef = useRef(0)
  const loadedRef = useRef(false)

  useEffect(() => {
    const onLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true
    })
    const onClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false
      interstitial.load()
    })

    interstitial.load()

    return () => {
      onLoaded()
      onClosed()
    }
  }, [])

  const showIfReady = useCallback(
    (onDismissed: () => void) => {
      countRef.current += 1

      if (countRef.current % frequency === 0 && loadedRef.current) {
        const unsub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          unsub()
          onDismissed()
        })
        interstitial.show()
      } else {
        onDismissed()
      }
    },
    [frequency],
  )

  return { showIfReady }
}
