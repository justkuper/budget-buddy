import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import './Auth.css'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // ── Email / Password ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(email, password)
      navigate(result?.mfaRequired ? '/auth/2fa' : '/')
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError('')
      try {
        // Fetch real profile from Google's userinfo endpoint
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch Google profile')
        const profile = await res.json()
        // profile = { sub, email, name, given_name, family_name, picture }
        await signInWithGoogle(profile)
        navigate('/')
      } catch (err) {
        setError(err.message || 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google login error:', err)
      setError('Google sign-in was cancelled or failed.')
    },
  })

  // ── Facebook (demo) ───────────────────────────────────────────────────────
  const handleFacebook = async () => {
    try { await signInWithFacebook(); navigate('/') }
    catch (err) { setError(err.message) }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-controls">
          <button className="icon-btn-sm" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}>
            {i18n.language === 'en' ? '🇺🇸' : '🇪🇸'}
          </button>
          <button className="icon-btn-sm" onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="auth-logo">💰</div>
        <h1 className="auth-app-name">Budget Buddy</h1>
        <p className="auth-tagline">
          {i18n.language === 'en' ? 'Smart money management' : 'Gestión inteligente de dinero'}
        </p>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{t('welcome')}</h2>

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
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="auth-forgot">
            <button type="button" className="btn btn-ghost" style={{padding: '4px 0', fontSize: '0.85rem'}}>
              {t('forgotPassword')}
            </button>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('signIn')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('orContinueWith')}</span>
        </div>

        <div className="social-buttons">
          <button
            className="btn-social btn-google"
            onClick={() => googleLogin()}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {loading ? t('loading') : t('continueWithGoogle')}
          </button>

          <button className="btn-social btn-facebook" onClick={handleFacebook} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t('continueWithFacebook')}
          </button>
        </div>

        <p className="auth-switch">
          {t('dontHaveAccount')}{' '}
          <Link to="/auth/signup" style={{color: 'var(--primary)', fontWeight: 600}}>
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
