export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Page - If you see this, React is working!</h1>
      <p>Backend URL: http://localhost:3001</p>
      <p>Frontend URL: http://localhost:5174</p>
      <p>SharePoint Enabled: {process.env.REACT_APP_SHAREPOINT_ENABLED}</p>
      <p>Backend API URL: {process.env.REACT_APP_BACKEND_API_URL}</p>
    </div>
  )
}
