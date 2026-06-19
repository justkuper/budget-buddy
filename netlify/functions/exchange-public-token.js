/**
 * POST /api/exchange-public-token
 * Body: { public_token: string, institution: { name, institution_id }, accounts: [...] }
 *
 * Exchanges the short-lived public_token for a permanent access_token.
 *
 * ⚠️  PRODUCTION NOTE:
 * Store the access_token in a secure database (e.g. DynamoDB, RDS) keyed by userId.
 * NEVER return the access_token to the client.
 * This demo returns item_id only; the client stores metadata (institution name/accounts).
 */
import { plaidClient, ok, err, corsHeaders } from './_plaid-client.js'

// In-memory store — replace with a real DB in production
const tokenStore = {}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405)

  try {
    const { public_token, institution, accounts, userId } = JSON.parse(event.body || '{}')
    if (!public_token) return err('public_token is required', 400)

    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = response.data

    // Store securely (in-memory here; use DB in production)
    tokenStore[item_id] = { access_token, userId }

    // Fetch account balances immediately after exchange
    const balanceResponse = await plaidClient.accountsBalanceGet({ access_token })
    const accountsWithBalance = balanceResponse.data.accounts.map(a => ({
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

    return ok({
      item_id,
      institution: institution || { name: 'Bank', institution_id: '' },
      accounts: accountsWithBalance,
    })
  } catch (e) {
    console.error('exchange-public-token error:', e?.response?.data || e.message)
    return err(e?.response?.data?.error_message || 'Failed to exchange token')
  }
}

// Expose store for use by other functions (serverless functions share module scope per warm instance)
export { tokenStore }
