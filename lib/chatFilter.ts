// Liste des mots interdits dans le chat
// Violence, sexe explicite, haine, spam/promo/liens

const BLOCKED_WORDS = [
  // FR - Violence
  'tuer', 'mourir', 'crève', 'suicide', 'meurtre', 'assassiner', 'fusillade', 'massacre',

  // FR - Sexe explicite
  'pénis', 'bite', 'queue', 'vagin', 'chatte', 'clitoris', 'porno', 'pornographie',
  'masturbation', 'sodomie', 'fellation',

  // FR - Haine
  'nègre', 'negre', 'pédé', 'tapette',

  // EN - Violence
  'kill', 'die', 'suicide', 'murder', 'assassination', 'shoot', 'shooting', 'stab',

  // EN - Sexe explicite
  'penis', 'dick', 'cock', 'pussy', 'vagina', 'clit', 'porn', 'blowjob', 'handjob',
  'cum', 'ejaculation', 'anal',

  // EN - Haine
  'nigger', 'nig', 'nigga', 'faggot', 'fag', 'retard',

  // Spam / Promo / Liens
  'http', 'https', 'www', '.com', '.ca', '.net', '.org', '.io', '.gg', '.bet', '.casino', '.info', '.co', '.tv', '.me', '.xyz',

  // FR - Auto-promo
  'site', 'business', 'lien', 'promo', 'abonne',

  // EN - Auto-promo
  'website', 'link', 'bio', 'subscribe', 'follow', 'click', 'contact',

  // Réseaux sociaux
  'dm', 'ig', 'instagram', 'fb', 'facebook', 'discord', 'telegram', 'whatsapp', 'snapchat',
]

/**
 * Vérifie si un message contient des mots interdits
 * @param message Le message à vérifier
 * @returns true si le message contient un mot interdit
 */
export function containsBlockedWord(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  return BLOCKED_WORDS.some(word => {
    const lowerWord = word.toLowerCase()
    // Vérifie si le mot est présent (en tant que mot entier ou partie)
    return lowerMessage.includes(lowerWord)
  })
}

/**
 * Retourne le premier mot interdit trouvé dans le message (pour le debug)
 * @param message Le message à vérifier
 * @returns Le mot interdit trouvé ou null
 */
export function getBlockedWord(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  for (const word of BLOCKED_WORDS) {
    const lowerWord = word.toLowerCase()
    if (lowerMessage.includes(lowerWord)) {
      return word
    }
  }

  return null
}
