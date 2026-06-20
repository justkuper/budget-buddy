import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'
import TopBar from '../../components/Layout/TopBar'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function daysUntil(iso) {
  const diff = new Date(iso) - new Date()
  return Math.ceil(diff / 86400000)
}

function BillCard({ bill, category, onTogglePaid, onDelete, t }) {
  const days = daysUntil(bill.dueDate)
  const overdue = days < 0
  const soon = days >= 0 && days <= 3

  return (
    <div className="card" style={{marginBottom:12, opacity: bill.paid ? 0.6 : 1}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background: category?.color + '25',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem',
          flexShrink:0,
        }}>
          {category?.icon}
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <p style={{fontWeight:700, fontSize:'0.95rem'}}>{bill.name}</p>
            {bill.paid && <span className="badge badge-income">{t('paid')}</span>}
            {!bill.paid && overdue && <span className="badge badge-expense">{t('overdue')}</span>}
            {!bill.paid && soon && !overdue && <span style={{fontSize:'0.7rem', color:'#FFB347', fontWeight:700}}>⚠️ {t('dueIn')} {days} {t('days')}</span>}
          </div>
          <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2}}>
            {bill.recurring && `${t(bill.recurring)} · `}
            {new Date(bill.dueDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
          </p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{fontWeight:800, fontSize:'1rem', color: bill.paid ? 'var(--text-muted)' : overdue ? 'var(--expense)' : 'var(--text-primary)'}}>
            {formatCurrency(bill.amount)}
          </p>
        </div>
      </div>

      <div style={{display:'flex', gap:8, marginTop:12}}>
        {!bill.paid && (
          <button
            className="btn"
            style={{
              flex:2, padding:'9px', fontSize:'0.85rem',
              background: 'linear-gradient(135deg, var(--income), #00A87A)',
              color:'white', borderRadius:10, border:'none',
            }}
            onClick={onTogglePaid}
          >
            ✓ {t('markPaid')}
          </button>
        )}
        {bill.paid && (
          <button className="btn btn-secondary" style={{flex:2, padding:'9px', fontSize:'0.85rem'}} onClick={onTogglePaid}>
            ↩ {t('unpaid')}
          </button>
        )}
        <button
          className="btn btn-danger"
          style={{flex:1, padding:'9px', fontSize:'0.85rem'}}
          onClick={onDelete}
        >
          {t('delete')}
        </button>
      </div>
    </div>
  )
}

export default function BillsPage() {
  const { t } = useTranslation()
  const { bills, categories, addBill, deleteBill, toggleBillPaid } = useData()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [recurring, setRecurring] = useState('monthly')
  const [category, setCategory] = useState('housing')

  const ALL_CATS = ['food', 'transport', 'shopping', 'health', 'entertainment', 'housing', 'other']

  const sortedBills = [...bills].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  const totalUnpaid = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
  const overdueCount = bills.filter(b => !b.paid && daysUntil(b.dueDate) < 0).length

  const handleAdd = () => {
    if (!name || !amount) return
    addBill({
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate).toISOString(),
      recurring,
      category,
    })
    setName(''); setAmount(''); setShowAdd(false)
  }

  return (
    <div style={{flex:1}}>
      <TopBar title={t('upcomingBills')} />
      <div className="page">

        {/* Summary */}
        {bills.length > 0 && (
          <div style={{display:'flex', gap:12, marginTop:16, marginBottom:20}}>
            <div className="card" style={{flex:1, textAlign:'center'}}>
              <p style={{fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4}}>{t('unpaid')}</p>
              <p style={{fontWeight:800, fontSize:'1.2rem', color:'var(--expense)'}}>{formatCurrency(totalUnpaid)}</p>
            </div>
            {overdueCount > 0 && (
              <div className="card" style={{flex:1, textAlign:'center', borderColor:'#FF6B6B'}}>
                <p style={{fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4}}>{t('overdue')}</p>
                <p style={{fontWeight:800, fontSize:'1.2rem', color:'var(--expense)'}}>{overdueCount} bills</p>
              </div>
            )}
          </div>
        )}

        {bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{t('noBills')}</p>
            <button className="btn btn-primary" style={{marginTop:16, width:'auto', padding:'12px 24px'}} onClick={() => setShowAdd(true)}>
              {t('addFirstBill')}
            </button>
          </div>
        ) : (
          sortedBills.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              category={categories[bill.category]}
              onTogglePaid={() => toggleBillPaid(bill.id)}
              onDelete={() => deleteBill(bill.id)}
              t={t}
            />
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>+</button>

      {showAdd && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <h3 style={{marginBottom:20}}>{t('addBill')}</h3>
            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Netflix, Rent..." autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">{t('amount')}</label>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontWeight:700,color:'var(--text-secondary)'}}>$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{paddingLeft:28}} />
              </div>
            </div>
            <div style={{display:'flex', gap:10}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">{t('dueDate')}</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">{t('recurring')}</label>
                <select value={recurring} onChange={e => setRecurring(e.target.value)}>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                  <option value="yearly">{t('yearly')}</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {ALL_CATS.map(c => (
                  <option key={c} value={c}>{categories[c]?.icon} {t(c)}</option>
                ))}
              </select>
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
