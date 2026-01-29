/**
 * Hook pour récupérer les détails d'un match en direct (événements, stats)
 */

import { fetchMatchDetails } from '@/lib/services/api'
import { MatchDetails } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

interface UseMatchDetailsOptions {
  matchId: string
  date?: string // Format YYYY-MM-DD
  enabled?: boolean
}

/**
 * Hook pour récupérer les détails d'un match (événements, stats)
 * Rafraîchit automatiquement toutes les 15 secondes pour les matchs en direct
 */
export function useMatchDetails({ matchId, date, enabled = true }: UseMatchDetailsOptions) {
  // Convertir la date string en objet Date si fournie
  const matchDate = date ? new Date(date + 'T12:00:00') : undefined

  return useQuery<MatchDetails | null>({
    queryKey: ['matchDetails', matchId, date],
    queryFn: () => fetchMatchDetails(matchId, matchDate),
    enabled: enabled && !!matchId,
    staleTime: 15000, // 15 secondes
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes pour les matchs en direct
  })
}
