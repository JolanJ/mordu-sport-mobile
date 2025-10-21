import { Match } from '@/lib/types'

export const mockMatches: Match[] = [
  // NHL Matches
  {
    id: "1",
    league: "NHL",
    status: "live",
    date: "2025-01-20",
    time: "20h30",
    period: "2e période",
    timeRemaining: "12:45",
    awayTeam: {
      name: "Montreal Canadiens",
      abbr: "MTL",
      logo: require('@/assets/images/ch.png'),
      score: 2
    },
    homeTeam: {
      name: "Toronto Maple Leafs",
      abbr: "TOR",
      logo: require('@/assets/images/toor.png'),
      score: 3
    }
  },
  {
    id: "2",
    league: "NHL",
    status: "upcoming",
    date: "2025-01-20",
    time: "22h00",
    awayTeam: {
      name: "Boston Bruins",
      abbr: "BOS",
      logo: require('@/assets/images/bos.png')
    },
    homeTeam: {
      name: "New York Rangers",
      abbr: "NYR",
      logo: require('@/assets/images/ran.png')
    }
  },
  {
    id: "3",
    league: "NHL",
    status: "finished",
    date: "2025-01-20",
    time: "19h00",
    awayTeam: {
      name: "Vegas Golden Knights",
      abbr: "VGK",
      logo: require('@/assets/images/vgk.png'),
      score: 4
    },
    homeTeam: {
      name: "Edmonton Oilers",
      abbr: "EDM",
      logo: "https://via.placeholder.com/32x32/041E42/FF4C00?text=EDM",
      score: 2
    }
  },
  {
    id: "4",
    league: "NHL",
    status: "upcoming",
    date: "2025-01-21",
    time: "20h00",
    awayTeam: {
      name: "Pittsburgh Penguins",
      abbr: "PIT",
      logo: "https://via.placeholder.com/32x32/000000/FFFFFF?text=PIT"
    },
    homeTeam: {
      name: "Washington Capitals",
      abbr: "WSH",
      logo: "https://via.placeholder.com/32x32/C8102E/FFFFFF?text=WSH"
    }
  },

  // NBA Matches
  {
    id: "5",
    league: "NBA",
    status: "live",
    date: "2025-01-20",
    time: "21h00",
    period: "3e quart",
    timeRemaining: "8:30",
    awayTeam: {
      name: "Los Angeles Lakers",
      abbr: "LAL",
      logo: "https://via.placeholder.com/32x32/552583/FDB927?text=LAL",
      score: 78
    },
    homeTeam: {
      name: "Boston Celtics",
      abbr: "BOS",
      logo: "https://via.placeholder.com/32x32/007A33/FFFFFF?text=BOS",
      score: 82
    }
  },
  {
    id: "6",
    league: "NBA",
    status: "upcoming",
    date: "2025-01-20",
    time: "23h30",
    awayTeam: {
      name: "Golden State Warriors",
      abbr: "GSW",
      logo: "https://via.placeholder.com/32x32/1D428A/FFC72C?text=GSW"
    },
    homeTeam: {
      name: "Miami Heat",
      abbr: "MIA",
      logo: "https://via.placeholder.com/32x32/98002E/FFFFFF?text=MIA"
    }
  },
  {
    id: "7",
    league: "NBA",
    status: "finished",
    date: "2025-01-20",
    time: "20h00",
    awayTeam: {
      name: "Chicago Bulls",
      abbr: "CHI",
      logo: "https://via.placeholder.com/32x32/CE1141/FFFFFF?text=CHI",
      score: 95
    },
    homeTeam: {
      name: "New York Knicks",
      abbr: "NYK",
      logo: "https://via.placeholder.com/32x32/006BB6/FFFFFF?text=NYK",
      score: 88
    }
  },
  {
    id: "8",
    league: "NBA",
    status: "upcoming",
    date: "2025-01-21",
    time: "21h00",
    awayTeam: {
      name: "Phoenix Suns",
      abbr: "PHX",
      logo: "https://via.placeholder.com/32x32/1D1160/FFFFFF?text=PHX"
    },
    homeTeam: {
      name: "Denver Nuggets",
      abbr: "DEN",
      logo: "https://via.placeholder.com/32x32/0E2240/FFFFFF?text=DEN"
    }
  },

  // NFL Matches
  {
    id: "9",
    league: "NFL",
    status: "live",
    date: "2025-01-20",
    time: "18h00",
    period: "3e quart",
    timeRemaining: "5:15",
    awayTeam: {
      name: "Kansas City Chiefs",
      abbr: "KC",
      logo: "https://via.placeholder.com/32x32/E31837/FFFFFF?text=KC",
      score: 17
    },
    homeTeam: {
      name: "Buffalo Bills",
      abbr: "BUF",
      logo: "https://via.placeholder.com/32x32/00338D/FFFFFF?text=BUF",
      score: 14
    }
  },
  {
    id: "10",
    league: "NFL",
    status: "upcoming",
    date: "2025-01-20",
    time: "21h30",
    awayTeam: {
      name: "San Francisco 49ers",
      abbr: "SF",
      logo: "https://via.placeholder.com/32x32/AA0000/FFFFFF?text=SF"
    },
    homeTeam: {
      name: "Dallas Cowboys",
      abbr: "DAL",
      logo: "https://via.placeholder.com/32x32/003594/FFFFFF?text=DAL"
    }
  },
  {
    id: "11",
    league: "NFL",
    status: "finished",
    date: "2025-01-20",
    time: "15h00",
    awayTeam: {
      name: "Green Bay Packers",
      abbr: "GB",
      logo: "https://via.placeholder.com/32x32/203731/FFFFFF?text=GB",
      score: 24
    },
    homeTeam: {
      name: "Tampa Bay Buccaneers",
      abbr: "TB",
      logo: "https://via.placeholder.com/32x32/D50A0A/FFFFFF?text=TB",
      score: 21
    }
  },
  {
    id: "12",
    league: "NFL",
    status: "upcoming",
    date: "2025-01-21",
    time: "20h00",
    awayTeam: {
      name: "Baltimore Ravens",
      abbr: "BAL",
      logo: "https://via.placeholder.com/32x32/241773/FFFFFF?text=BAL"
    },
    homeTeam: {
      name: "Pittsburgh Steelers",
      abbr: "PIT",
      logo: "https://via.placeholder.com/32x32/FFB612/000000?text=PIT"
    }
  }
]

export const getMatchesByLeague = (league: string) => {
  return mockMatches.filter(match => match.league === league)
}

export const getMatchesByDate = (date: string) => {
  return mockMatches.filter(match => match.date === date)
}
