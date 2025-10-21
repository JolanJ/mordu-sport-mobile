import { Calendar } from '@/components/Calendar'
import { HomeHeader } from '@/components/HomeHeader'
import { MatchList } from '@/components/MatchList'
import { SportLeagues } from '@/components/SportLeagues'
import { colors } from '@/theme/colors'
import { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [selectedLeague, setSelectedLeague] = useState("ALL")

  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league)
  }

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
      
      <SportLeagues onLeagueChange={handleLeagueChange} />
      <Calendar />
      <View style={styles.content}>
        <MatchList selectedLeague={selectedLeague} />
      </View>
    </SafeAreaView>
  )
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
  content: {
    flex: 1,
  },
})

