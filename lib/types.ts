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
    logo: any // Accept both string URLs and require() images
    score?: number
  }
  
  homeTeam: {
    name: string
    abbr: string
    logo: any // Accept both string URLs and require() images
    score?: number
  }
}
