import { COMPANY_NAME_SHORT } from '@/data/constants'
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: COMPANY_NAME_SHORT,
  description: 'Профессиональный подход, разумное решение',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}