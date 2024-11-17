'use client'

import { ThemeProvider } from 'next-themes'
import { NavigationProvider } from '@/lib/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </ThemeProvider>
  )
}
