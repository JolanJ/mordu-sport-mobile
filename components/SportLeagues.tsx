import { colors } from '@/theme/colors'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const leagues = [
  { id: "ALL", name: "TOUS" },
  { id: "NHL", name: "NHL" },
  { id: "NFL", name: "NFL" },
  { id: "NBA", name: "NBA" },
]

interface SportLeaguesProps {
  onLeagueChange?: (league: string) => void
}

export function SportLeagues({ onLeagueChange }: SportLeaguesProps) {
  const [selectedLeague, setSelectedLeague] = useState("ALL") // TOUS par défaut

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {leagues.map((league) => {
          const isSelected = selectedLeague === league.id
          return (
                    <Pressable
                      key={league.id}
                      onPress={() => {
                        setSelectedLeague(league.id)
                        onLeagueChange?.(league.id)
                      }}
                      style={styles.leagueButton}
                    >
              <Text style={[
                styles.leagueText,
                isSelected ? styles.leagueTextActive : styles.leagueTextInactive
              ]}>
                {league.name}
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
