import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'
import TopBar from '../../components/Layout/TopBar'
import TransactionSheet from '../../components/Transactions/TransactionSheet'
import './Transactions.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { transactions, categories, deleteTransaction } = useData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = transactions.filter(tx => {
    if (filter === 'income' && tx.type !== 'income') return false
    if (filter === 'expense' && tx.type !== 'expense') return false
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = filtered.reduce((acc, tx) => {
    const day = new Date(tx.date).toDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(tx)
    return acc
  }, {})

  return (
    <div style={{flex:1}}>
      <TopBar title={t('transactions')} />

      <div className="page">
        {/* Search */}
        <div style={{margin: '16px 0 12px', position: 'relative'}}>
          <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem'}}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            style={{paddingLeft: 40}}
          />
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          {['all', 'income', 'expense'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? t('filterAll') : f === 'income' ? t('filterIncome') : t('filterExpense')}
            </button>
          ))}
        </div>

        {/* Grouped List */}
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>{t('noTransactions')}</p>
            <button className="btn btn-primary" style={{marginTop:16, width:'auto', padding:'12px 24px'}} onClick={() => setShowAdd(true)}>
              {t('addFirst')}
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([day, txs]) => (
            <div key={day} style={{marginBottom: 20}}>
              <p className="day-label">
                {(() => {
                  const d = new Date(day)
                  const today = new Date()
                  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1)
                  if (d.toDateString() === today.toDateString()) return t('today')
                  if (d.toDateString() === yesterday.toDateString()) return t('yesterday')
                  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                })()}
              </p>
              <div className="card" style={{padding: 0, overflow:'hidden'}}>
                {txs.map((tx, i) => (
                  <div key={tx.id} className={`tx-row ${i < txs.length-1 ? 'tx-row-border' : ''}`}
                    onClick={() => setConfirmDelete(tx.id)}
                    style={{cursor:'pointer'}}
                  >
                    <div className="tx-icon" style={{background: categories[tx.category]?.color + '25'}}>
                      {categories[tx.category]?.icon}
                    </div>
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description}</p>
                      <span className={`badge badge-${tx.type}`} style={{fontSize:'0.7rem'}}>
                        {t(tx.type)}
                      </span>
                    </div>
                    <p className={`tx-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>+</button>

      {showAdd && <TransactionSheet onClose={() => setShowAdd(false)} />}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="sheet" style={{padding: 24}}>
            <div className="sheet-handle" />
            <p style={{fontWeight:700, marginBottom:8}}>Delete transaction?</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:20}}>This cannot be undone.</p>
            <div style={{display:'flex', gap:10}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setConfirmDelete(null)}>{t('cancel')}</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={() => { deleteTransaction(confirmDelete); setConfirmDelete(null) }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tx-row { display:flex; align-items:center; gap:12px; padding:14px 16px; transition:background 0.15s; }
        .tx-row:active { background: var(--bg); }
        .tx-row-border { border-bottom: 1px solid var(--border); }
        .tx-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
        .tx-info { flex:1; min-width:0; }
        .tx-desc { font-weight:600; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tx-amount { font-weight:700; font-size:0.95rem; white-space:nowrap; }
        .day-label { font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px; }
      `}</style>
    </div>
  )
}
