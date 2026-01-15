import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback } from 'react'

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  username: string
  avatar_id: number
  content: string
  created_at: string
}

interface UseChatOptions {
  matchId: string
}

export function useChat({ matchId }: UseChatOptions) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Charger les messages existants
  useEffect(() => {
    if (!matchId) return

    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()
  }, [matchId])

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!matchId) return

    const channel = supabase
      .channel(`chat:${matchId}`)
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
          setMessages((prev) => [...prev, newMessage])
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
  }, [matchId])

  // Envoyer un message
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
      })

      setSending(false)

      return { error }
    },
    [user, matchId]
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
