"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the Midnight wallet is connected
 * Simple check based on localStorage and wallet provider
 */
export function useMidnightWalletState() {
  const [isConnected, setIsConnected] = useState(false);
  const isLoading = false; // Not currently tracking loading state

  useEffect(() => {
    // Function to check if wallet is connected
    const checkWalletState = () => {
      // Check localStorage first
      const storedState =
        localStorage.getItem("midnight-wallet-connected") === "true";

      let connected = storedState;

      // Check window.midnight.mnLace directly if available
      if (typeof window !== "undefined" && (window as any).midnight?.mnLace) {
        const mnLace = (window as any).midnight.mnLace;

        // Check for connection state properties
        if (mnLace.isConnected || mnLace.connected || mnLace._isConnected) {
          connected = true;
        }

        // Check if there's account/address information
        if (
          mnLace.address ||
          mnLace.account ||
          mnLace.accounts ||
          mnLace.selectedAddress
        ) {
          connected = true;
        }
      }

      // Update state if changed
      if (connected !== isConnected) {
        console.log(
          "Wallet connection state changed:",
          connected ? "CONNECTED" : "DISCONNECTED",
        );
        setIsConnected(connected);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "midnight-wallet-connected",
            connected.toString(),
          );
        }
      }
    };

    // Check immediately
    checkWalletState();

    // Listen for custom events from the wallet
    const handleWalletChange = () => {
      checkWalletState();
    };

    window.addEventListener("midnight-wallet-connected", handleWalletChange);
    window.addEventListener("midnight-wallet-disconnected", handleWalletChange);

    // Periodic check
    const interval = setInterval(checkWalletState, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "midnight-wallet-connected",
        handleWalletChange,
      );
      window.removeEventListener(
        "midnight-wallet-disconnected",
        handleWalletChange,
      );
    };
  }, [isConnected]);

  return { isConnected, isLoading };
}
