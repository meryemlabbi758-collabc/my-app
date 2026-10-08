import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>(['Page loaded'])
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    setLogs(prev => [...prev, 'useEffect started'])

    // Test 1: Can we fetch from backend?
    fetch('http://localhost:3001/api/health')
      .then(res => {
        setLogs(prev => [...prev, 'Backend health check OK: ' + res.status])
        return res.json()
      })
      .then(data => {
        setLogs(prev => [...prev, 'Health data: ' + JSON.stringify(data)])
      })
      .catch(err => {
        setLogs(prev => [...prev, 'Backend error: ' + err.message])
      })

    // Test 2: Can we fetch clients?
    fetch('http://localhost:3001/api/datalake/dim_project')
      .then(res => {
        setLogs(prev => [...prev, 'Clients fetch OK: ' + res.status])
        return res.json()
      })
      .then(data => {
        setLogs(prev => [...prev, 'Got ' + data.count + ' clients'])
        setClients(data.data)
      })
      .catch(err => {
        setLogs(prev => [...prev, 'Clients error: ' + err.message])
      })
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Debug Page</h1>

      <div className="bg-slate-100 p-4 rounded max-h-96 overflow-auto">
        <h2 className="font-bold mb-2">Logs:</h2>
        {logs.map((log, i) => (
          <div key={i} className="text-sm font-mono">{log}</div>
        ))}
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Clients ({clients.length}):</h2>
        {clients.map(c => (
          <div key={c.project_sk}>{c.project_name} ({c.project_key})</div>
        ))}
      </div>
    </div>
  )
}
