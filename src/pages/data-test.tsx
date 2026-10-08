import { useEffect, useState } from 'react'

export default function DataTestPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching from backend...')
        const response = await fetch('http://localhost:3001/api/datalake/dim_project')
        console.log('Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const json = await response.json()
        console.log('Data received:', json)
        setData(json)
      } catch (err) {
        console.error('Error:', err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', color: '#000' }}>
      <h1 style={{ color: 'blue' }}>Data Test Page</h1>

      {loading && <p style={{ color: 'orange' }}>Loading...</p>}

      {error && (
        <div style={{ color: 'red', backgroundColor: '#ffe0e0', padding: '10px', borderRadius: '5px' }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <h2 style={{ color: 'green' }}>Success! Got {data.count} clients</h2>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
