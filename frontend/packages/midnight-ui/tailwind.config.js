import shadcnConfig from '../shadcn/tailwind.config.ts';

/** @type {import('tailwindcss').Config} */
export default {
  // Extend shadcn config rather than spreading to preserve all configuration
  presets: [shadcnConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include shadcn components for proper class detection
    "../shadcn/src/**/*.{ts,tsx}",
  ],
  // Ensure important strategy works in PayloadCMS context
  important: false,
}
