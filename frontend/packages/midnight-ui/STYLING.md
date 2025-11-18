# Midnight UI Styling

The midnight-ui package uses Tailwind CSS for styling with custom scoped styles for the dark theme.

## Architecture

1. **Tailwind CSS**: Base styling framework imported from the `shadcn` package
2. **Scoped Styles**: Custom dark theme styles in `midnight-ui.css` scoped to `[data-midnight-ui]`
3. **Component Classes**: Tailwind utility classes applied directly in React components

## Files

- `src/index.css` - Main entry point that imports all styles
- `src/midnight-ui.css` - Custom scoped styles for the midnight-ui dark theme
- `../../shadcn/src/styles/globals.css` - Tailwind base, components, and utilities

## Style Scoping

All custom midnight-ui styles are scoped to the `[data-midnight-ui]` attribute:

```tsx
<div data-midnight-ui>
  {/* All midnight-ui components go here */}
</div>
```

This ensures:
- Styles only apply within midnight-ui components
- No interference with PayloadCMS admin panel styles
- No global style pollution

## Tailwind Integration

The midnight-ui package works seamlessly with Tailwind:

1. **Content Paths**: Apps using midnight-ui must include it in Tailwind config:
   ```js
   // tailwind.config.mjs
   content: [
     '../../packages/midnight-ui/src/**/*.{ts,tsx,js,jsx}',
   ]
   ```

2. **Transpilation**: Apps must transpile the midnight-ui package:
   ```js
   // next.config.js
   transpilePackages: ['midnight-setup-ui']
   ```

## Theme Compatibility

The midnight-ui components are **theme-aware** and adapt to the application's light/dark mode:

- Uses CSS variables from the parent theme (`--background`, `--foreground`, etc.)
- Automatically adjusts colors when the `dark` class is toggled on the HTML element
- Respects the application's theme settings (glass, blue, paper, etc.)
- No hardcoded colors - all styling uses semantic theme tokens

## Custom Styling

The `midnight-ui.css` file contains scoped styles for:

- **Adaptive Theme**: Uses `hsl(var(--background))`, `hsl(var(--foreground))`, etc.
- **Buttons**: Primary, outline, ghost, and disabled states with theme colors
- **Forms**: Inputs, textareas, labels with theme-aware focus states
- **Cards**: Card backgrounds that match the application theme
- **Status Colors**: Success (emerald) and error (destructive) states
- **Interactive States**: Hover, focus, disabled using theme variables

## Using in Your App

### In PayloadCMS Plugin

The `midnight` PayloadCMS plugin automatically loads midnight-ui styles through dynamic imports:

```tsx
// packages/midnight/src/components/MidnightUIWrapper.tsx
const MidnightUIWrapper = dynamic(
  () => import('./MidnightUIWrapper'),
  { ssr: false }
)
```

### In Regular React Apps

Import the styles in your app entry point:

```tsx
// In your app/layout.tsx or main.tsx
import 'midnight-setup-ui' // Automatically includes CSS
```

## Customization

To customize midnight-ui styles:

1. **Override via className**: Add custom classes to the wrapper
   ```tsx
   <div data-midnight-ui className="custom-midnight-theme">
     {/* components */}
   </div>
   ```

2. **CSS Custom Properties**: Define theme variables
   ```css
   [data-midnight-ui].custom-theme {
     --midnight-bg: #000;
     --midnight-text: #fff;
   }
   ```

3. **Extend midnight-ui.css**: Add additional scoped rules
   ```css
   /* In your own CSS file */
   [data-midnight-ui] .my-custom-component {
     /* custom styles */
   }
   ```

## Troubleshooting

### Styles not applying

1. Ensure `data-midnight-ui` attribute is present on container
2. Check that CSS is imported in your app
3. Verify Tailwind content paths include midnight-ui

### Conflicting with PayloadCMS

- All midnight-ui styles are scoped to `[data-midnight-ui]`
- They should not affect PayloadCMS admin panel
- If conflicts occur, check for global CSS that might override scoped styles

### Tailwind classes not working

1. Verify midnight-ui is in Tailwind content paths
2. Ensure package is transpiled in Next.js config
3. Check that Tailwind is properly configured in your app
