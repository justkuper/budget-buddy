/**
 * POST /api/create-link-token
 * Body: { userId: string }
 *
 * Creates a Plaid Link token so the frontend can open the Plaid Link UI.
 */
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid'

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
    const { userId } = JSON.parse(event.body || '{}')
    if (!userId) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'userId is required' }) }

    const client = getPlaidClient()
    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Budget Buddy',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ link_token: response.data.link_token }) }
  } catch (e) {
    console.error('create-link-token:', e?.response?.data || e.message)
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e?.response?.data?.error_message || 'Failed to create link token' }) }
  }
}
