/**
 * Hook pour récupérer les détails d'un match en direct (événements, stats)
 */

import { fetchMatchDetails } from '@/lib/services/api'
import { MatchDetails } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

interface UseMatchDetailsOptions {
  matchId: string
  enabled?: boolean
}

/**
 * Hook pour récupérer les détails d'un match (événements, stats)
 * Rafraîchit automatiquement toutes les 15 secondes pour les matchs en direct
 */
export function useMatchDetails({ matchId, enabled = true }: UseMatchDetailsOptions) {
  return useQuery<MatchDetails | null>({
    queryKey: ['matchDetails', matchId],
    queryFn: () => fetchMatchDetails(matchId),
    enabled: enabled && !!matchId,
    staleTime: 15000, // 15 secondes
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes pour les matchs en direct
  })
}
