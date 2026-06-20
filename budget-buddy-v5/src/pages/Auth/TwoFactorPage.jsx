import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

export default function TwoFactorPage({ isSetup = false }) {
  const { t } = useTranslation()
  const { confirmMFA, signOut } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef([])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...code]
    next[i] = val.slice(-1)
    setCode(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const full = code.join('')
    if (full.length < 6) return
    setLoading(true)
    setError('')
    try {
      await confirmMFA(full)
      navigate('/')
    } catch {
      setError('Invalid code. Try again.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">🔐</div>
        <h1 className="auth-app-name">Budget Buddy</h1>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{t('twoFactorTitle')}</h2>
        <p className="auth-desc">{t('twoFactorDesc')}</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <div className="otp-wrapper" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={loading || code.join('').length < 6}
          style={{marginTop: '24px'}}
        >
          {loading ? t('loading') : t('verifyCode')}
        </button>

        <button className="btn btn-ghost" style={{marginTop: '12px', width: '100%'}} onClick={handleSkip}>
          {t('skip2FA')}
        </button>
      </div>
    </div>
  )
}
