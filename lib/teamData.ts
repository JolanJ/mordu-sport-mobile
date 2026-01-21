export interface Team {
  id: string
  name: string
  abbr: string           // "MTL", "TOR", "BOS"
  city: string
  league: "NHL" | "NBA" | "NFL"
  conference: string     // "Eastern", "Western", "AFC", "NFC"
  division: string       // "Atlantic", "Metropolitan", etc.
  logo?: any            // Logo de l'équipe (URL ou image locale)
  goalserveId?: string  // ID Goalserve pour fetcher les données en temps réel
  stats?: {
    wins: number
    losses: number
    otLosses?: number    // Hockey seulement
    points: number
  }
}

export const mockTeams: Team[] = [
  // NHL - Conférence Est (Atlantic)
  {
    id: "montreal-canadiens",
    name: "Montreal Canadiens",
    abbr: "MTL",
    city: "Montreal",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    logo: require('@/assets/images/ch.png'),
    goalserveId: "1115",
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
    logo: require('@/assets/images/toor.png'),
    goalserveId: "1136",
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
    logo: require('@/assets/images/bos.png'),
    goalserveId: "1160",
    stats: { wins: 12, losses: 10, otLosses: 3, points: 27 }
  },
  {
    id: "buffalo-sabres",
    name: "Buffalo Sabres",
    abbr: "BUF",
    city: "Buffalo",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    goalserveId: "1162",
    stats: { wins: 10, losses: 15, otLosses: 3, points: 23 }
  },
  {
    id: "detroit-red-wings",
    name: "Detroit Red Wings",
    abbr: "DET",
    city: "Detroit",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    goalserveId: "1143",
    stats: { wins: 12, losses: 12, otLosses: 4, points: 28 }
  },
  {
    id: "florida-panthers",
    name: "Florida Panthers",
    abbr: "FLA",
    city: "Sunrise",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    goalserveId: "1156",
    stats: { wins: 18, losses: 8, otLosses: 2, points: 38 }
  },
  {
    id: "ottawa-senators",
    name: "Ottawa Senators",
    abbr: "OTT",
    city: "Ottawa",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    goalserveId: "1188",
    stats: { wins: 13, losses: 11, otLosses: 3, points: 29 }
  },
  {
    id: "tampa-bay-lightning",
    name: "Tampa Bay Lightning",
    abbr: "TBL",
    city: "Tampa",
    league: "NHL",
    conference: "Eastern",
    division: "Atlantic",
    goalserveId: "1157",
    stats: { wins: 16, losses: 10, otLosses: 2, points: 34 }
  },

  // NHL - Conférence Est (Metropolitan)
  {
    id: "new-york-rangers",
    name: "New York Rangers",
    abbr: "NYR",
    city: "New York",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    logo: require('@/assets/images/ran.png'),
    goalserveId: "1172",
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
    goalserveId: "1131",
    stats: { wins: 14, losses: 9, otLosses: 2, points: 30 }
  },
  {
    id: "carolina-hurricanes",
    name: "Carolina Hurricanes",
    abbr: "CAR",
    city: "Raleigh",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1126",
    stats: { wins: 17, losses: 9, otLosses: 1, points: 35 }
  },
  {
    id: "columbus-blue-jackets",
    name: "Columbus Blue Jackets",
    abbr: "CBJ",
    city: "Columbus",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1141",
    stats: { wins: 10, losses: 14, otLosses: 4, points: 24 }
  },
  {
    id: "new-jersey-devils",
    name: "New Jersey Devils",
    abbr: "NJD",
    city: "Newark",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1145",
    stats: { wins: 15, losses: 11, otLosses: 2, points: 32 }
  },
  {
    id: "new-york-islanders",
    name: "New York Islanders",
    abbr: "NYI",
    city: "Elmont",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1166",
    stats: { wins: 12, losses: 12, otLosses: 5, points: 29 }
  },
  {
    id: "philadelphia-flyers",
    name: "Philadelphia Flyers",
    abbr: "PHI",
    city: "Philadelphia",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1027",
    stats: { wins: 11, losses: 13, otLosses: 4, points: 26 }
  },
  {
    id: "washington-capitals",
    name: "Washington Capitals",
    abbr: "WSH",
    city: "Washington",
    league: "NHL",
    conference: "Eastern",
    division: "Metropolitan",
    goalserveId: "1150",
    stats: { wins: 19, losses: 7, otLosses: 2, points: 40 }
  },

  // NHL - Conférence Ouest (Central)
  {
    id: "winnipeg-jets",
    name: "Winnipeg Jets",
    abbr: "WPG",
    city: "Winnipeg",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "2786",
    stats: { wins: 20, losses: 8, otLosses: 1, points: 41 }
  },
  {
    id: "chicago-blackhawks",
    name: "Chicago Blackhawks",
    abbr: "CHI",
    city: "Chicago",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1028",
    stats: { wins: 8, losses: 18, otLosses: 2, points: 18 }
  },
  {
    id: "colorado-avalanche",
    name: "Colorado Avalanche",
    abbr: "COL",
    city: "Denver",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1137",
    stats: { wins: 17, losses: 10, otLosses: 1, points: 35 }
  },
  {
    id: "dallas-stars",
    name: "Dallas Stars",
    abbr: "DAL",
    city: "Dallas",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1146",
    stats: { wins: 18, losses: 9, otLosses: 0, points: 36 }
  },
  {
    id: "minnesota-wild",
    name: "Minnesota Wild",
    abbr: "MIN",
    city: "Saint Paul",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1125",
    stats: { wins: 16, losses: 8, otLosses: 4, points: 36 }
  },
  {
    id: "nashville-predators",
    name: "Nashville Predators",
    abbr: "NSH",
    city: "Nashville",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1185",
    stats: { wins: 10, losses: 14, otLosses: 5, points: 25 }
  },
  {
    id: "st-louis-blues",
    name: "St. Louis Blues",
    abbr: "STL",
    city: "St. Louis",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "1288",
    stats: { wins: 14, losses: 13, otLosses: 2, points: 30 }
  },
  {
    id: "utah-mammoth",
    name: "Utah Mammoth",
    abbr: "UTA",
    city: "Salt Lake City",
    league: "NHL",
    conference: "Western",
    division: "Central",
    goalserveId: "9404",
    stats: { wins: 11, losses: 12, otLosses: 5, points: 27 }
  },

  // NHL - Conférence Ouest (Pacific)
  {
    id: "vegas-golden-knights",
    name: "Vegas Golden Knights",
    abbr: "VGK",
    city: "Las Vegas",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    logo: require('@/assets/images/vgk.png'),
    goalserveId: "6264",
    stats: { wins: 18, losses: 6, otLosses: 1, points: 37 }
  },
  {
    id: "edmonton-oilers",
    name: "Edmonton Oilers",
    abbr: "EDM",
    city: "Edmonton",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    goalserveId: "1139",
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
    goalserveId: "1140",
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
    goalserveId: "1181",
    stats: { wins: 13, losses: 8, otLosses: 4, points: 30 }
  },
  {
    id: "anaheim-ducks",
    name: "Anaheim Ducks",
    abbr: "ANA",
    city: "Anaheim",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    goalserveId: "1144",
    stats: { wins: 9, losses: 15, otLosses: 4, points: 22 }
  },
  {
    id: "los-angeles-kings",
    name: "Los Angeles Kings",
    abbr: "LAK",
    city: "Los Angeles",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    goalserveId: "1169",
    stats: { wins: 15, losses: 9, otLosses: 4, points: 34 }
  },
  {
    id: "san-jose-sharks",
    name: "San Jose Sharks",
    abbr: "SJS",
    city: "San Jose",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    goalserveId: "1124",
    stats: { wins: 8, losses: 18, otLosses: 3, points: 19 }
  },
  {
    id: "seattle-kraken",
    name: "Seattle Kraken",
    abbr: "SEA",
    city: "Seattle",
    league: "NHL",
    conference: "Western",
    division: "Pacific",
    goalserveId: "7414",
    stats: { wins: 14, losses: 12, otLosses: 2, points: 30 }
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
