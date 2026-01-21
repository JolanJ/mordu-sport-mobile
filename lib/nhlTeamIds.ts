/**
 * Mapping des équipes NHL vers leurs IDs Goalserve
 *
 * Ces IDs sont utilisés pour fetcher:
 * - Roster: /{id}_rosters
 * - Stats joueurs: /{id}_stats
 * - Stats équipe: /{id}_team_stats
 * - Blessures: /{id}_injuries
 */

export const NHL_TEAM_IDS: Record<string, string> = {
  // Atlantic Division - Eastern Conference
  'boston-bruins': '1160',
  'buffalo-sabres': '1162',
  'detroit-red-wings': '1143',
  'florida-panthers': '1156',
  'montreal-canadiens': '1115',
  'ottawa-senators': '1188',
  'tampa-bay-lightning': '1157',
  'toronto-maple-leafs': '1136',

  // Metropolitan Division - Eastern Conference
  'carolina-hurricanes': '1126',
  'columbus-blue-jackets': '1141',
  'new-jersey-devils': '1145',
  'new-york-islanders': '1166',
  'new-york-rangers': '1172',
  'philadelphia-flyers': '1027',
  'pittsburgh-penguins': '1131',
  'washington-capitals': '1150',

  // Central Division - Western Conference
  'chicago-blackhawks': '1028',
  'colorado-avalanche': '1137',
  'dallas-stars': '1146',
  'minnesota-wild': '1125',
  'nashville-predators': '1185',
  'st-louis-blues': '1288',
  'utah-mammoth': '9404', // Anciennement Arizona Coyotes
  'winnipeg-jets': '2786',

  // Pacific Division - Western Conference
  'anaheim-ducks': '1144',
  'calgary-flames': '1140',
  'edmonton-oilers': '1139',
  'los-angeles-kings': '1169',
  'san-jose-sharks': '1124',
  'seattle-kraken': '7414',
  'vancouver-canucks': '1181',
  'vegas-golden-knights': '6264',
}

/**
 * Obtenir l'ID Goalserve d'une équipe par son slug
 */
export function getGoalserveTeamId(teamSlug: string): string | undefined {
  return NHL_TEAM_IDS[teamSlug]
}

/**
 * Obtenir le slug d'une équipe par son ID Goalserve
 */
export function getTeamSlugById(goalserveId: string): string | undefined {
  return Object.entries(NHL_TEAM_IDS).find(([_, id]) => id === goalserveId)?.[0]
}

/**
 * Vérifier si une équipe a un ID Goalserve connu
 */
export function hasGoalserveId(teamSlug: string): boolean {
  return teamSlug in NHL_TEAM_IDS
}
