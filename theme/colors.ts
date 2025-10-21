/**
 * 🎨 Mordu Sport - Système de Couleurs
 * Toutes les couleurs utilisées dans l'application
 */

export const colors = {
  // ==========================================
  // 🏷️ COULEURS DE MARQUE (Principales)
  // ==========================================
  morduBlue: '#00C4FF',      // Bleu principal (primary)
  morduOrange: '#F27020',    // Orange principal (accent)
  
  // ==========================================
  // ✨ COULEURS NÉON (Accents)
  // ==========================================
  neonGreen: '#00FF39',      // Vert néon (icône search)
  neonBlue: '#00D2FF',       // Bleu néon (icône notifications)
  neonPurple: '#A470F4',     // Violet
  neonYellow: '#FFD700',     // Jaune/Or (favoris)
  
  // ==========================================
  // 🌙 SYSTÈME (Dark Mode - Par Défaut)
  // ==========================================
  background: '#0D0D0D',           // Noir profond (fond principal)
  foreground: '#F5F5F5',           // Blanc cassé (texte principal)
  card: '#141414',                 // Gris très foncé (cartes)
  border: '#333333',               // Gris (bordures)
  muted: '#1F1F1F',                // Gris foncé (backgrounds secondaires)
  mutedForeground: '#999999',      // Gris moyen (texte secondaire)
  input: '#262626',                // Gris pour inputs
  primary: '#00C4FF',              // = morduBlue
  accent: '#F27020',               // = morduOrange
  destructive: '#EF4444',          // Rouge (erreurs)
  success: '#10B981',              // Vert (succès)
  
  // ==========================================
  // 🏒 COULEURS PAR LIGUE
  // ==========================================
  nhl: '#00C4FF',      // Bleu (comme primary)
  nba: '#F27020',      // Orange (comme accent)
  nfl: '#DC2626',      // Rouge
  
  // ==========================================
  // 📊 ÉTATS DES MATCHS
  // ==========================================
  live: '#FF4500',         // Rouge vif pour EN DIRECT
  upcoming: '#999999',     // Gris pour À VENIR
  finished: '#F5F5F5',     // Blanc pour TERMINÉ
}

// ==========================================
// 🔤 POLICES
// ==========================================
export const fonts = {
  // Familles
  sans: 'Geist',
  mono: 'GeistMono',
  
  // Tailles
  sizes: {
    xs: 12,        // Petits labels, infos
    sm: 14,        // Texte standard
    base: 16,      // Texte normal
    lg: 18,        // Sous-titres
    xl: 20,        // Titres
    '2xl': 24,     // Grands titres
    '3xl': 30,     // Headers
    '4xl': 36,     // Scores (gros chiffres)
  },
  
  // Poids
  weights: {
    normal: '400' as const,      // Texte normal
    medium: '500' as const,      // Texte moyen
    semibold: '600' as const,    // Semi-bold
    bold: '700' as const,        // Gras (titres, scores)
  }
}

// Type exports pour TypeScript
export type ColorKey = keyof typeof colors
export type FontSize = keyof typeof fonts.sizes
export type FontWeight = keyof typeof fonts.weights

