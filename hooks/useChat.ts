import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback, useRef } from 'react'
import { AppState } from 'react-native'

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
  match_id?: string
  team_id?: string
  user_id: string
  username: string
  avatar_id: number
  content: string
  locale: string
  created_at: string
  reactions?: ReactionCount[]
}

interface UseChatOptions {
  matchId: string
}

export function useChat({ matchId }: UseChatOptions) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Charger les messages existants (filtrés par locale ou tous si 'all')
  const fetchMessages = useCallback(async () => {
    if (!matchId) return

    setLoading(true)
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('match_id', matchId)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setMessages([...data].reverse())

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
  }, [matchId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Refetch messages when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchMessages()
      }
    })
    return () => sub.remove()
  }, [fetchMessages])

  // Écouter les nouveaux messages en temps réel (filtrés par locale)
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
          // Skip own messages — already handled by optimistic update
          if (newMessage.user_id === user?.id) return
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
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
          // Ignore reactions for messages not in this chat
          setMessages(currentMessages => {
            const belongsToChat = currentMessages.some(m => m.id === newReaction.message_id)
            if (belongsToChat) {
              setReactions((prev) => {
                const exists = prev.some(r => r.id === newReaction.id ||
                  (r.message_id === newReaction.message_id &&
                   r.user_id === newReaction.user_id &&
                   r.emoji === newReaction.emoji))
                if (exists) {
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
            return currentMessages
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

      // Optimistic update — show message immediately
      const tempId = `temp-${Date.now()}`
      const optimisticMessage: ChatMessage = {
        id: tempId,
        match_id: matchId,
        user_id: user.id,
        username,
        avatar_id: avatarId,
        content: content.trim(),
        locale: 'fr',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, optimisticMessage])

      const { data, error } = await supabase.from('chat_messages').insert({
        match_id: matchId,
        user_id: user.id,
        username,
        avatar_id: avatarId,
        content: content.trim(),
        locale: 'fr',
      }).select().single()

      if (error) {
        // Rollback on error
        setMessages(prev => prev.filter(m => m.id !== tempId))
      } else if (data) {
        // Replace temp with real message
        setMessages(prev => prev.map(m => m.id === tempId ? data : m))
      }

      // Store @mentions in DB (fire and forget)
      if (!error && data) {
        const mentionMatches = content.match(/@(\w+)/g)
        if (mentionMatches) {
          const mentionedUsernames = mentionMatches.map(m => m.slice(1).toLowerCase())
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username')
            .in('username', mentionedUsernames)
          if (profiles && profiles.length > 0) {
            const mentions = profiles
              .filter(p => p.id !== user.id)
              .map(p => ({
                match_id: matchId,
                message_id: data.id,
                mentioned_user_id: p.id,
                from_user_id: user.id,
                from_username: username,
                content: content.trim(),
              }))
            if (mentions.length > 0) {
              supabase.from('mentions').insert(mentions).then(() => {})
            }
          }
        }
      }

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

  // Fetch unread mentions for this match
  const getUnreadMentions = useCallback(async () => {
    if (!user || !matchId) return []
    const { data } = await supabase
      .from('mentions')
      .select('*')
      .eq('mentioned_user_id', user.id)
      .eq('match_id', matchId)
      .eq('read', false)
      .order('created_at', { ascending: false })
    return data || []
  }, [user, matchId])

  // Mark all mentions as read for this match
  const markMentionsRead = useCallback(async () => {
    if (!user || !matchId) return
    await supabase
      .from('mentions')
      .update({ read: true })
      .eq('mentioned_user_id', user.id)
      .eq('match_id', matchId)
      .eq('read', false)
  }, [user, matchId])

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    toggleReaction,
    getReactionsForMessage,
    getUnreadMentions,
    markMentionsRead,
    isAuthenticated: !!user,
  }
}
