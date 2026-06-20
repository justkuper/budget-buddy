import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useData } from '../../contexts/DataContext'
import TopBar from '../../components/Layout/TopBar'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
}

const PERIODS = ['thisMonth', 'lastMonth', 'last3Months', 'last6Months', 'thisYear']

export default function ReportsPage() {
  const { t } = useTranslation()
  const { transactions, categories } = useData()
  const [period, setPeriod] = useState('thisMonth')

  const { filtered, income, expenses, savings } = useMemo(() => {
    const now = new Date()
    let start
    if (period === 'thisMonth') start = new Date(now.getFullYear(), now.getMonth(), 1)
    else if (period === 'lastMonth') { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); start = d }
    else if (period === 'last3Months') start = new Date(now.getFullYear(), now.getMonth()-2, 1)
    else if (period === 'last6Months') start = new Date(now.getFullYear(), now.getMonth()-5, 1)
    else start = new Date(now.getFullYear(), 0, 1)

    const end = period === 'lastMonth'
      ? new Date(now.getFullYear(), now.getMonth(), 0)
      : now

    const f = transactions.filter(tx => {
      const d = new Date(tx.date)
      return d >= start && d <= end
    })
    const inc = f.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
    const exp = f.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)
    return { filtered: f, income: inc, expenses: exp, savings: inc - exp }
  }, [transactions, period])

  // Spending by category for pie
  const catData = useMemo(() => {
    const map = {}
    filtered.filter(tx => tx.type === 'expense').forEach(tx => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount
    })
    return Object.entries(map)
      .map(([k, v]) => ({ name: t(k), value: v, color: categories[k]?.color || '#A8A4CE', icon: categories[k]?.icon }))
      .sort((a, b) => b.value - a.value)
  }, [filtered, categories, t])

  // Monthly trend (last 6 months)
  const trendData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const start = d
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const inc = transactions.filter(tx => tx.type === 'income' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, tx) => s + tx.amount, 0)
      const exp = transactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, tx) => s + tx.amount, 0)
      months.push({ month: label, income: inc, expenses: exp })
    }
    return months
  }, [transactions])

  return (
    <div style={{flex:1}}>
      <TopBar title={t('reports')} />
      <div className="page">

        {/* Period selector */}
        <div className="filter-pills" style={{marginTop:16}}>
          {PERIODS.map(p => (
            <button key={p} className={`pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {t(p)}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:16, marginBottom:20}}>
          <div className="card" style={{padding:'14px 12px', textAlign:'center'}}>
            <p style={{fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:4}}>{t('totalEarned')}</p>
            <p style={{fontWeight:800, fontSize:'0.95rem', color:'var(--income)'}}>{formatCurrency(income)}</p>
          </div>
          <div className="card" style={{padding:'14px 12px', textAlign:'center'}}>
            <p style={{fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:4}}>{t('totalSpent')}</p>
            <p style={{fontWeight:800, fontSize:'0.95rem', color:'var(--expense)'}}>{formatCurrency(expenses)}</p>
          </div>
          <div className="card" style={{padding:'14px 12px', textAlign:'center'}}>
            <p style={{fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:4}}>{t('netSavings')}</p>
            <p style={{fontWeight:800, fontSize:'0.95rem', color: savings >= 0 ? 'var(--income)' : 'var(--expense)'}}>{formatCurrency(savings)}</p>
          </div>
        </div>

        {/* 6-Month Bar Chart */}
        <div className="card" style={{marginBottom:20}}>
          <h3 style={{marginBottom:16}}>6-Month Overview</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{fontSize:11, fill:'var(--text-muted)'}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v, name) => [formatCurrency(v), name === 'income' ? t('income') : t('expense')]}
                contentStyle={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:12}}
              />
              <Bar dataKey="income" fill="#00C896" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" fill="#FF6B6B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex', gap:16, justifyContent:'center', marginTop:8}}>
            <span style={{display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)'}}>
              <span style={{width:10,height:10,borderRadius:2,background:'#00C896',display:'inline-block'}} /> {t('income')}
            </span>
            <span style={{display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)'}}>
              <span style={{width:10,height:10,borderRadius:2,background:'#FF6B6B',display:'inline-block'}} /> {t('expense')}
            </span>
          </div>
        </div>

        {/* Category breakdown */}
        {catData.length > 0 && (
          <div className="card" style={{marginBottom:20}}>
            <h3 style={{marginBottom:16}}>{t('byCategory')}</h3>
            {catData.map((item, i) => (
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5}}>
                  <span style={{fontSize:'0.88rem', fontWeight:600}}>{item.icon} {item.name}</span>
                  <span style={{fontSize:'0.88rem', fontWeight:700}}>{formatCurrency(item.value)}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(item.value / (catData[0]?.value || 1)) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
