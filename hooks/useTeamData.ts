import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/services/api'
import { getTeamById } from '@/lib/teamData'

interface UseTeamDataOptions {
  teamId: string // slug comme "montreal-canadiens"
}

export function useTeamData({ teamId }: UseTeamDataOptions) {
  // Récupérer les infos de base de l'équipe (incluant goalserveId)
  const teamBasicInfo = getTeamById(teamId)
  const goalserveId = teamBasicInfo?.goalserveId

  // Fetch le roster (avec logo)
  const rosterQuery = useQuery({
    queryKey: ['teamRoster', goalserveId],
    queryFn: () => api.fetchTeamRoster(goalserveId!),
    enabled: !!goalserveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch les stats de l'équipe
  const teamStatsQuery = useQuery({
    queryKey: ['teamStats', goalserveId],
    queryFn: () => api.fetchTeamStats(goalserveId!),
    enabled: !!goalserveId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch les stats des joueurs
  const playerStatsQuery = useQuery({
    queryKey: ['playerStats', goalserveId],
    queryFn: () => api.fetchPlayerStats(goalserveId!),
    enabled: !!goalserveId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch les blessures
  const injuriesQuery = useQuery({
    queryKey: ['teamInjuries', goalserveId],
    queryFn: () => api.fetchTeamInjuries(goalserveId!),
    enabled: !!goalserveId,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = rosterQuery.isLoading || teamStatsQuery.isLoading || playerStatsQuery.isLoading || injuriesQuery.isLoading
  const isError = !goalserveId || rosterQuery.isError || teamStatsQuery.isError

  return {
    // Infos de base
    teamBasicInfo,
    goalserveId,
    hasGoalserveId: !!goalserveId,

    // Données fetchées
    roster: rosterQuery.data?.roster,
    teamInfo: rosterQuery.data?.teamInfo,
    teamStats: teamStatsQuery.data,
    playerStats: playerStatsQuery.data || [],
    injuries: injuriesQuery.data || [],

    // États
    isLoading,
    isError,

    // Queries individuelles pour plus de contrôle
    rosterQuery,
    teamStatsQuery,
    playerStatsQuery,
    injuriesQuery,
  }
}
