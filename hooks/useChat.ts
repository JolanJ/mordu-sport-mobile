import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback } from 'react'

export type Locale = 'fr' | 'en'

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  username: string
  avatar_id: number
  content: string
  locale: Locale
  created_at: string
}

interface UseChatOptions {
  matchId: string
  locale: Locale
}

export function useChat({ matchId, locale }: UseChatOptions) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Charger les messages existants (filtrés par locale)
  useEffect(() => {
    if (!matchId) return

    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .eq('locale', locale)
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()
  }, [matchId, locale])

  // Écouter les nouveaux messages en temps réel (filtrés par locale)
  useEffect(() => {
    if (!matchId) return

    const channel = supabase
      .channel(`chat:${matchId}:${locale}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          // Ne pas ajouter si ce n'est pas la bonne locale
          if (newMessage.locale === locale) {
            setMessages((prev) => [...prev, newMessage])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as ChatMessage
          setMessages((prev) => prev.filter((m) => m.id !== deletedMessage.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, locale])

  // Envoyer un message (avec la locale)
  const sendMessage = useCallback(
    async (content: string, username: string, avatarId: number = 1) => {
      if (!user || !matchId || !content.trim()) return { error: new Error('Invalid data') }

      setSending(true)

      const { error } = await supabase.from('chat_messages').insert({
        match_id: matchId,
        user_id: user.id,
        username,
        avatar_id: avatarId,
        content: content.trim(),
        locale,
      })

      setSending(false)

      return { error }
    },
    [user, matchId, locale]
  )

  // Supprimer un message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user) return { error: new Error('Not authenticated') }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id)

      return { error }
    },
    [user]
  )

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    isAuthenticated: !!user,
  }
}
