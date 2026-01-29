import { useEffect, useState } from 'react'
import { Team } from '@/lib/teamData'
import { supabase } from '@/lib/supabase'

// Cache mémoire pour les équipes
let teamsCache: Record<string, Team[]> = {}

/**
 * Fetch les équipes depuis Supabase
 */
async function fetchTeamsFromDB(league: string): Promise<Team[]> {
  // Vérifier le cache
  if (teamsCache[league] && teamsCache[league].length > 0) {
    return teamsCache[league]
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('league', league)
      .order('conference')
      .order('division')
      .order('name')

    if (error || !data) {
      return []
    }

    const teams: Team[] = data.map((row) => ({
      id: row.team_id,
      name: row.name,
      abbr: row.abbr,
      city: row.city,
      league: row.league as 'NHL' | 'NBA' | 'NFL',
      conference: row.conference,
      division: row.division,
      logo: row.logo_url || undefined,
      goalserveId: row.goalserve_id || undefined,
    }))

    // Mettre en cache
    teamsCache[league] = teams
    return teams
  } catch (error) {
    return []
  }
}

/**
 * Hook qui retourne les équipes d'une ligue depuis Supabase
 * Une seule requête DB = ultra rapide
 */
export function useTeamsWithLogos(league: string) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadTeams = async () => {
      // Si en cache, afficher immédiatement
      if (teamsCache[league] && teamsCache[league].length > 0) {
        setTeams(teamsCache[league])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const fetchedTeams = await fetchTeamsFromDB(league)

      if (mounted) {
        setTeams(fetchedTeams)
        setIsLoading(false)
      }
    }

    loadTeams()

    return () => {
      mounted = false
    }
  }, [league])

  return { teams, isLoading }
}

/**
 * Précharge les équipes NHL depuis Supabase
 */
export async function prefetchTeamLogos(): Promise<void> {
  await fetchTeamsFromDB('NHL')
}
