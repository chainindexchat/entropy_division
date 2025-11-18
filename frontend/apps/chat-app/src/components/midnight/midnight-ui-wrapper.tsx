"use client";

import { useEffect, useState } from "react";

/**
 * Midnight UI Wrapper
 * Renders a simple wallet connector UI in a modal overlay
 */
export function MidnightUIWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Listen for events to show/hide the Midnight UI
    const handleShow = () => {
      console.log("MidnightUIWrapper: Received show-midnight-ui event");
      setIsVisible(true);
    };
    const handleHide = () => {
      console.log("MidnightUIWrapper: Received hide-midnight-ui event");
      setIsVisible(false);
    };

    window.addEventListener("show-midnight-ui", handleShow);
    window.addEventListener("hide-midnight-ui", handleHide);

    console.log("MidnightUIWrapper: Event listeners registered");

    return () => {
      window.removeEventListener("show-midnight-ui", handleShow);
      window.removeEventListener("hide-midnight-ui", handleHide);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsVisible(false)}
        />
      )}

      {/* Midnight UI Container */}
      <div
        data-midnight-ui
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxWidth: "600px", maxHeight: "90vh", overflow: "auto" }}
      >
        <div className="bg-background rounded-lg shadow-2xl p-6">
          <MidnightWalletUI onClose={() => setIsVisible(false)} />
        </div>
      </div>
    </>
  );
}

// Simple wallet connector UI
function MidnightWalletUI({ onClose }: { onClose: () => void }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Midnight wallet/provider is available
      if (typeof window !== "undefined") {
        // Try the Midnight dApp connector API
        const midnightProvider = (window as any).midnight;

        if (midnightProvider) {
          let connected = false;

          // Check if mnLace API is available (Midnight Lace wallet)
          if (midnightProvider.mnLace) {
            const mnLace = midnightProvider.mnLace;
            console.log("Using Midnight Lace wallet API");
            console.log("mnLace API:", mnLace);
            console.log(
              "mnLace methods:",
              Object.keys(mnLace).filter(
                (key) => typeof mnLace[key] === "function",
              ),
            );

            // Try to enable/connect the wallet
            if (typeof mnLace.enable === "function") {
              await mnLace.enable();
              connected = true;
            } else if (typeof mnLace.connect === "function") {
              await mnLace.connect();
              connected = true;
            } else if (typeof mnLace.isEnabled === "function") {
              const enabled = await mnLace.isEnabled();
              if (enabled) {
                connected = true;
              } else if (typeof mnLace.enable === "function") {
                await mnLace.enable();
                connected = true;
              }
            } else {
              // Assume it's already enabled if the API exists
              console.log("mnLace API exists, assuming connected");
              connected = true;
            }
          }
          // Fallback: try standard methods
          else if (typeof midnightProvider.enable === "function") {
            console.log("Using enable() method");
            await midnightProvider.enable();
            connected = true;
          } else if (typeof midnightProvider.connect === "function") {
            console.log("Using connect() method");
            await midnightProvider.connect();
            connected = true;
          }

          if (connected) {
            // Persist connection state
            localStorage.setItem("midnight-wallet-connected", "true");

            // Dispatch event so the state detector picks it up
            window.dispatchEvent(new CustomEvent("midnight-wallet-connected"));

            // Close the dialog after successful connection
            setTimeout(() => onClose(), 500);
          }
        } else {
          setError(
            "Midnight wallet extension not found. Please install the Midnight browser extension first.",
          );
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMsg);
      console.error("Midnight wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-bold">Midnight Wallet</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-md"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Midnight wallet to interact with Midnight smart
            contracts and deploy dApps.
          </p>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
            <li>Install the Midnight browser extension</li>
            <li>Click connect to authorize this app</li>
            <li>Use the dropdown menu to deploy or join contracts</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Connecting...
            </>
          ) : (
            "Connect Midnight Wallet"
          )}
        </button>

        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Don&apos;t have the extension?
          </p>
          <button
            onClick={() => window.open("https://midnight.network", "_blank")}
            className="w-full text-xs text-primary hover:underline"
          >
            Visit Midnight Network →
          </button>
        </div>
      </div>
    </div>
  );
}
