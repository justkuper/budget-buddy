import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './i18n/index.js'
import './styles/global.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { PlaidProvider } from './contexts/PlaidContext'
import App from './App'

// Optional: configure AWS Amplify for production
// import { Amplify } from 'aws-amplify'
// import { awsConfig } from './aws-config'
// Amplify.configure(awsConfig)

// VITE_GOOGLE_CLIENT_ID must be set in Netlify environment variables
// Get it at: https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client IDs
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PlaidProvider>
              <App />
            </PlaidProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
