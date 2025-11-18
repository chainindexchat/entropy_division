// src/polyfills.ts - Browser polyfills
import { Buffer } from 'buffer'

// Only setup polyfills in browser environment
if (typeof window !== 'undefined') {
  // Make Buffer available globally
  window.Buffer = Buffer
  window.global = window.global || window
  window.process = window.process || { env: {} }
}

// Export for direct imports
export { Buffer }
