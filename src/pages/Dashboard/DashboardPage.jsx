import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import TopBar from '../../components/Layout/TopBar'
import TransactionSheet from '../../components/Transactions/TransactionSheet'
import './Dashboard.css'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'goodMorning'
  if (h < 17) return 'goodAfternoon'
  return 'goodEvening'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { transactions, categories, monthlyIncome, monthlyExpenses, spendingByCategory } = useData()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)

  const balance = monthlyIncome - monthlyExpenses
  const recent = transactions.slice(0, 5)

  const pieData = Object.entries(spendingByCategory).map(([key, value]) => ({
    name: key,
    value,
    color: categories[key]?.color || '#A8A4CE',
    icon: categories[key]?.icon || '📦',
  })).sort((a, b) => b.value - a.value).slice(0, 5)

  return (
    <div className="dashboard">
      <TopBar />

      <div className="page">
        {/* Greeting */}
        <div className="greeting">
          <p className="greeting-text">{t(greeting())}, <strong>{user?.name?.split(' ')[0] || 'there'}</strong> 👋</p>
        </div>

        {/* Balance Card */}
        <div className="balance-card card-gradient">
          <p className="balance-label">{t('totalBalance')}</p>
          <h1 className="balance-amount">{formatCurrency(balance)}</h1>
          <div className="balance-row">
            <div className="balance-stat">
              <span className="stat-icon income">↑</span>
              <div>
                <p className="stat-label">{t('monthlyIncome')}</p>
                <p className="stat-value">{formatCurrency(monthlyIncome)}</p>
              </div>
            </div>
            <div className="balance-divider" />
            <div className="balance-stat">
              <span className="stat-icon expense">↓</span>
              <div>
                <p className="stat-label">{t('monthlyExpenses')}</p>
                <p className="stat-value">{formatCurrency(monthlyExpenses)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spending by Category Donut */}
        {pieData.length > 0 && (
          <div className="card" style={{marginTop: 20}}>
            <div className="section-header">
              <h3>{t('spendingOverview')}</h3>
            </div>
            <div className="chart-row">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {pieData.map((item, i) => (
                  <div key={i} className="legend-item">
                    <span className="cat-dot" style={{background: item.color}} />
                    <span className="legend-name">{item.icon} {t(item.name)}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div style={{marginTop: 20}}>
          <div className="section-header">
            <h3>{t('recentTransactions')}</h3>
            <button className="btn btn-ghost" onClick={() => navigate('/transactions')}>{t('viewAll')} →</button>
          </div>
          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
            {recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💸</div>
                <p>{t('noTransactions')}</p>
              </div>
            ) : (
              recent.map((tx, i) => (
                <div key={tx.id} className={`tx-row ${i < recent.length - 1 ? 'tx-row-border' : ''}`}>
                  <div className="tx-icon" style={{background: categories[tx.category]?.color + '25'}}>
                    {categories[tx.category]?.icon}
                  </div>
                  <div className="tx-info">
                    <p className="tx-desc">{tx.description}</p>
                    <p className="tx-date">{formatDate(tx.date)}</p>
                  </div>
                  <p className={`tx-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)}>+</button>

      {showAdd && <TransactionSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
