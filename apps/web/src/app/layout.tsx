import '@/styles/tailwind.css'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { Metadata } from 'next';
import clsx from 'clsx'

export const metadata: Metadata = {
  title: {
    template: '%s - Docs',
    default: 'Intrig Insight',
  },
  description: 'Backend API integration assistant for Intrig',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Use local version of Lexend so that we can use OpenType features
const lexend = localFont({
  src: '../fonts/lexend.woff2',
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html
    lang="en"
    className={clsx('h-full antialiased', inter.variable, lexend.variable)}
    suppressHydrationWarning
  >
  <body className="flex min-h-full bg-white dark:bg-slate-900">
  <Providers>
    <Layout>{children}</Layout>
  </Providers>
  </body>
  </html>
}
