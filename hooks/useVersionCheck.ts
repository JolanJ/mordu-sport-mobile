import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Constants from 'expo-constants'

interface VersionCheckResult {
  needsUpdate: boolean
  requiredVersion: string | null
  currentVersion: string
  loading: boolean
}

// Compare deux versions (ex: "1.0.3" vs "1.0.4")
function compareVersions(current: string, required: string): number {
  const currentParts = current.split('.').map(Number)
  const requiredParts = required.split('.').map(Number)

  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0
    const requiredPart = requiredParts[i] || 0

    if (currentPart < requiredPart) return -1
    if (currentPart > requiredPart) return 1
  }

  return 0
}

export function useVersionCheck(): VersionCheckResult {
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [requiredVersion, setRequiredVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const currentVersion = Constants.expoConfig?.version || '1.0.0'

  useEffect(() => {
    async function checkVersion() {
      try {
        const { data, error } = await supabase
          .from('app_version')
          .select('required_version')
          .single()

        if (error) {
          console.error('Error checking version:', error)
          setLoading(false)
          return
        }

        if (data) {
          setRequiredVersion(data.required_version)
          const comparison = compareVersions(currentVersion, data.required_version)
          setNeedsUpdate(comparison < 0)
        }
      } catch (error) {
        console.error('Error checking version:', error)
      } finally {
        setLoading(false)
      }
    }

    checkVersion()
  }, [currentVersion])

  return {
    needsUpdate,
    requiredVersion,
    currentVersion,
    loading,
  }
}
