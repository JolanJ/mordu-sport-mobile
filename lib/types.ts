export interface Match {
  id: string
  league: "NHL" | "NBA" | "NFL"
  status: "upcoming" | "live" | "finished"
  date: string
  time?: string
  period?: string
  timeRemaining?: string
  
  awayTeam: {
    name: string
    abbr: string
    logo: string
    score?: number
  }
  
  homeTeam: {
    name: string
    abbr: string
    logo: string
    score?: number
  }
}
