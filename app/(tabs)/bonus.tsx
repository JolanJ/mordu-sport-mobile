import { HomeHeader } from '@/components/HomeHeader'
import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
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
  const { locale, t } = useTranslation()
  const bannerWidth = width - 32
  const bannerHeight = bannerWidth / 3

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {PROMOS.map((promo) => (
          <View key={promo.id} style={styles.promoBlock}>
            <Text style={styles.step}><Text style={styles.stepNumber}>1-</Text> {t('bonusStep1')}</Text>
            <Text style={styles.step}><Text style={styles.stepNumber}>2-</Text> {t('bonusStep2')}</Text>
            <Text style={styles.step}><Text style={styles.stepNumber}>3-</Text> {t('bonusStep3')} <Text style={styles.code}>MORDU99</Text></Text>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardTitle}>{t('bonusRewardTitle')}</Text>
              <Text style={styles.rewardText}>{t('bonusRewardText')}</Text>
            </View>
            <Pressable onPress={() => Linking.openURL(locale === 'fr' ? promo.urlFr : promo.urlEn)}>
              <Image
                source={locale === 'fr' ? promo.imageFr : promo.imageEn}
                style={{ width: bannerWidth, height: bannerHeight, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>
          </View>
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
  promoBlock: {
    gap: 12,
    alignItems: 'flex-start',
  },
  step: {
    fontSize: 15,
    color: colors.foreground,
    lineHeight: 22,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  code: {
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 1,
  },
  highlight: {
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  rewardBox: {
    gap: 4,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  rewardText: {
    fontSize: 15,
    color: colors.foreground,
    lineHeight: 22,
  },
})
