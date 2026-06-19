import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

export default function SignupPage() {
  const { t } = useTranslation()
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password)
      await signIn(email, password)
      navigate('/auth/2fa-setup')
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">💰</div>
        <h1 className="auth-app-name">Budget Buddy</h1>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{t('createAccount')}</h2>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('createAccount')}
          </button>
        </form>

        <p className="auth-switch">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/auth/login" style={{color: 'var(--primary)', fontWeight: 600}}>{t('signIn')}</Link>
        </p>
      </div>
    </div>
  )
}
