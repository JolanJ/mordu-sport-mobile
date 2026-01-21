import { Player, TeamRoster } from '@/lib/teamTypes'
import { colors } from '@/theme/colors'
import { StyleSheet, Text, View } from 'react-native'
import { PlayerAvatar } from './PlayerAvatar'

interface TeamRosterComponentProps {
  roster: TeamRoster
}

export function TeamRosterComponent({ roster }: TeamRosterComponentProps) {
  const renderPlayerCard = (player: Player, positionColor: string) => {
    const isGoalie = player.position === 'G'

    return (
      <View key={player.id} style={styles.playerCard}>
        {/* Photo du joueur */}
        <PlayerAvatar
          playerId={player.id}
          playerNumber={player.number}
          size={56}
          color={positionColor}
        />

        {/* Infos joueur */}
        <View style={styles.playerInfo}>
          <View style={styles.playerNameRow}>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.name}
            </Text>
            <View style={[styles.numberBadge, { backgroundColor: `${positionColor}1A` }]}>
              <Text style={[styles.numberBadgeText, { color: positionColor }]}>
                #{player.number}
              </Text>
            </View>
          </View>

          <View style={styles.playerDetailsRow}>
            <Text style={styles.playerDetail}>{player.position}</Text>
            {player.gamesPlayed !== undefined && (
              <>
                <Text style={styles.playerDetail}>•</Text>
                <Text style={styles.playerDetail}>{player.gamesPlayed} PJ</Text>
              </>
            )}
            {player.birthplace && (
              <>
                <Text style={styles.playerDetail}>•</Text>
                <Text style={styles.playerDetail} numberOfLines={1}>
                  {player.birthplace}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Stats - différent pour gardiens vs joueurs */}
        <View style={styles.statsColumn}>
          {isGoalie ? (
            <>
              <Text style={styles.statsPoints}>
                {player.wins || 0}-{player.losses || 0}
              </Text>
              <Text style={styles.statsBreakdown}>
                {player.savePercentage ? `${(player.savePercentage * 100).toFixed(1)}%` : '-'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.statsPoints}>{player.points || 0}</Text>
              <Text style={styles.statsBreakdown}>
                {player.goals || 0}B-{player.assists || 0}A
              </Text>
            </>
          )}
        </View>
      </View>
    )
  }

  const renderSection = (
    title: string,
    players: Player[],
    color: string
  ) => {
    if (players.length === 0) return null

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color }]}>
          {title} ({players.length})
        </Text>
        <View style={styles.playersContainer}>
          {players.map((player) => renderPlayerCard(player, color))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderSection('ATTAQUANTS', roster.forwards, colors.primary)}
      {renderSection('DÉFENSEURS', roster.defensemen, colors.accent)}
      {renderSection('GARDIENS', roster.goalies, colors.destructive)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  playersContainer: {
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  numberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playerDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  playerDetail: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  statsColumn: {
    alignItems: 'flex-end',
  },
  statsPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  statsBreakdown: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
})

