import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAvatars } from '@/hooks/useAvatars'
import { ChatMessage, Locale, useChat } from '@/hooks/useChat'
import { containsBlockedWord } from '@/lib/chatFilter'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'
import { LogIn, Send } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
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
  const [locale, setLocale] = useState<Locale>(profile?.preferred_locale || 'en')
  const { messages, loading, sending, sendMessage, toggleReaction, getReactionsForMessage, isAuthenticated } = useChat({ matchId, locale })
  const [inputText, setInputText] = useState('')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Mettre à jour la locale si le profil change
  useEffect(() => {
    if (profile?.preferred_locale) {
      setLocale(profile.preferred_locale)
    }
  }, [profile?.preferred_locale])

  // Changer de langue (local seulement, pas d'écriture en BD)
  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length])

  // Gérer l'ouverture/fermeture du keyboard
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [])

  const handleSend = async () => {
    if (!inputText.trim() || sending) return

    // Vérifier si le message contient des mots interdits
    if (containsBlockedWord(inputText)) {
      Alert.alert(t('messageBlocked'), t('messageBlockedReason'))
      return
    }

    const text = inputText
    setInputText('')
    await sendMessage(text, username, avatarId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(appLocale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleLongPress = (messageId: string) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId)
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    await toggleReaction(messageId, emoji)
    setSelectedMessageId(null)
  }

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
              {item.content}
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
                style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}
                onPress={() => handleLocaleChange('fr')}
              >
                <Text style={[styles.localeButtonText, locale === 'fr' && styles.localeButtonTextActive]}>FR</Text>
              </Pressable>
              <Pressable
                style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}
                onPress={() => handleLocaleChange('en')}
              >
                <Text style={[styles.localeButtonText, locale === 'en' && styles.localeButtonTextActive]}>ALL</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('beFirstToMessage')}
              </Text>
            </View>
          }
        />
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
            onChangeText={setInputText}
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
