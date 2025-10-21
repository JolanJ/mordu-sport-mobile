import { Match } from '@/lib/types'

// Matches favoris - sous-ensemble des matchs existants
export const mockFavoriteMatches: Match[] = [
  // NHL - Montreal vs Toronto (live)
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
      logo: "https://via.placeholder.com/32x32/FF0000/FFFFFF?text=MTL",
      score: 2
    },
    homeTeam: {
      name: "Toronto Maple Leafs",
      abbr: "TOR",
      logo: "https://via.placeholder.com/32x32/003E7E/FFFFFF?text=TOR",
      score: 3
    }
  },
  // NHL - Vegas vs Edmonton (terminé)
  {
    id: "3",
    league: "NHL",
    status: "finished",
    date: "2025-01-20",
    time: "19h00",
    awayTeam: {
      name: "Vegas Golden Knights",
      abbr: "VGK",
      logo: "https://via.placeholder.com/32x32/B4975A/000000?text=VGK",
      score: 4
    },
    homeTeam: {
      name: "Edmonton Oilers",
      abbr: "EDM",
      logo: "https://via.placeholder.com/32x32/041E42/FF4C00?text=EDM",
      score: 2
    }
  },
  // NBA - Lakers vs Celtics (live)
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
  // NBA - Warriors vs Heat (à venir)
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
  // NFL - Chiefs vs Bills (live)
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
]

