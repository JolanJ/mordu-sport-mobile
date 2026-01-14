/**
 * Service API pour récupérer les matchs depuis Goalserve
 */

import { API_BASE_URL, API_ENDPOINTS, formatDate, getTeamRosterUrl } from '@/config/api'
import { Player, TeamRoster } from '@/lib/teamTypes'
import { Match } from '@/lib/types'
import { XMLParser } from 'fast-xml-parser'

// Cache simple pour les logos d'équipes (évite les appels API répétés)
// Note: on ne met pas undefined dans le cache pour permettre de réessayer
const teamLogoCache = new Map<string, string>()

export type League = 'NHL'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
})

/**
 * Récupère les matchs pour une ligue et une date
 * @param withLogos Si true, enrichit les matchs avec les logos des équipes
 */
export async function fetchMatches(league: League, date?: Date, withLogos: boolean = false): Promise<Match[]> {
  const endpoint = API_ENDPOINTS[league.toLowerCase() as keyof typeof API_ENDPOINTS]
  let url = `${API_BASE_URL}${endpoint}`
  
  // Ajouter la date si fournie (utiliser date1 comme paramètre)
  if (date) {
    const dateStr = formatDate(date)
    url += `?date1=${dateStr}`
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const xml = await response.text()
    const matches = parseXMLMatches(xml, league, date)
    
    // Enrichir avec les logos si demandé
    if (withLogos && matches.length > 0) {
      return await enrichMatchesWithLogos(matches)
    }
    
    return matches
  } catch (error) {
    return []
  }
}

/**
 * Enrichit les matchs avec les logos des équipes
 */
async function enrichMatchesWithLogos(matches: Match[]): Promise<Match[]> {
  // Collecter toutes les équipes avec leurs IDs depuis les matchs (plus fiable que le mapping)
  const teams = new Map<string, { name: string; teamId: string | undefined }>()
  matches.forEach(match => {
    teams.set(match.awayTeam.name, { name: match.awayTeam.name, teamId: match.awayTeam.teamId })
    teams.set(match.homeTeam.name, { name: match.homeTeam.name, teamId: match.homeTeam.teamId })
  })
  
  // Récupérer les logos pour toutes les équipes (en parallèle)
  const logoPromises = Array.from(teams.values()).map(async ({ name, teamId }) => {
    // Vérifier le cache d'abord (seulement si on a un logo, pas undefined)
    const cachedLogo = teamLogoCache.get(name)
    if (cachedLogo) {
      return { name, logo: cachedLogo }
    }
    
    // Utiliser l'ID depuis les matchs (plus fiable que le mapping)
    if (!teamId) {
      return { name, logo: undefined }
    }
    
    // Récupérer le roster avec le logo
    try {
      const rosterData = await fetchTeamRoster(teamId)
      const logo = rosterData?.teamInfo.logo
      
      // Mettre en cache seulement si on a un logo
      if (logo) {
        teamLogoCache.set(name, logo)
      }
      
      return { name, logo }
    } catch (error) {
      // Erreur silencieuse : certains endpoints peuvent être indisponibles
      return { name, logo: undefined }
    }
  })
  
  const logoResults = await Promise.all(logoPromises)
  const logoMap = new Map<string, string | undefined>()
  logoResults.forEach(({ name, logo }) => {
    logoMap.set(name, logo)
  })
  
  // Enrichir les matchs avec les logos
  return matches.map(match => ({
    ...match,
    awayTeam: {
      ...match.awayTeam,
      logo: logoMap.get(match.awayTeam.name),
    },
    homeTeam: {
      ...match.homeTeam,
      logo: logoMap.get(match.homeTeam.name),
    },
  }))
}

/**
 * Parse le XML en tableau de Match
 */
function parseXMLMatches(xml: string, league: League, requestedDate?: Date): Match[] {
  try {
    if (!xml || xml.trim().length === 0) {
      return []
    }
    
    const parsed = xmlParser.parse(xml)
    const matches: Match[] = []
    let matchArray: any[] = []
    
    // Structure Goalserve: shedules.matches.match
    if (parsed.shedules?.matches?.match) {
      const matchesData = parsed.shedules.matches.match
      matchArray = Array.isArray(matchesData) ? matchesData : [matchesData]
    }
    // Structure alternative: shedules.match
    else if (parsed.shedules?.match) {
      matchArray = Array.isArray(parsed.shedules.match) ? parsed.shedules.match : [parsed.shedules.match]
    }
    
    // Transformer chaque match
    for (const matchData of matchArray) {
      const match = transformMatch(matchData, league)
      if (match) {
        matches.push(match)
      }
    }
    
    // Filtrer par date si une date est fournie
    const targetDate = requestedDate ? requestedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    return matches.filter(match => match.date === targetDate)
  } catch (error) {
    return []
  }
}

/**
 * Transforme un match Goalserve en objet Match
 */
function transformMatch(matchData: any, league: League): Match | null {
  try {
    const awayTeam = matchData.awayteam || {}
    const homeTeam = matchData.hometeam || {}
    
    // Extraire les noms depuis les attributs @_name
    const awayName = awayTeam['@_name'] || ''
    const homeName = homeTeam['@_name'] || ''
    
    if (!awayName || !homeName || awayName.length < 2 || homeName.length < 2) {
      return null
    }
    
    // Extraire les scores depuis totalscore
    const awayScore = awayTeam['@_totalscore']
    const homeScore = homeTeam['@_totalscore']
    const awayScoreNum = awayScore && awayScore !== '' ? parseInt(String(awayScore), 10) : undefined
    const homeScoreNum = homeScore && homeScore !== '' ? parseInt(String(homeScore), 10) : undefined
    
    // Déterminer le statut
    let status: 'upcoming' | 'live' | 'finished' = 'upcoming'
    const statusValue = (matchData['@_status'] || '').toLowerCase()
    if (statusValue.includes('live') || statusValue.includes('in progress')) {
      status = 'live'
    } else if (statusValue.includes('finished') || statusValue.includes('final')) {
      status = 'finished'
    } else if (statusValue.includes('not started') || statusValue.includes('scheduled')) {
      status = 'upcoming'
    } else if (awayScoreNum !== undefined && homeScoreNum !== undefined) {
      status = matchData['@_period'] ? 'live' : 'finished'
    }
    
    // Formater la date depuis formatted_date
    let dateStr = new Date().toISOString().split('T')[0]
    const dateValue = matchData['@_formatted_date'] || matchData['@_date']
    if (dateValue) {
      const dateParts = String(dateValue).trim().split('.')
      if (dateParts.length === 3) {
        dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      }
    }
    
    // Formater l'heure
    let timeStr: string | undefined
    const timeValue = matchData['@_time']
    if (timeValue) {
      timeStr = String(timeValue).trim().replace(':', 'h')
    }
    
    // Extraire le period
    let period: string | undefined
    if (matchData['@_period']) {
      const periodNum = parseInt(String(matchData['@_period']), 10)
      period = league === 'NHL' ? `${periodNum}e période` : `${periodNum}e quart`
    }
    
    // Utiliser l'ID Goalserve (toujours présent et unique)
    // Si pas d'ID, générer un ID de fallback (ne devrait jamais arriver)
    const id = matchData['@_id'] 
      ? String(matchData['@_id']) 
      : `${league}-${dateStr}-${awayName}-${homeName}`.replace(/\s+/g, '-').toLowerCase()
    
    // Générer les abréviations
    const awayAbbr = awayName.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase()
    const homeAbbr = homeName.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase()
    
    // Extraire le venue (stade/aréna)
    const venue = matchData['@_venue_name'] ? String(matchData['@_venue_name']).trim() : undefined
    
    return {
      id: String(id).trim(), // S'assurer que l'ID est toujours une string propre
      league,
      status,
      date: dateStr,
      time: timeStr,
      period,
      timeRemaining: matchData['@_timer'] ? String(matchData['@_timer']) : undefined,
      venue,
      awayTeam: {
        name: String(awayName),
        abbr: awayAbbr,
        logo: undefined,
        score: awayScoreNum,
        teamId: awayTeam['@_id'] ? String(awayTeam['@_id']) : undefined, // ID de l'équipe depuis les matchs
      },
      homeTeam: {
        name: String(homeName),
        abbr: homeAbbr,
        logo: undefined,
        score: homeScoreNum,
        teamId: homeTeam['@_id'] ? String(homeTeam['@_id']) : undefined, // ID de l'équipe depuis les matchs
      },
    }
  } catch (error) {
    return null
  }
}

/**
 * Convertit une image base64 en URI utilisable par React Native
 */
export function base64ToDataUri(base64: string): string {
  if (!base64 || base64.trim().length === 0) {
    return ''
  }
  // Le base64 peut déjà être propre ou contenir des retours à la ligne
  const cleanBase64 = base64.trim().replace(/\s/g, '')
  return `data:image/png;base64,${cleanBase64}`
}

/**
 * Interface pour les données de roster d'équipe
 */
export interface TeamRosterData {
  teamInfo: {
    id: string
    name: string
    abbr: string
    logo?: string // URI data pour l'image base64
  }
  roster: TeamRoster
}

/**
 * Récupère le roster d'une équipe avec son logo
 */
export async function fetchTeamRoster(teamId: string): Promise<TeamRosterData | null> {
  const url = getTeamRosterUrl(teamId)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    })
    
    if (!response.ok) {
      // Erreur 500 signifie que l'endpoint n'est pas disponible pour cette équipe
      return null
    }
    
    const xml = await response.text()
    
    // Vérifier si le XML contient une erreur serveur
    if (xml.includes('Server Error') || xml.includes('Root element is missing') || xml.trim().length === 0) {
      return null
    }
    
    const result = parseTeamRosterXML(xml)
    return result
  } catch (error) {
    return null
  }
}

/**
 * Parse le XML du roster en objet TeamRosterData
 */
function parseTeamRosterXML(xml: string): TeamRosterData | null {
  try {
    if (!xml || xml.trim().length === 0) {
      return null
    }
    
    const parsed = xmlParser.parse(xml)
    const team = parsed.team
    
    if (!team) {
      return null
    }
    
    // Extraire le logo (base64) et le convertir en URI
    // Le parser peut mettre l'image dans team.image directement ou dans team.image['#text']
    let logoBase64 = ''
    
    if (typeof team.image === 'string') {
      logoBase64 = team.image.trim()
    } else if (team.image?.['#text']) {
      logoBase64 = String(team.image['#text']).trim()
    } else if (team.image) {
      logoBase64 = String(team.image).trim()
    }
    
    const logoUri = logoBase64 && logoBase64.length > 0 ? base64ToDataUri(logoBase64) : undefined
    
    // Extraire les joueurs par position
    const positions = Array.isArray(team.position) ? team.position : [team.position]
    
    const roster: TeamRoster = {
      forwards: [],
      defensemen: [],
      goalies: [],
    }
    
    for (const position of positions) {
      if (!position || !position.player) {
        continue
      }
      
      const players = Array.isArray(position.player) ? position.player : [position.player]
      const positionName = String(position['@_name'] || '').toLowerCase()
      
      for (const playerData of players) {
        const player: Player = {
          id: String(playerData['@_id'] || ''),
          name: String(playerData['@_name'] || ''),
          number: String(playerData['@_number'] || ''),
          position: String(positionName),
          birthplace: playerData['@_birth_place'] ? String(playerData['@_birth_place']) : undefined,
        }
        
        // Classer par position
        if (positionName.includes('center') || positionName.includes('wing')) {
          roster.forwards.push(player)
        } else if (positionName.includes('defense')) {
          roster.defensemen.push(player)
        } else if (positionName.includes('goalie')) {
          roster.goalies.push(player)
        }
      }
    }
    
    return {
      teamInfo: {
        id: String(team['@_id'] || ''),
        name: String(team['@_name'] || ''),
        abbr: String(team['@_abbreviation'] || ''),
        logo: logoUri, // ✅ Logo converti en URI utilisable
      },
      roster,
    }
  } catch (error) {
    return null
  }
}

