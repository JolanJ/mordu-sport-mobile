import { HomeHeader } from '@/components/HomeHeader'
import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { Image, Linking, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PROMOS = [
  {
    id: 'bet99',
    imageFr: require('@/assets/images/bet99Promo.png'),
    imageEn: require('@/assets/images/bet99PromoEn.png'),
    urlFr: 'https://bet99.com/fr/promotions/affiliate-sports-600?bTag=UaOCb8Xie8JkSbMrJy6xA2Nd7ZgqdRLk&aff=666&group=AFF800_FBE',
    urlEn: 'https://bet99.com/en/promotions/affiliate-sports-600?bTag=UaOCb8Xie8JkSbMrJy6xA2Nd7ZgqdRLk&aff=666&group=AFF800_FBE',
  },
]

export default function BonusScreen() {
  const { width } = useWindowDimensions()
  const { locale } = useTranslation()
  const bannerWidth = width - 32
  const bannerHeight = bannerWidth / 3

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {PROMOS.map((promo) => (
          <Pressable key={promo.id} onPress={() => Linking.openURL(locale === 'fr' ? promo.urlFr : promo.urlEn)}>
            <Image
              source={locale === 'fr' ? promo.imageFr : promo.imageEn}
              style={{ width: bannerWidth, height: bannerHeight, borderRadius: 8 }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
})
