import { ReactNode } from 'react'
import { ClientProviders } from '@/providers/ClientProviders'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}