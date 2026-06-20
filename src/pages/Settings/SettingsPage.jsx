import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePlaid } from '../../contexts/PlaidContext'
import { useNavigate, Link } from 'react-router-dom'
import TopBar from '../../components/Layout/TopBar'

function SettingRow({ icon, label, children, danger }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 0', borderBottom:'1px solid var(--border)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <span style={{fontSize:'1.2rem'}}>{icon}</span>
        <span style={{fontWeight:500, fontSize:'0.95rem', color: danger ? 'var(--expense)' : 'var(--text-primary)'}}>{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { items, allAccounts } = usePlaid()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/auth/login')
  }

  return (
    <div style={{flex:1}}>
      <TopBar title={t('settings')} showBack onBack={() => navigate(-1)} />
      <div className="page">
        {/* Profile */}
        <div className="card" style={{marginTop:20, display:'flex', alignItems:'center', gap:16}}>
          <div style={{
            width:60, height:60, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', color:'white', fontWeight:800,
          }}>
            {(user?.name || 'U')[0]}
          </div>
          <div>
            <p style={{fontWeight:700, fontSize:'1.05rem'}}>{user?.name || 'User'}</p>
            <p style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{user?.email}</p>
            {user?.provider && (
              <span className="badge badge-income" style={{marginTop:4}}>
                {user.provider === 'google' ? '🇬 Google' : '🇫 Facebook'}
              </span>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="card" style={{marginTop:16}}>
          <SettingRow icon="🌙" label={t('darkMode')}>
            <label className="switch">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <span className="switch-slider" />
            </label>
          </SettingRow>

          <SettingRow icon="🌐" label={t('language')}>
            <div style={{display:'flex', gap:6}}>
              <button
                onClick={() => i18n.changeLanguage('en')}
                style={{
                  padding:'5px 12px', borderRadius:8, border:'1.5px solid var(--border)',
                  background: i18n.language === 'en' ? 'var(--primary)' : 'var(--bg-input)',
                  color: i18n.language === 'en' ? 'white' : 'var(--text-primary)',
                  fontWeight:600, cursor:'pointer', fontSize:'0.85rem',
                }}
              >🇺🇸 EN</button>
              <button
                onClick={() => i18n.changeLanguage('es')}
                style={{
                  padding:'5px 12px', borderRadius:8, border:'1.5px solid var(--border)',
                  background: i18n.language === 'es' ? 'var(--primary)' : 'var(--bg-input)',
                  color: i18n.language === 'es' ? 'white' : 'var(--text-primary)',
                  fontWeight:600, cursor:'pointer', fontSize:'0.85rem',
                }}
              >🇪🇸 ES</button>
            </div>
          </SettingRow>

          <SettingRow icon="🔐" label="Two-Factor Auth">
            <button className="btn btn-secondary" style={{padding:'6px 14px', fontSize:'0.85rem'}} onClick={() => navigate('/auth/2fa-setup')}>
              {t('setupTwoFactor')}
            </button>
          </SettingRow>

          <SettingRow icon="💵" label={t('currency')}>
            <span style={{color:'var(--text-secondary)', fontWeight:600}}>USD $</span>
          </SettingRow>
        </div>

        {/* Bank Accounts */}
        <div className="card" style={{marginTop:16}}>
          <SettingRow icon="🏦" label={t('linkedAccounts')}>
            <Link
              to="/linked-accounts"
              style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'6px 14px', borderRadius:8, background:'var(--primary)',
                color:'white', fontWeight:600, fontSize:'0.85rem', textDecoration:'none',
              }}
            >
              {allAccounts.length > 0 ? `${allAccounts.length} connected` : 'Connect'} →
            </Link>
          </SettingRow>
        </div>

        <div className="card" style={{marginTop:16}}>
          <SettingRow icon="🔔" label={t('notifications')}>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="switch-slider" />
            </label>
          </SettingRow>
        </div>

        <div className="card" style={{marginTop:16}}>
          <SettingRow icon="🚪" label={t('signOut')} danger>
            <button
              className="btn btn-danger"
              style={{padding:'7px 16px', fontSize:'0.85rem'}}
              onClick={handleSignOut}
            >
              {t('signOut')}
            </button>
          </SettingRow>
        </div>

        <p style={{textAlign:'center', color:'var(--text-muted)', fontSize:'0.78rem', marginTop:32}}>
          Budget Buddy v1.0.0<br />
          Made with ❤️ for smarter spending
        </p>
      </div>
    </div>
  )
}
