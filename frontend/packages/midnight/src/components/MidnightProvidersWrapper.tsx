'use client'

import { StrictMode, useEffect, useState, ReactNode, createContext, useContext } from 'react'
import pino from 'pino'
import type { NetworkId } from '@midnight-ntwrk/midnight-js-network-id'

// Context to track provider loading state
const MidnightProvidersLoadedContext = createContext<boolean>(false)

export function useMidnightProvidersLoaded() {
  return useContext(MidnightProvidersLoadedContext)
}

interface MidnightProvidersWrapperProps {
  networkId?: NetworkId
  loggingLevel?: string
  children: ReactNode
}

interface MidnightProviders {
  MidnightWalletProvider: React.ComponentType<{ logger: any; children: React.ReactNode }>
  DeployedContractProvider: React.ComponentType<{ logger: any; children: React.ReactNode }>
}

export function MidnightProvidersWrapper({ 
  networkId = (process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID as NetworkId) || ('TestNet' as NetworkId),
  loggingLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as string) || 'info',
  children 
}: MidnightProvidersWrapperProps) {
  const [providers, setProviders] = useState<MidnightProviders | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logger] = useState(() => pino({ level: loggingLevel }))
  
  useEffect(() => {
    let cancelled = false

    async function loadProviders() {
      try {
        logger.info('Loading Midnight providers...', { networkId })
        
        // Dynamically import setNetworkId to avoid bundling WASM in initial chunk
        const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id')
        
        // Set the network ID before loading components
        setNetworkId(networkId)
        
        // Import the providers from midnight-setup-ui/payload
        const midnightUI = await import('midnight-setup-ui/payload');
        
        if (!cancelled) {
          setProviders({
            MidnightWalletProvider: midnightUI.MidnightWalletProvider,
            DeployedContractProvider: midnightUI.DeployedContractProvider,
          })
          logger.info('Midnight providers loaded successfully')
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          logger.error('Failed to load Midnight providers:', err)
          setError(errorMsg)
        }
      }
    }

    loadProviders()

    return () => {
      cancelled = true
    }
  }, [networkId, logger])

  if (error) {
    console.error('Midnight Providers Error:', error)
    return <>{children}</>
  }

  if (!providers) {
    return (
      <MidnightProvidersLoadedContext.Provider value={false}>
        {children}
      </MidnightProvidersLoadedContext.Provider>
    )
  }

  const { MidnightWalletProvider, DeployedContractProvider } = providers

  return (
    <StrictMode>
      <MidnightProvidersLoadedContext.Provider value={true}>
        <MidnightWalletProvider logger={logger}>
          <DeployedContractProvider logger={logger}>
            {children}
          </DeployedContractProvider>
        </MidnightWalletProvider>
      </MidnightProvidersLoadedContext.Provider>
    </StrictMode>
  )
}
