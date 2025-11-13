import { colors } from '@/theme/colors'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface LeagueFilterProps {
  leagues: string[]
  selectedLeague: string
  onLeagueChange: (league: string) => void
  centered?: boolean
}

export function LeagueFilter({ leagues, selectedLeague, onLeagueChange, centered = false }: LeagueFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          centered && styles.centeredContent,
        ]}
      >
        {leagues.map((league) => {
          const isSelected = selectedLeague === league
          return (
            <Pressable
              key={league}
              onPress={() => onLeagueChange(league)}
              style={styles.leagueButton}
            >
              <Text style={[
                styles.leagueText,
                isSelected ? styles.leagueTextActive : styles.leagueTextInactive
              ]}>
                {league}
              </Text>
              {isSelected && <View style={styles.indicator} />}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leagueTextInactive: {
    color: colors.mutedForeground,
  },
  leagueTextActive: {
    color: colors.neonGreen,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.neonGreen,
    borderRadius: 1,
  },
})
