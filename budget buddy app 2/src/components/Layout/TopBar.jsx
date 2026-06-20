import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import './TopBar.css'

export default function TopBar({ title, showBack, onBack }) {
  const { isDark, toggleTheme } = useTheme()
  const { i18n } = useTranslation()
  const { user, signOut } = useAuth()

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')
  }

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {showBack ? (
          <button className="icon-btn" onClick={onBack}>←</button>
        ) : (
          <div className="app-logo">💰</div>
        )}
        {title && <h2 className="top-bar-title">{title}</h2>}
      </div>
      <div className="top-bar-right">
        <button className="icon-btn" onClick={toggleLang} title="Toggle language">
          {i18n.language === 'en' ? '🇺🇸' : '🇪🇸'}
        </button>
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {isDark ? '☀️' : '🌙'}
        </button>
        <Link to="/settings" className="icon-btn">
          {user?.avatar
            ? <img src={user.avatar} className="avatar" alt="avatar" />
            : <div className="avatar-initials">{(user?.name || 'U')[0]}</div>
          }
        </Link>
      </div>
    </header>
  )
}
