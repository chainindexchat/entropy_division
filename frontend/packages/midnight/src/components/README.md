# Midnight DApp Connector Components

This directory contains React components for integrating with the Midnight blockchain wallet connector API (`@midnight-ntwrk/dapp-connector-api`).

## Components

### `MidnightWalletConnector`

A comprehensive React component that provides full wallet connectivity functionality following the Midnight DApp connector API specification.

#### Features

- ✅ Wallet detection and availability checking
- ✅ DApp authorization (`enable()` and `isEnabled()`)
- ✅ Wallet information display (name, API version)
- ✅ Service URI configuration retrieval
- ✅ Wallet state management and display
- ✅ Transaction balancing, proving, and submission
- ✅ Error handling and user feedback
- ✅ Automatic reconnection for authorized DApps
- ✅ TypeScript support with proper type definitions

#### Props

```typescript
interface MidnightWalletConnectorProps {
  walletName: string                              // The wallet name (e.g., 'lace', 'nami')
  onConnect?: (api: DAppConnectorWalletAPI) => void    // Callback when wallet connects
  onDisconnect?: () => void                       // Callback when wallet disconnects  
  onError?: (error: Error) => void                // Callback for error handling
}
```

#### Basic Usage

```tsx
import { MidnightWalletConnector } from 'midnight/client'

export const MyWalletPage = () => {
  const handleConnect = (api) => {
    console.log('Wallet connected:', api)
  }

  const handleError = (error) => {
    console.error('Wallet error:', error)
  }

  return (
    <MidnightWalletConnector
      walletName="lace" // Replace with actual wallet name
      onConnect={handleConnect}
      onError={handleError}
    />
  )
}
```

### `useMidnightWallet` Hook

A custom React hook that provides a cleaner way to manage wallet state across components.

#### Returns

```typescript
{
  isConnected: boolean                    // Connection status
  walletApi: DAppConnectorWalletAPI | null     // Wallet API instance
  walletState: DAppConnectorWalletState | null // Current wallet state
  error: Error | null                     // Last error
  MidnightWalletConnector: React.Component     // Pre-configured connector component
}
```

#### Hook Usage

```tsx
import { useMidnightWallet } from 'midnight/client'

export const MyComponent = () => {
  const { 
    isConnected, 
    walletApi, 
    walletState, 
    error,
    MidnightWalletConnector 
  } = useMidnightWallet('lace')

  const handleTransaction = async () => {
    if (!walletApi) return
    
    try {
      const transaction = { /* your transaction data */ }
      const balanced = await walletApi.balanceAndProveTransaction(transaction)
      const result = await walletApi.submitTransaction(balanced)
      console.log('Transaction submitted:', result)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return (
    <div>
      <MidnightWalletConnector />
      
      {isConnected && (
        <button onClick={handleTransaction}>
          Send Transaction
        </button>
      )}
      
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}
```

## API Methods Available

When the wallet is connected, the following methods are available through `walletApi`:

### Core Methods

- `state()` - Returns the current wallet state
- `balanceAndProveTransaction(transaction)` - Balances and proves a transaction
- `submitTransaction(transaction)` - Submits a balanced and proven transaction

### Deprecated Methods (still available)

- `balanceTransaction(transaction)` - Legacy balance method
- `proveTransaction(transaction)` - Legacy prove method

### Wallet Information

- `window.midnight.{walletName}.name` - Wallet name
- `window.midnight.{walletName}.apiVersion` - API version
- `window.midnight.{walletName}.serviceUriConfig()` - Service configuration


## Installation & Setup

1. The `@midnight-ntwrk/dapp-connector-api` package is already installed in this project
2. Import components from `midnight/client`:

```tsx
import { 
  MidnightWalletConnector, 
  useMidnightWallet
} from 'midnight/client'
```

## TypeScript Support

All components include comprehensive TypeScript definitions:

```typescript
interface DAppConnectorWalletAPI {
  balanceAndProveTransaction: (transaction: any) => Promise<any>
  submitTransaction: (transaction: any) => Promise<any>
  state: () => Promise<DAppConnectorWalletState>
  balanceTransaction: (transaction: any) => Promise<any> // deprecated
  proveTransaction: (transaction: any) => Promise<any>   // deprecated
}

interface ServiceUriConfig {
  nodeUrl: string
  indexerUrl: string
  provingServerUrl: string
}
```

## Error Handling

The components include comprehensive error handling:

- Wallet availability detection
- Authorization failures
- Network errors
- Transaction errors
- User cancellation

All errors are logged to console and passed to error callbacks for custom handling.

## Styling

The components use CSS modules for styling. You can:

1. Use the default styles (included)
2. Override with custom CSS classes
3. Use inline styles for quick customization

## Browser Compatibility

- Requires modern browsers with ES2020+ support
- Wallet extensions must be installed and enabled
- Works with all major Midnight-compatible wallets

## Security Considerations

- Always validate transaction data before submission
- Handle user rejections gracefully
- Never store sensitive wallet information in state
- Use proper error boundaries in production
- Validate wallet responses before processing

## Common Wallet Names

Replace `'yourWalletName'` with actual wallet identifiers:
- `'lace'` - Lace Wallet
- `'nami'` - Nami Wallet
- `'eternl'` - Eternl Wallet
- etc. (check wallet documentation for exact names)

## Troubleshooting

### Wallet Not Detected
- Ensure wallet extension is installed and enabled
- Check browser developer tools for console errors
- Verify wallet name spelling matches exactly

### Connection Fails
- User must approve the connection in wallet popup
- Check wallet is unlocked and has accounts
- Verify network connectivity

### Transaction Errors
- Ensure transaction structure matches wallet expectations
- Check wallet has sufficient funds
- Verify transaction is properly balanced and proved before submission

## Development

To extend or modify these components:

1. Components are in `/src/components/`
2. Types are defined in `MidnightWalletConnector.tsx`
3. Styles are in `MidnightWalletConnector.module.css`
4. Examples are in `MidnightWalletExample.tsx`

## Contributing

When contributing:
- Follow existing TypeScript patterns
- Add proper error handling
- Update this README for new features
- Include example usage
- Test with multiple wallet types