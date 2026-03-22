/**
 * Configuration de l'API — proxy via Supabase Edge Function
 */

import { supabase } from '@/lib/supabase'

/**
 * Appelle le proxy Goalserve et retourne le XML brut
 * @param path Chemin Goalserve (ex: "hockey/nhl-scores")
 */
export async function fetchGoalserveXml(path: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('goalserve-proxy', {
    body: { path },
  })

  if (error) throw new Error(`Proxy error: ${error.message}`)

  return data.xml
}

/**
 * Formate une date au format Goalserve (DD.MM.YYYY)
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
