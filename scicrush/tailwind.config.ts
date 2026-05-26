import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SciCrush brand
        void: '#08080f',
        surface: '#11111c',
        panel: '#1a1a2e',
        border: '#252540',
        muted: '#6b7280',
        // Accent
        crush: '#7c3aed',        // primary purple-violet
        'crush-light': '#a78bfa',
        'crush-glow': '#4c1d95',
        // Skill levels (ski resort)
        'green-circle': '#22c55e',
        'blue-square': '#3b82f6',
        'black-diamond': '#e5e7eb',
        'sapphire-hex': '#818cf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'crush-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1628 100%)',
        'card-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #111122 100%)',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
