import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PulseHub - Social Media Hot Topics Aggregation Platform',
  description: 'Real-time hot topics aggregation from Weibo, Douyin, Bilibili, Zhihu and other major social media platforms.',
  keywords: ['hot topics', 'social media', 'weibo', 'douyin', 'bilibili', 'zhihu', 'trending'],
  authors: [{ name: 'PulseHub Team' }],
  openGraph: {
    type: 'website',
    url: 'https://pulsehub.fullstackjam.com/',
    title: 'PulseHub - Social Media Hot Topics Aggregation Platform',
    description: 'Real-time hot topics aggregation from major social media platforms',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseHub - Social Media Hot Topics Aggregation Platform',
    description: 'Real-time hot topics aggregation from major social media platforms',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
