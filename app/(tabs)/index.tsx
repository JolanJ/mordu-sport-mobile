import { AdBanner } from '@/components/AdBanner'
import { Calendar } from '@/components/Calendar'
import { HomeHeader } from '@/components/HomeHeader'
import { MatchList } from '@/components/MatchList'
import { SportLeagues } from '@/components/SportLeagues'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [unreadMentions, setUnreadMentions] = useState<{ count: number; matchId?: string; matchDate?: string; messageId?: string }>({ count: 0 })
  const { user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  // Check for unread mentions
  useEffect(() => {
    if (!user) return

    const checkMentions = async () => {
      const { data, count } = await supabase
        .from('mentions')
        .select('match_id, message_id, created_at', { count: 'exact' })
        .eq('mentioned_user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0 && count) {
        const matchDate = data[0].created_at
          ? new Date(data[0].created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        setUnreadMentions({ count, matchId: data[0].match_id, matchDate, messageId: data[0].message_id })
      } else {
        setUnreadMentions({ count: 0 })
      }
    }

    checkMentions()

    // Re-check when screen focuses
    const channel = supabase
      .channel('home-mentions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mentions',
        filter: `mentioned_user_id=eq.${user.id}`,
      }, () => {
        checkMentions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const markMentionsRead = async () => {
    if (!user) return
    await supabase
      .from('mentions')
      .update({ read: true })
      .eq('mentioned_user_id', user.id)
      .eq('read', false)
    setUnreadMentions({ count: 0 })
  }

  const handleMentionPress = () => {
    if (unreadMentions.matchId) {
      const date = unreadMentions.matchDate || new Date().toISOString().split('T')[0]
      const messageId = unreadMentions.messageId || ''
      markMentionsRead()
      router.push(`/(tabs)/match/${unreadMentions.matchId}?date=${date}&messageId=${messageId}` as any)
    }
  }

  const handleMentionDismiss = () => {
    markMentionsRead()
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      {unreadMentions.count > 0 && (
        <Pressable style={styles.mentionBanner} onPress={handleMentionPress}>
          <Text style={styles.mentionBannerText}>
            💬 {t('youHaveMentions', { count: unreadMentions.count })}
          </Text>
          <Pressable
            style={styles.mentionDismiss}
            onPress={handleMentionDismiss}
            hitSlop={8}
          >
            <X size={16} color={colors.background} />
          </Pressable>
        </Pressable>
      )}

      <SportLeagues />
      <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
      <View style={styles.content}>
        <MatchList selectedDate={selectedDate} />
      </View>
      <AdBanner />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  mentionBanner: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentionBannerText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  mentionDismiss: {
    padding: 4,
  },
})

