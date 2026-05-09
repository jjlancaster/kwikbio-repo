import { Campaign } from './types'

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'cure-it',
    title: 'Cure It',
    tagline: 'Crush disease. Together.',
    brief:
      'From Alzheimer\'s to antibiotic resistance — bring your hypotheses, your literature finds, your wild ideas. The cure might start here.',
    emoji: '🧬',
    color: 'text-rose-400',
    contributorCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fix-earth',
    title: 'Fix Earth',
    tagline: 'Climate, oceans, cities. Pick your battle.',
    brief:
      'Carbon capture, rewilding, urban heat islands, ocean plastics — the planet has more bugs than any codebase. Squash them.',
    emoji: '🌍',
    color: 'text-emerald-400',
    contributorCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ride-the-wave',
    title: 'Ride the Wave',
    tagline: 'Quantum. ASI. Biotech. The singularity needs better surfers.',
    brief:
      'The next decade will rewrite physics, computation, and biology simultaneously. Where do you want to stand when it does?',
    emoji: '⚡',
    color: 'text-violet-400',
    contributorCount: 0,
    createdAt: new Date().toISOString(),
  },
]

export function getCampaignById(id: string): Campaign | undefined {
  return SEED_CAMPAIGNS.find((c) => c.id === id)
}
