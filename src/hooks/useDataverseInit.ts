import { useEffect, useState } from 'react'
import { initializeDataverseTables, addSampleData } from '@/services/dataverse-init'

export function useDataverseInit(enabled: boolean = true) {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const init = async () => {
      try {
        setLoading(true)
        const success = await initializeDataverseTables()
        if (success) {
          await addSampleData()
          setInitialized(true)
        } else {
          setError(new Error('Failed to initialize Dataverse'))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [enabled])

  return { initialized, loading, error }
}
