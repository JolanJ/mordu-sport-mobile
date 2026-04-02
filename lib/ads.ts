import { Platform } from 'react-native'
import { TestIds } from 'react-native-google-mobile-ads'

/**
 * AdMob configuration
 *
 * Replace the placeholder IDs below with your real AdMob ad unit IDs
 * before publishing to production.
 */

const IS_TEST = __DEV__

// ── Banner Ad Unit IDs ──────────────────────────────────────────────
const BANNER_IDS = {
  ios: 'ca-app-pub-5165277705756059/9071712489',
  android: 'ca-app-pub-5165277705756059/8613496573',
}

// ── Interstitial Ad Unit IDs ────────────────────────────────────────
const INTERSTITIAL_IDS = {
  ios: 'ca-app-pub-5165277705756059/9071712489', // Using banner ID for now — replace with interstitial unit ID if created
  android: 'ca-app-pub-5165277705756059/8613496573',
}

export const AD_UNIT_IDS = {
  BANNER: IS_TEST
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({ ios: BANNER_IDS.ios, android: BANNER_IDS.android })!,

  INTERSTITIAL: IS_TEST
    ? TestIds.INTERSTITIAL
    : Platform.select({ ios: INTERSTITIAL_IDS.ios, android: INTERSTITIAL_IDS.android })!,
}
