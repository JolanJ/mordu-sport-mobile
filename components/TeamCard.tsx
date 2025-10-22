import { Team } from '@/lib/teamData'
import { colors } from '@/theme/colors'
import { Users } from 'lucide-react-native'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface TeamCardProps {
  team: Team
  onPress?: (teamId: string) => void
}

export function TeamCard({ team, onPress }: TeamCardProps) {
  const handlePress = () => {
    onPress?.(team.id)
  }

  const getConferenceColor = () => {
    if (team.league === 'NHL') {
      return team.conference === 'Eastern' ? colors.primary : colors.accent
    }
    if (team.league === 'NBA') {
      return team.conference === 'Eastern' ? colors.accent : colors.destructive
    }
    if (team.league === 'NFL') {
      return team.conference === 'AFC' ? colors.primary : colors.destructive
    }
    return colors.foreground
  }

  const conferenceColor = getConferenceColor()

  return (
    <Pressable
      style={[
        styles.container, 
        { 
          borderColor: conferenceColor + '50',
          shadowColor: conferenceColor,
        }
      ]}
      onPress={handlePress}
    >
      <View style={[styles.logoContainer, { backgroundColor: conferenceColor + '10' }]}>
        {team.logo ? (
          <Image
            source={typeof team.logo === 'string' ? { uri: team.logo } : team.logo}
            style={styles.teamLogo}
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.logoText, { color: conferenceColor }]}>
            {team.abbr}
          </Text>
        )}
      </View>
      
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCity}>{team.city}</Text>
      </View>
      
      <View style={styles.iconContainer}>
        <Users size={20} color={colors.mutedForeground} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamLogo: {
    width: 32,
    height: 32,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 2,
  },
  teamCity: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  iconContainer: {
    padding: 8,
  },
})
