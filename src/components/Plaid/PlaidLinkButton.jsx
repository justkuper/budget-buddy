import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { usePlaid } from '../../contexts/PlaidContext'
import { useTranslation } from 'react-i18next'

/**
 * Button that opens the Plaid Link UI.
 * Fetches a link_token from our backend, then initialises usePlaidLink.
 */
export default function PlaidLinkButton({ onSuccess, style = {}, children }) {
  const { t } = useTranslation()
  const { getLinkToken, onPlaidSuccess, loading } = usePlaid()
  const [linkToken, setLinkToken] = useState(null)
  const [tokenError, setTokenError] = useState(null)

  // Fetch link token on mount
  useEffect(() => {
    let cancelled = false
    getLinkToken()
      .then(token => { if (!cancelled) setLinkToken(token) })
      .catch(e => { if (!cancelled) setTokenError(e.message) })
    return () => { cancelled = true }
  }, [getLinkToken])

  const handleSuccess = useCallback(async (public_token, metadata) => {
    await onPlaidSuccess(public_token, metadata)
    onSuccess?.()
  }, [onPlaidSuccess, onSuccess])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: (err) => {
      if (err) console.warn('Plaid Link exited with error:', err)
    },
  })

  if (tokenError) {
    return (
      <div style={{color: 'var(--expense)', fontSize: '0.85rem', padding: '12px', background: '#FFF0F0', borderRadius: 10}}>
        ⚠️ {tokenError}
      </div>
    )
  }

  return (
    <button
      className="btn btn-primary"
      onClick={() => open()}
      disabled={!ready || loading}
      style={style}
    >
      {loading ? t('loading') : (children || t('linkBankAccount'))}
    </button>
  )
}
