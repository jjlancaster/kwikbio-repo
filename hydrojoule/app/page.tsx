import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900 bg-grid relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-electric-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-electric-500/8 blur-[100px]" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 border-b border-electric-500/10 bg-navy-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded bg-electric-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">HJ</span>
            </div>
            <div>
              <span className="text-white font-semibold text-lg tracking-tight">HYDROJOULE</span>
              <span className="text-electric-400/60 text-xs font-mono ml-2">LLC</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="#portfolio" className="hover:text-white transition-colors">
              Patent Portfolio
            </Link>
            <Link href="#licensing" className="hover:text-white transition-colors">
              Licensing
            </Link>
            <Link href="#technology" className="hover:text-white transition-colors">
              Technology
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded hover:border-electric-500/50 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium bg-electric-500 text-white rounded hover:bg-electric-400 transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-4xl">
            {/* Classification badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-electric-500/30 bg-electric-500/10 text-electric-300 text-xs font-mono mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse-slow" />
              RESTRICTED ACCESS — AUTHORIZED LICENSEES ONLY
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
              Intellectual Property
              <br />
              <span className="gradient-text">Licensing Portal</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-4 max-w-2xl">
              Secure, institutional-grade access to hydrojoule LLC&apos;s patent portfolio,
              licensing agreements, and biomedical technology assets.
            </p>

            <p className="text-sm text-slate-500 font-mono mb-12">
              Holdings: USP11282088 (FastScience!/ARS Engine) &bull; Telehealth Patent Suite
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-electric-500 text-white font-semibold rounded hover:bg-electric-400 transition-colors text-sm"
              >
                Access Portal
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="#portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded hover:border-electric-500/50 hover:text-white transition-all text-sm"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-electric-500/10 bg-navy-950/40">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Patents', value: '2+', sublabel: 'Issued & Pending' },
              { label: 'Core Technology', value: 'ARS', sublabel: 'FastScience! Engine' },
              { label: 'Verticals', value: '3', sublabel: 'Biomedical · Telehealth · Analytics' },
              { label: 'Access Tiers', value: '3', sublabel: 'Subscriber · Researcher · Admin' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-sm font-medium text-slate-300 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Patent Portfolio */}
        <section id="portfolio" className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-3">
              Patent Portfolio
            </div>
            <h2 className="text-3xl font-bold text-white">Core IP Assets</h2>
            <p className="text-slate-400 mt-3 max-w-xl">
              Proprietary technology protected under U.S. and international patent law.
              Licensing inquiries require authenticated portal access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Patent card 1 */}
            <div className="panel p-6 group hover:border-electric-500/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-0.5 rounded bg-green-900/40 text-green-400 text-xs font-mono border border-green-700/40">
                  ISSUED
                </div>
                <span className="text-slate-600 text-xs font-mono">USP11282088</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                FastScience! / ARS Engine
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Advanced Retrieval System (ARS) engine powering accelerated biomedical
                literature analysis and hypothesis generation. Applicable across
                pharmaceutical R&amp;D, clinical research, and biotech discovery pipelines.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">Biomedical Analysis</span>
                <span>&bull;</span>
                <span className="font-mono">Literature Mining</span>
                <span>&bull;</span>
                <span className="font-mono">Drug Discovery</span>
              </div>
            </div>

            {/* Patent card 2 */}
            <div className="panel p-6 group hover:border-electric-500/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 text-xs font-mono border border-blue-700/40">
                  PORTFOLIO
                </div>
                <span className="text-slate-600 text-xs font-mono">TELEHEALTH SUITE</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Telehealth Patent Portfolio
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Comprehensive suite of telehealth patents covering remote patient monitoring,
                asynchronous care delivery, and AI-assisted diagnostic workflows.
                Licensed to healthcare networks and digital health platforms.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">Remote Patient Care</span>
                <span>&bull;</span>
                <span className="font-mono">AI Diagnostics</span>
                <span>&bull;</span>
                <span className="font-mono">Health IT</span>
              </div>
            </div>
          </div>
        </section>

        {/* Access Tiers */}
        <section id="licensing" className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-3">
              Access Tiers
            </div>
            <h2 className="text-3xl font-bold text-white">Portal Access Levels</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'SUBSCRIBER',
                label: 'Subscriber',
                color: 'border-slate-700/50',
                badgeColor: 'bg-slate-700/40 text-slate-300',
                features: [
                  'Marketplace access',
                  'Patent search & discovery',
                  'Technology overview',
                  'Licensing inquiry submission',
                ],
              },
              {
                role: 'RESEARCHER',
                label: 'Researcher',
                color: 'border-electric-500/30',
                badgeColor: 'bg-electric-500/20 text-electric-300',
                features: [
                  'All Subscriber features',
                  'Patent analysis tools',
                  'Joule biomedical tools',
                  'Full specification access',
                  'Claims analysis',
                ],
              },
              {
                role: 'ADMIN',
                label: 'Administrator',
                color: 'border-red-700/40',
                badgeColor: 'bg-red-900/40 text-red-300',
                features: [
                  'All Researcher features',
                  'Licensee management',
                  'Terraform deployment controls',
                  'BrainFile updates',
                  'Telegram gatekeeper access',
                  'Full system administration',
                ],
              },
            ].map((tier) => (
              <div
                key={tier.role}
                className={`panel p-6 border ${tier.color}`}
              >
                <div className={`inline-block px-2 py-0.5 rounded text-xs font-mono mb-4 ${tier.badgeColor}`}>
                  {tier.role}
                </div>
                <h3 className="text-white font-semibold text-lg mb-4">{tier.label}</h3>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <svg
                        className="w-4 h-4 text-electric-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Technology section */}
        <section id="technology" className="max-w-7xl mx-auto px-6 py-20 border-t border-electric-500/10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-electric-400 text-xs font-mono uppercase tracking-widest mb-3">
                Technology
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                ARS Engine — FastScience!
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                The Advanced Retrieval System (ARS) is the core patented engine behind
                FastScience!. It enables rapid traversal and synthesis of biomedical literature
                at scale — reducing hypothesis generation cycles from weeks to hours.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Built for pharmaceutical R&amp;D organizations, academic medical centers, and
                digital health platforms requiring defensible, patent-backed AI infrastructure.
              </p>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric-500 text-white font-medium rounded text-sm hover:bg-electric-400 transition-colors"
              >
                Request Researcher Access
              </Link>
            </div>
            <div className="panel p-6 font-mono text-sm">
              <div className="text-slate-500 mb-4 text-xs"># SYSTEM CAPABILITIES</div>
              {[
                { key: 'patent', value: 'USP11282088' },
                { key: 'engine', value: 'ARS v3.x' },
                { key: 'corpus_size', value: '>40M biomedical docs' },
                { key: 'latency_p99', value: '<500ms query' },
                { key: 'output_types', value: ['hypotheses', 'evidence_chains', 'claim_maps'] },
                { key: 'integrations', value: ['PubMed', 'ClinicalTrials', 'USPTO'] },
                { key: 'access', value: 'RESEARCHER | ADMIN' },
              ].map((item) => (
                <div key={item.key} className="flex gap-3 py-1.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-electric-400 w-36 flex-shrink-0">{item.key}:</span>
                  <span className="text-slate-300">
                    {Array.isArray(item.value) ? item.value.join(', ') : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-electric-500/10 bg-navy-950/60 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-electric-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">HJ</span>
            </div>
            <span className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Hydrojoule LLC. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
            <span>CONFIDENTIAL</span>
            <span>&bull;</span>
            <span>NOT FOR PUBLIC DISTRIBUTION</span>
            <span>&bull;</span>
            <span>IP PROTECTED</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
