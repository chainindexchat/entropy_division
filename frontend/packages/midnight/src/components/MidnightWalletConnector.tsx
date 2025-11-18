'use client'

import dynamic from 'next/dynamic'
import type { NetworkId } from '@midnight-ntwrk/midnight-js-network-id'

// Dynamically import ClientMidnightProviders to match the loading pattern used by navigation callbacks
const ClientMidnightProviders = dynamic(
  () => import('./ClientMidnightProviders').then(mod => ({ default: mod.ClientMidnightProviders })),
  { ssr: false, loading: () => <div>Loading Midnight components...</div> }
)

// Dynamically import the MidnightSetupApp
const MidnightSetupApp = dynamic(
  () => import('midnight-setup-ui').then(mod => ({ default: mod.MidnightSetupApp })),
  { ssr: false }
)

export interface MidnightWalletConnectorProps {
  networkId?: NetworkId
  loggingLevel?: string
  className?: string
}

export const MidnightWalletConnector: React.FC<MidnightWalletConnectorProps> = ({
  networkId = (process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID as NetworkId) || ('TestNet' as NetworkId),
  loggingLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as string) || 'info',
  className,
}) => {
  return (
    <div className={className} data-midnight-ui>
      <ClientMidnightProviders networkId={networkId} loggingLevel={loggingLevel}>
        <MidnightSetupApp />
      </ClientMidnightProviders>
    </div>
  )
}

// Simplified hook that just provides the component
export const useMidnightWallet = () => {
  return {
    MidnightWalletConnector,
  }
}
