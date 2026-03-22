/**
 * Service API Goalserve — classe singleton
 */

import { fetchGoalserveXml, formatDate } from '@/config/api'
import { supabase } from '@/lib/supabase'
import { Match } from '@/lib/types'
import {
  isToday,
  parseXMLMatches,
  parseXMLScores,
  parseTeamRosterXML,
  parseTeamStatsXML,
  parsePlayerStatsXML,
  parseInjuriesXML,
  parsePlayerImageXML,
  parseMatchDetailsXML,
} from './parsers'
import type { MatchDetails } from '@/lib/types'

// Re-exports pour les consumers
export { base64ToDataUri } from './parsers'
export type { League, TeamRosterData, GoalserveTeamStats, GoalservePlayerStats, GoalserveInjury } from './parsers'
import type { TeamRosterData, GoalserveTeamStats, GoalservePlayerStats, GoalserveInjury } from './parsers'

const SCORES_CACHE_TTL = 60000

class GoalserveAPI {
  private logoCache: Record<string, string> = {}
  private abbrCache: Record<string, string> = {}
  private logoCacheLoaded = false
  private scoresXmlCache: { path: string; xml: string; timestamp: number } | null = null
  private playerImageCache = new Map<string, string>()

  // ============================================
  // MATCHES
  // ============================================

  async fetchMatches(league: 'NHL', date?: Date, withLogos: boolean = false): Promise<Match[]> {
    const useScoresEndpoint = isToday(date)
    let path = useScoresEndpoint ? 'hockey/nhl-scores' : 'hockey/nhl-shedule'

    if (date && !useScoresEndpoint) {
      path += `?date1=${formatDate(date)}`
    }

    try {
      const xml = await fetchGoalserveXml(path)

      if (useScoresEndpoint) {
        this.scoresXmlCache = { path, xml, timestamp: Date.now() }
      }

      const matches = useScoresEndpoint
        ? parseXMLScores(xml, league)
        : parseXMLMatches(xml, league, date)

      if (withLogos && matches.length > 0) {
        return await this.enrichMatchesWithLogos(matches)
      }

      return matches
    } catch (error) {
      return []
    }
  }

  // ============================================
  // MATCH DETAILS
  // ============================================

  async fetchMatchDetails(matchId: string, date?: Date): Promise<MatchDetails | null> {
    let path = 'hockey/nhl-scores'

    if (date && !isToday(date)) {
      path += `?date=${formatDate(date)}`
    }

    try {
      let xml: string

      if (this.scoresXmlCache && this.scoresXmlCache.path === path && Date.now() - this.scoresXmlCache.timestamp < SCORES_CACHE_TTL) {
        xml = this.scoresXmlCache.xml
      } else {
        xml = await fetchGoalserveXml(path)
        if (!xml || xml.includes('Server Error')) return null
        this.scoresXmlCache = { path, xml, timestamp: Date.now() }
      }

      return parseMatchDetailsXML(xml, matchId)
    } catch (error) {
      return null
    }
  }

  // ============================================
  // TEAM ROSTER
  // ============================================

  async fetchTeamRoster(teamId: string) {
    try {
      const xml = await fetchGoalserveXml(`hockey/${teamId}_rosters`)

      if (xml.includes('Server Error') || xml.includes('Root element is missing') || xml.trim().length === 0) {
        return null
      }

      return parseTeamRosterXML(xml)
    } catch (error) {
      return null
    }
  }

  // ============================================
  // TEAM STATS
  // ============================================

  async fetchTeamStats(teamId: string) {
    try {
      const xml = await fetchGoalserveXml(`hockey/${teamId}_team_stats`)
      if (!xml || xml.includes('Server Error')) return null
      return parseTeamStatsXML(xml)
    } catch (error) {
      return null
    }
  }

  // ============================================
  // PLAYER STATS
  // ============================================

  async fetchPlayerStats(teamId: string) {
    try {
      const xml = await fetchGoalserveXml(`hockey/${teamId}_stats`)
      if (!xml || xml.includes('Server Error')) return []
      return parsePlayerStatsXML(xml)
    } catch (error) {
      return []
    }
  }

  // ============================================
  // INJURIES
  // ============================================

  async fetchTeamInjuries(teamId: string) {
    try {
      const xml = await fetchGoalserveXml(`hockey/${teamId}_injuries`)
      if (!xml || xml.includes('Server Error')) return []
      return parseInjuriesXML(xml)
    } catch (error) {
      return []
    }
  }

  // ============================================
  // PLAYER IMAGE
  // ============================================

  async fetchPlayerImage(playerId: string): Promise<string | null> {
    if (this.playerImageCache.has(playerId)) {
      return this.playerImageCache.get(playerId) || null
    }

    try {
      const xml = await fetchGoalserveXml(`hockey/usa?playerimage=${playerId}`)
      if (!xml || xml.includes('Server Error')) return null

      const imageUri = parsePlayerImageXML(xml)

      if (imageUri) {
        this.playerImageCache.set(playerId, imageUri)
      }

      return imageUri
    } catch (error) {
      return null
    }
  }

  // ============================================
  // CACHED READS (from Supabase tables)
  // ============================================

  async fetchTeamRosterCached(teamId: string) {
    const { data } = await supabase
      .from('team_rosters')
      .select('*')
      .eq('team_goalserve_id', teamId)

    if (!data || data.length === 0) return this.fetchTeamRoster(teamId)

    const roster = { forwards: [] as any[], defensemen: [] as any[], goalies: [] as any[] }
    for (const p of data) {
      const player = {
        id: p.player_id,
        name: p.player_name,
        number: p.player_number || '',
        position: p.position || '',
        birthplace: p.birthplace || undefined,
      }
      if (p.position_group === 'forwards') roster.forwards.push(player)
      else if (p.position_group === 'defensemen') roster.defensemen.push(player)
      else if (p.position_group === 'goalies') roster.goalies.push(player)
    }

    // Get team info from the teams table
    const { data: teamRow } = await supabase
      .from('teams')
      .select('goalserve_id, name, abbr, logo_url')
      .eq('goalserve_id', teamId)
      .single()

    return {
      teamInfo: {
        id: teamId,
        name: teamRow?.name || '',
        abbr: teamRow?.abbr || '',
        logo: teamRow?.logo_url || undefined,
      },
      roster,
    } as TeamRosterData
  }

  async fetchTeamStatsCached(teamId: string) {
    const { data } = await supabase
      .from('team_stats_cache')
      .select('*')
      .eq('team_goalserve_id', teamId)
      .single()

    if (!data) return this.fetchTeamStats(teamId)

    return {
      wins: data.wins,
      losses: data.losses,
      otLosses: data.ot_losses,
      points: data.points,
      gamesPlayed: data.games_played,
      goalsFor: data.goals_for,
      goalsAgainst: data.goals_against,
      goalsForPerGame: Number(data.goals_for_per_game),
      goalsAgainstPerGame: Number(data.goals_against_per_game),
      shotsPerGame: Number(data.shots_per_game),
      shotsAgainstPerGame: Number(data.shots_against_per_game),
      powerPlayPercentage: data.power_play_pct,
      penaltyKillPercentage: data.penalty_kill_pct,
      savePercentage: data.save_pct,
    } as GoalserveTeamStats
  }

  async fetchPlayerStatsCached(teamId: string) {
    const { data } = await supabase
      .from('player_stats_cache')
      .select('*')
      .eq('team_goalserve_id', teamId)

    if (!data || data.length === 0) return this.fetchPlayerStats(teamId)

    return data.map(p => ({
      id: p.player_id,
      name: p.player_name,
      position: p.position || '',
      gamesPlayed: p.games_played,
      goals: p.goals,
      assists: p.assists,
      points: p.points,
      plusMinus: p.plus_minus,
      penaltyMinutes: p.penalty_minutes,
      powerPlayGoals: p.power_play_goals,
      powerPlayAssists: p.power_play_assists,
      shots: p.shots,
      wins: p.wins ?? undefined,
      losses: p.losses ?? undefined,
      otLosses: p.ot_losses ?? undefined,
      savePercentage: p.save_pct ? Number(p.save_pct) : undefined,
      goalsAgainst: p.goals_against ?? undefined,
      shutouts: p.shutouts ?? undefined,
    })) as GoalservePlayerStats[]
  }

  async fetchTeamInjuriesCached(teamId: string) {
    const { data } = await supabase
      .from('team_injuries_cache')
      .select('*')
      .eq('team_goalserve_id', teamId)

    if (!data || data.length === 0) return this.fetchTeamInjuries(teamId)

    return data.map(i => ({
      playerId: i.player_id,
      playerName: i.player_name,
      status: i.status || '',
      description: i.description || '',
      date: i.injury_date || '',
    })) as GoalserveInjury[]
  }

  // ============================================
  // LOGOS (SUPABASE)
  // ============================================

  private async loadLogosFromDB(): Promise<void> {
    if (this.logoCacheLoaded) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('goalserve_id, logo_url, abbr')

      if (!error && data) {
        for (const row of data) {
          if (row.goalserve_id) {
            if (row.logo_url) this.logoCache[row.goalserve_id] = row.logo_url
            if (row.abbr) this.abbrCache[row.goalserve_id] = row.abbr
          }
        }
        this.logoCacheLoaded = true
      }
    } catch (error) {
      // Ignorer les erreurs
    }
  }

  private async enrichMatchesWithLogos(matches: Match[]): Promise<Match[]> {
    await this.loadLogosFromDB()

    return matches.map(match => ({
      ...match,
      awayTeam: {
        ...match.awayTeam,
        logo: match.awayTeam.teamId ? this.logoCache[match.awayTeam.teamId] : undefined,
        abbr: (match.awayTeam.teamId && this.abbrCache[match.awayTeam.teamId]) || match.awayTeam.abbr,
      },
      homeTeam: {
        ...match.homeTeam,
        logo: match.homeTeam.teamId ? this.logoCache[match.homeTeam.teamId] : undefined,
        abbr: (match.homeTeam.teamId && this.abbrCache[match.homeTeam.teamId]) || match.homeTeam.abbr,
      },
    }))
  }
}

export const api = new GoalserveAPI()
