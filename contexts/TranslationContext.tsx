import { useAuth } from '@/contexts/AuthContext'
import { getTranslation, Locale, TranslationKey } from '@/lib/translations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react'

const LOCALE_STORAGE_KEY = '@mordu_locale'

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  isLocaleLoaded: boolean
  isLocaleChosen: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { user, profile, updateProfile } = useAuth()
  const [localLocale, setLocalLocale] = useState<Locale>('fr')
  const [isLocaleLoaded, setIsLocaleLoaded] = useState(false)
  const [isLocaleChosen, setIsLocaleChosen] = useState(false)

  // Charger la langue depuis AsyncStorage au démarrage
  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en') {
        setLocalLocale(stored)
        setIsLocaleChosen(true)
      }
      setIsLocaleLoaded(true)
    })
  }, [])

  // Si l'utilisateur est connecté, utiliser sa préférence de profil
  const locale: Locale = user && profile?.preferred_locale ? profile.preferred_locale : localLocale

  const setLocale = async (newLocale: Locale) => {
    // Toujours sauvegarder localement
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    setLocalLocale(newLocale)
    setIsLocaleChosen(true)

    // Si connecté, sauvegarder aussi dans le profil
    if (user) {
      await updateProfile({ preferred_locale: newLocale })
    }
  }

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      getTranslation(locale, key, params),
    isLocaleLoaded,
    isLocaleChosen,
  }), [locale, user, isLocaleLoaded, isLocaleChosen])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    return {
      locale: 'fr' as Locale,
      setLocale: async () => {},
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        getTranslation('fr', key, params),
      isLocaleLoaded: true,
      isLocaleChosen: true,
    }
  }
  return context
}
