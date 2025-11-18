import useMidnightWallet from "../hookes/useMidnightWallet";
import { MidnightSetupAPI, type DeployedMidnightSetupAPI } from "@meshsdk/midnight-setup";
import { Contract } from "@midnight-setup/midnight-setup-contract";
import type { Logger } from "pino";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

export interface DeploymentProvider {
  readonly isJoining: boolean;
  readonly isDeploying: boolean;
  readonly error: string | null;
  readonly hasJoined: boolean;
  readonly hasDeployed: boolean;
  readonly midnightSetupApi: DeployedMidnightSetupAPI | undefined;
  readonly deployedContractAddress: string | undefined;
  onJoinContract: (address: string) => Promise<void>;
  onDeployContract: () => Promise<void>;
  clearError: () => void;
}

export const DeployedContractContext = createContext<DeploymentProvider | null>(null);

interface DeployedContractProviderProps extends PropsWithChildren {
  logger?: Logger;
}

const DeployedContractProvider = ({ 
  children, 
  logger
}: DeployedContractProviderProps) => {
  
  const [midnightSetupApi, setMidnightSetupApi] = useState<DeployedMidnightSetupAPI | undefined>(undefined);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [hasDeployed, setHasDeployed] = useState<boolean>(false);
  const [deployedContractAddress, setDeployedContractAddress] = useState<string | undefined>(undefined);

  // Use the custom hook instead of useContext directly
  const walletContext = useMidnightWallet();

  const onJoinContract = useCallback(async (address: string) => {
    console.log('[DeployedContractProvider] onJoinContract called with address:', address);
    console.log('[DeployedContractProvider] Current state:', { isJoining, hasJoined, isDeploying, hasDeployed });
    
    // Prevent multiple simultaneous joins
    if (isJoining || hasJoined || isDeploying || hasDeployed) {
      console.log('[DeployedContractProvider] Operation prevented - already in progress or completed');
      return;
    }
    
    // Validate requirements with detailed logging
    if (!walletContext) {
      console.log('[DeployedContractProvider] Validation failed: no wallet context');
      logger?.error("Join failed: wallet context is null");
      setError("Wallet context not available. Please refresh the page.");
      return;
    }
    
    if (!walletContext.walletState.hasConnected) {
      console.log('[DeployedContractProvider] Validation failed: wallet not connected');
      logger?.error("Join failed: wallet not connected", { 
        hasConnected: walletContext.walletState.hasConnected,
        address: walletContext.walletState.address 
      });
      setError("Wallet must be connected before joining contract");
      return;
    }
    
    if (!walletContext.walletState.providers) {
      console.log('[DeployedContractProvider] Validation failed: providers not initialized');
      logger?.error("Join failed: providers not initialized");
      setError("Wallet providers not initialized. Please reconnect your wallet.");
      return;
    }

    if (!address || !address.trim()) {
      console.log('[DeployedContractProvider] Validation failed: empty address');
      setError("Contract address is required");
      return;
    }

    console.log('[DeployedContractProvider] All validations passed, setting isJoining to true');
    setIsJoining(true);
    setError(null);

    try {
      console.log('[DeployedContractProvider] Creating contract instance and calling MidnightSetupAPI.joinContract');
      const contractInstance = new Contract({});
      const deployedAPI = await MidnightSetupAPI.joinContract(
        walletContext.walletState.providers,
        contractInstance,
        address,
        logger
      );
      
      console.log('[DeployedContractProvider] Successfully joined contract, updating state');
      setMidnightSetupApi(deployedAPI);
      setHasJoined(true);
      setDeployedContractAddress(deployedAPI.deployedContractAddress);
      logger?.info("Successfully joined contract", { contractAddress: address });
      
    } catch (error) {
      console.error('[DeployedContractProvider] Error joining contract:', error);
      const errMsg = extractErrorMessage(error, `Failed to join contract at ${address}`);
      setError(errMsg);
      logger?.error("Failed to join contract", { error: errMsg, contractAddress: address });
    } finally {
      console.log('[DeployedContractProvider] Setting isJoining to false');
      setIsJoining(false);
    }
  }, [isJoining, hasJoined, isDeploying, hasDeployed, walletContext?.walletState.hasConnected, walletContext?.walletState.providers, logger]);

  const onDeployContract = useCallback(async () => {
    // Prevent multiple simultaneous operations
    if (isDeploying || hasDeployed || isJoining || hasJoined) return;
    
    // Validate requirements with detailed logging
    if (!walletContext) {
      logger?.error("Deploy failed: wallet context is null");
      setError("Wallet context not available. Please refresh the page.");
      return;
    }
    
    if (!walletContext.walletState.hasConnected) {
      logger?.error("Deploy failed: wallet not connected", { 
        hasConnected: walletContext.walletState.hasConnected,
        address: walletContext.walletState.address 
      });
      setError("Wallet must be connected before deploying contract");
      return;
    }
    
    if (!walletContext.walletState.providers) {
      logger?.error("Deploy failed: providers not initialized");
      setError("Wallet providers not initialized. Please reconnect your wallet.");
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      const contractInstance = new Contract({});
      const deployedAPI = await MidnightSetupAPI.deployContract(
        walletContext.walletState.providers,
        contractInstance,
        logger
      );
      
      setMidnightSetupApi(deployedAPI);
      setHasDeployed(true);
      setDeployedContractAddress(deployedAPI.deployedContractAddress);
      logger?.info("Successfully deployed new contract", { 
        contractAddress: deployedAPI.deployedContractAddress 
      });
      
    } catch (error) {
      const errMsg = extractErrorMessage(error, "Failed to deploy new contract");
      setError(errMsg);
      logger?.error("Failed to deploy contract", { error: errMsg });
    } finally {
      setIsDeploying(false);
    }
  }, [isDeploying, hasDeployed, isJoining, hasJoined, walletContext?.walletState.hasConnected, walletContext?.walletState.providers, logger]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: DeploymentProvider = {
    isJoining,
    isDeploying,
    hasJoined,
    hasDeployed,
    error,
    midnightSetupApi,
    deployedContractAddress,
    onJoinContract,
    onDeployContract,
    clearError,
  };

  return (
    <DeployedContractContext.Provider value={contextValue}>
      {children}
    </DeployedContractContext.Provider>
  );
};

// Custom hook for consuming the context
export const useDeployedContract = (): DeploymentProvider => {
  const context = useContext(DeployedContractContext);
  
  if (!context) {
    throw new Error("useDeployedContract must be used within a DeployedContractProvider");
  }
  
  return context;
};

/**
 * Extract a meaningful error message from various error types
 * Handles wallet extension errors that may not have a standard .message property
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  // Try Error.message first
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  // Try common error object properties
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    
    const msg = 
      (err.message as string) ||
      (err.error as string) ||
      (err.description as string) ||
      (err.reason as string) ||
      (err.info as string);
    
    if (msg) return msg;
    
    // Try to get constructor name for APIError and similar
    const errorType = err.constructor?.name;
    if (errorType && errorType !== 'Object') {
      return `${errorType}: ${fallback}`;
    }
  }
  
  // Use fallback
  return fallback;
}

export default DeployedContractProvider;
