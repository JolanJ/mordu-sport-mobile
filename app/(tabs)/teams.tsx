import { ConferenceSection } from '@/components/ConferenceSection'
import { HomeHeader } from '@/components/HomeHeader'
import { LeagueFilter } from '@/components/LeagueFilter'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { useTranslation } from '@/contexts/TranslationContext'
import { useTeamsWithLogos } from '@/hooks/useTeamsWithLogos'
import { api } from '@/lib/services/api'
import { getTeamById, Team } from '@/lib/teamData'
import { colors } from '@/theme/colors'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const leagues = ['NHL', 'NFL', 'NBA']

export default function Teams() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0])
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const { t } = useTranslation()

  // Utiliser le hook pour avoir les équipes avec logos
  const { teams, isLoading } = useTeamsWithLogos(selectedLeague)

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const queryClient = useQueryClient()

  const handleTeamPress = (teamId: string) => {
    // Prefetch team data before navigating
    const team = getTeamById(teamId)
    const gId = team?.goalserveId
    if (gId) {
      queryClient.prefetchQuery({ queryKey: ['teamRoster', gId], queryFn: () => api.fetchTeamRoster(gId) })
      queryClient.prefetchQuery({ queryKey: ['teamStats', gId], queryFn: () => api.fetchTeamStats(gId) })
      queryClient.prefetchQuery({ queryKey: ['playerStats', gId], queryFn: () => api.fetchPlayerStats(gId) })
      queryClient.prefetchQuery({ queryKey: ['teamInjuries', gId], queryFn: () => api.fetchTeamInjuries(gId) })
    }
    router.push(`/teams/${teamId}`)
  }

  // Grouper les équipes par conférence
  const teamsByConference = teams.reduce((acc: Record<string, Team[]>, team: Team) => {
    if (!acc[team.conference]) {
      acc[team.conference] = []
    }
    acc[team.conference].push(team)
    return acc
  }, {} as Record<string, Team[]>)

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      <LeagueFilter
        leagues={leagues}
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
        centered
      />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.neonGreen} />
            <Text style={styles.loadingText}>{t('loadingTeams')}</Text>
          </View>
        ) : (
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
                  teams={conferenceTeams as Team[]}
                  onTeamPress={handleTeamPress}
                />
              ))}
            </View>
          </Animated.ScrollView>
        )}
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.mutedForeground,
  },
});
