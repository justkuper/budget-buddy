/**
 * POST /api/get-accounts
 * Body: { item_id: string }
 *
 * Refreshes account balances for a linked item.
 * In production: look up access_token from DB using item_id.
 */
import { plaidClient, ok, err, corsHeaders } from './_plaid-client.js'
import { tokenStore } from './exchange-public-token.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405)

  try {
    const { item_id } = JSON.parse(event.body || '{}')
    if (!item_id) return err('item_id is required', 400)

    const record = tokenStore[item_id]
    if (!record) return err('Item not found — re-link your account', 404)

    const response = await plaidClient.accountsBalanceGet({ access_token: record.access_token })

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

    return ok({ accounts })
  } catch (e) {
    console.error('get-accounts error:', e?.response?.data || e.message)
    return err(e?.response?.data?.error_message || 'Failed to fetch accounts')
  }
}
