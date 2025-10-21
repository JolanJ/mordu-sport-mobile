import { TeamDetailData } from './teamTypes'

export const mockTeamDetail: Record<string, TeamDetailData> = {
  'montreal-canadiens': {
    teamInfo: {
      id: 'montreal-canadiens',
      name: 'Montreal Canadiens',
      abbr: 'MTL',
      city: 'Montreal',
      league: 'NHL',
      conference: 'Eastern',
      division: 'Atlantic'
    },
    teamStats: {
      wins: 15,
      losses: 8,
      otLosses: 2,
      points: 32,
      gamesPlayed: 25,
      goalsFor: 78,
      goalsAgainst: 71,
      shotsPerGame: 30.5,
      shotsAllowedPerGame: 29.2,
      powerPlayPercentage: '22.5%',
      powerPlayGoals: 18,
      powerPlayOpportunities: 80,
      penaltyKillPercentage: '82.3%',
      faceoffWinPercentage: '51.2%'
    },
    roster: {
      forwards: [
        {
          id: 'nick-suzuki',
          name: 'Nick Suzuki',
          number: '14',
          position: 'C',
          gamesPlayed: 25,
          points: 28,
          goals: 12,
          assists: 16,
          birthplace: 'London, ON'
        },
        {
          id: 'cole-caufield',
          name: 'Cole Caufield',
          number: '22',
          position: 'RW',
          gamesPlayed: 20,
          points: 24,
          goals: 15,
          assists: 9,
          birthplace: 'Stevens Point, WI'
        },
        {
          id: 'juraj-slafkovsky',
          name: 'Juraj Slafkovsky',
          number: '20',
          position: 'LW',
          gamesPlayed: 25,
          points: 18,
          goals: 8,
          assists: 10,
          birthplace: 'Košice, SVK'
        }
      ],
      defensemen: [
        {
          id: 'mike-matheson',
          name: 'Mike Matheson',
          number: '8',
          position: 'D',
          gamesPlayed: 25,
          points: 15,
          goals: 3,
          assists: 12,
          birthplace: 'Pointe-Claire, QC'
        },
        {
          id: 'kaiden-guhle',
          name: 'Kaiden Guhle',
          number: '21',
          position: 'D',
          gamesPlayed: 22,
          points: 8,
          goals: 2,
          assists: 6,
          birthplace: 'Edmonton, AB'
        }
      ],
      goalies: [
        {
          id: 'sam-montembeault',
          name: 'Sam Montembeault',
          number: '35',
          position: 'G',
          gamesPlayed: 18,
          birthplace: 'Bécancour, QC'
        },
        {
          id: 'cayden-primeau',
          name: 'Cayden Primeau',
          number: '30',
          position: 'G',
          gamesPlayed: 7,
          birthplace: 'Voorhees, NJ'
        }
      ]
    },
    injuries: [
      {
        playerId: 'cole-caufield',
        playerName: 'Cole Caufield',
        position: 'RW',
        injury: 'Blessure au haut du corps',
        status: 'Day-to-Day',
        date: '20 janvier 2025'
      },
      {
        playerId: 'rafael-harvey-pinard',
        playerName: 'Rafael Harvey-Pinard',
        position: 'LW',
        injury: 'Blessure au bas du corps',
        status: 'OUT',
        date: '10 janvier 2025'
      }
    ]
  },
  'toronto-maple-leafs': {
    teamInfo: {
      id: 'toronto-maple-leafs',
      name: 'Toronto Maple Leafs',
      abbr: 'TOR',
      city: 'Toronto',
      league: 'NHL',
      conference: 'Eastern',
      division: 'Atlantic'
    },
    teamStats: {
      wins: 18,
      losses: 6,
      otLosses: 1,
      points: 37,
      gamesPlayed: 25,
      goalsFor: 85,
      goalsAgainst: 68,
      shotsPerGame: 32.1,
      shotsAllowedPerGame: 28.5,
      powerPlayPercentage: '24.8%',
      powerPlayGoals: 22,
      powerPlayOpportunities: 89,
      penaltyKillPercentage: '80.5%',
      faceoffWinPercentage: '52.3%'
    },
    roster: {
      forwards: [
        {
          id: 'auston-matthews',
          name: 'Auston Matthews',
          number: '34',
          position: 'C',
          gamesPlayed: 25,
          points: 35,
          goals: 18,
          assists: 17,
          birthplace: 'San Ramon, CA'
        }
      ],
      defensemen: [],
      goalies: []
    },
    injuries: []
  }
}

