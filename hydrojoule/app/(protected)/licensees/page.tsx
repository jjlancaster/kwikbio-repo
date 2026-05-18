import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin, roleBadgeClass } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import type { Role } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

// Sample licensee data — replace with real DB queries when licensee table is added
const LICENSEES = [
  {
    id: 'lic-001',
    organization: 'Meridian Biotech Partners',
    contactEmail: 'legal@meridianbiotech.com',
    licenseType: 'EXCLUSIVE',
    patents: ['USP11282088'],
    territory: 'North America',
    startDate: '2023-01-01',
    expiryDate: '2028-01-01',
    status: 'ACTIVE',
    annualFee: '$420,000',
  },
  {
    id: 'lic-002',
    organization: 'GlobalHealth Digital',
    contactEmail: 'ip@globalhealth.io',
    licenseType: 'NON-EXCLUSIVE',
    patents: ['TELEHEALTH-SUITE'],
    territory: 'European Union',
    startDate: '2023-06-15',
    expiryDate: '2026-06-15',
    status: 'ACTIVE',
    annualFee: '$180,000',
  },
  {
    id: 'lic-003',
    organization: 'Apex Clinical Analytics',
    contactEmail: 'licensing@apexclinical.com',
    licenseType: 'RESEARCH',
    patents: ['USP11282088'],
    territory: 'Global',
    startDate: '2024-03-01',
    expiryDate: '2025-03-01',
    status: 'EXPIRING',
    annualFee: '$60,000',
  },
  {
    id: 'lic-004',
    organization: 'NovaMed Systems',
    contactEmail: 'bd@novamed.com',
    licenseType: 'NON-EXCLUSIVE',
    patents: ['USP11282088', 'TELEHEALTH-SUITE'],
    territory: 'Asia Pacific',
    startDate: '2022-09-01',
    expiryDate: '2024-09-01',
    status: 'EXPIRED',
    annualFee: '$240,000',
  },
]

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-900/40 text-green-400 border-green-700/40',
  EXPIRING: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  EXPIRED: 'bg-red-900/40 text-red-400 border-red-700/40',
  PENDING: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
}

const LICENSE_TYPE_STYLES: Record<string, string> = {
  EXCLUSIVE: 'text-purple-300',
  'NON-EXCLUSIVE': 'text-electric-300',
  RESEARCH: 'text-slate-300',
}

export default async function LicenseesPage() {
  const session = await auth()
  if (!session?.user) redirect('/signin')
  if (!isAdmin(session)) redirect('/unauthorized')

  const userRole = session.user.role as Role

  // Count registered portal users for overview stats
  const userCount = await prisma.user.count()
  const subscriberCount = await prisma.user.count({ where: { role: 'SUBSCRIBER' } })
  const researcherCount = await prisma.user.count({ where: { role: 'RESEARCHER' } })
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })

  const activeCount = LICENSEES.filter((l) => l.status === 'ACTIVE').length
  const totalRevenue = '$900,000 ARR'

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="border-b border-electric-500/10 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-electric-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs font-mono">HJ</span>
              </div>
              <span className="text-white font-semibold tracking-tight">HYDROJOULE</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">Dashboard</Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 text-sm">Licensees</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-mono ${roleBadgeClass(userRole)}`}>
            {userRole}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-2">
              Admin Panel
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Licensee Management</h1>
            <p className="text-slate-400 text-sm">
              Manage active licensees, agreements, and portal user accounts.
            </p>
          </div>
          <button className="px-4 py-2 bg-electric-500 text-white text-sm font-medium rounded hover:bg-electric-400 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Licensee
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Licenses', value: activeCount.toString(), color: 'text-green-400' },
            { label: 'Total ARR', value: totalRevenue, color: 'text-electric-300' },
            { label: 'Portal Users', value: userCount.toString(), color: 'text-white' },
            { label: 'Admin Accounts', value: adminCount.toString(), color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="panel p-4">
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Licensee table */}
        <div className="panel overflow-hidden mb-8">
          <div className="border-b border-electric-500/10 px-6 py-4 flex items-center justify-between bg-navy-950/30">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wide">
              License Agreements
            </div>
            <div className="text-xs font-mono text-slate-600">
              {LICENSEES.length} total records
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-navy-950/20">
                  <th className="text-left px-6 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Organization</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Patents</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Territory</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Fee</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {LICENSEES.map((lic, idx) => (
                  <tr
                    key={lic.id}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${idx === LICENSEES.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{lic.organization}</div>
                      <div className="text-slate-500 text-xs font-mono mt-0.5">{lic.contactEmail}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-mono ${LICENSE_TYPE_STYLES[lic.licenseType] ?? 'text-slate-400'}`}>
                        {lic.licenseType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lic.patents.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm">{lic.territory}</td>
                    <td className="px-4 py-4 text-slate-400 text-xs font-mono">{lic.expiryDate}</td>
                    <td className="px-4 py-4 text-slate-300 text-xs font-mono">{lic.annualFee}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded border text-xs font-mono ${STATUS_STYLES[lic.status] ?? 'text-slate-400'}`}>
                        {lic.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-xs text-slate-500 hover:text-electric-300 font-mono transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portal Users section */}
        <div className="panel p-6">
          <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-5">
            Portal User Breakdown
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { role: 'SUBSCRIBER', count: subscriberCount, color: roleBadgeClass('SUBSCRIBER') },
              { role: 'RESEARCHER', count: researcherCount, color: roleBadgeClass('RESEARCHER') },
              { role: 'ADMIN', count: adminCount, color: roleBadgeClass('ADMIN') },
            ].map((r) => (
              <div key={r.role} className="flex items-center gap-3 p-3 rounded border border-slate-800 bg-navy-950/30">
                <div className="text-2xl font-bold font-mono text-white">{r.count}</div>
                <span className={`px-2 py-0.5 rounded text-xs font-mono ${r.color}`}>{r.role}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
