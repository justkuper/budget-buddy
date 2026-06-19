import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaid } from '../../contexts/PlaidContext'
import TopBar from '../../components/Layout/TopBar'
import PlaidLinkButton from '../../components/Plaid/PlaidLinkButton'

function formatCurrency(n, code = 'USD') {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(n)
}

function accountTypeIcon(type, subtype) {
  if (type === 'depository') {
    if (subtype === 'checking') return '🏦'
    if (subtype === 'savings') return '💎'
    return '🏦'
  }
  if (type === 'credit') return '💳'
  if (type === 'investment') return '📈'
  if (type === 'loan') return '🏠'
  return '💰'
}

function AccountCard({ account }) {
  const { t } = useTranslation()
  const isCredit = account.type === 'credit'
  const balance = isCredit ? account.balances.current : (account.balances.available ?? account.balances.current)
  const currency = account.balances.iso_currency_code || 'USD'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 10,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: isCredit ? '#FF6B6B25' : '#6C63FF20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>
          {accountTypeIcon(account.type, account.subtype)}
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <p style={{fontWeight: 700, fontSize: '0.95rem', marginBottom: 2}}>
            {account.name}
            {account.mask && <span style={{color: 'var(--text-muted)', fontWeight: 400}}> ••{account.mask}</span>}
          </p>
          <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize'}}>
            {account.institution?.name} · {account.subtype || account.type}
          </p>
        </div>
        <div style={{textAlign: 'right', flexShrink: 0}}>
          <p style={{
            fontWeight: 800, fontSize: '1.05rem',
            color: isCredit ? 'var(--expense)' : 'var(--income)',
          }}>
            {formatCurrency(balance, currency)}
          </p>
          <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1}}>
            {isCredit ? t('balance') : t('available')}
          </p>
        </div>
      </div>
    </div>
  )
}

function InstitutionGroup({ item, onRemove, onRefresh, onSync }) {
  const { t } = useTranslation()
  const [syncing, setSyncing] = useState(false)
  const [newCount, setNewCount] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const added = await onSync(item.item_id)
      setNewCount(added.length)
      setTimeout(() => setNewCount(null), 4000)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{marginBottom: 24}}>
      {/* Institution header */}
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', color: 'white', fontWeight: 800, flexShrink: 0,
        }}>
          {item.institution?.name?.[0] || '🏦'}
        </div>
        <div style={{flex: 1}}>
          <p style={{fontWeight: 700, fontSize: '0.95rem'}}>{item.institution?.name || 'Bank'}</p>
          {item.lastRefreshed && (
            <p style={{fontSize: '0.72rem', color: 'var(--text-muted)'}}>
              {t('lastUpdated')}: {new Date(item.lastRefreshed).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
            </p>
          )}
        </div>
        <div style={{display: 'flex', gap: 6}}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
              background: 'var(--bg-input)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--primary)',
            }}
          >
            {syncing ? '⟳' : newCount !== null ? `+${newCount} new` : t('sync')}
          </button>
          <button
            onClick={() => onRemove(item.item_id)}
            style={{
              padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
              background: 'var(--bg-input)', cursor: 'pointer', fontSize: '0.8rem',
              color: 'var(--expense)',
            }}
          >
            {t('unlink')}
          </button>
        </div>
      </div>

      {/* Account cards */}
      {item.accounts.map(account => (
        <AccountCard key={account.account_id} account={{...account, institution: item.institution}} />
      ))}
    </div>
  )
}

export default function LinkedAccountsPage() {
  const { t } = useTranslation()
  const { items, totalBankBalance, loading, error, removeItem, refreshAccounts, syncTransactions } = usePlaid()
  const [showLink, setShowLink] = useState(false)

  return (
    <div style={{flex: 1}}>
      <TopBar title={t('linkedAccounts')} />
      <div className="page">

        {/* Total balance across all accounts */}
        {items.length > 0 && (
          <div className="card-gradient" style={{marginTop: 16, marginBottom: 24}}>
            <p style={{color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginBottom: 6}}>
              {t('totalBankBalance')}
            </p>
            <h1 style={{color: 'white', fontSize: '2.2rem', fontWeight: 900, marginBottom: 4}}>
              {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(totalBankBalance)}
            </h1>
            <p style={{color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem'}}>
              {items.reduce((s, i) => s + i.accounts.length, 0)} {t('accountsLinked')} · {items.length} {t('banks')}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FFF0F0', border: '1px solid #FFD0D0', color: 'var(--expense)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: '0.88rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !loading && (
          <div className="empty-state" style={{paddingTop: 40}}>
            <div className="empty-icon">🏦</div>
            <h3 style={{marginBottom: 8, color: 'var(--text-primary)'}}>{t('noAccountsLinked')}</h3>
            <p style={{marginBottom: 24, color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto 24px'}}>
              {t('linkAccountDesc')}
            </p>
            <PlaidLinkButton onSuccess={() => setShowLink(false)}>
              🏦 {t('linkBankAccount')}
            </PlaidLinkButton>
          </div>
        )}

        {/* Institution groups */}
        {items.map(item => (
          <InstitutionGroup
            key={item.item_id}
            item={item}
            onRemove={removeItem}
            onRefresh={refreshAccounts}
            onSync={syncTransactions}
          />
        ))}

        {/* Add another bank */}
        {items.length > 0 && (
          <div style={{marginTop: 8}}>
            <PlaidLinkButton
              onSuccess={() => {}}
              style={{background: 'var(--bg-input)', color: 'var(--primary)', boxShadow: 'none', border: '1.5px dashed var(--primary)'}}
            >
              + {t('addAnotherBank')}
            </PlaidLinkButton>
          </div>
        )}

        {/* Security note */}
        <div style={{
          marginTop: 24, padding: '14px 16px',
          background: 'var(--bg-input)', borderRadius: 14,
          border: '1px solid var(--border)',
        }}>
          <p style={{fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6}}>
            🔒 <strong style={{color: 'var(--text-secondary)'}}>Bank-level security.</strong>{' '}
            {t('plaidSecurityNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
