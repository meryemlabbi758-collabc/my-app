export default function MinimalPage() {
  return (
    <div style={{
      padding: '50px',
      fontFamily: 'Arial, sans-serif',
      color: 'black',
      backgroundColor: 'white'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>MINIMAL TEST PAGE</h1>
      <p style={{ color: 'blue', fontSize: '16px' }}>If you see this, React works!</p>
      <p style={{ color: 'green' }}>Environment: {process.env.NODE_ENV}</p>
    </div>
  )
}
