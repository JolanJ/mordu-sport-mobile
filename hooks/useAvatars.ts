import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Avatar {
  id: number
  img_link: string
}

async function fetchAvatars(): Promise<Avatar[]> {
  const { data, error } = await supabase
    .from('avatar_img')
    .select('id, img_link')
    .order('id')

  if (error) throw error
  return data || []
}

export function useAvatars() {
  const { data: avatars = [], isLoading } = useQuery({
    queryKey: ['avatars'],
    queryFn: fetchAvatars,
    staleTime: 24 * 60 * 60 * 1000, // 24h - les avatars changent rarement
  })

  const getAvatarUrl = (avatarId: number): string | undefined => {
    const avatar = avatars.find(a => a.id === avatarId)
    return avatar?.img_link || avatars[0]?.img_link || undefined
  }

  return { avatars, getAvatarUrl, isLoading }
}
