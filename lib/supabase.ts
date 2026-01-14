import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrajekuuhbuneoualiix.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWpla3V1aGJ1bmVvdWFsaWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTk4MTMsImV4cCI6MjA4Mzk5NTgxM30.X3ZnoRoyaOZ4JVRR14L3gHCiwawToxSsEvVFn6s8Mjw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
