import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Match } from '@/lib/types'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

export interface FavoriteMatch {
  id: string
  user_id: string
  match_id: string
  match_data: Match
  created_at: string
}

interface FavoritesContextType {
  favorites: FavoriteMatch[]
  loading: boolean
  isFavorite: (matchId: string) => boolean
  addFavorite: (match: Match) => Promise<{ error: Error | null }>
  removeFavorite: (matchId: string) => Promise<{ error: Error | null }>
  toggleFavorite: (match: Match) => Promise<{ error: Error | null }>
  isAuthenticated: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  // Charger les favoris de l'utilisateur
  useEffect(() => {
    if (!user) {
      setFavorites([])
      setFavoriteIds(new Set())
      setLoading(false)
      return
    }

    const fetchFavorites = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setFavorites(data)
        setFavoriteIds(new Set(data.map((f) => f.match_id)))
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [user])

  // Vérifier si un match est en favori
  const isFavorite = useCallback(
    (matchId: string) => {
      return favoriteIds.has(matchId)
    },
    [favoriteIds]
  )

  // Ajouter un match en favori (optimistic update)
  const addFavorite = useCallback(
    async (match: Match) => {
      if (!user) return { error: new Error('Non authentifié') }

      // Optimistic update - mettre à jour immédiatement
      const tempId = `temp-${Date.now()}`
      const tempFavorite: FavoriteMatch = {
        id: tempId,
        user_id: user.id,
        match_id: match.id,
        match_data: match,
        created_at: new Date().toISOString(),
      }

      setFavorites((prev) => [tempFavorite, ...prev])
      setFavoriteIds((prev) => new Set([...prev, match.id]))

      // Appel API
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          match_id: match.id,
          match_data: match,
        })
        .select()
        .single()

      if (error) {
        // Rollback en cas d'erreur
        setFavorites((prev) => prev.filter((f) => f.id !== tempId))
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(match.id)
          return newSet
        })
        return { error }
      }

      // Remplacer le temp par le vrai
      if (data) {
        setFavorites((prev) =>
          prev.map((f) => (f.id === tempId ? data : f))
        )
      }

      return { error: null }
    },
    [user]
  )

  // Retirer un match des favoris (optimistic update)
  const removeFavorite = useCallback(
    async (matchId: string) => {
      if (!user) return { error: new Error('Non authentifié') }

      // Sauvegarder pour rollback
      const removedFavorite = favorites.find((f) => f.match_id === matchId)

      // Optimistic update - retirer immédiatement
      setFavorites((prev) => prev.filter((f) => f.match_id !== matchId))
      setFavoriteIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(matchId)
        return newSet
      })

      // Appel API
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId)

      if (error && removedFavorite) {
        // Rollback en cas d'erreur
        setFavorites((prev) => [removedFavorite, ...prev])
        setFavoriteIds((prev) => new Set([...prev, matchId]))
        return { error }
      }

      return { error: null }
    },
    [user, favorites]
  )

  // Toggle favori (ajouter ou retirer)
  const toggleFavorite = useCallback(
    async (match: Match) => {
      if (isFavorite(match.id)) {
        return removeFavorite(match.id)
      } else {
        return addFavorite(match)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
