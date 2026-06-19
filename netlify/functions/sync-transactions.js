/**
 * POST /api/sync-transactions
 * Body: { item_id: string, cursor?: string }
 *
 * Uses Plaid's /transactions/sync endpoint (incremental updates).
 * Returns added/modified/removed transactions since the last cursor.
 * Store the returned cursor on the client to fetch only new changes next time.
 */
import { plaidClient, ok, err, corsHeaders } from './_plaid-client.js'
import { tokenStore } from './exchange-public-token.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405)

  try {
    const { item_id, cursor } = JSON.parse(event.body || '{}')
    if (!item_id) return err('item_id is required', 400)

    const record = tokenStore[item_id]
    if (!record) return err('Item not found — re-link your account', 404)

    let added = [], modified = [], removed = [], nextCursor = cursor, hasMore = true

    // Page through all updates
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: record.access_token,
        cursor: nextCursor,
        count: 100,
      })
      const data = response.data
      added = added.concat(data.added)
      modified = modified.concat(data.modified)
      removed = removed.concat(data.removed)
      nextCursor = data.next_cursor
      hasMore = data.has_more
    }

    // Map to our internal transaction format
    const mapTx = (tx) => ({
      id: tx.transaction_id,
      plaid_id: tx.transaction_id,
      account_id: tx.account_id,
      amount: Math.abs(tx.amount),
      // Plaid: positive = debit (expense), negative = credit (income)
      type: tx.amount > 0 ? 'expense' : 'income',
      description: tx.merchant_name || tx.name,
      category: mapCategory(tx.personal_finance_category?.primary || tx.category?.[0] || 'OTHER'),
      date: tx.date,
      pending: tx.pending,
      logo_url: tx.logo_url,
    })

    return ok({
      added: added.map(mapTx),
      modified: modified.map(mapTx),
      removed: removed.map(tx => tx.transaction_id),
      next_cursor: nextCursor,
    })
  } catch (e) {
    console.error('sync-transactions error:', e?.response?.data || e.message)
    return err(e?.response?.data?.error_message || 'Failed to sync transactions')
  }
}

// Map Plaid categories → our app categories
function mapCategory(plaidCategory) {
  const map = {
    FOOD_AND_DRINK: 'food',
    GROCERIES: 'food',
    RESTAURANTS: 'food',
    TRAVEL: 'transport',
    TRANSPORTATION: 'transport',
    SHOPS: 'shopping',
    SHOPPING: 'shopping',
    MEDICAL: 'health',
    HEALTHCARE: 'health',
    RECREATION: 'entertainment',
    ENTERTAINMENT: 'entertainment',
    RENT_AND_UTILITIES: 'housing',
    HOME: 'housing',
    INCOME: 'salary',
    TRANSFER_IN: 'income',
    LOAN_PAYMENTS: 'other',
    GENERAL_MERCHANDISE: 'shopping',
  }
  return map[plaidCategory?.toUpperCase?.()] || 'other'
}
