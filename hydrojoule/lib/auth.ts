import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/nodemailer'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { getCachedSecret } from '@/lib/secrets'
import type { Role } from '@/lib/rbac'

/**
 * Builds the NextAuth configuration object by resolving secrets from
 * Google Secret Manager at runtime (server-side only).
 */
async function buildAuthConfig(): Promise<NextAuthConfig> {
  const [
    nextAuthSecret,
    googleClientId,
    googleClientSecret,
    emailHost,
    emailPort,
    emailUser,
    emailPassword,
    emailFrom,
  ] = await Promise.all([
    getCachedSecret('NEXTAUTH_SECRET'),
    getCachedSecret('GOOGLE_CLIENT_ID'),
    getCachedSecret('GOOGLE_CLIENT_SECRET'),
    getCachedSecret('EMAIL_SERVER_HOST'),
    getCachedSecret('EMAIL_SERVER_PORT'),
    getCachedSecret('EMAIL_SERVER_USER'),
    getCachedSecret('EMAIL_SERVER_PASSWORD'),
    getCachedSecret('EMAIL_FROM'),
  ])

  return {
    secret: nextAuthSecret,

    adapter: PrismaAdapter(prisma),

    providers: [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      }),
      EmailProvider({
        server: {
          host: emailHost,
          port: parseInt(emailPort, 10),
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        },
        from: emailFrom,
      }),
    ],

    session: {
      strategy: 'jwt',
    },

    pages: {
      signIn: '/signin',
      error: '/error',
    },

    callbacks: {
      /**
       * jwt callback — runs when a JWT is created or updated.
       * Attaches the user's role to the token on first sign-in,
       * then persists it on subsequent requests.
       */
      async jwt({ token, user }) {
        if (user) {
          // First sign-in: user object is populated — fetch role from DB
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, telegramId: true },
          })
          token.role = dbUser?.role ?? 'SUBSCRIBER'
          token.telegramId = dbUser?.telegramId ?? null
        }
        return token
      },

      /**
       * session callback — runs whenever a session is checked.
       * Copies role and telegramId from the JWT token into the session object
       * so client components can read them via useSession().
       */
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub as string
          session.user.role = token.role as Role
          session.user.telegramId = (token.telegramId as string | null) ?? null
        }
        return session
      },

      /**
       * signIn callback — allows fine-grained control over who can sign in.
       * All authenticated users are allowed; role enforcement happens in middleware.
       */
      async signIn({ user }) {
        // Reject sign-in if no email (should not happen with Google/Email providers)
        return !!user.email
      },
    },

    events: {
      /**
       * Fired after a new user account is created.
       * Log the event for audit purposes.
       */
      async createUser({ user }) {
        console.info(`[auth] New user registered: ${user.email} (role: SUBSCRIBER)`)
      },
    },

    debug: process.env.NODE_ENV === 'development',
  }
}

// Lazily-initialised auth instance — resolved once per process
let _authInstance: ReturnType<typeof NextAuth> | null = null
let _buildPromise: Promise<ReturnType<typeof NextAuth>> | null = null

async function getAuthInstance(): Promise<ReturnType<typeof NextAuth>> {
  if (_authInstance) return _authInstance
  if (_buildPromise) return _buildPromise

  _buildPromise = buildAuthConfig().then((config) => {
    const instance = NextAuth(config)
    _authInstance = instance
    return instance
  })

  return _buildPromise
}

/**
 * auth() — call this in Server Components / API routes to get the session.
 */
export async function auth() {
  const instance = await getAuthInstance()
  return instance.auth()
}

/**
 * handlers — Next.js App Router route handlers for GET and POST.
 * Wrapped to lazily resolve secrets before handling the first request.
 */
export async function handlers() {
  const instance = await getAuthInstance()
  return instance.handlers
}

export { getAuthInstance }
