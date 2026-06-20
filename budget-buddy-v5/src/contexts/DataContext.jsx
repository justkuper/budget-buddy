import { createContext, useContext, useEffect, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

const DataContext = createContext()

// Bump this version any time you need to wipe old cached data
const DATA_VERSION = '2'

const CATEGORIES = {
  food:          { label: 'food',          icon: '🍔', color: '#FF6B6B' },
  transport:     { label: 'transport',     icon: '🚗', color: '#4ECDC4' },
  shopping:      { label: 'shopping',      icon: '🛍️',  color: '#FFB347' },
  health:        { label: 'health',        icon: '💊', color: '#95E1D3' },
  entertainment: { label: 'entertainment', icon: '🎬', color: '#F38181' },
  housing:       { label: 'housing',       icon: '🏠', color: '#6C63FF' },
  salary:        { label: 'salary',        icon: '💼', color: '#00C896' },
  freelance:     { label: 'freelance',     icon: '💻', color: '#00C896' },
  investment:    { label: 'investment',    icon: '📈', color: '#00C896' },
  other:         { label: 'other',         icon: '📦', color: '#A8A4CE' },
}

const EMPTY_STATE = {
  transactions: [],
  budgets: [],
  bills: [],
}

function loadState() {
  try {
    // If the stored version doesn't match, wipe old data (removes seed data for existing users)
    const storedVersion = localStorage.getItem('bb-data-version')
    if (storedVersion !== DATA_VERSION) {
      localStorage.removeItem('bb-data')
      localStorage.setItem('bb-data-version', DATA_VERSION)
      return EMPTY_STATE
    }
    const raw = localStorage.getItem('bb-data')
    if (raw) return JSON.parse(raw)
  } catch {}
  return EMPTY_STATE
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
    case 'IMPORT_TRANSACTIONS': {
      // Merge Plaid transactions — skip any already present by id
      const existingIds = new Set(state.transactions.map(t => t.id))
      const newOnes = action.payload.filter(t => !existingIds.has(t.id))
      return { ...state, transactions: [...newOnes, ...state.transactions] }
    }
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.id) }
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] }
    case 'DELETE_BILL':
      return { ...state, bills: state.bills.filter(b => b.id !== action.id) }
    case 'TOGGLE_BILL_PAID':
      return { ...state, bills: state.bills.map(b => b.id === action.id ? { ...b, paid: !b.paid } : b) }
    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem('bb-data', JSON.stringify(state))
  }, [state])

  const addTransaction = (tx) =>
    dispatch({ type: 'ADD_TRANSACTION', payload: { ...tx, id: uuidv4() } })

  const deleteTransaction = (id) => dispatch({ type: 'DELETE_TRANSACTION', id })

  // Called after Plaid sync — merges bank transactions without duplicates
  const importTransactions = (txList) =>
    dispatch({ type: 'IMPORT_TRANSACTIONS', payload: txList })

  const addBudget = (b) =>
    dispatch({ type: 'ADD_BUDGET', payload: { ...b, id: uuidv4() } })

  const deleteBudget = (id) => dispatch({ type: 'DELETE_BUDGET', id })

  const addBill = (bill) =>
    dispatch({ type: 'ADD_BILL', payload: { ...bill, id: uuidv4(), paid: false } })

  const deleteBill = (id) => dispatch({ type: 'DELETE_BILL', id })

  const toggleBillPaid = (id) => dispatch({ type: 'TOGGLE_BILL_PAID', id })

  // Derived totals (this month only)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyTransactions = state.transactions.filter(t => new Date(t.date) >= monthStart)
  const monthlyIncome   = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0)
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const spendingByCategory = {}
  monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
    spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount
  })

  return (
    <DataContext.Provider value={{
      transactions: state.transactions,
      budgets: state.budgets,
      bills: state.bills,
      categories: CATEGORIES,
      monthlyIncome,
      monthlyExpenses,
      spendingByCategory,
      addTransaction, deleteTransaction, importTransactions,
      addBudget, deleteBudget,
      addBill, deleteBill, toggleBillPaid,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
