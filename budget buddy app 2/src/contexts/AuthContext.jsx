import { createContext, useContext, useEffect, useState } from 'react'

// In production, replace mock functions with AWS Amplify calls:
// import { signIn, signOut, signUp, getCurrentUser, confirmSignIn } from 'aws-amplify/auth'

const AuthContext = createContext()

const DEMO_USER = {
  userId: 'demo-user-1',
  email: 'demo@budgetbuddy.app',
  name: 'Alex Johnson',
  avatar: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mfaPending, setMfaPending] = useState(false)

  useEffect(() => {
    // Check persisted session
    const session = localStorage.getItem('bb-session')
    if (session) {
      setUser(JSON.parse(session))
    }
    setLoading(false)
  }, [])

  // --- Email/Password Sign In ---
  const signIn = async (email, password) => {
    // PRODUCTION: const result = await amplifySignIn({ username: email, password })
    // if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') { setMfaPending(true); return { mfaRequired: true } }

    // Demo mode
    if (email && password) {
      const u = { ...DEMO_USER, email }
      setUser(u)
      localStorage.setItem('bb-session', JSON.stringify(u))
      return { mfaRequired: false }
    }
    throw new Error('Invalid credentials')
  }

  // --- Google / Facebook OAuth ---
  const signInWithGoogle = async () => {
    // PRODUCTION: await signInWithRedirect({ provider: 'Google' })
    const u = { ...DEMO_USER, provider: 'google' }
    setUser(u)
    localStorage.setItem('bb-session', JSON.stringify(u))
  }

  const signInWithFacebook = async () => {
    // PRODUCTION: await signInWithRedirect({ provider: 'Facebook' })
    const u = { ...DEMO_USER, provider: 'facebook' }
    setUser(u)
    localStorage.setItem('bb-session', JSON.stringify(u))
  }

  // --- 2FA ---
  const confirmMFA = async (code) => {
    // PRODUCTION: await confirmSignIn({ challengeResponse: code })
    if (code.length === 6) {
      const u = { ...DEMO_USER }
      setUser(u)
      setMfaPending(false)
      localStorage.setItem('bb-session', JSON.stringify(u))
      return true
    }
    throw new Error('Invalid code')
  }

  // --- Sign Up ---
  const signUp = async (email, password) => {
    // PRODUCTION: await amplifySignUp({ username: email, password, options: { userAttributes: { email } } })
    return { nextStep: 'DONE' }
  }

  // --- Sign Out ---
  const signOut = () => {
    // PRODUCTION: await amplifySignOut()
    setUser(null)
    setMfaPending(false)
    localStorage.removeItem('bb-session')
  }

  return (
    <AuthContext.Provider value={{ user, loading, mfaPending, signIn, signInWithGoogle, signInWithFacebook, confirmMFA, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
