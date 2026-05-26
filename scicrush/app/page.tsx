import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { SEED_CAMPAIGNS } from '@/lib/campaigns'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-crush-gradient relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-crush/10 border border-crush/30 rounded-full px-4 py-1.5 text-sm text-crush-light mb-8">
          <span>⚗️</span>
          <span>Where sapiosexuals do science — together</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
          Crush{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Science
          </span>
          .<br />
          Find your{' '}
          <span className="bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent">
            match
          </span>
          .
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join live research collaborations on the problems that actually matter.
          Cure diseases. Fix the climate. Ride the quantum wave.
          <br />
          <span className="text-gray-300">
            Your next great relationship starts with a hypothesis.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-crush text-base px-8 py-4">
            Start crushing — it&apos;s free ⚗️
          </Link>
          <Link href="/campaigns" className="btn-ghost text-base px-8 py-4">
            Browse campaigns →
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-muted">
          Join the growing community of citizen scientists finding brilliant companions
        </p>
      </section>

      {/* Campaigns preview */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-200">
          Active Campaigns
        </h2>
        <p className="text-center text-muted mb-10 text-sm">
          Pick your battle. Contribute. Find people who care as much as you do.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {SEED_CAMPAIGNS.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="card p-6 hover:border-crush/50 hover:bg-panel transition-all duration-200 group"
            >
              <div className="text-4xl mb-4">{c.emoji}</div>
              <h3 className={`text-xl font-bold mb-1 ${c.color}`}>{c.title}</h3>
              <p className="text-sm text-muted mb-3">{c.tagline}</p>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{c.brief}</p>
              <div className="mt-4 text-xs text-crush-light group-hover:underline">
                Join the research →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-200">
          How SciCrush works
        </h2>
        <div className="grid sm:grid-cols-4 gap-6 text-center">
          {[
            { step: '01', icon: '🧬', label: 'Pick a campaign', desc: 'Cure It, Fix Earth, or Ride the Wave' },
            { step: '02', icon: '💡', label: 'Contribute', desc: 'Post hypotheses, links, rebuttals, wild ideas' },
            { step: '03', icon: '💜', label: 'Get Crushed', desc: 'Others crush your thinking — not your photo' },
            { step: '04', icon: '💬', label: 'Connect', desc: 'DM the minds that moved you (PRO unlocks)' },
          ].map(({ step, icon, label, desc }) => (
            <div key={step} className="card p-5 flex flex-col items-center">
              <span className="text-xs text-muted font-mono mb-2">{step}</span>
              <span className="text-3xl mb-3">{icon}</span>
              <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skill level explainer */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-2 text-center">Your Research Level</h2>
          <p className="text-center text-muted text-sm mb-8">
            Like the mountain — choose your trail. Go further when you&apos;re ready.
          </p>
          <div className="grid sm:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl mb-2">🟢</div>
              <div className="font-semibold text-green-400">Green Circle</div>
              <div className="text-xs text-muted mt-1">Beginner Researcher</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🔵</div>
              <div className="font-semibold text-blue-400">Blue Square</div>
              <div className="text-xs text-muted mt-1">Novice Scientist</div>
            </div>
            <div>
              <div className="text-2xl mb-2">◆</div>
              <div className="font-semibold text-gray-200">Black Diamond</div>
              <div className="text-xs text-muted mt-1">Advanced Scientist</div>
            </div>
            <div>
              <div className="text-2xl mb-2">💎</div>
              <div className="font-semibold text-indigo-300">Sapphire Hexagon</div>
              <div className="text-xs text-muted mt-1">CrowdCureDisease DAO</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted mt-6">
            SciCrush matching is available to Black Diamond and Sapphire Hexagon members (18+)
          </p>
        </div>
      </section>

      {/* CTA footer */}
      <section className="text-center pb-32 px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to find your research partner?</h2>
        <p className="text-muted mb-8">Free to join. No swiping. Just science.</p>
        <Link href="/signup" className="btn-crush text-base px-10 py-4">
          Create your SciCrush profile →
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <p>SciCrush.ai — a kwiKBio / FastScience!5 initiative</p>
        <p className="mt-1">
          Powered by the ARS engine (USP11282088) · $8/mo for full access
        </p>
      </footer>
    </div>
  )
}
