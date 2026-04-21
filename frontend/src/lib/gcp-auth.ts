import { GoogleAuth } from 'google-auth-library'

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
})

/** Returns a fresh GCP access token. Safe to call on every request — the library caches and refreshes internally. */
export async function getAccessToken(): Promise<string> {
  const client = await auth.getClient()
  const token  = await client.getAccessToken()
  if (!token.token) throw new Error('Failed to obtain GCP access token')
  return token.token
}
