import { useTranslation } from '@/contexts/TranslationContext'
import { useMatchDetails } from '@/hooks/useMatchDetails'
import { GoalEvent, PenaltyEvent } from '@/lib/types'
import { colors } from '@/theme/colors'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

interface MatchEventsComponentProps {
  matchId: string
  homeTeamAbbr: string
  awayTeamAbbr: string
}

export function MatchEventsComponent({ matchId, homeTeamAbbr, awayTeamAbbr }: MatchEventsComponentProps) {
  const { t } = useTranslation()
  const { data: details, isLoading, isError } = useMatchDetails({ matchId })

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.neonGreen} />
        <Text style={styles.loadingText}>{t('loadingEvents')}</Text>
      </View>
    )
  }

  if (isError || !details) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t('eventsNotAvailable')}</Text>
      </View>
    )
  }

  const { events, teamStats, periodScores, powerplay } = details

  // Séparer les buts et les pénalités
  const goals = events.filter((e): e is GoalEvent => e.type === 'goal')
  const penalties = events.filter((e): e is PenaltyEvent => e.type === 'penalty')

  const getTeamAbbr = (team: 'home' | 'away') => team === 'home' ? homeTeamAbbr : awayTeamAbbr

  const getGoalTypeLabel = (goalType: GoalEvent['goalType']) => {
    switch (goalType) {
      case 'pp': return t('goalTypePP')
      case 'sh': return t('goalTypeSH')
      case 'en': return t('goalTypeEN')
      case 'ps': return t('goalTypeSO')
      default: return null
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Résumé par période */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('scoreByPeriod')}</Text>
        <View style={styles.periodScoresContainer}>
          <View style={styles.periodScoreRow}>
            <Text style={styles.periodTeamName}>{awayTeamAbbr}</Text>
            {periodScores.away.map((score, i) => (
              <Text key={i} style={styles.periodScore}>{score}</Text>
            ))}
            <Text style={styles.periodTotalScore}>
              {periodScores.away.reduce((a, b) => a + b, 0)}
            </Text>
          </View>
          <View style={styles.periodScoreRow}>
            <Text style={styles.periodTeamName}>{homeTeamAbbr}</Text>
            {periodScores.home.map((score, i) => (
              <Text key={i} style={styles.periodScore}>{score}</Text>
            ))}
            <Text style={styles.periodTotalScore}>
              {periodScores.home.reduce((a, b) => a + b, 0)}
            </Text>
          </View>
          <View style={styles.periodLabelsRow}>
            <Text style={styles.periodLabelTeam}></Text>
            {periodScores.home.map((_, i) => (
              <Text key={i} style={styles.periodLabel}>
                {i < 3 ? `P${i + 1}` : i === 3 ? 'OT' : 'SO'}
              </Text>
            ))}
            <Text style={styles.periodLabelTotal}>T</Text>
          </View>
        </View>
      </View>

      {/* Buts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('goalsCount', { count: goals.length })}</Text>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>{t('noGoals')}</Text>
        ) : (
          goals.map((goal, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={[styles.teamBadge, goal.team === 'home' ? styles.homeBadge : styles.awayBadge]}>
                  <Text style={styles.teamBadgeText}>{getTeamAbbr(goal.team)}</Text>
                </View>
                <Text style={styles.eventTime}>{goal.period} - {goal.time}</Text>
                {getGoalTypeLabel(goal.goalType) && (
                  <View style={styles.goalTypeBadge}>
                    <Text style={styles.goalTypeText}>{getGoalTypeLabel(goal.goalType)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.goalScorer}>{goal.player}</Text>
                {goal.assists.length > 0 && (
                  <Text style={styles.goalAssists}>
                    {t('assistsLabel', { assists: goal.assists.join(', ') })}
                  </Text>
                )}
                <Text style={styles.goalScore}>
                  {awayTeamAbbr} {goal.awayScore} - {goal.homeScore} {homeTeamAbbr}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Pénalités */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('penaltiesCount', { count: penalties.length })}</Text>
        {penalties.length === 0 ? (
          <Text style={styles.emptyText}>{t('noPenalties')}</Text>
        ) : (
          penalties.map((penalty, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={[styles.teamBadge, penalty.team === 'home' ? styles.homeBadge : styles.awayBadge]}>
                  <Text style={styles.teamBadgeText}>{getTeamAbbr(penalty.team)}</Text>
                </View>
                <Text style={styles.eventTime}>{penalty.period} - {penalty.time}</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.penaltyPlayer}>{penalty.player}</Text>
                <Text style={styles.penaltyReason}>{penalty.reason}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Stats d'équipe */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('statistics')}</Text>
        <View style={styles.statsTable}>
          <StatRow label={t('shots')} away={teamStats.away.shots} home={teamStats.home.shots} />
          <StatRow label={t('hits')} away={teamStats.away.hits} home={teamStats.home.hits} />
          <StatRow label={t('faceoffsWon')} away={teamStats.away.faceoffsWon} home={teamStats.home.faceoffsWon} />
          <StatRow label={t('giveaways')} away={teamStats.away.giveaways} home={teamStats.home.giveaways} inverse />
          <StatRow label={t('takeaways')} away={teamStats.away.takeaways} home={teamStats.home.takeaways} />
          <StatRow
            label={t('powerPlayShort')}
            away={`${powerplay.away.goals}/${powerplay.away.opportunities}`}
            home={`${powerplay.home.goals}/${powerplay.home.opportunities}`}
          />
        </View>
      </View>
    </ScrollView>
  )
}

// Composant pour une ligne de stat
function StatRow({ label, away, home, inverse = false }: {
  label: string
  away: number | string
  home: number | string
  inverse?: boolean
}) {
  const awayNum = typeof away === 'number' ? away : 0
  const homeNum = typeof home === 'number' ? home : 0
  const awayWins = inverse ? awayNum < homeNum : awayNum > homeNum
  const homeWins = inverse ? homeNum < awayNum : homeNum > awayNum

  return (
    <View style={styles.statRow}>
      <Text style={[styles.statValue, awayWins && styles.statValueHighlight]}>{away}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, homeWins && styles.statValueHighlight]}>{home}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  // Period scores
  periodScoresContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  periodScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  periodLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  periodTeamName: {
    width: 50,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  periodLabelTeam: {
    width: 50,
  },
  periodScore: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: colors.foreground,
  },
  periodLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: colors.mutedForeground,
  },
  periodTotalScore: {
    width: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neonGreen,
  },
  periodLabelTotal: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mutedForeground,
  },
  // Event cards
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.neonGreen,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  homeBadge: {
    backgroundColor: colors.neonBlue,
  },
  awayBadge: {
    backgroundColor: colors.primary,
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  eventTime: {
    fontSize: 12,
    color: colors.mutedForeground,
    flex: 1,
  },
  goalTypeBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goalTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
  },
  eventDetails: {
    gap: 4,
  },
  goalScorer: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  goalAssists: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  goalScore: {
    fontSize: 12,
    color: colors.neonGreen,
    fontWeight: '600',
  },
  penaltyPlayer: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  penaltyReason: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  // Stats table
  statsTable: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    width: 60,
    textAlign: 'center',
  },
  statValueHighlight: {
    color: colors.neonGreen,
  },
})
