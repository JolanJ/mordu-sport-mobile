/**
 * Service API pour récupérer les matchs depuis Goalserve
 */

import { API_BASE_URL, API_ENDPOINTS, formatDate, getTeamRosterUrl, getTeamStatsUrl, getPlayerStatsUrl, getTeamInjuriesUrl, getPlayerImageUrl } from '@/config/api'
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
 * Formate une date en YYYY-MM-DD en heure locale
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Vérifie si une date est aujourd'hui (en heure locale)
 */
function isToday(date?: Date): boolean {
  const today = new Date()
  const checkDate = date || today
  return formatLocalDate(checkDate) === formatLocalDate(today)
}

/**
 * Récupère les matchs pour une ligue et une date
 * @param withLogos Si true, enrichit les matchs avec les logos des équipes
 *
 * Pour les matchs d'aujourd'hui, utilise l'endpoint nhl-scores pour avoir les scores en direct.
 * Pour les autres dates, utilise l'endpoint nhl-shedule.
 */
export async function fetchMatches(league: League, date?: Date, withLogos: boolean = false): Promise<Match[]> {
  const useScoresEndpoint = isToday(date)

  // Utiliser nhl-scores pour aujourd'hui (scores en direct), sinon nhl-shedule
  const endpoint = useScoresEndpoint
    ? API_ENDPOINTS.nhlScores
    : API_ENDPOINTS[league.toLowerCase() as keyof typeof API_ENDPOINTS]

  let url = `${API_BASE_URL}${endpoint}`

  // Ajouter la date si fournie (utiliser date1 comme paramètre)
  if (date && !useScoresEndpoint) {
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

    // Parser selon le type d'endpoint
    const matches = useScoresEndpoint
      ? parseXMLScores(xml, league)
      : parseXMLMatches(xml, league, date)

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
    
    // Filtrer par date si une date est fournie (en heure locale)
    const targetDate = formatLocalDate(requestedDate || new Date())
    return matches.filter(match => match.date === targetDate)
  } catch (error) {
    return []
  }
}

/**
 * Parse le XML des scores en direct (nhl-scores) en tableau de Match
 * Structure: scores.category.match
 */
function parseXMLScores(xml: string, league: League): Match[] {
  try {
    if (!xml || xml.trim().length === 0) {
      return []
    }

    const parsed = xmlParser.parse(xml)
    const matches: Match[] = []
    let matchArray: any[] = []

    // Structure nhl-scores: scores.category.match
    if (parsed.scores?.category?.match) {
      const matchesData = parsed.scores.category.match
      matchArray = Array.isArray(matchesData) ? matchesData : [matchesData]
    }
    // Structure alternative: scores.category peut être un tableau
    else if (parsed.scores?.category) {
      const categories = Array.isArray(parsed.scores.category)
        ? parsed.scores.category
        : [parsed.scores.category]
      for (const cat of categories) {
        if (cat.match) {
          const catMatches = Array.isArray(cat.match) ? cat.match : [cat.match]
          matchArray.push(...catMatches)
        }
      }
    }

    // Transformer chaque match
    for (const matchData of matchArray) {
      const match = transformMatch(matchData, league)
      if (match) {
        matches.push(match)
      }
    }

    return matches
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
    // Note: on vérifie !== undefined et !== '' car 0 est une valeur valide
    const parseScore = (score: any): number | undefined => {
      if (score === undefined || score === '') return undefined
      const parsed = parseInt(String(score), 10)
      return isNaN(parsed) ? undefined : parsed
    }
    const awayScoreNum = parseScore(awayScore)
    const homeScoreNum = parseScore(homeScore)
    
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
    } else if (matchData['@_timer'] && statusValue) {
      // Si on a un timer mais pas de période, utiliser le statut comme période
      // Le statut peut contenir "1st", "2nd", "3rd", "OT", etc.
      period = String(matchData['@_status'] || 'En cours')
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

      // Mapper les noms de position vers les abréviations
      const getPositionAbbr = (name: string): string => {
        if (name.includes('center')) return 'C'
        if (name.includes('left wing')) return 'LW'
        if (name.includes('right wing')) return 'RW'
        if (name.includes('defense')) return 'D'
        if (name.includes('goalie')) return 'G'
        return name.toUpperCase().substring(0, 2)
      }

      for (const playerData of players) {
        const player: Player = {
          id: String(playerData['@_id'] || ''),
          name: String(playerData['@_name'] || ''),
          number: String(playerData['@_number'] || ''),
          position: getPositionAbbr(positionName),
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

// ============================================
// TEAM STATS API
// ============================================

export interface GoalserveTeamStats {
  wins: number
  losses: number
  otLosses: number
  points: number
  gamesPlayed: number
  goalsFor: number
  goalsAgainst: number
  goalsForPerGame: number
  goalsAgainstPerGame: number
  shotsPerGame: number
  shotsAgainstPerGame: number
  powerPlayPercentage: string
  penaltyKillPercentage: string
  savePercentage: string
}

/**
 * Récupère les stats globales d'une équipe
 */
export async function fetchTeamStats(teamId: string): Promise<GoalserveTeamStats | null> {
  const url = getTeamStatsUrl(teamId)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) return null

    const xml = await response.text()
    if (!xml || xml.includes('Server Error')) return null

    return parseTeamStatsXML(xml)
  } catch (error) {
    return null
  }
}

function parseTeamStatsXML(xml: string): GoalserveTeamStats | null {
  try {
    const parsed = xmlParser.parse(xml)
    const statistic = parsed.statistic

    if (!statistic) return null

    // Structure: <statistic> → <category name="Skating/Goaltending"> → <team ...stats />
    const categories = Array.isArray(statistic.category) ? statistic.category : [statistic.category]

    let skating: any = {}
    let goaltending: any = {}

    for (const cat of categories) {
      if (!cat) continue
      const catName = cat['@_name'] || ''
      // Les stats sont dans l'élément <team> à l'intérieur de <category>
      const teamStats = cat.team || {}

      if (catName === 'Skating') {
        skating = teamStats
      } else if (catName === 'Goaltending') {
        goaltending = teamStats
      }
    }

    const wins = parseInt(goaltending['@_wins'] || '0', 10)
    const losses = parseInt(goaltending['@_losses'] || '0', 10)
    const otLosses = parseInt(goaltending['@_ot_losses'] || '0', 10)
    const gamesPlayed = parseInt(goaltending['@_games_played'] || skating['@_games_played'] || '0', 10)

    return {
      wins,
      losses,
      otLosses,
      points: (wins * 2) + otLosses,
      gamesPlayed,
      goalsFor: Math.round(parseFloat(skating['@_goals_for_per_game'] || '0') * gamesPlayed),
      goalsAgainst: parseInt(goaltending['@_goals_against'] || '0', 10),
      goalsForPerGame: parseFloat(skating['@_goals_for_per_game'] || '0'),
      goalsAgainstPerGame: parseFloat(goaltending['@_goals_against_per_game'] || '0'),
      shotsPerGame: parseFloat(skating['@_shots'] || '0') / Math.max(gamesPlayed, 1),
      shotsAgainstPerGame: parseFloat(goaltending['@_shots_against'] || '0') / Math.max(gamesPlayed, 1),
      powerPlayPercentage: `${skating['@_power_play_pct'] || '0'}%`,
      penaltyKillPercentage: `${skating['@_penalty_kill_pct'] || '0'}%`,
      savePercentage: `${(parseFloat(goaltending['@_saves_pct'] || '0') * 100).toFixed(1)}%`,
    }
  } catch (error) {
    return null
  }
}

// ============================================
// PLAYER STATS API
// ============================================

export interface GoalservePlayerStats {
  id: string
  name: string
  position: string
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  penaltyMinutes: number
  powerPlayGoals: number
  powerPlayAssists: number
  shots: number
  // Goalie specific
  wins?: number
  losses?: number
  otLosses?: number
  savePercentage?: number
  goalsAgainst?: number
  shutouts?: number
}

/**
 * Récupère les stats des joueurs d'une équipe
 */
export async function fetchPlayerStats(teamId: string): Promise<GoalservePlayerStats[]> {
  const url = getPlayerStatsUrl(teamId)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) return []

    const xml = await response.text()
    if (!xml || xml.includes('Server Error')) return []

    return parsePlayerStatsXML(xml)
  } catch (error) {
    return []
  }
}

function parsePlayerStatsXML(xml: string): GoalservePlayerStats[] {
  try {
    const parsed = xmlParser.parse(xml)
    const statistic = parsed.statistic

    if (!statistic) return []

    const players: GoalservePlayerStats[] = []

    // Parser les joueurs de champ (dans <team>)
    if (statistic.team?.player) {
      const teamPlayers = Array.isArray(statistic.team.player)
        ? statistic.team.player
        : [statistic.team.player]

      for (const p of teamPlayers) {
        players.push({
          id: String(p['@_id'] || ''),
          name: String(p['@_name'] || ''),
          position: String(p['@_pos'] || ''),
          gamesPlayed: parseInt(p['@_games_played'] || '0', 10),
          goals: parseInt(p['@_goals'] || '0', 10),
          assists: parseInt(p['@_assists'] || '0', 10),
          points: parseInt(p['@_points'] || '0', 10),
          plusMinus: parseInt(p['@_plus_minus'] || '0', 10),
          penaltyMinutes: parseInt(p['@_penalty_minutes'] || '0', 10),
          powerPlayGoals: parseInt(p['@_pp_goals'] || '0', 10),
          powerPlayAssists: parseInt(p['@_pp_assists'] || '0', 10),
          shots: parseInt(p['@_shots'] || '0', 10),
        })
      }
    }

    // Parser les gardiens (dans <goalkeepers>)
    if (statistic.goalkeepers?.player) {
      const goalies = Array.isArray(statistic.goalkeepers.player)
        ? statistic.goalkeepers.player
        : [statistic.goalkeepers.player]

      for (const p of goalies) {
        players.push({
          id: String(p['@_id'] || ''),
          name: String(p['@_name'] || ''),
          position: 'G',
          gamesPlayed: parseInt(p['@_games_played'] || '0', 10),
          goals: 0,
          assists: 0,
          points: 0,
          plusMinus: 0,
          penaltyMinutes: parseInt(p['@_penalty_minutes'] || '0', 10),
          powerPlayGoals: 0,
          powerPlayAssists: 0,
          shots: 0,
          wins: parseInt(p['@_wins'] || '0', 10),
          losses: parseInt(p['@_losses'] || '0', 10),
          otLosses: parseInt(p['@_ot_losses'] || '0', 10),
          savePercentage: parseFloat(p['@_saves_pct'] || '0'),
          goalsAgainst: parseInt(p['@_total_goals_against'] || '0', 10),
          shutouts: parseInt(p['@_shutouts'] || '0', 10),
        })
      }
    }

    return players
  } catch (error) {
    return []
  }
}

// ============================================
// INJURIES API
// ============================================

export interface GoalserveInjury {
  playerId: string
  playerName: string
  status: string
  description: string
  date: string
}

/**
 * Récupère les blessures d'une équipe
 */
export async function fetchTeamInjuries(teamId: string): Promise<GoalserveInjury[]> {
  const url = getTeamInjuriesUrl(teamId)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) return []

    const xml = await response.text()
    if (!xml || xml.includes('Server Error')) return []

    return parseInjuriesXML(xml)
  } catch (error) {
    return []
  }
}

function parseInjuriesXML(xml: string): GoalserveInjury[] {
  try {
    const parsed = xmlParser.parse(xml)
    const team = parsed.team

    if (!team?.report) return []

    const reports = Array.isArray(team.report) ? team.report : [team.report]

    return reports.map((r: any) => ({
      playerId: String(r['@_player_id'] || ''),
      playerName: String(r['@_player_name'] || ''),
      status: String(r['@_status'] || ''),
      description: String(r['@_description'] || ''),
      date: String(r['@_date'] || ''),
    }))
  } catch (error) {
    return []
  }
}

// ============================================
// PLAYER IMAGE API
// ============================================

// Cache global pour les images de joueurs
const playerImageCache = new Map<string, string>()

/**
 * Récupère l'image d'un joueur (retourne une URI base64)
 */
export async function fetchPlayerImage(playerId: string): Promise<string | null> {
  // Vérifier le cache d'abord
  if (playerImageCache.has(playerId)) {
    return playerImageCache.get(playerId) || null
  }

  const url = getPlayerImageUrl(playerId)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) return null

    const xml = await response.text()
    if (!xml || xml.includes('Server Error')) return null

    const imageUri = parsePlayerImageXML(xml)

    // Mettre en cache si on a une image
    if (imageUri) {
      playerImageCache.set(playerId, imageUri)
    }

    return imageUri
  } catch (error) {
    return null
  }
}

function parsePlayerImageXML(xml: string): string | null {
  try {
    const parsed = xmlParser.parse(xml)

    let imageBase64 = ''

    // L'image peut être dans différents formats selon le parser
    if (typeof parsed.image === 'string') {
      imageBase64 = parsed.image.trim()
    } else if (parsed.image?.['#text']) {
      imageBase64 = String(parsed.image['#text']).trim()
    } else if (parsed.image) {
      imageBase64 = String(parsed.image).trim()
    }

    if (!imageBase64 || imageBase64.length === 0) {
      return null
    }

    return base64ToDataUri(imageBase64)
  } catch (error) {
    return null
  }
}

// ============================================
// MATCH DETAILS / EVENTS API
// ============================================

import {
  GoalEvent,
  PenaltyEvent,
  MatchEvent,
  TeamMatchStats,
  PlayerMatchStats,
  GoalkeeperMatchStats,
  PowerplayStats,
  MatchDetails,
} from '@/lib/types'

/**
 * Récupère les détails d'un match en direct (événements, stats, etc.)
 * Utilise l'endpoint nhl-scores qui contient les données détaillées
 */
export async function fetchMatchDetails(matchId: string): Promise<MatchDetails | null> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.nhlScores}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) return null

    const xml = await response.text()
    if (!xml || xml.includes('Server Error')) return null

    return parseMatchDetailsXML(xml, matchId)
  } catch (error) {
    return null
  }
}

/**
 * Parse le XML pour extraire les détails d'un match spécifique
 */
function parseMatchDetailsXML(xml: string, matchId: string): MatchDetails | null {
  try {
    const parsed = xmlParser.parse(xml)
    let matchArray: any[] = []

    // Structure nhl-scores: scores.category.match
    if (parsed.scores?.category?.match) {
      const matchesData = parsed.scores.category.match
      matchArray = Array.isArray(matchesData) ? matchesData : [matchesData]
    } else if (parsed.scores?.category) {
      const categories = Array.isArray(parsed.scores.category)
        ? parsed.scores.category
        : [parsed.scores.category]
      for (const cat of categories) {
        if (cat.match) {
          const catMatches = Array.isArray(cat.match) ? cat.match : [cat.match]
          matchArray.push(...catMatches)
        }
      }
    }

    // Trouver le match correspondant
    const matchData = matchArray.find(m => String(m['@_id']) === matchId)
    if (!matchData) return null

    // Parser les événements
    const events: MatchEvent[] = []

    // Parser les buts
    const scoring = matchData.scoring || {}
    const periods = ['firstperiod', 'secondperiod', 'thirdperiod', 'overtime', 'shootout']
    const periodNames = ['1ère', '2e', '3e', 'Prolongation', 'Tirs de barrage']

    periods.forEach((periodKey, index) => {
      const periodData = scoring[periodKey]
      if (!periodData?.event) return

      const periodEvents = Array.isArray(periodData.event) ? periodData.event : [periodData.event]
      for (const event of periodEvents) {
        if (!event) continue

        const goalEvent: GoalEvent = {
          type: 'goal',
          team: event['@_team'] === 'hometeam' ? 'home' : 'away',
          period: periodNames[index],
          time: String(event['@_min'] || ''),
          player: String(event['@_player'] || ''),
          playerId: String(event['@_player_id'] || ''),
          assists: event['@_assist'] ? String(event['@_assist']).split(', ') : [],
          assistIds: [
            event['@_assist_id1'] ? String(event['@_assist_id1']) : '',
            event['@_assist_id2'] ? String(event['@_assist_id2']) : '',
          ].filter(Boolean),
          goalType: parseGoalType(event['@_goal_type']),
          homeScore: parseInt(event['@_home_score'] || '0', 10),
          awayScore: parseInt(event['@_away_score'] || '0', 10),
        }
        events.push(goalEvent)
      }
    })

    // Parser les pénalités
    const penalties = matchData.penalties || {}
    periods.forEach((periodKey, index) => {
      const periodData = penalties[periodKey]
      if (!periodData?.penalty) return

      const periodPenalties = Array.isArray(periodData.penalty) ? periodData.penalty : [periodData.penalty]
      for (const penalty of periodPenalties) {
        if (!penalty) continue

        const penaltyEvent: PenaltyEvent = {
          type: 'penalty',
          team: penalty['@_team'] === 'hometeam' ? 'home' : 'away',
          period: periodNames[index],
          time: String(penalty['@_min'] || ''),
          player: String(penalty['@_player'] || ''),
          playerId: String(penalty['@_player_id'] || ''),
          reason: String(penalty['@_reason'] || ''),
        }
        events.push(penaltyEvent)
      }
    })

    // Trier les événements par période et temps
    events.sort((a, b) => {
      const periodOrder = periodNames.indexOf(a.period) - periodNames.indexOf(b.period)
      if (periodOrder !== 0) return periodOrder
      return parseTime(a.time) - parseTime(b.time)
    })

    // Parser les stats d'équipe
    const teamStatsData = matchData.team_stats || {}
    const homeTeamStats = parseTeamMatchStats(teamStatsData.hometeam)
    const awayTeamStats = parseTeamMatchStats(teamStatsData.awayteam)

    // Parser les stats de joueurs
    const playerStatsData = matchData.player_stats || {}
    const homePlayerStats = parsePlayerMatchStats(playerStatsData.hometeam)
    const awayPlayerStats = parsePlayerMatchStats(playerStatsData.awayteam)

    // Parser les stats de gardiens
    const goalkeeperStatsData = matchData.goalkeeper_stats || {}
    const homeGoalkeeperStats = parseGoalkeeperMatchStats(goalkeeperStatsData.hometeam)
    const awayGoalkeeperStats = parseGoalkeeperMatchStats(goalkeeperStatsData.awayteam)

    // Parser le powerplay
    const powerplayData = matchData.powerplay || {}
    const homePowerplay = parsePowerplayStats(powerplayData.hometeam)
    const awayPowerplay = parsePowerplayStats(powerplayData.awayteam)

    // Parser les scores par période
    const homeTeam = matchData.hometeam || {}
    const awayTeam = matchData.awayteam || {}
    const periodScores = {
      home: [
        parseInt(homeTeam['@_p1'] || '0', 10) || 0,
        parseInt(homeTeam['@_p2'] || '0', 10) || 0,
        parseInt(homeTeam['@_p3'] || '0', 10) || 0,
      ],
      away: [
        parseInt(awayTeam['@_p1'] || '0', 10) || 0,
        parseInt(awayTeam['@_p2'] || '0', 10) || 0,
        parseInt(awayTeam['@_p3'] || '0', 10) || 0,
      ],
    }

    // Ajouter OT et SO si présents
    if (homeTeam['@_ot'] || awayTeam['@_ot']) {
      periodScores.home.push(parseInt(homeTeam['@_ot'] || '0', 10) || 0)
      periodScores.away.push(parseInt(awayTeam['@_ot'] || '0', 10) || 0)
    }

    return {
      matchId,
      events,
      teamStats: {
        home: homeTeamStats,
        away: awayTeamStats,
      },
      playerStats: {
        home: homePlayerStats,
        away: awayPlayerStats,
      },
      goalkeeperStats: {
        home: homeGoalkeeperStats,
        away: awayGoalkeeperStats,
      },
      powerplay: {
        home: homePowerplay,
        away: awayPowerplay,
      },
      periodScores,
    }
  } catch (error) {
    return null
  }
}

function parseGoalType(type: string | undefined): GoalEvent['goalType'] {
  const t = String(type || 'reg').toLowerCase()
  if (t.includes('pp') || t.includes('power')) return 'pp'
  if (t.includes('sh') || t.includes('short')) return 'sh'
  if (t.includes('en') || t.includes('empty')) return 'en'
  if (t.includes('ps') || t.includes('penalty')) return 'ps'
  return 'reg'
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
  }
  return 0
}

function parseTeamMatchStats(data: any): TeamMatchStats {
  if (!data) {
    return { shots: 0, penaltyMinutes: 0, hits: 0, giveaways: 0, takeaways: 0, faceoffsWon: 0 }
  }
  return {
    shots: parseInt(data.shots?.['@_total'] || '0', 10),
    penaltyMinutes: parseInt(data.penalty_minutes?.['@_total'] || '0', 10),
    hits: parseInt(data.hits?.['@_total'] || '0', 10),
    giveaways: parseInt(data.giveaways?.['@_total'] || '0', 10),
    takeaways: parseInt(data.takeaways?.['@_total'] || '0', 10),
    faceoffsWon: parseInt(data.faceoffs_won?.['@_total'] || '0', 10),
  }
}

function parsePlayerMatchStats(data: any): PlayerMatchStats[] {
  if (!data?.player) return []
  const players = Array.isArray(data.player) ? data.player : [data.player]

  return players.map((p: any) => ({
    id: String(p['@_id'] || ''),
    name: String(p['@_name'] || ''),
    goals: parseInt(p['@_goals'] || '0', 10),
    assists: parseInt(p['@_assists'] || '0', 10),
    shots: parseInt(p['@_shots_on_goal'] || '0', 10),
    plusMinus: parseInt(p['@_plus_minus'] || '0', 10),
    penaltyMinutes: parseInt(p['@_penalty_minutes'] || '0', 10),
    hits: parseInt(p['@_hits'] || '0', 10),
    timeOnIce: String(p['@_time_on_ice'] || '0:00'),
    faceoffsWon: parseInt(p['@_faceoffs_won'] || '0', 10),
    faceoffsLost: parseInt(p['@_faceoffs_lost'] || '0', 10),
  }))
}

function parseGoalkeeperMatchStats(data: any): GoalkeeperMatchStats[] {
  if (!data?.player) return []
  const players = Array.isArray(data.player) ? data.player : [data.player]

  return players.map((p: any) => ({
    id: String(p['@_id'] || ''),
    name: String(p['@_name'] || ''),
    shotsAgainst: parseInt(p['@_shots_against'] || '0', 10),
    goalsAgainst: parseInt(p['@_goals_against'] || '0', 10),
    saves: parseInt(p['@_saves'] || '0', 10),
    savePercentage: String(p['@_saves_pct'] || '0'),
    timeOnIce: String(p['@_time_on_ice'] || '0:00'),
  }))
}

function parsePowerplayStats(data: any): PowerplayStats {
  if (!data) {
    return { opportunities: 0, goals: 0 }
  }
  return {
    opportunities: parseInt(data['@_opportunities'] || '0', 10),
    goals: parseInt(data['@_goals'] || '0', 10),
  }
}

