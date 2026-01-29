import { useTranslation } from '@/contexts/TranslationContext'
import { useTeamSeasonStats } from '@/hooks/useTeamSeasonStats'
import { colors } from '@/theme/colors'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

interface TeamSeasonStatsComponentProps {
  homeTeamId?: string
  awayTeamId?: string
  homeTeamAbbr: string
  awayTeamAbbr: string
}

export function TeamSeasonStatsComponent({
  homeTeamId,
  awayTeamId,
  homeTeamAbbr,
  awayTeamAbbr,
}: TeamSeasonStatsComponentProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useTeamSeasonStats({ homeTeamId, awayTeamId })

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.neonGreen} />
        <Text style={styles.loadingText}>{t('loadingStats')}</Text>
      </View>
    )
  }

  if (isError || (!data?.home && !data?.away)) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t('statsNotAvailable')}</Text>
      </View>
    )
  }

  const homeStats = data?.home
  const awayStats = data?.away

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header avec les noms des équipes */}
      <View style={styles.headerRow}>
        <Text style={styles.teamHeader}>{awayTeamAbbr}</Text>
        <Text style={styles.statHeader}>{t('seasonStats')}</Text>
        <Text style={styles.teamHeader}>{homeTeamAbbr}</Text>
      </View>

      {/* Fiche */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('record')}</Text>
        <View style={styles.statsTable}>
          <StatRow
            label={t('wins')}
            away={awayStats?.wins ?? '-'}
            home={homeStats?.wins ?? '-'}
          />
          <StatRow
            label={t('losses')}
            away={awayStats?.losses ?? '-'}
            home={homeStats?.losses ?? '-'}
            inverse
          />
          <StatRow
            label={t('otLosses')}
            away={awayStats?.otLosses ?? '-'}
            home={homeStats?.otLosses ?? '-'}
            inverse
          />
          <StatRow
            label={t('points')}
            away={awayStats?.points ?? '-'}
            home={homeStats?.points ?? '-'}
          />
          <StatRow
            label={t('gamesPlayed')}
            away={awayStats?.gamesPlayed ?? '-'}
            home={homeStats?.gamesPlayed ?? '-'}
          />
        </View>
      </View>

      {/* Offensive */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('offense')}</Text>
        <View style={styles.statsTable}>
          <StatRow
            label={t('goalsFor')}
            away={awayStats?.goalsFor ?? '-'}
            home={homeStats?.goalsFor ?? '-'}
          />
          <StatRow
            label={t('goalsPerGame')}
            away={awayStats?.goalsForPerGame?.toFixed(2) ?? '-'}
            home={homeStats?.goalsForPerGame?.toFixed(2) ?? '-'}
          />
          <StatRow
            label={t('shotsPerGame')}
            away={awayStats?.shotsPerGame?.toFixed(1) ?? '-'}
            home={homeStats?.shotsPerGame?.toFixed(1) ?? '-'}
          />
          <StatRow
            label={t('powerPlayPct')}
            away={awayStats?.powerPlayPercentage ?? '-'}
            home={homeStats?.powerPlayPercentage ?? '-'}
          />
        </View>
      </View>

      {/* Defensive */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('defense')}</Text>
        <View style={styles.statsTable}>
          <StatRow
            label={t('goalsAgainst')}
            away={awayStats?.goalsAgainst ?? '-'}
            home={homeStats?.goalsAgainst ?? '-'}
            inverse
          />
          <StatRow
            label={t('goalsAgainstPerGame')}
            away={awayStats?.goalsAgainstPerGame?.toFixed(2) ?? '-'}
            home={homeStats?.goalsAgainstPerGame?.toFixed(2) ?? '-'}
            inverse
          />
          <StatRow
            label={t('shotsAgainstPerGame')}
            away={awayStats?.shotsAgainstPerGame?.toFixed(1) ?? '-'}
            home={homeStats?.shotsAgainstPerGame?.toFixed(1) ?? '-'}
            inverse
          />
          <StatRow
            label={t('penaltyKillPct')}
            away={awayStats?.penaltyKillPercentage ?? '-'}
            home={homeStats?.penaltyKillPercentage ?? '-'}
          />
          <StatRow
            label={t('savePct')}
            away={awayStats?.savePercentage ?? '-'}
            home={homeStats?.savePercentage ?? '-'}
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
  const awayNum = typeof away === 'number' ? away : parseFloat(String(away)) || 0
  const homeNum = typeof home === 'number' ? home : parseFloat(String(home)) || 0
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
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  teamHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neonGreen,
    width: 60,
    textAlign: 'center',
  },
  statHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 12,
  },
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
