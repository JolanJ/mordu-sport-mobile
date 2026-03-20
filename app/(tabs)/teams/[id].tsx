import { AdBanner } from '@/components/AdBanner'
import { HomeHeader } from '@/components/HomeHeader'
import { InjuryReport } from '@/components/InjuryReport'
import { TabsNavigation } from '@/components/TabsNavigation'
import { TeamBanner } from '@/components/TeamBanner'
import { TeamRosterComponent } from '@/components/TeamRosterComponent'
import { TeamStatsComponent } from '@/components/TeamStatsComponent'
import { useTranslation } from '@/contexts/TranslationContext'
import { useTeamData } from '@/hooks/useTeamData'
import { colors } from '@/theme/colors'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type TabType = 'players' | 'stats' | 'injuries'

export default function TeamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('players')
  const { t } = useTranslation()

  // Utiliser le hook pour fetcher les vraies données
  const {
    teamBasicInfo,
    roster,
    teamInfo,
    teamStats,
    playerStats,
    injuries,
    isLoading,
    hasGoalserveId,
  } = useTeamData({ teamId: id || '' })

  // Helper pour trouver les stats d'un joueur par son nom
  const findPlayerStats = (playerName: string) => {
    return playerStats.find(ps => ps.name.toLowerCase() === playerName.toLowerCase())
  }

  // Loading state
  if (isLoading && hasGoalserveId) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>{t('loadingData')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Équipe non trouvée
  if (!teamBasicInfo) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('teamNotFound')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Transformer les données pour les composants
  const displayTeamInfo = {
    id: teamBasicInfo.id,
    name: teamInfo?.name || teamBasicInfo.name,
    abbr: teamInfo?.abbr || teamBasicInfo.abbr,
    city: teamBasicInfo.city,
    league: teamBasicInfo.league,
    conference: teamBasicInfo.conference,
    division: teamBasicInfo.division,
  }

  const displayTeamStats = teamStats ? {
    wins: teamStats.wins,
    losses: teamStats.losses,
    otLosses: teamStats.otLosses,
    points: teamStats.points,
    gamesPlayed: teamStats.gamesPlayed,
    goalsFor: teamStats.goalsFor,
    goalsAgainst: teamStats.goalsAgainst,
    shotsPerGame: teamStats.shotsPerGame,
    shotsAllowedPerGame: teamStats.shotsAgainstPerGame,
    powerPlayPercentage: teamStats.powerPlayPercentage,
    powerPlayGoals: 0, // Non disponible dans l'API
    powerPlayOpportunities: 0,
    penaltyKillPercentage: teamStats.penaltyKillPercentage,
    faceoffWinPercentage: '50%', // Non disponible
  } : teamBasicInfo.stats ? {
    wins: teamBasicInfo.stats.wins,
    losses: teamBasicInfo.stats.losses,
    otLosses: teamBasicInfo.stats.otLosses || 0,
    points: teamBasicInfo.stats.points,
    gamesPlayed: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    shotsPerGame: 0,
    shotsAllowedPerGame: 0,
    powerPlayPercentage: '0%',
    powerPlayGoals: 0,
    powerPlayOpportunities: 0,
    penaltyKillPercentage: '0%',
    faceoffWinPercentage: '0%',
  } : null

  // Transformer le roster pour le composant avec les vraies stats
  const displayRoster = roster ? {
    forwards: roster.forwards.map(p => {
      const stats = findPlayerStats(p.name)
      return {
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        gamesPlayed: stats?.gamesPlayed || p.gamesPlayed,
        birthplace: p.birthplace,
        points: stats?.points || 0,
        goals: stats?.goals || 0,
        assists: stats?.assists || 0,
      }
    }),
    defensemen: roster.defensemen.map(p => {
      const stats = findPlayerStats(p.name)
      return {
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        gamesPlayed: stats?.gamesPlayed || p.gamesPlayed,
        birthplace: p.birthplace,
        points: stats?.points || 0,
        goals: stats?.goals || 0,
        assists: stats?.assists || 0,
      }
    }),
    goalies: roster.goalies.map(p => {
      const stats = findPlayerStats(p.name)
      return {
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        gamesPlayed: stats?.gamesPlayed || p.gamesPlayed,
        birthplace: p.birthplace,
        // Stats spécifiques aux gardiens
        wins: stats?.wins,
        losses: stats?.losses,
        savePercentage: stats?.savePercentage,
      }
    }),
  } : { forwards: [], defensemen: [], goalies: [] }

  // Transformer les blessures pour le composant
  const displayInjuries = injuries.map(inj => ({
    playerId: inj.playerId,
    playerName: inj.playerName,
    position: '', // Non disponible dans l'API
    injury: inj.description,
    status: inj.status as 'OUT' | 'Day-to-Day' | 'IR',
    date: inj.date,
  }))

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      {/* Team Banner - Sticky */}
      <TeamBanner
        abbr={displayTeamInfo.abbr}
        name={displayTeamInfo.name}
        division={displayTeamInfo.division}
        conference={displayTeamInfo.conference}
        wins={displayTeamStats?.wins || 0}
        losses={displayTeamStats?.losses || 0}
        otLosses={displayTeamStats?.otLosses || 0}
        points={displayTeamStats?.points || 0}
        logo={teamInfo?.logo}
      />

      {/* Tabs Navigation - Sticky */}
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenu scrollable selon l'onglet actif */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'players' && <TeamRosterComponent roster={displayRoster} />}
        {activeTab === 'stats' && displayTeamStats && <TeamStatsComponent stats={displayTeamStats} />}
        {activeTab === 'injuries' && <InjuryReport injuries={displayInjuries} />}
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Espace pour le bottom nav
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
})
