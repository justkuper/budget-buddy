# Budget Buddy 💰

A bold, colorful mobile budget app built with React.

## Features
- 📊 Dashboard with spending overview and charts
- 💸 Income & expense tracking by category
- 🎯 Monthly budget goals with progress bars
- 📋 Bills tracker with recurring payments
- 📈 Reports with bar charts and category breakdown
- 🌙 Dark / Light mode
- 🌐 English / Spanish language support
- 🔐 Google, Facebook, and email auth (AWS Cognito + 2FA)
- 📱 Mobile-first, works on all screen sizes

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication Setup (Production)

1. Create an AWS Cognito User Pool
2. Enable Google and Facebook as identity providers
3. Enable TOTP-based MFA
4. Copy `.env.example` → `.env` and fill in your values
5. In `src/main.jsx`, uncomment the Amplify configuration lines

## Deploy to Netlify

```bash
npm run build
# Then drag the `dist/` folder to Netlify, or connect your repo
```

The `netlify.toml` is pre-configured for SPA routing.

## Tech Stack
- React 18 + Vite
- React Router 6
- Recharts (charts)
- AWS Amplify (auth)
- i18next (translations)
- CSS Variables (theming)
