import { createContext, useContext, useEffect, useState } from 'react'

// In production, replace mock email/password with AWS Amplify:
// import { signIn, signOut, signUp, getCurrentUser, confirmSignIn } from 'aws-amplify/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mfaPending, setMfaPending] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('bb-session')
    if (session) {
      try { setUser(JSON.parse(session)) } catch {}
    }
    setLoading(false)
  }, [])

  const persist = (u) => {
    setUser(u)
    localStorage.setItem('bb-session', JSON.stringify(u))
  }

  // --- Email/Password Sign In (demo mode) ---
  const signIn = async (email, password) => {
    if (email && password) {
      persist({ userId: email, email, name: email.split('@')[0], avatar: null })
      return { mfaRequired: false }
    }
    throw new Error('Invalid credentials')
  }

  // --- Google OAuth (real) ---
  // Called from LoginPage after @react-oauth/google resolves the access token
  // and we've fetched the user profile from Google's userinfo endpoint.
  const signInWithGoogle = async (googleProfile) => {
    const u = {
      userId: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.picture,
      provider: 'google',
    }
    persist(u)
  }

  // --- Facebook (demo — real implementation needs Facebook JS SDK) ---
  const signInWithFacebook = async () => {
    persist({
      userId: 'fb-demo',
      email: '',
      name: 'Facebook User',
      avatar: null,
      provider: 'facebook',
    })
  }

  // --- 2FA ---
  const confirmMFA = async (code) => {
    if (code.length === 6) {
      const current = user || JSON.parse(localStorage.getItem('bb-session') || '{}')
      persist(current)
      setMfaPending(false)
      return true
    }
    throw new Error('Invalid code')
  }

  // --- Sign Up ---
  const signUp = async (email, password) => {
    return { nextStep: 'DONE' }
  }

  // --- Sign Out ---
  const signOut = () => {
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
