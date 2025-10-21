import { Injury } from '@/lib/teamTypes'
import { colors } from '@/theme/colors'
import { AlertCircle, Hospital } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'

interface InjuryReportProps {
  injuries: Injury[]
}

export function InjuryReport({ injuries }: InjuryReportProps) {
  if (injuries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Hospital size={48} color={colors.mutedForeground} />
        <Text style={styles.emptyTitle}>Aucune blessure</Text>
        <Text style={styles.emptySubtext}>L'équipe est en pleine santé!</Text>
      </View>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OUT':
        return colors.destructive
      case 'Day-to-Day':
        return '#EAB308' // Yellow
      default:
        return colors.mutedForeground
    }
  }

  return (
    <View style={styles.container}>
      {/* Alert banner */}
      <View style={styles.alertBanner}>
        <AlertCircle size={20} color={colors.destructive} />
        <Text style={styles.alertText}>
          {injuries.length} joueur{injuries.length > 1 ? 's' : ''} blessé{injuries.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des blessures */}
      <View style={styles.injuriesList}>
        {injuries.map((injury) => {
          const statusColor = getStatusColor(injury.status)

          return (
            <View key={injury.playerId} style={styles.injuryCard}>
              {/* Header avec nom et statut */}
              <View style={styles.injuryHeader}>
                <View>
                  <Text style={styles.playerName}>{injury.playerName}</Text>
                  <Text style={styles.position}>{injury.position}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {injury.status}
                  </Text>
                </View>
              </View>

              {/* Type de blessure */}
              <View style={styles.injuryType}>
                <Hospital size={16} color={colors.mutedForeground} />
                <Text style={styles.injuryText}>{injury.injury}</Text>
              </View>

              {/* Date */}
              {injury.date && (
                <Text style={styles.injuryDate}>Depuis le {injury.date}</Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyState: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: `${colors.destructive}1A`, // 10% opacity
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.destructive}80`, // 50% opacity
    marginBottom: 16,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.destructive,
  },
  injuriesList: {
    gap: 12,
  },
  injuryCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  injuryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  position: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  injuryType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  injuryText: {
    fontSize: 14,
    color: colors.foreground,
  },
  injuryDate: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 8,
  },
})

