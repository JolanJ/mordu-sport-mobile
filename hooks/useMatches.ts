/**
 * Hook pour récupérer les matchs NHL depuis l'API
 * Avec cache persistant pour affichage instantané
 */

import { fetchMatches, fetchMatchDetails, fetchTeamStats } from '@/lib/services/api'
import { Match } from '@/lib/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'

const MATCHES_CACHE_KEY = 'matches_cache_'

interface UseMatchesOptions {
  date?: Date
  withLogos?: boolean
}

/**
 * Charge les matchs depuis le cache AsyncStorage
 */
async function loadCachedMatches(dateKey: string): Promise<Match[] | null> {
  try {
    const cached = await AsyncStorage.getItem(MATCHES_CACHE_KEY + dateKey)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    // Ignorer
  }
  return null
}

/**
 * Sauvegarde les matchs dans le cache
 */
async function cacheMatches(dateKey: string, matches: Match[]): Promise<void> {
  try {
    await AsyncStorage.setItem(MATCHES_CACHE_KEY + dateKey, JSON.stringify(matches))
  } catch (error) {
    // Ignorer
  }
}

/**
 * Hook pour récupérer les matchs NHL pour une date donnée
 * - Affiche instantanément les données en cache
 * - Rafraîchit en arrière-plan
 */
export function useMatches({ date, withLogos = true }: UseMatchesOptions = {}) {
  const queryDate = date || new Date()
  const dateKey = queryDate.toISOString().split('T')[0]
  const queryClient = useQueryClient()

  // Charger le cache au mount et le mettre dans React Query
  useEffect(() => {
    const loadCache = async () => {
      const cached = await loadCachedMatches(dateKey)
      if (cached && cached.length > 0) {
        // Injecter le cache dans React Query pour affichage instantané
        queryClient.setQueryData(
          ['matches', 'NHL', dateKey, withLogos ? 'withLogos' : 'noLogos'],
          cached
        )
      }
    }
    loadCache()
  }, [dateKey, withLogos, queryClient])

  const query = useQuery<Match[]>({
    queryKey: ['matches', 'NHL', dateKey, withLogos ? 'withLogos' : 'noLogos'],
    queryFn: async () => {
      const matches = await fetchMatches('NHL', queryDate, withLogos)
      // Sauvegarder en cache pour le prochain lancement
      if (matches.length > 0) {
        cacheMatches(dateKey, matches)
      }
      return matches
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  return query
}

/**
 * Précharge les matchs du jour - cache d'abord, API en arrière-plan
 * Retourne dès que le cache est chargé (instantané)
 */
export async function prefetchTodayMatches(queryClient: any): Promise<void> {
  const today = new Date()
  const dateKey = today.toISOString().split('T')[0]

  // Charger depuis AsyncStorage (instantané)
  const cached = await loadCachedMatches(dateKey)
  if (cached && cached.length > 0) {
    queryClient.setQueryData(['matches', 'NHL', dateKey, 'withLogos'], cached)
  }

  // Fetcher les données fraîches en arrière-plan (ne bloque pas)
  fetchMatches('NHL', today, true).then(matches => {
    if (matches.length > 0) {
      cacheMatches(dateKey, matches)
      queryClient.setQueryData(['matches', 'NHL', dateKey, 'withLogos'], matches)

      // Prefetch match details for all today's games (XML is already cached from fetchMatches)
      for (const match of matches) {
        queryClient.prefetchQuery({
          queryKey: ['matchDetails', match.id, dateKey],
          queryFn: () => fetchMatchDetails(match.id, today),
          staleTime: 60000,
        })
      }

      // Prefetch season stats for each matchup (same key as useTeamSeasonStats)
      for (const match of matches) {
        if (match.homeTeam.teamId && match.awayTeam.teamId) {
          queryClient.prefetchQuery({
            queryKey: ['teamSeasonStats', match.homeTeam.teamId, match.awayTeam.teamId],
            queryFn: () => Promise.all([
              fetchTeamStats(match.homeTeam.teamId!),
              fetchTeamStats(match.awayTeam.teamId!),
            ]).then(([home, away]) => ({ home, away })),
            staleTime: 5 * 60 * 1000,
          })
        }
      }
    }
  }).catch(() => {})

}
