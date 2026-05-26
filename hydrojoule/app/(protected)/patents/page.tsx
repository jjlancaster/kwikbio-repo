import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isResearcher, roleBadgeClass } from '@/lib/rbac'
import type { Role } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const PATENTS = [
  {
    id: 'USP11282088',
    status: 'ISSUED',
    statusColor: 'bg-green-900/40 text-green-400 border-green-700/40',
    title: 'FastScience! — Advanced Retrieval System (ARS) Engine',
    filed: '2018-03-15',
    issued: '2022-03-22',
    inventors: ['Hydrojoule LLC'],
    abstract:
      'A system and method for accelerated biomedical literature retrieval and synthesis using a multi-layer vector embedding architecture combined with a probabilistic claim-mapping inference engine. The ARS engine enables sub-second hypothesis generation across corpora exceeding 40 million documents.',
    claims: [
      'A computer-implemented method for biomedical literature retrieval comprising...',
      'The system of claim 1, wherein the vector embedding layer includes...',
      'A non-transitory computer-readable medium storing instructions that...',
    ],
    classifications: ['G06F 16/903', 'G16H 50/20', 'G06N 20/00'],
    assignee: 'Hydrojoule LLC',
    licensingStatus: 'AVAILABLE',
  },
  {
    id: 'TELEHEALTH-SUITE',
    status: 'PORTFOLIO',
    statusColor: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
    title: 'Telehealth Patent Portfolio',
    filed: '2019-2022',
    issued: 'Multiple',
    inventors: ['Hydrojoule LLC'],
    abstract:
      'A portfolio of patents covering remote patient monitoring protocols, asynchronous care delivery workflows, and AI-assisted diagnostic decision support for telehealth platforms. Applicable to digital health platforms, hospital networks, and insurers.',
    claims: [
      'Remote patient monitoring with adaptive sampling rates based on clinical risk scores...',
      'Asynchronous provider-patient communication with automated triage classification...',
      'AI-assisted diagnostic support system integrating EHR data with real-time vitals...',
    ],
    classifications: ['G16H 40/67', 'G16H 10/60', 'G16H 50/30'],
    assignee: 'Hydrojoule LLC',
    licensingStatus: 'NEGOTIATING',
  },
]

export default async function PatentsPage() {
  const session = await auth()
  if (!session?.user) redirect('/signin')
  if (!isResearcher(session)) redirect('/unauthorized')

  const userRole = session.user.role as Role

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
            <Link href="/dashboard" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 text-sm">Patents</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-mono ${roleBadgeClass(userRole)}`}>
            {userRole}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-2">
            Patent Portfolio
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IP Asset Registry</h1>
          <p className="text-slate-400 text-sm">
            Hydrojoule LLC proprietary patents and patent portfolios.
            Confidential — authorized researchers only.
          </p>
        </div>

        {/* Patent cards */}
        <div className="space-y-6">
          {PATENTS.map((patent) => (
            <div key={patent.id} className="panel p-0 overflow-hidden">
              {/* Card header */}
              <div className="border-b border-electric-500/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-navy-950/30">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono border ${patent.statusColor}`}>
                    {patent.status}
                  </span>
                  <span className="font-mono text-slate-500 text-sm">{patent.id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                  <span>Filed: {patent.filed}</span>
                  <span>Issued: {patent.issued}</span>
                  <span className={`px-2 py-0.5 rounded border ${
                    patent.licensingStatus === 'AVAILABLE'
                      ? 'border-green-700/40 text-green-500'
                      : 'border-yellow-700/40 text-yellow-500'
                  }`}>
                    {patent.licensingStatus}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">{patent.title}</h2>

                {/* Abstract */}
                <div className="mb-6">
                  <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-2">
                    Abstract
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{patent.abstract}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Claims */}
                  <div>
                    <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-2">
                      Representative Claims
                    </div>
                    <ol className="space-y-2">
                      {patent.claims.map((claim, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-400">
                          <span className="font-mono text-slate-600 flex-shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{claim}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-2">
                        Classification
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patent.classifications.map((cls) => (
                          <span
                            key={cls}
                            className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-400 text-xs font-mono"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-2">
                        Assignee
                      </div>
                      <div className="text-sm text-slate-300 font-mono">{patent.assignee}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-600">
                        Full specifications, prosecution history, and claim charts available
                        to authorized licensees upon NDA execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ARS Tools section */}
        <div className="mt-10 panel p-6">
          <div className="text-xs font-mono text-electric-400 uppercase tracking-wide mb-4">
            Joule Biomedical Tools — ARS Engine Interface
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Literature Search', desc: 'Query 40M+ biomedical documents', status: 'ONLINE' },
              { label: 'Hypothesis Generator', desc: 'AI-assisted hypothesis construction', status: 'ONLINE' },
              { label: 'Claim Mapper', desc: 'Map prior art to patent claims', status: 'BETA' },
            ].map((tool) => (
              <div key={tool.label} className="p-4 rounded border border-slate-800 bg-navy-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{tool.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    tool.status === 'ONLINE'
                      ? 'bg-green-900/40 text-green-400 border border-green-700/40'
                      : 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/40'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <p className="text-slate-500 text-xs">{tool.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-4 font-mono">
            Full ARS API access requires RESEARCHER or ADMIN credentials. Contact admin to provision API keys.
          </p>
        </div>
      </main>
    </div>
  )
}
