/**
 * POST /api/get-accounts
 * Body: { access_token }
 *
 * Refreshes live account balances for a linked item.
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
    const { access_token } = JSON.parse(event.body || '{}')
    if (!access_token) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'access_token is required' }) }

    const client = getPlaidClient()
    const response = await client.accountsBalanceGet({ access_token })

    const accounts = response.data.accounts.map(a => ({
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

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ accounts }) }
  } catch (e) {
    console.error('get-accounts:', e?.response?.data || e.message)
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e?.response?.data?.error_message || 'Failed to fetch accounts' }) }
  }
}
