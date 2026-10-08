import { useEffect, useState } from 'react'

export default function ErrorCatcherPage() {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Catch all console errors
    const originalError = console.error
    console.error = (...args: any[]) => {
      setErrors(prev => [...prev, 'ERROR: ' + JSON.stringify(args)])
      originalError.apply(console, args)
    }

    // Catch unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
      setErrors(prev => [...prev, 'UNHANDLED: ' + event.reason])
    })

    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      color: '#000',
      backgroundColor: '#fff'
    }}>
      <h1 style={{ color: 'red' }}>Error Catcher</h1>
      <p>Errors caught: {errors.length}</p>
      <div style={{
        border: '1px solid red',
        padding: '10px',
        maxHeight: '500px',
        overflow: 'auto',
        marginTop: '10px'
      }}>
        {errors.length === 0 ? (
          <p style={{ color: 'green' }}>No errors caught yet!</p>
        ) : (
          errors.map((err, i) => (
            <div key={i} style={{ color: 'red', marginBottom: '5px' }}>
              {i + 1}. {err}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
