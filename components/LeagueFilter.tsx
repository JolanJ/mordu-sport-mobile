import { ComingSoonModal } from '@/components/ComingSoonModal'
import { colors } from '@/theme/colors'
import { Lock } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface LeagueFilterProps {
  leagues: string[]
  selectedLeague: string
  onLeagueChange: (league: string) => void
  centered?: boolean
}

// Ligues disponibles pour l'instant
const AVAILABLE_LEAGUES = ['ALL', 'NHL']

export function LeagueFilter({ leagues, selectedLeague, onLeagueChange, centered = false }: LeagueFilterProps) {
  const [comingSoonLeague, setComingSoonLeague] = useState<string | null>(null)

  const handlePress = (league: string) => {
    if (AVAILABLE_LEAGUES.includes(league)) {
      onLeagueChange(league)
    } else {
      setComingSoonLeague(league)
    }
  }

  return (
    <>
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
            const isAvailable = AVAILABLE_LEAGUES.includes(league)
            return (
              <Pressable
                key={league}
                onPress={() => handlePress(league)}
                style={styles.leagueButton}
              >
                <View style={styles.leagueContent}>
                  <Text style={[
                    styles.leagueText,
                    isSelected ? styles.leagueTextActive :
                    isAvailable ? styles.leagueTextInactive : styles.leagueTextDisabled
                  ]}>
                    {league}
                  </Text>
                  {!isAvailable && (
                    <Lock size={14} color={colors.mutedForeground} />
                  )}
                </View>
                {isSelected && <View style={styles.indicator} />}
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      <ComingSoonModal
        visible={comingSoonLeague !== null}
        league={comingSoonLeague || ''}
        onClose={() => setComingSoonLeague(null)}
      />
    </>
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
  leagueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  leagueTextDisabled: {
    color: colors.mutedForeground,
    opacity: 0.6,
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
