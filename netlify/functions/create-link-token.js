/**
 * POST /api/create-link-token
 * Body: { userId: string }
 *
 * Creates a Plaid Link token so the frontend can open the Plaid Link UI.
 * Called once per linking session; the token expires after 30 minutes.
 */
import { plaidClient, ok, err, corsHeaders } from './_plaid-client.js'
import { CountryCode, Products } from 'plaid'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405)

  try {
    const { userId } = JSON.parse(event.body || '{}')
    if (!userId) return err('userId is required', 400)

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Budget Buddy',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      // Uncomment to enable OAuth redirect (required for some banks):
      // redirect_uri: process.env.PLAID_REDIRECT_URI,
    })

    return ok({ link_token: response.data.link_token })
  } catch (e) {
    console.error('create-link-token error:', e?.response?.data || e.message)
    return err(e?.response?.data?.error_message || 'Failed to create link token')
  }
}
