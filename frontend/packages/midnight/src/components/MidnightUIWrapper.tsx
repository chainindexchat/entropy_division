'use client'

import { StrictMode, useEffect, useState } from 'react'
import pino from 'pino'
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id'

interface MidnightUIWrapperProps {
  networkId: NetworkId
  loggingLevel: string
}

interface MidnightComponents {
  MidnightSetupApp: React.ComponentType
}

export default function MidnightUIWrapper({ networkId, loggingLevel }: MidnightUIWrapperProps) {
  const [components, setComponents] = useState<MidnightComponents | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logger] = useState(() => pino({ level: loggingLevel }))
  
  useEffect(() => {
    let cancelled = false

    async function loadComponents() {
      try {
        logger.info('Starting Midnight initialization...', { networkId })
        
        // Set the network ID before loading components
        setNetworkId(networkId)
        logger.info('Network ID set', { networkId })
        
        // Import the UI components with polyfills
        // The polyfills set up browser globals needed for WASM
        // Use the payload export which only includes scoped styles (no Tailwind base)
        logger.info('Loading Midnight UI components...')
        const midnightUI = await import('midnight-setup-ui/payload')
        
        // Give a moment for any async initialization to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!cancelled) {
          setComponents({
            MidnightSetupApp: midnightUI.MidnightSetupApp,
          })
          logger.info('Midnight UI components loaded successfully')
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          logger.error('Failed to load Midnight components:', err)
          setError(errorMsg)
        }
      }
    }

    loadComponents()

    return () => {
      cancelled = true
    }
  }, [networkId, logger])

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid red', borderRadius: '4px' }}>
        <h3 style={{ color: 'red' }}>Failed to Initialize Midnight</h3>
        <p>{error}</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Check the browser console for more details.
        </p>
      </div>
    )
  }

  if (!components) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Initializing Midnight runtime...</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Loading WASM modules...</p>
      </div>
    )
  }

  const { MidnightSetupApp } = components

  return (
    <div data-midnight-ui>
      <MidnightSetupApp />
    </div>
  )
}
