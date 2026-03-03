import { Calendar } from '@/components/Calendar'
import { HomeHeader } from '@/components/HomeHeader'
import { MatchList } from '@/components/MatchList'
import { SportLeagues } from '@/components/SportLeagues'
import { colors } from '@/theme/colors'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HomeHeader />
      
      <SportLeagues />
      <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
      <View style={styles.content}>
        <MatchList selectedDate={selectedDate} />
      </View>
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
})

