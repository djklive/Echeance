import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import ProtectedRoute from './components/ProtectedRoute'
import EcheanceList from './components/EcheanceList'
import './App.css'

function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="App">
      {session && (
        <header className="app-header">
          <div className="header-content">
            <div className="header-user">
              <div className="user-avatar">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="header-user-email">{session.user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnexion
            </button>
          </div>
        </header>
      )}
      <main className="app-main">
        <ProtectedRoute>
          <EcheanceList />
        </ProtectedRoute>
      </main>
    </div>
  )
}

export default App
