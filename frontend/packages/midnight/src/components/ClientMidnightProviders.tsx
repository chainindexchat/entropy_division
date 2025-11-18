'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import type { NetworkId } from '@midnight-ntwrk/midnight-js-network-id'

interface ClientMidnightProvidersProps {
  networkId?: NetworkId
  loggingLevel?: string
  children: ReactNode
}

// Dynamically import the MidnightProvidersWrapper with no SSR
const MidnightProvidersWrapper = dynamic(
  () => import('./MidnightProvidersWrapper').then(mod => ({ default: mod.MidnightProvidersWrapper })),
  { 
    ssr: false,
    loading: () => null
  }
)

export function ClientMidnightProviders({ networkId, loggingLevel, children }: ClientMidnightProvidersProps) {
  return (
    <MidnightProvidersWrapper networkId={networkId} loggingLevel={loggingLevel}>
      {children}
    </MidnightProvidersWrapper>
  )
}
