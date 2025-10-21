export interface Team {
  id: string
  name: string
  abbr: string           // "MTL", "TOR", "BOS"
  city: string
  league: "NHL" | "NBA" | "NFL"
  conference: string     // "Eastern", "Western", "AFC", "NFC"
  division: string       // "Atlantic", "Metropolitan", etc.
  stats?: {
    wins: number
    losses: number
    otLosses?: number    // Hockey seulement
    points: number
  }
}

export const mockTeams: Team[] = [
  // NHL - Conférence Est
  {
    id: "montreal-canadiens",
    name: "Montreal Canadiens",
    abbr: "MTL",
    city: "Montreal",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    stats: { wins: 15, losses: 8, otLosses: 2, points: 32 }
  },
  {
    id: "toronto-maple-leafs",
    name: "Toronto Maple Leafs",
    abbr: "TOR",
    city: "Toronto",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    stats: { wins: 18, losses: 5, otLosses: 1, points: 37 }
  },
  {
    id: "boston-bruins",
    name: "Boston Bruins",
    abbr: "BOS",
    city: "Boston",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    stats: { wins: 12, losses: 10, otLosses: 3, points: 27 }
  },
  {
    id: "new-york-rangers",
    name: "New York Rangers",
    abbr: "NYR",
    city: "New York",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    stats: { wins: 16, losses: 7, otLosses: 2, points: 34 }
  },
  {
    id: "pittsburgh-penguins",
    name: "Pittsburgh Penguins",
    abbr: "PIT",
    city: "Pittsburgh",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    stats: { wins: 14, losses: 9, otLosses: 2, points: 30 }
  },

  // NHL - Conférence Ouest
  {
    id: "edmonton-oilers",
    name: "Edmonton Oilers",
    abbr: "EDM",
    city: "Edmonton",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    stats: { wins: 20, losses: 3, otLosses: 1, points: 41 }
  },
  {
    id: "calgary-flames",
    name: "Calgary Flames",
    abbr: "CGY",
    city: "Calgary",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    stats: { wins: 11, losses: 12, otLosses: 2, points: 24 }
  },
  {
    id: "vancouver-canucks",
    name: "Vancouver Canucks",
    abbr: "VAN",
    city: "Vancouver",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    stats: { wins: 13, losses: 8, otLosses: 4, points: 30 }
  },

  // NBA - Conférence Est
  {
    id: "boston-celtics",
    name: "Boston Celtics",
    abbr: "BOS",
    city: "Boston",
    league: "NBA",
    conference: "Eastern",
    division: "Atlantic",
    stats: { wins: 22, losses: 6, points: 44 }
  },
  {
    id: "miami-heat",
    name: "Miami Heat",
    abbr: "MIA",
    city: "Miami",
    league: "NBA",
    conference: "Eastern",
    division: "Southeast",
    stats: { wins: 18, losses: 10, points: 36 }
  },

  // NBA - Conférence Ouest
  {
    id: "los-angeles-lakers",
    name: "Los Angeles Lakers",
    abbr: "LAL",
    city: "Los Angeles",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    stats: { wins: 15, losses: 13, points: 30 }
  },
  {
    id: "golden-state-warriors",
    name: "Golden State Warriors",
    abbr: "GSW",
    city: "San Francisco",
    league: "NBA",
    conference: "Western",
    division: "Pacific",
    stats: { wins: 12, losses: 16, points: 24 }
  },

  // NFL - AFC
  {
    id: "buffalo-bills",
    name: "Buffalo Bills",
    abbr: "BUF",
    city: "Buffalo",
    league: "NFL",
    conference: "AFC",
    division: "East",
    stats: { wins: 9, losses: 3, points: 18 }
  },
  {
    id: "kansas-city-chiefs",
    name: "Kansas City Chiefs",
    abbr: "KC",
    city: "Kansas City",
    league: "NFL",
    conference: "AFC",
    division: "West",
    stats: { wins: 8, losses: 4, points: 16 }
  },

  // NFL - NFC
  {
    id: "philadelphia-eagles",
    name: "Philadelphia Eagles",
    abbr: "PHI",
    city: "Philadelphia",
    league: "NFL",
    conference: "NFC",
    division: "East",
    stats: { wins: 10, losses: 2, points: 20 }
  },
  {
    id: "san-francisco-49ers",
    name: "San Francisco 49ers",
    abbr: "SF",
    city: "San Francisco",
    league: "NFL",
    conference: "NFC",
    division: "West",
    stats: { wins: 9, losses: 3, points: 18 }
  }
]

export const getTeamsByLeague = (league: string) => {
  return mockTeams.filter(team => team.league === league)
}

export const getTeamsByConference = (league: string, conference: string) => {
  return mockTeams.filter(team => team.league === league && team.conference === conference)
}

export const getTeamById = (id: string) => {
  return mockTeams.find(team => team.id === id)
}
