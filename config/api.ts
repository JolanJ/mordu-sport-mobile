/**
 * Configuration de l'API
 */

const GOALSERVE_TOKEN = '174a9bd35aac4c6ba67a08de21cd460f'
export const API_BASE_URL = 'https://www.goalserve.com/getfeed'

export const API_ENDPOINTS = {
  nhl: `/${GOALSERVE_TOKEN}/hockey/nhl-shedule`, // "shedule" est la faute d'orthographe de Goalserve pour "schedule"
  nhlScores: `/${GOALSERVE_TOKEN}/hockey/nhl-scores`, // Scores en direct
} as const

/**
 * Construit l'URL pour récupérer le roster d'une équipe
 */
export function getTeamRosterUrl(teamId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_rosters`
}

/**
 * Construit l'URL pour récupérer les stats globales d'une équipe
 */
export function getTeamStatsUrl(teamId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_team_stats`
}

/**
 * Construit l'URL pour récupérer les stats des joueurs d'une équipe
 */
export function getPlayerStatsUrl(teamId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_stats`
}

/**
 * Construit l'URL pour récupérer les blessures d'une équipe
 */
export function getTeamInjuriesUrl(teamId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_injuries`
}

/**
 * Construit l'URL pour récupérer l'image d'un joueur
 */
export function getPlayerImageUrl(playerId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/usa?playerimage=${playerId}`
}

/**
 * Formate une date au format Goalserve (DD.MM.YYYY)
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

