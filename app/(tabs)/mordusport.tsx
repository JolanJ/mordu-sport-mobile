import { Calendar } from '@/components/Calendar';
import { HomeHeader } from '@/components/HomeHeader';
import { SportLeagues } from '@/components/SportLeagues';
import { colors, fonts } from '@/theme/colors';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MorduSport() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />
      
      {/* Espace publicitaire */}
      <View style={styles.adSpace}>
        <Image 
          source={require('@/assets/images/ROC-Display-320x50-FR (1).jpg')}
          style={styles.adImage}
          resizeMode="cover"
        />
      </View>
      
      <SportLeagues />
      <Calendar />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.text}>Mordu Sport screen</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adSpace: {
    width: 325,
    height: 50,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  text: {
    color: colors.foreground,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.medium,
  },
});
