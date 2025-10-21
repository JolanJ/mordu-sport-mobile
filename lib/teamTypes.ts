export interface Player {
  id: string
  name: string
  number: string // "12", "27"
  position: string // "C", "RW", "LW", "D", "G"
  gamesPlayed?: number
  birthplace?: string

  // Stats pour attaquants/défenseurs
  points?: number
  goals?: number
  assists?: number
}

export interface TeamRoster {
  forwards: Player[]
  defensemen: Player[]
  goalies: Player[]
}

export interface TeamStats {
  wins: number
  losses: number
  otLosses: number
  points: number
  gamesPlayed: number

  // Offensive
  goalsFor: number
  shotsPerGame: number
  powerPlayPercentage: string // "22.5%"
  powerPlayGoals: number
  powerPlayOpportunities: number
  faceoffWinPercentage: string // "51.2%"

  // Defensive
  goalsAgainst: number
  shotsAllowedPerGame: number
  penaltyKillPercentage: string // "82.3%"
}

export interface Injury {
  playerId: string
  playerName: string
  position: string
  injury: string // "Blessure au bas du corps"
  status: 'OUT' | 'Day-to-Day' | 'IR'
  date?: string // "15 janvier 2025"
}

export interface TeamDetailData {
  teamInfo: {
    id: string
    name: string
    abbr: string
    city: string
    league: string
    conference: string
    division: string
  }
  teamStats: TeamStats
  roster: TeamRoster
  injuries: Injury[]
}

