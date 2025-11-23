import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Login from './Login'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setAuthenticated(!!session)
      setLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        Chargement...
      </div>
    )
  }

  if (!authenticated) {
    return <Login />
  }

  return <>{children}</>
}

