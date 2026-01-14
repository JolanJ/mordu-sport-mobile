/**
 * Mapping des équipes NHL vers leurs IDs Goalserve
 * Format: { nom_équipe: team_id }
 */

export const NHL_TEAM_IDS: Record<string, string> = {
  'Winnipeg Jets': '2786',
  'Montreal Canadiens': '2787',
  'Toronto Maple Leafs': '2788',
  'Boston Bruins': '2789',
  'Buffalo Sabres': '2790',
  'Ottawa Senators': '2791',
  'Detroit Red Wings': '2792',
  'Florida Panthers': '2793',
  'Tampa Bay Lightning': '2794',
  'Carolina Hurricanes': '2795',
  'New York Rangers': '2796',
  'New York Islanders': '2797',
  'New Jersey Devils': '2798',
  'Philadelphia Flyers': '2799',
  'Pittsburgh Penguins': '2800',
  'Washington Capitals': '2801',
  'Columbus Blue Jackets': '2802',
  'Chicago Blackhawks': '2803',
  'St. Louis Blues': '2804',
  'Nashville Predators': '2805',
  'Dallas Stars': '2806',
  'Minnesota Wild': '2807',
  'Colorado Avalanche': '2808',
  'Arizona Coyotes': '2809',
  'Vegas Golden Knights': '2810',
  'Los Angeles Kings': '2811',
  'Anaheim Ducks': '2812',
  'San Jose Sharks': '2813',
  'Calgary Flames': '2814',
  'Edmonton Oilers': '2815',
  'Vancouver Canucks': '2816',
  'Seattle Kraken': '2817',
}

/**
 * Récupère l'ID d'une équipe depuis son nom
 */
export function getTeamId(teamName: string): string | null {
  return NHL_TEAM_IDS[teamName] || null
}

/**
 * Récupère l'ID d'une équipe depuis son nom (insensible à la casse)
 */
export function getTeamIdCaseInsensitive(teamName: string): string | null {
  const normalizedName = teamName.trim()
  for (const [name, id] of Object.entries(NHL_TEAM_IDS)) {
    if (name.toLowerCase() === normalizedName.toLowerCase()) {
      return id
    }
  }
  return null
}

