import { HomeHeader } from '@/components/HomeHeader'
import { InjuryReport } from '@/components/InjuryReport'
import { TabsNavigation } from '@/components/TabsNavigation'
import { TeamBanner } from '@/components/TeamBanner'
import { TeamRosterComponent } from '@/components/TeamRosterComponent'
import { TeamStatsComponent } from '@/components/TeamStatsComponent'
import { mockTeamDetail } from '@/lib/mockTeamDetail'
import { colors } from '@/theme/colors'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type TabType = 'players' | 'stats' | 'injuries'

export default function TeamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('players')

  // Charger les données mock de l'équipe
  const teamData = id ? mockTeamDetail[id] : null

  if (!teamData) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <HomeHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Équipe non trouvée</Text>
        </View>
      </SafeAreaView>
    )
  }

  const { teamInfo, teamStats, roster, injuries } = teamData

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

      {/* Team Banner - Sticky */}
      <TeamBanner
        abbr={teamInfo.abbr}
        name={teamInfo.name}
        division={teamInfo.division}
        conference={teamInfo.conference}
        wins={teamStats.wins}
        losses={teamStats.losses}
        otLosses={teamStats.otLosses}
        points={teamStats.points}
      />

      {/* Tabs Navigation - Sticky */}
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenu scrollable selon l'onglet actif */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'players' && <TeamRosterComponent roster={roster} />}
        {activeTab === 'stats' && <TeamStatsComponent stats={teamStats} />}
        {activeTab === 'injuries' && <InjuryReport injuries={injuries} />}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Espace pour le bottom nav
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

