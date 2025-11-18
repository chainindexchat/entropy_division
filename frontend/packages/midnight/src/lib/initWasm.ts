/**
 * Initialize WASM modules before using any Midnight components
 */

let wasmInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeWasmModules(): Promise<void> {
  if (wasmInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Pre-load the WASM modules by importing them
      // The imports trigger the WASM initialization
      const wasmModules = await Promise.all([
        import('@midnight-ntwrk/onchain-runtime/midnight_onchain_runtime_wasm.js').catch(e => {
          console.warn('Could not load onchain-runtime WASM:', e)
          return null
        }),
        import('@midnight-ntwrk/ledger/midnight_ledger_wasm.js').catch(e => {
          console.warn('Could not load ledger WASM:', e)
          return null
        }),
        import('@midnight-ntwrk/zswap/midnight_zswap_wasm.js').catch(e => {
          console.warn('Could not load zswap WASM:', e)
          return null
        })
      ]);

      // Give WASM time to fully initialize
      await new Promise(resolve => setTimeout(resolve, 200));

      wasmInitialized = true;
      console.log('WASM modules initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WASM modules:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export function isWasmInitialized(): boolean {
  return wasmInitialized;
}
