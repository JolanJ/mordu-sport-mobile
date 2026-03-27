export interface Match {
  id: string
  league: "NHL" | "NBA" | "NFL"
  status: "upcoming" | "live" | "finished"
  statusText?: string // Texte descriptif (ex: "Fin 1ère période", "Entracte")
  date: string
  time?: string
  period?: string
  timeRemaining?: string
  venue?: string // Nom du stade/aréna

  homePP?: boolean // Équipe locale en avantage numérique
  awayPP?: boolean // Équipe visiteur en avantage numérique

  awayTeam: {
    name: string
    abbr: string
    logo: any // Accept both string URLs and require() images
    score?: number
    teamId?: string // ID de l'équipe depuis Goalserve
  }

  homeTeam: {
    name: string
    abbr: string
    logo: any // Accept both string URLs and require() images
    score?: number
    teamId?: string // ID de l'équipe depuis Goalserve
  }
}

// ============================================
// MATCH EVENTS TYPES
// ============================================

export interface GoalEvent {
  type: 'goal'
  team: 'home' | 'away'
  period: string
  time: string
  player: string
  playerId: string
  assists: string[]
  assistIds: string[]
  goalType: 'reg' | 'pp' | 'sh' | 'en' | 'ps' // regular, power play, short-handed, empty net, penalty shot
  homeScore: number
  awayScore: number
}

export interface PenaltyEvent {
  type: 'penalty'
  team: 'home' | 'away'
  period: string
  time: string
  player: string
  playerId: string
  reason: string
}

export type MatchEvent = GoalEvent | PenaltyEvent

export interface TeamMatchStats {
  shots: number
  penaltyMinutes: number
  hits: number
  giveaways: number
  takeaways: number
  faceoffsWon: number
}

export interface PlayerMatchStats {
  id: string
  name: string
  goals: number
  assists: number
  shots: number
  plusMinus: number
  penaltyMinutes: number
  hits: number
  timeOnIce: string
  faceoffsWon: number
  faceoffsLost: number
}

export interface GoalkeeperMatchStats {
  id: string
  name: string
  shotsAgainst: number
  goalsAgainst: number
  saves: number
  savePercentage: string
  timeOnIce: string
}

export interface PowerplayStats {
  opportunities: number
  goals: number
}

export interface MatchDetails {
  matchId: string
  events: MatchEvent[]
  teamStats: {
    home: TeamMatchStats
    away: TeamMatchStats
  }
  playerStats: {
    home: PlayerMatchStats[]
    away: PlayerMatchStats[]
  }
  goalkeeperStats: {
    home: GoalkeeperMatchStats[]
    away: GoalkeeperMatchStats[]
  }
  powerplay: {
    home: PowerplayStats
    away: PowerplayStats
  }
  periodScores: {
    home: number[]
    away: number[]
  }
}
