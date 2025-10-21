import { Team } from '@/lib/teamData'
import { colors } from '@/theme/colors'
import { StyleSheet, Text, View } from 'react-native'
import { TeamCard } from './TeamCard'

interface ConferenceSectionProps {
  conference: string
  teams: Team[]
  onTeamPress?: (teamId: string) => void
}

export function ConferenceSection({ conference, teams, onTeamPress }: ConferenceSectionProps) {
  const translateConference = (conference: string) => {
    const translations: Record<string, string> = {
      'Eastern': 'Est',
      'Western': 'Ouest',
      'AFC': 'AFC',
      'NFC': 'NFC'
    }
    return translations[conference] || conference
  }

  const getConferenceColor = () => {
    // NHL
    if (conference === 'Eastern') return colors.primary // Bleu
    if (conference === 'Western') return colors.accent // Orange
    
    // NBA
    if (conference === 'Eastern') return colors.accent // Orange
    if (conference === 'Western') return colors.destructive // Rouge
    
    // NFL
    if (conference === 'AFC') return colors.primary // Bleu
    if (conference === 'NFC') return colors.destructive // Rouge
    
    return colors.foreground
  }

  const conferenceColor = getConferenceColor()

  // Grouper les équipes par division
  const teamsByDivision = teams.reduce((acc, team) => {
    if (!acc[team.division]) {
      acc[team.division] = []
    }
    acc[team.division].push(team)
    return acc
  }, {} as Record<string, Team[]>)

  return (
    <View style={styles.container}>
      <View style={[styles.conferenceHeader, { borderBottomColor: conferenceColor }]}>
        <Text style={[styles.conferenceTitle, { color: conferenceColor }]}>
          CONFÉRENCE {translateConference(conference).toUpperCase()}
        </Text>
      </View>

      {Object.entries(teamsByDivision).map(([division, divisionTeams]) => (
        <View key={division} style={styles.divisionSection}>
          <Text style={styles.divisionTitle}>{division}</Text>
          {divisionTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onPress={onTeamPress}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  conferenceHeader: {
    borderBottomWidth: 2,
    paddingBottom: 8,
    marginBottom: 16,
  },
  conferenceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divisionSection: {
    marginBottom: 20,
  },
  divisionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
    marginLeft: 4,
  },
})
