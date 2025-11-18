# Chat-App Customization Changes

This document summarizes the changes made to transform better-chatbot into chat-app.

## 1. Directory and Project Renamed
- **Directory**: Renamed from `better-chatbot` to `chat-app`
- **Files Updated**:
  - `package.json`: Changed package name and Docker container names
  - `docker/compose.yml`: Updated service and network names

## 2. Branding Updates
- **HTML Title**: Changed from "better-chatbot" to "Entropy Division" (`src/app/layout.tsx`)
- **Sidebar Header**: Updated to display "Entropy Division" with tagline "Lorem ipsum factum..." (`src/components/layouts/app-sidebar.tsx`)
  - Added vertical spacing and alignment to match header elements
  - Tagline styled with smaller font size (10px) and italic
  - Added padding to sidebar header for better visual alignment
- **Description**: Updated metadata description to reference new branding

## 3. User Menu Modifications
- **Disabled Buttons** (`src/components/layouts/app-sidebar-user.tsx`):
  - "Report an Issue" - greyed out and disabled
  - "Join Community" - greyed out and disabled
  - Both buttons styled with reduced opacity and cursor-not-allowed

## 4. Midnight Wallet Connector Integration
Added a third button in the top-right header (alongside "Toggle Voice Chat" and "Toggle Temporary Chat"):

### New Files Created:
- `src/hooks/use-midnight-wallet-state.ts` - Hook to detect wallet connection status via DOM inspection
- `src/lib/midnight-callbacks.ts` - Utility functions for wallet operations (connect, deploy, join, disconnect)
- `src/components/midnight/midnight-dialogs-provider.tsx` - Dialog context provider for wallet operations
- `src/components/midnight/midnight-ui-wrapper.tsx` - Wrapper component that renders the full Midnight Setup UI in an overlay

### Modified Files:
- `src/components/layouts/app-header.tsx`:
  - Added Wallet, Rocket, Users, and LogOut icons from lucide-react
  - Added DropdownMenu components for the connected state
  - Integrated `useMidnightWalletState` hook
  - Wallet button with two states:
    - **Not Connected**: Shows button with loading spinner or wallet icon
    - **Connected**: Shows dropdown menu with Deploy Contract, Join Contract, and Disconnect options
  - Styled consistently with existing buttons (secondary variant, bg-secondary/40)
  - Tooltip always shows "Midnight Dapp Connector"
- `src/app/(chat)/layout.tsx`:
  - Added `MidnightUIWrapper` component to render Midnight wallet infrastructure
- `src/components/layouts/sidebar-header.tsx`:
  - Reduced padding from `py-4` to `py-3` for better title alignment

## Key Features of Wallet Button:
- **Not Connected State**:
  - Shows loading spinner while wallet is connecting
  - Shows wallet icon when ready to connect
  - Disabled while loading
  - Tooltip shows "Connecting..." or "Connect Midnight Wallet"
  - Clicking triggers the `connectWallet` callback function
  
- **Connected State**:
  - Button transforms into a dropdown menu
  - Dropdown includes:
    - **Deploy Contract** - Opens dialog to deploy new contract
    - **Join Contract** - Opens dialog to join existing contract
    - **Disconnect** - Disconnects the wallet
  - Automatically detects wallet connection state through DOM inspection
  - Tooltip shows "Wallet Connected"

## Dependencies:
- **midnight-setup-ui** package (from monorepo)
- The wallet integration uses the full Midnight Setup UI rendered in an overlay
- Connection state detection monitors the DOM for:
  - Connect/Disconnect buttons
  - Badge elements with connection status  
  - Address patterns (0x... format)
  - Text content indicating "Connected:"
- The overlay is shown/hidden via custom events: `show-midnight-ui` and `hide-midnight-ui`

## Build and Deployment:
All changes maintain compatibility with the existing Next.js build system. The TypeScript files are properly typed and follow the existing code patterns in the project.
