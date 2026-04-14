import { useEffect, useMemo } from 'react'
import { AppState } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const HEARTBEAT_MS = 30_000

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useMatchPresence(matchId: string | null | undefined) {
  const { user } = useAuth()
  const sessionKey = useMemo(() => randomId(), [])

  useEffect(() => {
    if (!matchId) return

    let cancelled = false

    const heartbeat = async () => {
      if (cancelled) return
      await supabase.from('match_viewers').upsert(
        {
          match_id: matchId,
          session_key: sessionKey,
          user_id: user?.id ?? null,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'match_id,session_key' }
      )
    }

    heartbeat()
    const interval = setInterval(heartbeat, HEARTBEAT_MS)

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') heartbeat()
    })

    return () => {
      cancelled = true
      clearInterval(interval)
      sub.remove()
      supabase
        .from('match_viewers')
        .delete()
        .eq('match_id', matchId)
        .eq('session_key', sessionKey)
        .then(() => {})
    }
  }, [matchId, sessionKey, user?.id])
}
