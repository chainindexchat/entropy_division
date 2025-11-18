# Midnight Dashboard Block

A PayloadCMS block that embeds the Midnight UI components into your content, allowing you to add wallet connection, contract deployment, and blockchain interaction capabilities to any page or dashboard.

## Features

- **Wallet Connection**: Connect to Midnight wallets
- **Contract Operations**: Deploy or join smart contracts
- **State Reading**: View contract and ledger states
- **Configurable**: Customize network, logging, title, and description

## Installation

The block is included with the `midnight` PayloadCMS plugin. Make sure the plugin is installed in your Payload config:

```ts
import { midnight } from 'midnight'

export default buildConfig({
  plugins: [
    midnight({
      // your config
    }),
  ],
})
```

## Usage

### 1. Add the Block to a Collection or Global

Import and add the `MidnightDashboard` block to any collection or global that uses blocks:

```ts
import { MidnightDashboard } from 'midnight'

const MyCollection = {
  slug: 'pages',
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        MidnightDashboard,
        // ... other blocks
      ],
    },
  ],
}
```

### 2. Create a Frontend Component

Create a component to render the block in your frontend:

```tsx
// components/RenderBlocks.tsx
'use client'

import { MidnightDashboardBlock } from 'midnight/client'

interface Block {
  blockType: string
  // ... midnight dashboard fields
  networkId?: 'TestNet' | 'MainNet' | 'DevNet'
  loggingLevel?: 'debug' | 'info' | 'warn' | 'error'
  title?: string
  description?: string
}

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks?.map((block, index) => {
        switch (block.blockType) {
          case 'midnightDashboard':
            return (
              <MidnightDashboardBlock
                key={index}
                networkId={block.networkId}
                loggingLevel={block.loggingLevel}
                title={block.title}
                description={block.description}
              />
            )
          // ... handle other block types
          default:
            return null
        }
      })}
    </>
  )
}
```

### 3. Use in Your Pages

```tsx
// app/page.tsx
import { RenderBlocks } from '@/components/RenderBlocks'

export default async function Page() {
  const page = await fetch('http://localhost:3000/api/pages/home').then(r => r.json())
  
  return (
    <div>
      <RenderBlocks blocks={page.layout} />
    </div>
  )
}
```

## Block Configuration

When adding the block in the Payload admin panel, you can configure:

### Network ID
- **TestNet** (default): Test network for development
- **MainNet**: Production network
- **DevNet**: Development network

### Logging Level
- **debug**: Verbose logging for debugging
- **info** (default): Standard information logs
- **warn**: Warning messages only
- **error**: Error messages only

### Optional Display Fields
- **Dashboard Title**: Optional title displayed above the dashboard
- **Dashboard Description**: Optional description text

## Block Features

The rendered dashboard includes:

1. **Wallet Connection Section**
   - Connect/disconnect wallet
   - Display wallet address
   - Error handling

2. **Contract Operations**
   - Deploy new contracts
   - Join existing contracts
   - View contract status

3. **State Reader**
   - Get contract state
   - Get ledger state
   - Display formatted data

## Styling

The block comes with built-in dark theme styling. You can customize the appearance by:

1. **Using className prop**: Pass custom classes to the component
2. **CSS overrides**: Target the `[data-midnight-ui]` selector
3. **Wrapper styling**: Wrap the component in your own styled container

Example with custom styling:

```tsx
<MidnightDashboardBlock
  networkId="TestNet"
  className="my-custom-midnight-dashboard"
  title="Blockchain Dashboard"
  description="Connect your wallet and interact with smart contracts"
/>
```

```css
.my-custom-midnight-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
```

## Environment Variables

You can set default values via environment variables:

```env
NEXT_PUBLIC_MIDNIGHT_NETWORK_ID=TestNet
NEXT_PUBLIC_LOG_LEVEL=info
```

## TypeScript Support

The block exports full TypeScript types:

```ts
import type { MidnightDashboardBlockProps } from 'midnight/client'

const props: MidnightDashboardBlockProps = {
  networkId: 'TestNet',
  loggingLevel: 'info',
  title: 'My Dashboard',
  description: 'A custom Midnight dashboard',
}
```

## Example: Custom Dashboard Page

Here's a complete example of creating a dedicated dashboard page:

```ts
// payload.config.ts
import { MidnightDashboard } from 'midnight'

const Dashboard = {
  slug: 'dashboard',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [MidnightDashboard],
    },
  ],
}
```

```tsx
// app/dashboard/page.tsx
'use client'

import { MidnightDashboardBlock } from 'midnight/client'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Midnight Blockchain Dashboard</h1>
      <MidnightDashboardBlock
        networkId="TestNet"
        loggingLevel="info"
        title="Smart Contract Management"
        description="Deploy, manage, and interact with your Midnight smart contracts"
      />
    </div>
  )
}
```

## Troubleshooting

### Block not appearing in admin
- Ensure the `MidnightDashboard` block is imported and added to your blocks array
- Check that the `midnight` plugin is properly configured

### Components not loading
- Verify that `midnight-setup-ui` package is installed
- Check browser console for WASM loading errors
- Ensure proper environment variables are set

### Styling issues
- The component requires client-side rendering (`'use client'`)
- Ensure dynamic import with `ssr: false` is used
- Check for CSS conflicts with your theme

## Advanced Usage

### Multiple Dashboards

You can add multiple dashboard blocks to a single page, each with different configurations:

```tsx
<MidnightDashboardBlock networkId="TestNet" title="Test Network" />
<MidnightDashboardBlock networkId="MainNet" title="Main Network" />
```

### Custom Wrapper

Create a custom wrapper for additional functionality:

```tsx
import { MidnightDashboardBlock } from 'midnight/client'

export function CustomDashboard() {
  const handleWalletConnect = () => {
    console.log('Wallet connected!')
  }
  
  return (
    <div className="custom-wrapper">
      <MidnightDashboardBlock 
        networkId="TestNet"
        title="My Custom Dashboard"
      />
    </div>
  )
}
```

## Support

For issues or questions, refer to:
- Midnight documentation
- PayloadCMS block documentation
- MeshJS Midnight SDK documentation
