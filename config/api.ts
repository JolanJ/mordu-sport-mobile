/**
 * Configuration de l'API
 */

const GOALSERVE_TOKEN = '174a9bd35aac4c6ba67a08de21cd460f'
export const API_BASE_URL = 'https://www.goalserve.com/getfeed'

export const API_ENDPOINTS = {
  nhl: `/${GOALSERVE_TOKEN}/hockey/nhl-shedule`, // "shedule" est la faute d'orthographe de Goalserve pour "schedule"
} as const

/**
 * Construit l'URL pour récupérer le roster d'une équipe
 */
export function getTeamRosterUrl(teamId: string): string {
  return `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_rosters`
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

