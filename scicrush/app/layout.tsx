import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'SciCrush — Crush Science. Together.',
  description:
    'Meet brilliant minds working on the problems that matter. Cure diseases. Fix the climate. Ride the quantum wave. SciCrush is where sapiosexuals do science — and find each other doing it.',
  openGraph: {
    title: 'SciCrush',
    description: 'Where your next great collaboration becomes your next great relationship.',
    siteName: 'SciCrush',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void text-gray-100 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#e5e7eb',
                border: '1px solid #252540',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
