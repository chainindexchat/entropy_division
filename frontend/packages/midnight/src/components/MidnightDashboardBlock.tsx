'use client'

import dynamic from 'next/dynamic'
import type { NetworkId } from '@midnight-ntwrk/midnight-js-network-id'

// Dynamically import the MidnightUIWrapper with SSR disabled
const MidnightUIWrapper = dynamic(
  () => import('./MidnightUIWrapper'),
  { ssr: false, loading: () => <div style={{ padding: '20px' }}>Loading Midnight Dashboard...</div> }
)

export interface MidnightDashboardBlockProps {
  networkId?: NetworkId
  loggingLevel?: string
  title?: string
  description?: string
  className?: string
}

export const MidnightDashboardBlock: React.FC<MidnightDashboardBlockProps> = ({
  networkId = 'TestNet' as NetworkId,
  loggingLevel = 'info',
  title,
  description,
  className,
}) => {
  return (
    <div className={className}>
      {(title || description) && (
        <div style={{ marginBottom: '1.5rem' }}>
          {title && (
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <MidnightUIWrapper 
        networkId={networkId}
        loggingLevel={loggingLevel}
      />
    </div>
  )
}
