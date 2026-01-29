/**
 * Hook pour récupérer les stats de saison de deux équipes
 */

import { fetchTeamStats, GoalserveTeamStats } from '@/lib/services/api'
import { useQuery } from '@tanstack/react-query'

interface UseTeamSeasonStatsOptions {
  homeTeamId?: string
  awayTeamId?: string
  enabled?: boolean
}

interface TeamSeasonStatsResult {
  home: GoalserveTeamStats | null
  away: GoalserveTeamStats | null
}

/**
 * Hook pour récupérer les stats de saison des deux équipes d'un match
 */
export function useTeamSeasonStats({ homeTeamId, awayTeamId, enabled = true }: UseTeamSeasonStatsOptions) {
  return useQuery<TeamSeasonStatsResult>({
    queryKey: ['teamSeasonStats', homeTeamId, awayTeamId],
    queryFn: async () => {
      const [homeStats, awayStats] = await Promise.all([
        homeTeamId ? fetchTeamStats(homeTeamId) : null,
        awayTeamId ? fetchTeamStats(awayTeamId) : null,
      ])
      return { home: homeStats, away: awayStats }
    },
    enabled: enabled && !!(homeTeamId || awayTeamId),
    staleTime: 5 * 60 * 1000, // 5 minutes - les stats de saison changent moins souvent
  })
}
