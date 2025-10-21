import { colors } from '@/theme/colors'
import { StyleSheet, Text, View } from 'react-native'

interface TeamBannerProps {
  abbr: string
  name: string
  division: string
  conference: string
  wins: number
  losses: number
  otLosses: number
  points: number
}

export function TeamBanner({ 
  abbr, 
  name, 
  division, 
  conference, 
  wins, 
  losses, 
  otLosses, 
  points 
}: TeamBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.row}>
          {/* Logo/Abréviation */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{abbr}</Text>
          </View>

          {/* Infos équipe */}
          <View style={styles.info}>
            <Text style={styles.teamName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.divisionText} numberOfLines={1}>
              {division} • {conference}
            </Text>
            <Text style={styles.recordText}>
              {wins}-{losses}-{otLosses} • {points} PTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.card}F2`, // 95% opacity
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}1A`, // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  divisionText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  recordText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
})

