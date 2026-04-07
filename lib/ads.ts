import { Platform } from 'react-native'
import { TestIds } from 'react-native-google-mobile-ads'

const IS_TEST = __DEV__

const BANNER_IDS = {
  ios: 'ca-app-pub-5165277705756059/9071712489',
  android: 'ca-app-pub-5165277705756059/8613496573',
}

export const BANNER_AD_UNIT_ID = IS_TEST
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({ ios: BANNER_IDS.ios, android: BANNER_IDS.android })!
