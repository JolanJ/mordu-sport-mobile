import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback } from 'react'

export type Locale = 'fr' | 'en'

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface ReactionCount {
  emoji: string
  count: number
  hasReacted: boolean
}

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  username: string
  avatar_id: number
  content: string
  locale: Locale
  created_at: string
  reactions?: ReactionCount[]
}

interface UseChatOptions {
  matchId: string
  locale: Locale
}

export function useChat({ matchId, locale }: UseChatOptions) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Charger les messages existants (filtrés par locale ou tous si 'all')
  useEffect(() => {
    if (!matchId) return

    const fetchMessages = async () => {
      setLoading(true)
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)

      // Filtrer par locale
      query = query.eq('locale', locale)

      const { data, error } = await query
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        setMessages(data)

        // Fetch reactions for these messages
        if (data.length > 0) {
          const messageIds = data.map(m => m.id)
          const { data: reactionsData } = await supabase
            .from('message_reactions')
            .select('*')
            .in('message_id', messageIds)

          if (reactionsData) {
            setReactions(reactionsData)
          }
        }
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
          // Ajouter si c'est la bonne locale
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

  // Écouter les réactions en temps réel
  useEffect(() => {
    if (!matchId) return

    const channel = supabase
      .channel(`reactions:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const newReaction = payload.new as MessageReaction
          // Éviter les doublons (déjà ajouté par optimistic update)
          setReactions((prev) => {
            const exists = prev.some(r => r.id === newReaction.id ||
              (r.message_id === newReaction.message_id &&
               r.user_id === newReaction.user_id &&
               r.emoji === newReaction.emoji))
            if (exists) {
              // Remplacer le temp par le vrai si c'est un temp
              return prev.map(r =>
                (r.id.startsWith('temp-') &&
                 r.message_id === newReaction.message_id &&
                 r.user_id === newReaction.user_id &&
                 r.emoji === newReaction.emoji) ? newReaction : r
              )
            }
            return [...prev, newReaction]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const deletedReaction = payload.old as MessageReaction
          setReactions((prev) => prev.filter((r) => r.id !== deletedReaction.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  // Envoyer un message (avec la locale, défaut 'fr' si 'all')
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

  // Toggle une réaction (ajouter si pas présente, supprimer si déjà présente)
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user) return { error: new Error('Not authenticated') }

      // Vérifier si l'utilisateur a déjà réagi avec cet emoji
      const existingReaction = reactions.find(
        r => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
      )

      if (existingReaction) {
        // Optimistic update - supprimer immédiatement de l'UI
        setReactions(prev => prev.filter(r => r.id !== existingReaction.id))

        // Supprimer du serveur
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id)

        // Rollback si erreur
        if (error) {
          setReactions(prev => [...prev, existingReaction])
        }

        return { error }
      } else {
        // Optimistic update - ajouter immédiatement à l'UI
        const tempReaction: MessageReaction = {
          id: `temp-${Date.now()}`,
          message_id: messageId,
          user_id: user.id,
          emoji,
          created_at: new Date().toISOString(),
        }
        setReactions(prev => [...prev, tempReaction])

        // Ajouter au serveur
        const { data, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          })
          .select()
          .single()

        // Remplacer temp par vraie réaction ou rollback si erreur
        if (error) {
          setReactions(prev => prev.filter(r => r.id !== tempReaction.id))
        } else if (data) {
          setReactions(prev => prev.map(r => r.id === tempReaction.id ? data : r))
        }

        return { error }
      }
    },
    [user, reactions]
  )

  // Obtenir les réactions groupées pour un message
  const getReactionsForMessage = useCallback(
    (messageId: string): ReactionCount[] => {
      const messageReactions = reactions.filter(r => r.message_id === messageId)

      // Grouper par emoji
      const grouped = messageReactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
          acc[r.emoji] = { emoji: r.emoji, count: 0, hasReacted: false }
        }
        acc[r.emoji].count++
        if (user && r.user_id === user.id) {
          acc[r.emoji].hasReacted = true
        }
        return acc
      }, {} as Record<string, ReactionCount>)

      return Object.values(grouped)
    },
    [reactions, user]
  )

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    toggleReaction,
    getReactionsForMessage,
    isAuthenticated: !!user,
  }
}
