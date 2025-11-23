import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          if (error.status === 429) {
            throw new Error('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.')
          }
          throw error
        }
        if (data.user && !data.session) {
          setMessage('Compte créé ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.')
          setMessageType('success')
        } else {
          setMessage('Compte créé avec succès !')
          setMessageType('success')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.status === 429) {
            throw new Error('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.')
          }
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect.')
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.')
          }
          throw error
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue'
      setMessage(errorMessage)
      setMessageType('error')
      console.error('Erreur d\'authentification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="login-title">{isSignUp ? 'Créer un compte' : 'Bienvenue'}</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Commencez à gérer vos échéances' : 'Connectez-vous pour continuer'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="votre@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Chargement...
              </>
            ) : (
              isSignUp ? 'Créer mon compte' : 'Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-switch-text">
            {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setMessageType('')
              }}
              className="login-switch-button"
            >
              {isSignUp ? 'Se connecter' : 'Créer un compte'}
            </button>
          </p>
        </div>

        {message && (
          <div className={`login-message ${messageType}`}>
            <span className="message-icon">
              {messageType === 'error' ? '⚠️' : '✓'}
            </span>
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
