/**
 * Midnight Wallet Connection Utilities
 * Functions to interact with the Midnight wallet UI
 */

/**
 * Connect to Midnight wallet
 * Shows the Midnight UI overlay for wallet connection
 */
export function connectWallet() {
  console.log("connectWallet: Opening Midnight UI overlay");
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-midnight-ui");
    console.log("connectWallet: Dispatching event", event);
    window.dispatchEvent(event);
    console.log("connectWallet: Event dispatched");
  } else {
    console.error("connectWallet: window is undefined");
  }
}

/**
 * Deploy a new Midnight contract
 */
export function deployContract() {
  console.log("deployContract callback executed");
  window.dispatchEvent(new CustomEvent("midnight-open-deploy-dialog"));
}

/**
 * Join an existing Midnight contract
 */
export function joinContract() {
  console.log("joinContract callback executed");
  window.dispatchEvent(new CustomEvent("midnight-open-join-dialog"));
}

/**
 * Disconnect from Midnight wallet
 */
export function disconnectWallet() {
  console.log("disconnectWallet callback executed");

  // Clear connection state
  if (typeof window !== "undefined") {
    localStorage.removeItem("midnight-wallet-connected");
    window.dispatchEvent(new CustomEvent("midnight-wallet-disconnected"));
  }

  // Optionally show disconnect dialog for confirmation
  // window.dispatchEvent(new CustomEvent('midnight-open-disconnect-dialog'))
}
