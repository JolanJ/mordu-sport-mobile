import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type Locale = 'fr' | 'en'

export type Profile = {
  id: string
  username: string
  email: string
  state_province: string | null
  avatar_id: number
  is_18_plus: boolean
  newsletter_subscribed: boolean
  preferred_locale: Locale
  is_banned: boolean
  created_at: string
  updated_at: string
  username_changed_at: string | null
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isBanned: boolean
  clearBanned: () => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'state_province' | 'avatar_id' | 'preferred_locale' | 'newsletter_subscribed'>>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)

  // Récupérer le profil utilisateur
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      if (data.is_banned) {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
        setIsBanned(true)
        return
      }
      setProfile(data)
    }
  }

  const clearBanned = () => setIsBanned(false)

  // Rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'state_province' | 'avatar_id' | 'preferred_locale' | 'newsletter_subscribed'>>) => {
    if (!user) return { error: new Error('Non authentifié') }

    const finalUpdates: Record<string, unknown> = { ...updates }
    if ('username' in updates) {
      finalUpdates.username_changed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .update(finalUpdates)
      .eq('id', user.id)

    if (!error) {
      await fetchProfile(user.id)
    }

    return { error }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isBanned,
      clearBanned,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
