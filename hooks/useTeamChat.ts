import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import type { MessageReaction, ReactionCount } from './useChat'

export interface TeamChatMessage {
  id: string
  team_id: string
  user_id: string
  username: string
  avatar_id: number
  content: string
  locale: string
  created_at: string
  reactions?: ReactionCount[]
}

interface UseTeamChatOptions {
  teamId: string
}

export function useTeamChat({ teamId }: UseTeamChatOptions) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<TeamChatMessage[]>([])
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!teamId) return

    setLoading(true)
    const { data, error } = await supabase
      .from('nhl_team_chat_messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      setMessages(data)

      if (data.length > 0) {
        const messageIds = data.map(m => m.id)
        const { data: reactionsData } = await supabase
          .from('nhl_team_message_reactions')
          .select('*')
          .in('message_id', messageIds)

        if (reactionsData) {
          setReactions(reactionsData)
        }
      }
    }
    setLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchMessages()
    })
    return () => sub.remove()
  }, [fetchMessages])

  // Realtime messages
  useEffect(() => {
    if (!teamId) return

    const channel = supabase
      .channel(`team-chat:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nhl_team_chat_messages', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const newMessage = payload.new as TeamChatMessage
          if (newMessage.user_id === user?.id) return
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'nhl_team_chat_messages', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const deleted = payload.old as TeamChatMessage
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamId, user?.id])

  // Realtime reactions
  useEffect(() => {
    if (!teamId) return

    const channel = supabase
      .channel(`team-reactions:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nhl_team_message_reactions' },
        (payload) => {
          const newReaction = payload.new as MessageReaction
          setMessages(currentMessages => {
            const belongsToChat = currentMessages.some(m => m.id === newReaction.message_id)
            if (belongsToChat) {
              setReactions((prev) => {
                const exists = prev.some(r => r.id === newReaction.id ||
                  (r.message_id === newReaction.message_id && r.user_id === newReaction.user_id && r.emoji === newReaction.emoji))
                if (exists) {
                  return prev.map(r =>
                    (r.id.startsWith('temp-') && r.message_id === newReaction.message_id &&
                     r.user_id === newReaction.user_id && r.emoji === newReaction.emoji) ? newReaction : r
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
        { event: 'DELETE', schema: 'public', table: 'nhl_team_message_reactions' },
        (payload) => {
          const deleted = payload.old as MessageReaction
          setReactions((prev) => prev.filter((r) => r.id !== deleted.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamId])

  const sendMessage = useCallback(
    async (content: string, username: string, avatarId: number = 1) => {
      if (!user || !teamId || !content.trim()) return { error: new Error('Invalid data') }

      setSending(true)

      const tempId = `temp-${Date.now()}`
      const optimisticMessage: TeamChatMessage = {
        id: tempId,
        team_id: teamId,
        user_id: user.id,
        username,
        avatar_id: avatarId,
        content: content.trim(),
        locale: 'fr',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, optimisticMessage])

      const { data, error } = await supabase
        .from('nhl_team_chat_messages')
        .insert({ team_id: teamId, user_id: user.id, username, avatar_id: avatarId, content: content.trim(), locale: 'fr' })
        .select()
        .single()

      if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
      } else if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m))
      }

      setSending(false)
      return { error }
    },
    [user, teamId]
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user) return { error: new Error('Not authenticated') }
      const { error } = await supabase
        .from('nhl_team_chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id)
      return { error }
    },
    [user]
  )

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user) return { error: new Error('Not authenticated') }

      const existingReaction = reactions.find(
        r => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
      )

      if (existingReaction) {
        setReactions(prev => prev.filter(r => r.id !== existingReaction.id))
        const { error } = await supabase.from('nhl_team_message_reactions').delete().eq('id', existingReaction.id)
        if (error) setReactions(prev => [...prev, existingReaction])
        return { error }
      } else {
        const tempReaction: MessageReaction = {
          id: `temp-${Date.now()}`,
          message_id: messageId,
          user_id: user.id,
          emoji,
          created_at: new Date().toISOString(),
        }
        setReactions(prev => [...prev, tempReaction])
        const { data, error } = await supabase
          .from('nhl_team_message_reactions')
          .insert({ message_id: messageId, user_id: user.id, emoji })
          .select()
          .single()
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

  const getReactionsForMessage = useCallback(
    (messageId: string): ReactionCount[] => {
      const messageReactions = reactions.filter(r => r.message_id === messageId)
      const grouped = messageReactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, hasReacted: false }
        acc[r.emoji].count++
        if (user && r.user_id === user.id) acc[r.emoji].hasReacted = true
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
    markMentionsRead: async () => {},
    isAuthenticated: !!user,
  }
}
