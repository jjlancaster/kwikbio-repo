import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

const client = new SecretManagerServiceClient()

/**
 * Fetches a secret's latest version from Google Secret Manager.
 * Must only be called server-side (API routes, Server Components, middleware).
 *
 * @param name - The secret name as stored in GCP Secret Manager
 * @returns The secret payload as a UTF-8 string
 */
export async function getSecret(name: string): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable is not set')
  }

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  })

  const payload = version.payload?.data
  if (!payload) {
    throw new Error(`Secret "${name}" returned empty payload`)
  }

  return payload.toString()
}

// Simple in-process cache so secrets are only fetched once per cold start
const secretCache = new Map<string, string>()

/**
 * Fetches a secret with in-process caching (one fetch per process lifetime).
 * Safe for use in auth config that is evaluated at startup.
 */
export async function getCachedSecret(name: string): Promise<string> {
  if (secretCache.has(name)) {
    return secretCache.get(name)!
  }
  const value = await getSecret(name)
  secretCache.set(name, value)
  return value
}
