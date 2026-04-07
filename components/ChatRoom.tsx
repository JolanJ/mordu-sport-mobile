import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { ChatMessage, useChat } from '@/hooks/useChat'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { ChevronLeft, ChevronRight, LogIn, Send } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  const { t } = useTranslation()
  const { messages, loading, sending, sendMessage, toggleReaction, getReactionsForMessage, markMentionsRead, isAuthenticated } = useChat({ matchId })
  const [inputText, setInputText] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showModerationMenu, setShowModerationMenu] = useState<string | null>(null)
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionToast, setMentionToast] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightMessageId || null)
  const PICKER_PANEL_WIDTH = REACTION_EMOJIS.length * 40
  const moderationSlide = useRef(new Animated.Value(0)).current
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
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleLongPress = (messageId: string) => {
    moderationSlide.setValue(0)
    setShowModerationMenu(null)
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId)
  }

  const toggleModerationSlide = (id: string) => {
    const isOpen = showModerationMenu === id
    Animated.spring(moderationSlide, {
      toValue: isOpen ? 0 : -PICKER_PANEL_WIDTH,
      useNativeDriver: true,
    }).start()
    setShowModerationMenu(isOpen ? null : id)
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
            <View style={{ overflow: 'hidden', width: PICKER_PANEL_WIDTH }}>
              <Animated.View style={{ flexDirection: 'row', width: PICKER_PANEL_WIDTH * 2, transform: [{ translateX: moderationSlide }] }}>
                {/* Panneau emojis */}
                <View style={{ width: PICKER_PANEL_WIDTH, flexDirection: 'row', alignItems: 'center' }}>
                  {REACTION_EMOJIS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={styles.reactionPickerButton}
                      onPress={() => handleReaction(item.id, emoji)}
                    >
                      <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                {/* Panneau actions */}
                {!isOwnMessage && (
                  <View style={{ width: PICKER_PANEL_WIDTH, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <Pressable style={styles.slideAction} onPress={() => handleReport(item)}>
                      <Text style={styles.slideActionText}>⚠️ {t('report')}</Text>
                    </Pressable>
                    <Pressable style={[styles.slideAction, styles.slideActionBlock]} onPress={() => handleBlock(item)}>
                      <Text style={[styles.slideActionText, { color: colors.destructive }]}>🚫 {t('block')}</Text>
                    </Pressable>
                  </View>
                )}
              </Animated.View>
            </View>
            {!isOwnMessage && (
              <Pressable style={styles.slideArrow} onPress={() => toggleModerationSlide(item.id)}>
                {showModerationMenu === item.id
                  ? <ChevronLeft size={16} color={colors.mutedForeground} />
                  : <ChevronRight size={16} color={colors.mutedForeground} />
                }
              </Pressable>
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
            keyboardShouldPersistTaps="handled"
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

      {!isAuthenticated ? (
        <View style={styles.guestInputBanner}>
          <LogIn size={16} color={colors.neonGreen} />
          <Text style={styles.guestInputText}>{t('loginToChat')}</Text>
          <Pressable style={styles.guestInputButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.guestInputButtonText}>{t('signIn')}</Text>
            <ChevronRight size={14} color={colors.background} />
          </Pressable>
        </View>
      ) : (
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
      )}
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

  // ── Guest Input Banner ──────────────────────────────
  guestInputBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: `${colors.border}60`,
  },
  guestInputText: {
    flex: 1,
    color: colors.mutedForeground,
    fontSize: 13,
  },
  guestInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  guestInputButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    marginLeft: 44,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    marginHorizontal: 3,
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
  slideAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slideActionBlock: {
    borderLeftWidth: 1,
    borderLeftColor: `${colors.border}60`,
  },
  slideActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  slideArrow: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
