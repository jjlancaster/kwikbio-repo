import type { Session } from 'next-auth'

export type Role = 'SUBSCRIBER' | 'RESEARCHER' | 'ADMIN'

/**
 * Role hierarchy: ADMIN > RESEARCHER > SUBSCRIBER
 * A higher-ranked role satisfies all lower-ranked requirements.
 */
const ROLE_RANK: Record<Role, number> = {
  SUBSCRIBER: 1,
  RESEARCHER: 2,
  ADMIN: 3,
}

/**
 * Returns true if the user's role meets or exceeds the required role.
 */
export function hasRole(userRole: Role | undefined | null, required: Role): boolean {
  if (!userRole) return false
  return (ROLE_RANK[userRole] ?? 0) >= ROLE_RANK[required]
}

/**
 * Returns true if the session belongs to an ADMIN.
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session?.user?.role as Role, 'ADMIN')
}

/**
 * Returns true if the session belongs to a RESEARCHER or ADMIN.
 */
export function isResearcher(session: Session | null): boolean {
  return hasRole(session?.user?.role as Role, 'RESEARCHER')
}

/**
 * Returns true if the session is authenticated (any role).
 */
export function isAuthenticated(session: Session | null): boolean {
  return session !== null && !!session.user
}

/**
 * Returns a human-readable label for a role.
 */
export function roleLabel(role: Role | string | undefined | null): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'RESEARCHER':
      return 'Researcher'
    case 'SUBSCRIBER':
      return 'Subscriber'
    default:
      return 'Unknown'
  }
}

/**
 * Returns the badge color class for a given role (Tailwind).
 */
export function roleBadgeClass(role: Role | string | undefined | null): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-900/40 text-red-300 border border-red-700/50'
    case 'RESEARCHER':
      return 'bg-electric-500/20 text-electric-300 border border-electric-500/30'
    case 'SUBSCRIBER':
      return 'bg-slate-700/40 text-slate-300 border border-slate-600/50'
    default:
      return 'bg-slate-800 text-slate-400'
  }
}
