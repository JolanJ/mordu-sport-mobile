import { TeamStats } from '@/lib/teamTypes'
import { colors } from '@/theme/colors'
import { Target, Trophy } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'

interface TeamStatsComponentProps {
  stats: TeamStats
}

export function TeamStatsComponent({ stats }: TeamStatsComponentProps) {
  const winPercentage = ((stats.wins / stats.gamesPlayed) * 100).toFixed(1)

  return (
    <View style={styles.container}>
      {/* Résumé - 2 cartes */}
      <View style={styles.summaryGrid}>
        {/* Carte Record */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Trophy size={16} color={colors.primary} />
            <Text style={styles.cardLabel}>Record</Text>
          </View>
          <Text style={styles.cardValue}>
            {stats.wins}-{stats.losses}-{stats.otLosses}
          </Text>
          <Text style={styles.cardSecondary}>{winPercentage}% victoires</Text>
        </View>

        {/* Carte Points */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Target size={16} color={colors.accent} />
            <Text style={styles.cardLabel}>Points</Text>
          </View>
          <Text style={styles.cardValue}>{stats.points}</Text>
          <Text style={styles.cardSecondary}>{stats.gamesPlayed} matchs joués</Text>
        </View>
      </View>

      {/* Statistiques Offensives */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          OFFENSIVE
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Buts pour</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.goalsFor}</Text>
              <Text style={styles.statSecondary}>
                {(stats.goalsFor / stats.gamesPlayed).toFixed(1)} / match
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tirs par match</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.shotsPerGame}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Avantage numérique</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.powerPlayPercentage}</Text>
              <Text style={styles.statSecondary}>
                {stats.powerPlayGoals}/{stats.powerPlayOpportunities}
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mises au jeu</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.faceoffWinPercentage}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Statistiques Défensives */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.destructive }]}>
          DÉFENSIVE
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Buts contre</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.goalsAgainst}</Text>
              <Text style={styles.statSecondary}>
                {(stats.goalsAgainst / stats.gamesPlayed).toFixed(1)} / match
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tirs alloués</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.shotsAllowedPerGame}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Infériorité numérique</Text>
            <View style={styles.statValues}>
              <Text style={styles.statValue}>{stats.penaltyKillPercentage}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  cardSecondary: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  statValues: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  statSecondary: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
})

