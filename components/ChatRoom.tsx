import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { ChatMessage, Locale, useChat } from '@/hooks/useChat'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { LogIn, Send } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
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
  period?: string
  timeRemaining?: string
  isLive?: boolean
}

const REACTION_EMOJIS = ['👍', '👎', '🔥', '💀']

export function ChatRoom({ matchId, username = 'Anonyme', avatarId = 1, period, timeRemaining, isLive }: ChatRoomProps) {
  const { user, profile } = useAuth()
  const { getAvatarUrl } = useAvatars()
  const { t, locale: appLocale } = useTranslation()
  const [locale, setLocale] = useState<Locale>('en')
  const { messages, loading, sending, sendMessage, toggleReaction, getReactionsForMessage, getUnreadMentions, markMentionsRead, isAuthenticated } = useChat({ matchId, locale })
  const [unreadCount, setUnreadCount] = useState(0)
  const [inputText, setInputText] = useState('')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showModerationMenu, setShowModerationMenu] = useState<string | null>(null)
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionToast, setMentionToast] = useState<string | null>(null)
  const prevMessageCount = useRef(messages.length)
  const flatListRef = useRef<FlatList>(null)


  // Check for unread mentions on mount
  useEffect(() => {
    if (!isAuthenticated) return
    getUnreadMentions().then(mentions => {
      if (mentions.length > 0) {
        setUnreadCount(mentions.length)
        // Auto-dismiss after 5 seconds and mark as read
        setTimeout(() => {
          setUnreadCount(0)
          markMentionsRead()
        }, 5000)
      }
    })
  }, [isAuthenticated])

  // Detect @mention in new messages
  useEffect(() => {
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
  }, [messages.length])

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


  // Gérer l'ouverture/fermeture du keyboard
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [])

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

    return (
      <View style={styles.messageWrapper}>
        <Pressable
          onLongPress={() => handleLongPress(item.id)}
          delayLongPress={300}
          style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}
        >
          {!isOwnMessage && avatarUrl && (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
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
          {isOwnMessage && avatarUrl && (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          )}
        </Pressable>

        {/* Reaction Picker - en bas du message */}
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
          <LogIn size={48} color={colors.mutedForeground} />
          <Text style={styles.authPromptTitle}>{t('loginRequired')}</Text>
          <Text style={styles.authPromptText}>{t('loginToChat')}</Text>
          <Pressable
            style={styles.authLoginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authLoginButtonText}>{t('signIn')}</Text>
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
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('liveChat')}</Text>
          </View>
          <View style={styles.headerRight}>
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
        </View>
      )}

      {/* Unread mentions banner */}
      {unreadCount > 0 && (
        <Pressable style={styles.mentionToast} onPress={() => { setUnreadCount(0); markMentionsRead() }}>
          <Text style={styles.mentionToastText}>
            💬 {unreadCount} {unreadCount === 1 ? t('newMention') : t('newMentions')}
          </Text>
        </Pressable>
      )}

      {/* Mention toast */}
      {mentionToast && (
        <View style={styles.mentionToast}>
          <Text style={styles.mentionToastText}>
            💬 {mentionToast} {t('mentionedYou')}
          </Text>
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
        {/* Quick emoji reactions - caché quand keyboard ouvert */}
        {!keyboardVisible && <View style={styles.quickEmojis}>
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
        </View>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('writeMessage')}
            placeholderTextColor={colors.mutedForeground}
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
              <Send size={20} color={colors.background} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.live,
  },
  liveText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: '600',
  },
  participantsText: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  localeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 2,
  },
  localeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  localeButtonActive: {
    backgroundColor: colors.primary,
  },
  localeButtonText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  localeButtonTextActive: {
    color: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 4,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
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
    fontWeight: '600',
  },
  ownUsername: {
    color: 'rgba(13, 13, 13, 0.8)',
  },
  messageText: {
    color: colors.foreground,
    fontSize: 13,
    lineHeight: 18,
  },
  ownMessageText: {
    color: colors.background,
  },
  messageTime: {
    color: colors.mutedForeground,
    fontSize: 10,
  },
  ownMessageTime: {
    color: 'rgba(13, 13, 13, 0.6)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
  },
  mentionToast: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  mentionToastText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
  mentionList: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 4,
  },
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: 4,
  },
  quickEmojis: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.muted,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authPromptTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  authPromptText: {
    marginTop: 8,
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  authLoginButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 32,
    backgroundColor: colors.neonGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLoginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  // Reactions
  messageWrapper: {
    marginBottom: 4,
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    marginLeft: 40,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionPickerOwn: {
    alignSelf: 'flex-end',
    marginRight: 40,
    marginLeft: 0,
  },
  reactionPickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPickerEmoji: {
    fontSize: 16,
  },
  moderationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    top: 40,
    left: 0,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  moderationMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moderationMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  moderationMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginLeft: 40,
    marginTop: 4,
  },
  reactionsContainerOwn: {
    justifyContent: 'flex-end',
    marginRight: 40,
    marginLeft: 0,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionBadgeActive: {
    borderColor: colors.neonGreen,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  reactionCountActive: {
    color: colors.neonGreen,
  },
})
