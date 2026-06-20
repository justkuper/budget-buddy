import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'

const EXPENSE_CATS = ['food', 'transport', 'shopping', 'health', 'entertainment', 'housing', 'other']
const INCOME_CATS  = ['salary', 'freelance', 'investment', 'other']

export default function TransactionSheet({ onClose, defaultType = 'expense' }) {
  const { t } = useTranslation()
  const { addTransaction, categories } = useData()

  const [type, setType] = useState(defaultType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(type === 'expense' ? 'food' : 'salary')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) return
    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description: description || t(category),
      date: new Date(date).toISOString(),
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <h3 style={{marginBottom: 20}}>{t('addTransaction')}</h3>

        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => { setType('expense'); setCategory('food') }}
          >
            ↓ {t('expense')}
          </button>
          <button
            className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => { setType('income'); setCategory('salary') }}
          >
            ↑ {t('income')}
          </button>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">{t('amount')}</label>
          <div style={{position: 'relative'}}>
            <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontWeight:700, color:'var(--text-secondary)', fontSize:'1.1rem'}}>$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{paddingLeft: 30, fontSize: '1.2rem', fontWeight: 700}}
              autoFocus
            />
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">{t('category')}</label>
          <div className="cat-grid">
            {cats.map(c => (
              <button
                key={c}
                className={`cat-chip ${category === c ? 'cat-chip-active' : ''}`}
                onClick={() => setCategory(c)}
                style={category === c ? {borderColor: categories[c]?.color, background: categories[c]?.color + '20'} : {}}
              >
                <span>{categories[c]?.icon}</span>
                <span>{t(c)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">{t('description')}</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t(category)}
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div style={{display:'flex', gap:10, marginTop: 8}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" style={{flex:2}} onClick={handleSave}>{t('save')}</button>
        </div>
      </div>

      <style>{`
        .type-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
        .type-btn {
          flex: 1; padding: 10px; border-radius: 12px; border: 2px solid var(--border);
          background: var(--bg-input); color: var(--text-secondary); font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-size: 0.95rem;
        }
        .type-btn.active-expense { border-color: #FF6B6B; background: #FF6B6B20; color: #FF6B6B; }
        .type-btn.active-income  { border-color: #00C896; background: #00C89620; color: #00C896; }
        .cat-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .cat-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 100px; border: 1.5px solid var(--border);
          background: var(--bg-input); color: var(--text-primary); cursor: pointer;
          font-size: 0.82rem; font-weight: 600; transition: all 0.15s;
        }
        .cat-chip-active { font-weight: 700; }
      `}</style>
    </div>
  )
}
