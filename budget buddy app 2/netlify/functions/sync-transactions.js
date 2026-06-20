/**
 * POST /api/sync-transactions
 * Body: { access_token, cursor? }
 *
 * Incrementally syncs transactions using Plaid's /transactions/sync.
 * Pass the cursor returned from the previous call to get only new changes.
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

function mapCategory(plaidCategory) {
  const map = {
    FOOD_AND_DRINK: 'food', GROCERIES: 'food', RESTAURANTS: 'food',
    TRAVEL: 'transport', TRANSPORTATION: 'transport',
    SHOPS: 'shopping', SHOPPING: 'shopping', GENERAL_MERCHANDISE: 'shopping',
    MEDICAL: 'health', HEALTHCARE: 'health',
    RECREATION: 'entertainment', ENTERTAINMENT: 'entertainment',
    RENT_AND_UTILITIES: 'housing', HOME: 'housing',
    INCOME: 'salary', TRANSFER_IN: 'income',
  }
  return map[(plaidCategory || '').toUpperCase()] || 'other'
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { access_token, cursor } = JSON.parse(event.body || '{}')
    if (!access_token) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'access_token is required' }) }

    const client = getPlaidClient()
    let added = [], modified = [], removed = [], nextCursor = cursor, hasMore = true

    while (hasMore) {
      const response = await client.transactionsSync({
        access_token,
        ...(nextCursor ? { cursor: nextCursor } : {}),
        count: 100,
      })
      const data = response.data
      added = added.concat(data.added)
      modified = modified.concat(data.modified)
      removed = removed.concat(data.removed)
      nextCursor = data.next_cursor
      hasMore = data.has_more
    }

    const mapTx = (tx) => ({
      id: tx.transaction_id,
      plaid_id: tx.transaction_id,
      account_id: tx.account_id,
      amount: Math.abs(tx.amount),
      type: tx.amount > 0 ? 'expense' : 'income',
      description: tx.merchant_name || tx.name,
      category: mapCategory(tx.personal_finance_category?.primary || (tx.category || [])[0]),
      date: new Date(tx.date).toISOString(),
      pending: tx.pending,
      logo_url: tx.logo_url || null,
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        added: added.map(mapTx),
        modified: modified.map(mapTx),
        removed: removed.map(tx => tx.transaction_id),
        next_cursor: nextCursor,
      }),
    }
  } catch (e) {
    console.error('sync-transactions:', e?.response?.data || e.message)
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e?.response?.data?.error_message || 'Failed to sync transactions' }) }
  }
}
