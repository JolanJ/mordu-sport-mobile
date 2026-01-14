/**
 * Hook pour récupérer les matchs NHL depuis l'API
 */

import { fetchMatches } from '@/lib/services/api'
import { Match } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

interface UseMatchesOptions {
  date?: Date
  withLogos?: boolean // Si true, récupère aussi les logos des équipes
}

/**
 * Hook pour récupérer les matchs NHL pour une date donnée
 * Par défaut, récupère les matchs d'aujourd'hui
 */
export function useMatches({ date, withLogos = true }: UseMatchesOptions = {}) {
  const queryDate = date || new Date()
  const dateKey = queryDate.toISOString().split('T')[0]

  return useQuery<Match[]>({
    queryKey: ['matches', 'NHL', dateKey, withLogos ? 'withLogos' : 'noLogos'],
    queryFn: () => fetchMatches('NHL', queryDate, withLogos),
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes pour les matchs en direct
  })
}

