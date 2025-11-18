'use client'

// Import polyfills first to ensure browser globals are available
import './polyfills'

// NO CSS imports - the dapp already has Tailwind loaded
// This prevents style conflicts with Payload admin panel

// Re-export components
export { default as MidnightSetupApp } from './App'
export { useMidnightWallet } from './hookes/useMidnightWallet'
export { useDeployedContract } from './providers/DeployedContractProvider'
export { default as MidnightWalletProvider } from './providers/MidnightWalletProvider'
export { default as DeployedContractProvider } from './providers/DeployedContractProvider'
