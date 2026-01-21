import { useEffect, useState } from 'react'
import { getTeamsByLeague, Team } from '@/lib/teamData'
import { fetchTeamRoster } from '@/lib/services/api'

// Cache global pour les logos (persiste entre les renders)
const logoCache = new Map<string, string>()

/**
 * Hook qui retourne les équipes d'une ligue avec leurs logos fetchés depuis l'API
 */
export function useTeamsWithLogos(league: string) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTeamsWithLogos = async () => {
      setIsLoading(true)
      const baseTeams = getTeamsByLeague(league)

      // Pour les ligues non-NHL, retourner directement
      if (league !== 'NHL') {
        setTeams(baseTeams)
        setIsLoading(false)
        return
      }

      // Enrichir les équipes NHL avec les logos
      const enrichedTeams = await Promise.all(
        baseTeams.map(async (team) => {
          // Si l'équipe a déjà un logo local, le garder
          if (team.logo && typeof team.logo !== 'string') {
            return team
          }

          // Vérifier le cache
          if (logoCache.has(team.id)) {
            return { ...team, logo: logoCache.get(team.id) }
          }

          // Fetcher le logo depuis l'API si on a un goalserveId
          if (team.goalserveId) {
            try {
              const rosterData = await fetchTeamRoster(team.goalserveId)
              if (rosterData?.teamInfo.logo) {
                logoCache.set(team.id, rosterData.teamInfo.logo)
                return { ...team, logo: rosterData.teamInfo.logo }
              }
            } catch (error) {
              // Ignorer les erreurs, garder l'équipe sans logo
            }
          }

          return team
        })
      )

      setTeams(enrichedTeams)
      setIsLoading(false)
    }

    loadTeamsWithLogos()
  }, [league])

  return { teams, isLoading }
}
