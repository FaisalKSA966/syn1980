import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: '1980 Synthesis - Discord Analytics Dashboard',
  description: 'Advanced Discord server analytics powered by 1980 Foundation in partnership with Flowline Data Solutions',
  keywords: ['discord', 'analytics', '1980', 'synthesis', 'flowline', 'data', 'dashboard'],
  authors: [{ name: '1980 Foundation' }, { name: 'Flowline Data Solutions' }],
  creator: '1980 Foundation & Flowline Data Solutions',
  publisher: '1980 Foundation',
  metadataBase: new URL('https://syn.ksa1980.lol'),
  openGraph: {
    title: '1980 Synthesis - Discord Analytics Dashboard',
    description: 'Advanced Discord server analytics powered by 1980 Foundation in partnership with Flowline Data Solutions',
    url: 'https://syn.ksa1980.lol',
    siteName: '1980 Synthesis',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1980 Synthesis - Discord Analytics Dashboard',
    description: 'Advanced Discord server analytics powered by 1980 Foundation in partnership with Flowline Data Solutions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
