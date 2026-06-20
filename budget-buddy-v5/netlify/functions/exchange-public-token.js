/**
 * POST /api/exchange-public-token
 * Body: { public_token, institution, accounts, userId }
 *
 * Exchanges the short-lived public_token for a permanent access_token,
 * then fetches live account balances.
 *
 * ⚠️  DEMO NOTE: This returns the access_token to the client so the app works
 * without a database. In production, store it server-side (DynamoDB, etc.)
 * and NEVER return it to the client.
 */
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function getPlaidClient() {
  const env = process.env.PLAID_ENV || 'sandbox'
  const config = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
  return new PlaidApi(config)
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { public_token, institution, accounts } = JSON.parse(event.body || '{}')
    if (!public_token) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'public_token is required' }) }

    const client = getPlaidClient()

    // Exchange public token for access token
    const exchangeRes = await client.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = exchangeRes.data

    // Fetch live balances immediately
    const balanceRes = await client.accountsBalanceGet({ access_token })
    const liveAccounts = balanceRes.data.accounts.map(a => ({
      account_id: a.account_id,
      name: a.name,
      official_name: a.official_name,
      type: a.type,
      subtype: a.subtype,
      mask: a.mask,
      balances: {
        available: a.balances.available,
        current: a.balances.current,
        iso_currency_code: a.balances.iso_currency_code,
      },
    }))

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        item_id,
        access_token, // demo only — store server-side in production
        institution: institution || { name: 'Bank', institution_id: '' },
        accounts: liveAccounts,
      }),
    }
  } catch (e) {
    console.error('exchange-public-token:', e?.response?.data || e.message)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e?.response?.data?.error_message || 'Failed to exchange token' }),
    }
  }
}
