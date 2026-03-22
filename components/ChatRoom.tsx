import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { ChatMessage, Locale, useChat } from '@/hooks/useChat'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { LogIn, Send, ChevronRight } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

interface ChatRoomProps {
  matchId: string
  username?: string
  avatarId?: number
  keyboardVisible?: boolean
  highlightMessageId?: string
}

const REACTION_EMOJIS = ['👍', '👎', '🔥', '💀']

export function ChatRoom({ matchId, username = 'Anonyme', avatarId = 1, keyboardVisible = false, highlightMessageId }: ChatRoomProps) {
  const { user } = useAuth()
  const { getAvatarUrl } = useAvatars()
  const { t, locale: appLocale } = useTranslation()
  const [locale, setLocale] = useState<Locale>('en')
  const { messages, loading, sending, sendMessage, toggleReaction, getReactionsForMessage, markMentionsRead, isAuthenticated } = useChat({ matchId, locale })
  const [inputText, setInputText] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showModerationMenu, setShowModerationMenu] = useState<string | null>(null)
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionToast, setMentionToast] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightMessageId || null)
  const initialLoadDone = useRef(false)
  const prevMessageCount = useRef(0)
  const flatListRef = useRef<FlatList>(null)

  // Mark mentions as read when entering this chat room
  useEffect(() => {
    if (!isAuthenticated) return
    markMentionsRead()
  }, [isAuthenticated])

  // Scroll to highlighted message after messages load
  useEffect(() => {
    if (!highlightedId || loading || messages.length === 0) return

    const reversedMessages = [...messages].reverse()
    const index = reversedMessages.findIndex(m => m.id === highlightedId)
    if (index >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
      }, 300)
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedId(null), 3000)
    }
  }, [highlightedId, loading, messages.length])

  // Detect @mention in new messages (only after initial load)
  useEffect(() => {
    if (!initialLoadDone.current) {
      // Skip initial load — don't toast for old messages
      if (!loading && messages.length > 0) {
        initialLoadDone.current = true
        prevMessageCount.current = messages.length
      }
      return
    }

    if (messages.length > prevMessageCount.current) {
      const newMessages = messages.slice(prevMessageCount.current)
      for (const msg of newMessages) {
        if (msg.user_id !== user?.id && msg.content.toLowerCase().includes(`@${username.toLowerCase()}`)) {
          setMentionToast(msg.username)
          setTimeout(() => setMentionToast(null), 3000)
          break
        }
      }
    }
    prevMessageCount.current = messages.length
  }, [messages.length, loading])

  // Charger les users bloqués
  useEffect(() => {
    if (!user) return
    const fetchBlocked = async () => {
      const { data } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id)
      if (data) setBlockedUserIds(new Set(data.map(r => r.blocked_id)))
    }
    fetchBlocked()
  }, [user])

  // Changer de langue (local seulement, pas d'écriture en BD)
  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }



  // Get unique usernames from chat (excluding own)
  const chatUsernames = useMemo(() => {
    const names = new Set<string>()
    for (const m of messages) {
      if (m.user_id !== user?.id) names.add(m.username)
    }
    return Array.from(names)
  }, [messages, user?.id])

  // Filter usernames matching the @query
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return []
    if (mentionQuery === '') return chatUsernames.slice(0, 5)
    return chatUsernames.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
  }, [mentionQuery, chatUsernames])

  const handleTextChange = (text: string) => {
    setInputText(text)
    // Detect @mention typing
    const lastAtIndex = text.lastIndexOf('@')
    if (lastAtIndex >= 0) {
      const afterAt = text.slice(lastAtIndex + 1)
      // Only show suggestions if no space after @
      if (!afterAt.includes(' ')) {
        setMentionQuery(afterAt)
        return
      }
    }
    setMentionQuery(null)
  }

  const handleMentionSelect = (mentionUsername: string) => {
    const lastAtIndex = inputText.lastIndexOf('@')
    const newText = inputText.slice(0, lastAtIndex) + `@${mentionUsername} `
    setInputText(newText)
    setMentionQuery(null)
  }

  const handleSend = async () => {
    if (!inputText.trim() || sending) return

    const text = inputText
    setInputText('')
    const { error } = await sendMessage(text, username, avatarId)
    if (error) {
      setInputText(text)
      Alert.alert(t('messageBlocked'), t('messageBlockedReason'))
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(appLocale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleLongPress = (messageId: string) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId)
  }

  const handleReport = (item: ChatMessage) => {
    setSelectedMessageId(null)
    Alert.alert(t('reportMessage'), t('reportConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('report'),
        style: 'destructive',
        onPress: async () => {
          await supabase.from('reported_messages').insert({
            reporter_id: user!.id,
            reported_user_id: item.user_id,
            message_id: item.id,
          })
          Alert.alert(t('success'), t('reportSuccess'))
        },
      },
    ])
  }

  const handleBlock = (item: ChatMessage) => {
    setSelectedMessageId(null)
    Alert.alert(t('blockUser'), t('blockConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('block'),
        style: 'destructive',
        onPress: async () => {
          await supabase.from('blocked_users').insert({
            blocker_id: user!.id,
            blocked_id: item.user_id,
          })
          await supabase.from('reported_messages').insert({
            reporter_id: user!.id,
            reported_user_id: item.user_id,
            message_id: item.id,
          })
          setBlockedUserIds(prev => { const next = new Set(prev); next.add(item.user_id); return next })
          Alert.alert(t('success'), t('blockSuccess'))
        },
      },
    ])
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    await toggleReaction(messageId, emoji)
    setSelectedMessageId(null)
  }

  const renderMessageContent = (content: string, isOwn: boolean) => {
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <Text key={i} style={[styles.mention, isOwn && styles.mentionOwn]}>{part}</Text>
        )
      }
      return part
    })
  }

  const visibleMessages = messages.filter(m => !blockedUserIds.has(m.user_id))

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = user?.id === item.user_id
    const avatarUrl = getAvatarUrl(item.avatar_id)
    const messageReactions = getReactionsForMessage(item.id)
    const showReactionPicker = selectedMessageId === item.id
    const isHighlighted = highlightedId === item.id

    return (
      <View style={[styles.messageWrapper, isHighlighted && styles.highlightedMessage]}>
        <Pressable
          onLongPress={() => handleLongPress(item.id)}
          delayLongPress={300}
          style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}
        >
          {!isOwnMessage && (
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          )}
          <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
            <View style={styles.usernameRow}>
              <Text style={[styles.username, isOwnMessage && styles.ownUsername]}>{item.username}</Text>
              <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
              {renderMessageContent(item.content, isOwnMessage)}
            </Text>
          </View>
          {isOwnMessage && (
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          )}
        </Pressable>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <View style={[styles.reactionPicker, isOwnMessage && styles.reactionPickerOwn]}>
            {REACTION_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.reactionPickerButton}
                onPress={() => handleReaction(item.id, emoji)}
              >
                <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
              </Pressable>
            ))}
            {!isOwnMessage && (
              <View>
                <Pressable
                  style={styles.moderationButton}
                  onPress={() => setShowModerationMenu(showModerationMenu === item.id ? null : item.id)}
                >
                  <Text style={styles.moderationButtonText}>•••</Text>
                </Pressable>
                {showModerationMenu === item.id && (
                  <View style={styles.moderationMenu}>
                    <Pressable style={styles.moderationMenuItem} onPress={() => { setShowModerationMenu(null); handleReport(item) }}>
                      <Text style={styles.moderationMenuText}>⚠️ {t('report')}</Text>
                    </Pressable>
                    <View style={styles.moderationMenuDivider} />
                    <Pressable style={styles.moderationMenuItem} onPress={() => { setShowModerationMenu(null); handleBlock(item) }}>
                      <Text style={[styles.moderationMenuText, { color: colors.destructive }]}>🚫 {t('block')}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Reactions Display */}
        {messageReactions.length > 0 && !showReactionPicker && (
          <View style={[styles.reactionsContainer, isOwnMessage && styles.reactionsContainerOwn]}>
            {messageReactions.map((reaction) => (
              <Pressable
                key={reaction.emoji}
                style={[styles.reactionBadge, reaction.hasReacted && styles.reactionBadgeActive]}
                onPress={() => handleReaction(item.id, reaction.emoji)}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={[styles.reactionCount, reaction.hasReacted && styles.reactionCountActive]}>
                  {reaction.count}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    )
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <View style={styles.authIconWrapper}>
            <LogIn size={28} color={colors.neonGreen} />
          </View>
          <Text style={styles.authPromptTitle}>{t('loginRequired')}</Text>
          <Text style={styles.authPromptText}>{t('loginToChat')}</Text>
          <Pressable
            style={styles.authLoginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authLoginButtonText}>{t('signIn')}</Text>
            <ChevronRight size={18} color={colors.background} />
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {!keyboardVisible && (
        <View style={styles.header}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDotOuter}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.liveText}>{t('liveChat')}</Text>
          </View>
          <View style={styles.localeToggle}>
            <Pressable
              style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}
              onPress={() => handleLocaleChange('en')}
            >
              <Text style={[styles.localeButtonText, locale === 'en' && styles.localeButtonTextActive]}>ALL</Text>
            </Pressable>
            <Pressable
              style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}
              onPress={() => handleLocaleChange('fr')}
            >
              <Text style={[styles.localeButtonText, locale === 'fr' && styles.localeButtonTextActive]}>FR</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Mention toast */}
      {mentionToast && (
        <View style={styles.mentionToastWrapper}>
          <View style={styles.mentionToast}>
            <Text style={styles.mentionToastText}>
              💬 {mentionToast} {t('mentionedYou')}
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Pressable style={{ flex: 1 }} onPress={() => { setSelectedMessageId(null); setShowModerationMenu(null) }}>
          <FlatList
            ref={flatListRef}
            data={[...visibleMessages].reverse()}
            inverted
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => { setSelectedMessageId(null); setShowModerationMenu(null) }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t('beFirstToMessage')}
                </Text>
              </View>
            }
          />
        </Pressable>
      )}

      {/* @mention suggestions */}
      {mentionQuery !== null && mentionSuggestions.length > 0 && (
        <View style={styles.mentionList}>
          {mentionSuggestions.map((name) => (
            <Pressable key={name} style={styles.mentionItem} onPress={() => handleMentionSelect(name)}>
              <Text style={styles.mentionAt}>@</Text>
              <Text style={styles.mentionName}>{name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputWrapper}>
        {/* Quick emoji reactions */}
        {!keyboardVisible && (
          <View style={styles.quickEmojis}>
            {['👍', '👎', '🔥', '💀'].map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.emojiButton}
                onPress={() => sendMessage(emoji, username, avatarId)}
                disabled={sending}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('writeMessage')}
            placeholderTextColor={`${colors.mutedForeground}99`}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={200}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Send size={18} color={colors.background} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${colors.live}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  liveText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  localeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 3,
  },
  localeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  localeButtonActive: {
    backgroundColor: colors.primary,
  },
  localeButtonText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  localeButtonTextActive: {
    color: colors.background,
  },

  // ── Loading ─────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Messages ────────────────────────────────────────
  messagesList: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 2,
  },
  messageWrapper: {
    marginBottom: 6,
  },
  highlightedMessage: {
    backgroundColor: `${colors.neonGreen}15`,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.neonGreen,
    paddingLeft: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },

  // ── Avatar ──────────────────────────────────────────
  avatarContainer: {
    marginBottom: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  avatarFallbackText: {
    color: colors.neonGreen,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Bubble ──────────────────────────────────────────
  messageBubble: {
    maxWidth: '78%',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  username: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ownUsername: {
    color: 'rgba(13, 13, 13, 0.7)',
  },
  messageText: {
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.background,
  },
  messageTime: {
    color: `${colors.mutedForeground}99`,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(13, 13, 13, 0.5)',
  },

  // ── Empty State ─────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Mention Toast ───────────────────────────────────
  mentionToastWrapper: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  mentionToast: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mentionToastText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Mention Suggestions ─────────────────────────────
  mentionList: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: `${colors.border}80`,
    paddingVertical: 6,
  },
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 2,
  },
  mentionAt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neonGreen,
  },
  mentionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  mention: {
    color: colors.neonGreen,
    fontWeight: '700',
  },
  mentionOwn: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // ── Input Area ──────────────────────────────────────
  inputWrapper: {
    backgroundColor: colors.background,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 4,
  },
  quickEmojis: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 9,
    fontSize: 14,
    color: colors.foreground,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.muted,
  },

  // ── Auth Prompt ─────────────────────────────────────
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.neonGreen}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  authPromptTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 0.2,
  },
  authPromptText: {
    marginTop: 8,
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  authLoginButton: {
    marginTop: 28,
    height: 50,
    paddingHorizontal: 36,
    backgroundColor: colors.neonGreen,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  authLoginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Reaction Picker ─────────────────────────────────
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    marginLeft: 44,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionPickerOwn: {
    alignSelf: 'flex-end',
    marginRight: 4,
    marginLeft: 0,
  },
  reactionPickerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPickerEmoji: {
    fontSize: 18,
  },

  // ── Moderation ──────────────────────────────────────
  moderationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moderationButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.mutedForeground,
    letterSpacing: 1,
  },
  moderationMenu: {
    position: 'absolute',
    top: 42,
    left: 0,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.border}80`,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
    overflow: 'hidden',
  },
  moderationMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  moderationMenuDivider: {
    height: 1,
    backgroundColor: `${colors.border}60`,
  },
  moderationMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },

  // ── Reaction Badges ─────────────────────────────────
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 44,
    marginTop: 4,
  },
  reactionsContainerOwn: {
    justifyContent: 'flex-end',
    marginRight: 4,
    marginLeft: 0,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  reactionBadgeActive: {
    backgroundColor: `${colors.neonGreen}18`,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}40`,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: '700',
  },
  reactionCountActive: {
    color: colors.neonGreen,
  },
})
