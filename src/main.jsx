import React from 'react'
import ReactDOM from 'react-dom/client'
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <PlaidProvider>
            <App />
          </PlaidProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
