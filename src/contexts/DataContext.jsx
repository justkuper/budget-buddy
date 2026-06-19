import { createContext, useContext, useEffect, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

const DataContext = createContext()

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

const SEED_TRANSACTIONS = [
  { id: uuidv4(), type: 'income',  amount: 4500, category: 'salary',        description: 'Monthly Salary',   date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 850,  category: 'housing',       description: 'Rent',             date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 120,  category: 'food',          description: 'Groceries',        date: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 45,   category: 'entertainment', description: 'Netflix + Spotify',date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 60,   category: 'transport',     description: 'Gas',              date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: uuidv4(), type: 'income',  amount: 800,  category: 'freelance',     description: 'Design project',  date: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 200,  category: 'shopping',      description: 'Clothes',          date: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: uuidv4(), type: 'expense', amount: 80,   category: 'health',        description: 'Pharmacy',         date: new Date(Date.now() - 86400000 * 8).toISOString() },
]

const SEED_BUDGETS = [
  { id: uuidv4(), category: 'food',          limit: 400 },
  { id: uuidv4(), category: 'transport',     limit: 200 },
  { id: uuidv4(), category: 'entertainment', limit: 100 },
  { id: uuidv4(), category: 'shopping',      limit: 300 },
  { id: uuidv4(), category: 'health',        limit: 150 },
]

const SEED_BILLS = [
  { id: uuidv4(), name: 'Netflix',    amount: 15.99, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),  recurring: 'monthly', paid: false, category: 'entertainment' },
  { id: uuidv4(), name: 'Rent',       amount: 850,   dueDate: new Date(Date.now() + 86400000 * 12).toISOString(), recurring: 'monthly', paid: false, category: 'housing' },
  { id: uuidv4(), name: 'Internet',   amount: 60,    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),  recurring: 'monthly', paid: false, category: 'housing' },
  { id: uuidv4(), name: 'Car Insurance', amount: 120, dueDate: new Date(Date.now() + 86400000 * 20).toISOString(), recurring: 'monthly', paid: false, category: 'transport' },
  { id: uuidv4(), name: 'Gym',        amount: 40,    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),  recurring: 'monthly', paid: false, category: 'health' },
]

function loadState() {
  try {
    const raw = localStorage.getItem('bb-data')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    transactions: SEED_TRANSACTIONS,
    budgets: SEED_BUDGETS,
    bills: SEED_BILLS,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
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

  const addTransaction = (tx) => dispatch({ type: 'ADD_TRANSACTION', payload: { ...tx, id: uuidv4() } })
  const deleteTransaction = (id) => dispatch({ type: 'DELETE_TRANSACTION', id })
  const addBudget = (b) => dispatch({ type: 'ADD_BUDGET', payload: { ...b, id: uuidv4() } })
  const deleteBudget = (id) => dispatch({ type: 'DELETE_BUDGET', id })
  const addBill = (bill) => dispatch({ type: 'ADD_BILL', payload: { ...bill, id: uuidv4(), paid: false } })
  const deleteBill = (id) => dispatch({ type: 'DELETE_BILL', id })
  const toggleBillPaid = (id) => dispatch({ type: 'TOGGLE_BILL_PAID', id })

  // Derived data
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyTransactions = state.transactions.filter(t => new Date(t.date) >= monthStart)
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Spending by category this month
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
      addTransaction, deleteTransaction,
      addBudget, deleteBudget,
      addBill, deleteBill, toggleBillPaid,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
