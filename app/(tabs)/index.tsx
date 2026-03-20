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
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [unreadMentions, setUnreadMentions] = useState<{ count: number; matchId?: string; matchDate?: string }>({ count: 0 })
  const { user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  // Check for unread mentions
  useEffect(() => {
    if (!user) return

    const checkMentions = async () => {
      const { data } = await supabase
        .from('mentions')
        .select('match_id')
        .eq('mentioned_user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) {
        setUnreadMentions({ count: data.length, matchId: data[0].match_id })
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

  const handleMentionPress = () => {
    if (unreadMentions.matchId) {
      const today = new Date().toISOString().split('T')[0]
      router.push(`/(tabs)/match/${unreadMentions.matchId}?date=${today}` as any)
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />

      {unreadMentions.count > 0 && (
        <Pressable style={styles.mentionBanner} onPress={handleMentionPress}>
          <Text style={styles.mentionBannerText}>
            💬 {t('youHaveMentions', { count: unreadMentions.count })}
          </Text>
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
    alignItems: 'center',
  },
  mentionBannerText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
})

