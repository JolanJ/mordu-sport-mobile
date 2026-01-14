export interface Match {
  id: string
  league: "NHL" | "NBA" | "NFL"
  status: "upcoming" | "live" | "finished"
  date: string
  time?: string
  period?: string
  timeRemaining?: string
  venue?: string // Nom du stade/aréna
  
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
