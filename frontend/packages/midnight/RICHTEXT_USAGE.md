# Using Midnight Dashboard in Rich Text Fields

The Midnight Dashboard block is now available as an inline block within PayloadCMS rich text fields.

## Setup Complete

The following changes have been made to enable midnight-ui blocks in rich text:

### 1. Server-Side Configuration
- `packages/shadcn/src/blocks/DashboardWidgets/RichText/config.server.ts`
  - Added `MidnightDashboard` to the available blocks in the Lexical editor
  - The block is now available in the rich text editor toolbar

### 2. Client-Side Rendering
- `packages/shadcn/src/blocks/DashboardWidgets/RichText/Component.tsx`
  - Added converter for `midnightDashboard` block type
  - Renders `MidnightDashboardBlock` component with all configured fields

- `apps/dapp/src/components/RichText/index.tsx`
  - Added converter for general rich text rendering throughout the app
  - Ensures midnight dashboard renders in all rich text contexts

## Usage

### In the PayloadCMS Admin Panel

1. **Navigate to a Dashboard Collection**
   - Go to any dashboard with a rich text widget
   - Or create a new page/post with rich text fields

2. **Add Midnight Dashboard Block**
   - Click in the rich text editor
   - Click the "+" button or use the block menu
   - Select "Midnight Dashboard" from the available blocks

3. **Configure the Block**
   - **Network ID**: Choose TestNet, MainNet, or DevNet
   - **Logging Level**: Select debug, info, warn, or error
   - **Title** (optional): Add a title above the dashboard
   - **Description** (optional): Add a description text

4. **Save and View**
   - Save your document
   - View the page to see the rendered midnight dashboard

### Example Rich Text Content

```json
{
  "root": {
    "children": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Here's your Midnight blockchain dashboard:"
          }
        ]
      },
      {
        "type": "block",
        "fields": {
          "blockType": "midnightDashboard",
          "networkId": "TestNet",
          "loggingLevel": "info",
          "title": "Midnight Network Dashboard",
          "description": "Connect your wallet and manage smart contracts"
        }
      },
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "More content after the dashboard..."
          }
        ]
      }
    ]
  }
}
```

## Features Available in Rich Text

When embedded in rich text, the Midnight Dashboard provides:

✅ **Wallet Connection**
- Connect/disconnect Midnight wallet
- Display wallet address
- Error handling

✅ **Smart Contract Operations**
- Deploy new contracts
- Join existing contracts
- View deployment status

✅ **Blockchain State**
- Read contract state
- View ledger state
- Display formatted blockchain data

✅ **Responsive Design**
- Works in any rich text context
- Adapts to container width
- Mobile-friendly interface

## Block Configuration Options

### Network ID
- **TestNet** (default) - For development and testing
- **MainNet** - Production blockchain
- **DevNet** - Development network

### Logging Level
- **debug** - Verbose logging for troubleshooting
- **info** (default) - Standard information logs
- **warn** - Warning messages only
- **error** - Error messages only

### Display Options
- **Title** - Optional heading above the dashboard
- **Description** - Optional explanatory text

## Styling

The midnight dashboard within rich text:
- Uses scoped styles (`[data-midnight-ui]`)
- Won't affect surrounding content
- Maintains dark theme appearance
- Includes all interactive elements

## Technical Details

### Block Slug
`midnightDashboard`

### Component Rendering
```tsx
<MidnightDashboardBlock
  networkId={node.fields.networkId}
  loggingLevel={node.fields.loggingLevel}
  title={node.fields.title}
  description={node.fields.description}
/>
```

### Dependencies
- `midnight/client` - Client-side components
- `midnight-setup-ui/payload` - PayloadCMS-safe styles
- Lexical editor with BlocksFeature

## Where It Works

The Midnight Dashboard block is available in:

✅ **Rich Text Widgets** - Dashboard widgets with rich text content
✅ **Page Content** - Any page with rich text fields
✅ **Post Content** - Blog posts or articles
✅ **Custom Collections** - Any collection using rich text with blocks

## Troubleshooting

### Block not appearing in editor
1. Check that `MidnightDashboard` is in the BlocksFeature blocks array
2. Verify the midnight plugin is installed
3. Restart the development server

### Block not rendering on frontend
1. Ensure `MidnightDashboardBlock` is imported in RichText component
2. Check that the converter is registered for `midnightDashboard` slug
3. Verify client-side components are properly exported

### Styles not working
1. The midnight-ui styles are automatically loaded
2. Check browser console for CSS import errors
3. Ensure `[data-midnight-ui]` wrapper is present

### WASM errors
1. Midnight uses WebAssembly - ensure browser supports it
2. Check that webpack is configured for WASM (already set up)
3. Verify network connectivity for loading WASM modules

## Example Dashboards

### Simple Dashboard
- Add block with default settings
- No title or description
- TestNet network
- Info logging

### Labeled Dashboard
- Add custom title: "Blockchain Dashboard"
- Add description explaining purpose
- Choose appropriate network
- Set logging level for debugging

### Multiple Dashboards
- Add multiple midnight dashboard blocks
- Configure each for different networks
- Use titles to distinguish them
- Embed within rich text flow

## Support

For issues or questions:
- Check the main `BLOCK_USAGE.md` documentation
- Review `STYLE_ISOLATION_SUMMARY.md` for styling info
- See midnight-ui package documentation
