import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './BottomNav.css'

const navItems = [
  { to: '/',             icon: '🏠', key: 'dashboard' },
  { to: '/transactions', icon: '💸', key: 'transactions' },
  { to: '/budget',       icon: '🎯', key: 'budget' },
  { to: '/bills',        icon: '📋', key: 'bills' },
  { to: '/reports',      icon: '📊', key: 'reports' },
]

export default function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.key}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{t(item.key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
