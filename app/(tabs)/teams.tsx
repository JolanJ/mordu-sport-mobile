import { ConferenceSection } from '@/components/ConferenceSection'
import { HomeHeader } from '@/components/HomeHeader'
import { LeagueFilter } from '@/components/LeagueFilter'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { getTeamsByLeague, mockTeams, Team } from '@/lib/teamData'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Animated, Image, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const leagues = ['TOUS', 'NHL', 'NFL', 'MLB', 'NBA', 'NCAA', 'UFC']

export default function Teams() {
  const [selectedLeague, setSelectedLeague] = useState('TOUS')
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`)
  }

  const teams = selectedLeague === 'TOUS' ? mockTeams : getTeamsByLeague(selectedLeague)
  
  // Grouper les équipes par conférence
  const teamsByConference = teams.reduce((acc, team) => {
    if (!acc[team.conference]) {
      acc[team.conference] = []
    }
    acc[team.conference].push(team)
    return acc
  }, {} as Record<string, Team[]>)

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
      
      <LeagueFilter
        leagues={leagues}
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
      />

      <View style={styles.content}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.scrollContent}>
            {/* Liste des équipes par conférence */}
            {Object.entries(teamsByConference).map(([conference, conferenceTeams]) => (
              <ConferenceSection
                key={conference}
                conference={conference}
                teams={conferenceTeams}
                onTeamPress={handleTeamPress}
              />
            ))}
          </View>
        </Animated.ScrollView>
        <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} />
      </View>
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
