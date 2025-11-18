"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  lazy,
  Suspense,
} from "react";

// Dynamically import dialogs to create async split point for WASM loading
const DeployContractDialog = lazy(() =>
  import("./deploy-contract-dialog").then((m) => ({
    default: m.DeployContractDialog,
  })),
);
const JoinContractDialog = lazy(() =>
  import("./join-contract-dialog").then((m) => ({
    default: m.JoinContractDialog,
  })),
);

interface MidnightDialogsContextType {
  openDeployContract: () => void;
  openJoinContract: () => void;
  openDisconnectWallet: () => void;
}

const MidnightDialogsContext = createContext<MidnightDialogsContextType | null>(
  null,
);

export function useMidnightDialogs() {
  const context = useContext(MidnightDialogsContext);
  if (!context) {
    throw new Error(
      "useMidnightDialogs must be used within MidnightDialogsProvider",
    );
  }
  return context;
}

interface MidnightDialogsProviderProps {
  children: ReactNode;
}

export function MidnightDialogsProvider({
  children,
}: MidnightDialogsProviderProps) {
  const [deployOpen, setDeployOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  // const [disconnectOpen, setDisconnectOpen] = useState(false) // TODO: Implement disconnect dialog

  const openDeployContract = () => setDeployOpen(true);
  const openJoinContract = () => setJoinOpen(true);
  const openDisconnectWallet = () => {
    // TODO: Implement disconnect logic
    console.log("Disconnect wallet requested");
  };

  useEffect(() => {
    // Listen for navigation callback events
    const handleDeployEvent = () => {
      console.log(
        "MidnightDialogsProvider: Received midnight-open-deploy-dialog event",
      );
      setDeployOpen(true);
    };
    const handleJoinEvent = () => {
      console.log(
        "MidnightDialogsProvider: Received midnight-open-join-dialog event",
      );
      setJoinOpen(true);
    };
    const handleDisconnectEvent = () => {
      console.log(
        "MidnightDialogsProvider: Received midnight-open-disconnect-dialog event",
      );
      // TODO: Implement disconnect dialog
    };

    window.addEventListener("midnight-open-deploy-dialog", handleDeployEvent);
    window.addEventListener("midnight-open-join-dialog", handleJoinEvent);
    window.addEventListener(
      "midnight-open-disconnect-dialog",
      handleDisconnectEvent,
    );

    console.log("MidnightDialogsProvider: Event listeners registered");

    return () => {
      window.removeEventListener(
        "midnight-open-deploy-dialog",
        handleDeployEvent,
      );
      window.removeEventListener("midnight-open-join-dialog", handleJoinEvent);
      window.removeEventListener(
        "midnight-open-disconnect-dialog",
        handleDisconnectEvent,
      );
    };
  }, []);

  return (
    <MidnightDialogsContext.Provider
      value={{
        openDeployContract,
        openJoinContract,
        openDisconnectWallet,
      }}
    >
      {children}

      {/* Render the dialogs with Suspense for lazy loading */}
      <Suspense fallback={null}>
        {deployOpen && (
          <DeployContractDialog
            open={deployOpen}
            onOpenChange={setDeployOpen}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {joinOpen && (
          <JoinContractDialog open={joinOpen} onOpenChange={setJoinOpen} />
        )}
      </Suspense>

      {/* TODO: Add DisconnectWallet dialog if needed */}
    </MidnightDialogsContext.Provider>
  );
}
