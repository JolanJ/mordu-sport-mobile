import { colors } from '@/theme/colors'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

// Format de date simple sans date-fns pour l'instant
const formatDate = (date: Date, today: Date) => {
  const isToday = isSameDay(date, today)
  if (isToday) {
    return "Aujourd'hui"
  }
  
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
  const month = months[date.getMonth()]
  const day = date.getDate()
  return `${month} ${day}`
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

export function Calendar() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentWeek, setCurrentWeek] = useState(0)

  // Générer les 15 jours (7 avant + 7 après aujourd'hui)
  const generateDates = () => {
    const dates = []
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + (currentWeek * 7))
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()
  const canGoLeft = currentWeek > -1
  const canGoRight = currentWeek < 1

  const handleDatePress = (date: Date) => {
    setSelectedDate(date)
  }

  const handlePreviousWeek = () => {
    if (canGoLeft) {
      setCurrentWeek(currentWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (canGoRight) {
      setCurrentWeek(currentWeek + 1)
    }
  }

  const getDateStyle = (date: Date) => {
    const isSelected = isSameDay(date, selectedDate)
    const isToday = isSameDay(date, today)
    const isDisabled = Math.abs(date.getTime() - today.getTime()) > (7 * 24 * 60 * 60 * 1000) // 7 jours

    if (isDisabled) {
      return styles.dateTextDisabled
    }
    if (isToday) {
      return styles.dateTextToday // "Aujourd'hui" reste toujours orange
    }
    if (isSelected) {
      return styles.dateTextSelected
    }
    return styles.dateTextNormal
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Flèche gauche */}
        <Pressable
          onPress={handlePreviousWeek}
          disabled={!canGoLeft}
          style={[styles.arrowButton, !canGoLeft && styles.arrowButtonDisabled]}
        >
          <ChevronLeft 
            size={16} 
            color={canGoLeft ? colors.mutedForeground : `${colors.mutedForeground}4D`} 
          />
        </Pressable>

        {/* Dates */}
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate)
          const isDisabled = Math.abs(date.getTime() - today.getTime()) > (7 * 24 * 60 * 60 * 1000)
          
          return (
            <Pressable
              key={index}
              onPress={() => !isDisabled && handleDatePress(date)}
              disabled={isDisabled}
              style={styles.dateButton}
            >
              <Text style={getDateStyle(date)}>
                {formatDate(date, today)}
              </Text>
            </Pressable>
          )
        })}

        {/* Flèche droite */}
        <Pressable
          onPress={handleNextWeek}
          disabled={!canGoRight}
          style={[styles.arrowButton, !canGoRight && styles.arrowButtonDisabled]}
        >
          <ChevronRight 
            size={16} 
            color={canGoRight ? colors.mutedForeground : `${colors.mutedForeground}4D`} 
          />
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  arrowButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextNormal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  dateTextToday: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground, // Blanc
  },
  dateTextSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonGreen,
  },
  dateTextDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: `${colors.mutedForeground}4D`, // 30% opacity
  },
})
