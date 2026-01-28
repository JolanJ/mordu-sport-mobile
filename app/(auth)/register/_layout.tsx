import { RegisterProvider } from '@/contexts/RegisterContext'
import { Stack } from 'expo-router'

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
          animation: 'slide_from_right',
        }}
      />
    </RegisterProvider>
  )
}
