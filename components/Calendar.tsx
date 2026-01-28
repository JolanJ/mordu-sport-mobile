import { useTranslation } from '@/contexts/TranslationContext'
import { colors } from '@/theme/colors'
import { useEffect, useRef } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const DAYS_BEFORE = 2
const DAYS_AFTER = 7
const ITEM_WIDTH = 44

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

interface CalendarProps {
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function Calendar({ selectedDate: propSelectedDate, onDateChange }: CalendarProps) {
  const { t, locale } = useTranslation()
  const today = new Date()
  const selectedDate = propSelectedDate || today
  const scrollViewRef = useRef<ScrollView>(null)

  const getDayName = (date: Date) => {
    const dayIndex = date.getDay()
    const dayKeys: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return t(dayKeys[dayIndex])
  }

  // Générer les dates: 2 jours avant + aujourd'hui + 7 jours après = 10 jours
  const generateDates = () => {
    const dates = []
    for (let i = -DAYS_BEFORE; i <= DAYS_AFTER; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()

  // Scroll vers aujourd'hui au chargement
  useEffect(() => {
    setTimeout(() => {
      const todayIndex = DAYS_BEFORE // Index d'aujourd'hui dans le tableau
      scrollViewRef.current?.scrollTo({
        x: todayIndex * ITEM_WIDTH - 100, // Centrer un peu
        animated: false,
      })
    }, 100)
  }, [])

  const handleDatePress = (date: Date) => {
    onDateChange?.(date)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today)

          return (
            <Pressable
              key={index}
              onPress={() => handleDatePress(date)}
              style={[
                styles.dateItem,
                isSelected && styles.dateItemSelected,
              ]}
            >
              <Text style={[
                styles.dayName,
                isToday && styles.dayNameToday,
                isSelected && styles.dayNameSelected,
              ]}>
                {getDayName(date)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isToday && styles.dayNumberToday,
                isSelected && styles.dayNumberSelected,
              ]}>
                {date.getDate()}
              </Text>
              {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 2,
  },
  dateItem: {
    width: ITEM_WIDTH,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  dateItemSelected: {
    borderBottomColor: colors.neonGreen,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: 1,
  },
  dayNameToday: {
    color: colors.foreground,
  },
  dayNameSelected: {
    color: colors.neonGreen,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mutedForeground,
  },
  dayNumberToday: {
    color: colors.foreground,
  },
  dayNumberSelected: {
    color: colors.neonGreen,
  },
  todayDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neonGreen,
    marginTop: 2,
  },
  todayDotSelected: {
    backgroundColor: colors.neonGreen,
  },
})
