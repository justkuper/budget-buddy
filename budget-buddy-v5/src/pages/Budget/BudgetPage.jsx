import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'
import TopBar from '../../components/Layout/TopBar'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
}

function BudgetCard({ budget, spent, category, onDelete, t }) {
  const pct = Math.min((spent / budget.limit) * 100, 100)
  const remaining = budget.limit - spent
  const over = spent > budget.limit

  return (
    <div className="card" style={{marginBottom: 12}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
        <div style={{
          width:44, height:44, borderRadius:14,
          background: category?.color + '25',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem'
        }}>
          {category?.icon}
        </div>
        <div style={{flex:1}}>
          <p style={{fontWeight:700, fontSize:'0.95rem'}}>{t(budget.category)}</p>
          <p style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>
            {formatCurrency(spent)} / {formatCurrency(budget.limit)}
          </p>
        </div>
        <span className={`badge ${over ? 'badge-expense' : 'badge-income'}`}>
          {over ? t('overBudget') : t('onTrack')}
        </span>
        <button
          onClick={onDelete}
          style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.2rem', padding:'4px'}}
        >×</button>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: over
              ? 'linear-gradient(90deg, #FF6B6B, #FF4757)'
              : pct > 80
              ? 'linear-gradient(90deg, #FFB347, #FFA000)'
              : `linear-gradient(90deg, ${category?.color || 'var(--primary)'}, ${category?.color || 'var(--primary-light)'})`,
          }}
        />
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:'0.8rem', color:'var(--text-secondary)'}}>
        <span>{Math.round(pct)}% {t('spent')}</span>
        <span style={{color: over ? 'var(--expense)' : 'var(--income)', fontWeight:600}}>
          {over ? `${formatCurrency(Math.abs(remaining))} ${t('overBudget')}` : `${formatCurrency(remaining)} ${t('remaining')}`}
        </span>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const { t } = useTranslation()
  const { budgets, categories, spendingByCategory, addBudget, deleteBudget } = useData()
  const [showAdd, setShowAdd] = useState(false)
  const [newCat, setNewCat] = useState('food')
  const [newLimit, setNewLimit] = useState('')

  const EXPENSE_CATS = ['food', 'transport', 'shopping', 'health', 'entertainment', 'housing', 'other']
  const existingCats = budgets.map(b => b.category)
  const availableCats = EXPENSE_CATS.filter(c => !existingCats.includes(c))

  const handleAdd = () => {
    if (!newLimit || isNaN(parseFloat(newLimit))) return
    addBudget({ category: newCat, limit: parseFloat(newLimit) })
    setNewLimit('')
    setShowAdd(false)
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + (spendingByCategory[b.category] || 0), 0)
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  return (
    <div style={{flex:1}}>
      <TopBar title={t('budgetGoals')} />
      <div className="page">

        {/* Summary card */}
        {budgets.length > 0 && (
          <div className="card-gradient" style={{marginTop:16, marginBottom:20}}>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'0.85rem', marginBottom:4}}>{t('monthlyBudget')}</p>
            <h2 style={{color:'white', marginBottom:4}}>{formatCurrency(totalBudget)}</h2>
            <p style={{color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', marginBottom:16}}>
              {formatCurrency(totalSpent)} {t('spent')} · {formatCurrency(Math.max(totalBudget - totalSpent, 0))} {t('remaining')}
            </p>
            <div style={{background:'rgba(255,255,255,0.2)', borderRadius:100, height:8, overflow:'hidden'}}>
              <div style={{height:'100%', borderRadius:100, width:`${overallPct}%`, background:'white', transition:'width 0.5s'}} />
            </div>
          </div>
        )}

        {/* Budget items */}
        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>{t('noBudgets')}</p>
            <button className="btn btn-primary" style={{marginTop:16, width:'auto', padding:'12px 24px'}} onClick={() => setShowAdd(true)}>
              {t('setBudget')}
            </button>
          </div>
        ) : (
          budgets.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={spendingByCategory[b.category] || 0}
              category={categories[b.category]}
              onDelete={() => deleteBudget(b.id)}
              t={t}
            />
          ))
        )}
      </div>

      {availableCats.length > 0 && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}

      {showAdd && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <h3 style={{marginBottom:20}}>{t('addBudget')}</h3>
            <div className="form-group">
              <label className="form-label">{t('category')}</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                {availableCats.map(c => (
                  <option key={c} value={c}>{categories[c]?.icon} {t(c)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('budgetLimit')}</label>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--text-secondary)'}}>$</span>
                <input
                  type="number"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  placeholder="0"
                  style={{paddingLeft:28}}
                  autoFocus
                />
              </div>
            </div>
            <div style={{display:'flex', gap:10, marginTop:8}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setShowAdd(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{flex:2}} onClick={handleAdd}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
