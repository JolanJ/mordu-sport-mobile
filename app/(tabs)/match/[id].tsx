import { ChatRoom } from '@/components/ChatRoom'
import { MatchEventsComponent } from '@/components/MatchEventsComponent'
import { TeamSeasonStatsComponent } from '@/components/TeamSeasonStatsComponent'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useMatchDetails } from '@/hooks/useMatchDetails'
import { useTeamSeasonStats } from '@/hooks/useTeamSeasonStats'
import { colors } from '@/theme/colors'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, BarChart3, MessageCircle, TrendingUp } from 'lucide-react-native'
import { Image, Keyboard, Pressable, StyleSheet, View, ActivityIndicator, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMatches } from '@/hooks/useMatches'
import { useState, useEffect } from 'react'
import { Match } from '@/lib/types'
import UsfLogo from '@/assets/images/usf.svg'

type TabType = 'chat' | 'events' | 'teamStats'

export default function MatchRoom() {
  const { id, date: dateParam } = useLocalSearchParams<{ id: string; date?: string }>()
  const router = useRouter()
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // Gérer l'ouverture/fermeture du keyboard
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })
    return () => {
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [])

  // Normaliser l'ID en string pour éviter les problèmes de comparaison
  const normalizedId = id ? String(id).trim() : null

  // Utiliser la date passée en paramètre, sinon aujourd'hui
  const matchDate = dateParam ? new Date(dateParam + 'T12:00:00') : new Date()

  // Charger les matchs pour la date spécifique
  const { data: matches = [] } = useMatches({ date: matchDate, withLogos: true })

  // Start fetching match details and season stats immediately (don't wait for tab click)
  useMatchDetails({ matchId: normalizedId || '', date: dateParam, enabled: !!normalizedId })
  useTeamSeasonStats({
    homeTeamId: match?.homeTeam.teamId,
    awayTeamId: match?.awayTeam.teamId,
    enabled: !!match,
  })

  useEffect(() => {
    if (!normalizedId) {
      setIsLoading(false)
      return
    }

    // Chercher le match par ID
    const foundMatch = matches.find(m => String(m.id).trim() === normalizedId)

    if (foundMatch) {
      setMatch(foundMatch)
    }
    setIsLoading(false)
  }, [normalizedId, matches])

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <UsfLogo width={160} height={22} />
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={styles.loadingText}>{t('loadingMatch')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!match) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <UsfLogo width={160} height={22} />
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('matchNotFound')}</Text>
          <Pressable onPress={() => router.back()} style={styles.backButtonPressable}>
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <UsfLogo width={160} height={22} />
        <View style={styles.placeholder} />
      </View>

      {/* Match Info - Full when keyboard closed, mini when open */}
      {keyboardVisible ? (
        <View style={styles.matchInfoMini}>
          <View style={styles.teamMini}>
            <View style={styles.logoContainerMini}>
              {match.awayTeam.logo ? (
                <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogoMini} resizeMode="contain" />
              ) : (
                <Text style={styles.logoPlaceholderTextSmall}>{match.awayTeam.abbr}</Text>
              )}
            </View>
            <Text style={styles.teamNameMini}>{match.awayTeam.abbr}</Text>
          </View>
          <Text style={styles.scoreMini}>{match.awayTeam.score ?? 0}</Text>
          <Text style={styles.timeMini}>
            {match.period ? `${match.period}` : match.time || '-'}
            {match.timeRemaining ? `\n${match.timeRemaining}` : ''}
          </Text>
          <Text style={styles.scoreMini}>{match.homeTeam.score ?? 0}</Text>
          <View style={styles.teamMini}>
            <View style={styles.logoContainerMini}>
              {match.homeTeam.logo ? (
                <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogoMini} resizeMode="contain" />
              ) : (
                <Text style={styles.logoPlaceholderTextSmall}>{match.homeTeam.abbr}</Text>
              )}
            </View>
            <Text style={styles.teamNameMini}>{match.homeTeam.abbr}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.matchInfoCompact}>
          <View style={styles.teamCompact}>
            <View style={styles.logoContainerSmall}>
              {match.awayTeam.logo ? (
                <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogoSmall} resizeMode="contain" />
              ) : (
                <Text style={styles.logoPlaceholderTextSmall}>{match.awayTeam.abbr}</Text>
              )}
            </View>
            <Text style={styles.teamNameCompact}>{match.awayTeam.abbr}</Text>
          </View>
          <Text style={styles.teamScoreCompact}>{match.awayTeam.score ?? 0}</Text>

          <View style={styles.matchStatus}>
            <Text style={styles.periodTimeText}>
              {match.period || match.time || '-'}
            </Text>
            {match.timeRemaining && (
              <Text style={styles.timeRemainingText}>{match.timeRemaining}</Text>
            )}
          </View>

          <Text style={styles.teamScoreCompact}>{match.homeTeam.score ?? 0}</Text>
          <View style={styles.teamCompact}>
            <View style={styles.logoContainerSmall}>
              {match.homeTeam.logo ? (
                <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogoSmall} resizeMode="contain" />
              ) : (
                <Text style={styles.logoPlaceholderTextSmall}>{match.homeTeam.abbr}</Text>
              )}
            </View>
            <Text style={styles.teamNameCompact}>{match.homeTeam.abbr}</Text>
          </View>
        </View>
      )}

      {/* Tab Bar - caché quand keyboard ouvert */}
      {!keyboardVisible && (
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <MessageCircle size={18} color={activeTab === 'chat' ? colors.neonGreen : colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>{t('chat')}</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'events' && styles.tabActive]}
            onPress={() => setActiveTab('events')}
          >
            <BarChart3 size={18} color={activeTab === 'events' ? colors.neonGreen : colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>{t('events')}</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'teamStats' && styles.tabActive]}
            onPress={() => setActiveTab('teamStats')}
          >
            <TrendingUp size={18} color={activeTab === 'teamStats' ? colors.neonGreen : colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'teamStats' && styles.tabTextActive]}>{t('teamStats')}</Text>
          </Pressable>
        </View>
      )}

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <ChatRoom
          matchId={match.id}
          username={profile?.username || 'Fan'}
          avatarId={profile?.avatar_id || 1}
          period={match.period}
          timeRemaining={match.timeRemaining}
          isLive={match.status === 'live'}
        />
      )}
      {activeTab === 'events' && (
        <MatchEventsComponent
          matchId={match.id}
          homeTeamAbbr={match.homeTeam.abbr}
          awayTeamAbbr={match.awayTeam.abbr}
          matchDate={match.date}
        />
      )}
      {activeTab === 'teamStats' && (
        <TeamSeasonStatsComponent
          homeTeamId={match.homeTeam.teamId}
          awayTeamId={match.awayTeam.teamId}
          homeTeamAbbr={match.homeTeam.abbr}
          awayTeamAbbr={match.awayTeam.abbr}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  placeholder: {
    width: 40,
  },
  // Match Info Mini (keyboard open)
  matchInfoMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamMini: {
    alignItems: 'center',
    gap: 2,
  },
  logoContainerMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neonBlue,
  },
  teamNameMini: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.foreground,
  },
  teamLogoMini: {
    width: 34,
    height: 34,
  },
  scoreMini: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  timeMini: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  // Match Info Compact
  matchInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamCompact: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  logoContainerSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neonBlue,
  },
  teamLogoSmall: {
    width: 44,
    height: 44,
  },
  logoPlaceholderTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  teamNameCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  teamScoreCompact: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  matchStatus: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
    overflow: 'hidden',
  },
  periodTimeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
  },
  timeRemainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  venueText: {
    fontSize: 10,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.foreground,
    marginBottom: 20,
  },
  backButtonPressable: {
    padding: 12,
    backgroundColor: colors.neonBlue,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.neonGreen,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.neonGreen,
  },
})
