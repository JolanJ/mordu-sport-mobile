/**
 * Script de test pour vérifier la conversion base64 → image
 * 
 * Usage: Appeler cette fonction depuis un composant pour tester
 */

import { api, base64ToDataUri } from '@/lib/services/api'

/**
 * Teste la récupération et la conversion du logo
 */
export async function testTeamLogo(teamId: string = '2786') {
  try {
    console.log(`[Test Logo] Récupération du roster pour l'équipe ${teamId}...`)
    
    const rosterData = await api.fetchTeamRoster(teamId)
    
    if (!rosterData) {
      console.error('[Test Logo] ❌ Aucune donnée récupérée')
      return null
    }
    
    console.log('[Test Logo] ✅ Roster récupéré avec succès')
    console.log(`[Test Logo] Équipe: ${rosterData.teamInfo.name}`)
    console.log(`[Test Logo] Abréviation: ${rosterData.teamInfo.abbr}`)
    console.log(`[Test Logo] Logo présent: ${rosterData.teamInfo.logo ? 'Oui' : 'Non'}`)
    
    if (rosterData.teamInfo.logo) {
      const logoUri = rosterData.teamInfo.logo
      console.log(`[Test Logo] URI du logo (premiers 60 chars): ${logoUri.substring(0, 60)}...`)
      console.log(`[Test Logo] Format: ${logoUri.startsWith('data:image') ? '✅ Format data URI valide' : '❌ Format invalide'}`)
      console.log(`[Test Logo] Taille URI: ${logoUri.length} caractères`)
      
      // Vérifier que c'est bien du base64
      const base64Part = logoUri.split(',')[1]
      if (base64Part) {
        console.log(`[Test Logo] Base64 (premiers 30 chars): ${base64Part.substring(0, 30)}...`)
      }
    }
    
    console.log(`[Test Logo] Joueurs: ${rosterData.roster.forwards.length} attaquants, ${rosterData.roster.defensemen.length} défenseurs, ${rosterData.roster.goalies.length} gardiens`)
    
    return rosterData
  } catch (error) {
    console.error('[Test Logo] ❌ Erreur lors du test:', error)
    return null
  }
}

/**
 * Teste la conversion base64 manuelle
 */
export function testBase64Conversion(base64String: string) {
  console.log('[Test Base64] Conversion manuelle...')
  console.log(`[Test Base64] Base64 original (premiers 50 chars): ${base64String.substring(0, 50)}...`)
  
  const uri = base64ToDataUri(base64String)
  console.log(`[Test Base64] URI converti (premiers 60 chars): ${uri.substring(0, 60)}...`)
  console.log(`[Test Base64] Format valide: ${uri.startsWith('data:image') ? '✅' : '❌'}`)
  
  return uri
}

