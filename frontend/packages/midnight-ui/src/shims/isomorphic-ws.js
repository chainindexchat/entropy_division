// Shim for isomorphic-ws to provide named exports in browser context
// This fixes: import * as ws from 'isomorphic-ws'

// Use globalThis which is available in modern browsers
const getWebSocket = () => {
  if (typeof globalThis !== 'undefined' && globalThis.WebSocket) {
    return globalThis.WebSocket
  }
  if (typeof window !== 'undefined' && window.WebSocket) {
    return window.WebSocket
  }
  if (typeof self !== 'undefined' && self.WebSocket) {
    return self.WebSocket
  }
  if (typeof global !== 'undefined' && global.WebSocket) {
    return global.WebSocket
  }
  // Fallback for older browsers
  if (typeof MozWebSocket !== 'undefined') {
    return MozWebSocket
  }
  return null
}

const ws = getWebSocket()

// Export both default and named export for compatibility
export default ws
export { ws as WebSocket }
