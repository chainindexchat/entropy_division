import { Observable } from "rxjs";
import { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { type Logger } from "pino";
import { ledger } from "@midnight-setup/midnight-setup-contract";
import { deployContract, findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import {
  MidnightSetupContractProviders,
  MidnightSetupPrivateStateId,
  DerivedMidnightSetupContractState,
  ContractStateData,
  LedgerStateData,
  ContractInstance,
  DeployedContract,
} from "./common-types.js";

export interface DeployedMidnightSetupAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state: Observable<DerivedMidnightSetupContractState>;
  getContractState: () => Promise<ContractStateData>;
  getLedgerState: () => Promise<LedgerStateData>;
}
/**
 * NB: Declaring a class implements a given type, means it must contain all defined properties and methods, then take on other extra properties or class
 */

export class MidnightSetupAPI implements DeployedMidnightSetupAPI {
  deployedContractAddress: string;
  state: Observable<DerivedMidnightSetupContractState>;

  private constructor(
    private providers: MidnightSetupContractProviders,
    public readonly deployedContract: DeployedContract,
    private logger?: Logger
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;

    // Real state observable
    this.state = new Observable(subscriber => {
      subscriber.next({
        protocolTVL: [],
        projects: [],
      });
    });
  }

  async getContractState(): Promise<ContractStateData> {
    try {
      this.logger?.info("Getting contract state...", { address: this.deployedContractAddress });
      
      // Try to get contract state from public data provider
      const contractState = await this.providers.publicDataProvider.queryContractState(this.deployedContractAddress);
      
      if (contractState) {
        this.logger?.info("Contract state retrieved successfully");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stateAny = contractState as any;
        return {
          address: this.deployedContractAddress,
          data: contractState.data,
          blockHeight: stateAny.blockHeight?.toString(),
          blockHash: stateAny.blockHash?.toString(),
        };
      } else {
        this.logger?.warn("No contract state found");
        return {
          address: this.deployedContractAddress,
          data: null,
          message: "No contract state found at this address"
        };
      }
    } catch (error) {
      this.logger?.error("Failed to get contract state", { error: error instanceof Error ? error.message : error });
      return {
        address: this.deployedContractAddress,
        data: null,
        error: error instanceof Error ? error.message : "Failed to get contract state"
      };
    }
  }

  async getLedgerState(): Promise<LedgerStateData> {
    try {
      this.logger?.info("Getting ledger state...", { address: this.deployedContractAddress });
      
      const contractState = await this.getContractState();
      
        if (contractState.data) {
          // Try to parse the ledger state
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ledgerState = ledger(contractState.data as any);
            
            this.logger?.info("Ledger state parsed successfully", { 
              messageLength: ledgerState.message?.length
            });
          
          let decodedMessage = null;
          if (ledgerState.message && ledgerState.message.length > 0) {
            try {
              decodedMessage = new TextDecoder().decode(ledgerState.message);
            } catch (decodeError) {
              this.logger?.warn("Failed to decode message", { error: decodeError });
              decodedMessage = `[Binary data: ${ledgerState.message.length} bytes]`;
            }
          }
          
          return {
            address: this.deployedContractAddress,
            ledgerState: {
              message: decodedMessage,
            },
            blockHeight: contractState.blockHeight,
            blockHash: contractState.blockHash,
          };
        } catch (parseError) {
          this.logger?.warn("Failed to parse ledger state", { error: parseError });
          return {
            address: this.deployedContractAddress,
            rawData: contractState.data,
            parseError: parseError instanceof Error ? parseError.message : "Failed to parse ledger state"
          };
        }
      } else {
        return {
          address: this.deployedContractAddress,
          error: contractState.error || contractState.message
        };
      }
    } catch (error) {
      this.logger?.error("Failed to get ledger state", { error: error instanceof Error ? error.message : error });
      return {
        address: this.deployedContractAddress,
        error: error instanceof Error ? error.message : "Failed to get ledger state"
      };
    }
  }

  static async deployContract(
    providers: MidnightSetupContractProviders,
    contractInstance: ContractInstance,
    logger?: Logger
  ): Promise<MidnightSetupAPI> {
    logger?.info("Deploying contract...");
    
    try {
      // Get or create initial private state
      const initialPrivateState = await MidnightSetupAPI.getPrivateState(providers);
      
      // Real contract deployment using the wallet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deployedContract = (await deployContract(
        providers as any,
        {
          contract: contractInstance,
          initialPrivateState: initialPrivateState,
          privateStateId: MidnightSetupPrivateStateId,
        }
      )) as DeployedContract;

      logger?.info("Contract deployed successfully", { 
        address: deployedContract.deployTxData.public.contractAddress 
      });
      return new MidnightSetupAPI(providers, deployedContract, logger);
    } catch (error) {
      // Enhanced error extraction for wallet extension errors
      const errorDetails = extractErrorDetails(error);
      logger?.error("Failed to deploy contract", errorDetails);
      
      // Re-throw with better message if original has none
      if (error instanceof Error && !error.message && errorDetails.error) {
        const enhancedError = new Error(errorDetails.error);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      throw error;
    }
  }

  static async joinContract(
    providers: MidnightSetupContractProviders,
    contractInstance: ContractInstance,
    contractAddress: string,
    logger?: Logger
  ): Promise<MidnightSetupAPI> {
    logger?.info("Joining contract...", { contractAddress });
    
    try {
      // Get or create initial private state
      const initialPrivateState = await MidnightSetupAPI.getPrivateState(providers);
      
      // Real contract join using the wallet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingContract = (await findDeployedContract(
        providers as any,
        {
          contract: contractInstance,
          contractAddress: contractAddress,
          privateStateId: MidnightSetupPrivateStateId,
          initialPrivateState: initialPrivateState,
        }
      )) as DeployedContract;

      logger?.info("Successfully joined contract", { 
        address: existingContract.deployTxData.public.contractAddress 
      });
      return new MidnightSetupAPI(providers, existingContract, logger);
    } catch (error) {
      // Enhanced error extraction for wallet extension errors
      const errorDetails = extractErrorDetails(error);
      logger?.error("Failed to join contract", { 
        ...errorDetails,
        contractAddress
      });
      
      // Re-throw with better message if original has none
      if (error instanceof Error && !error.message && errorDetails.error) {
        const enhancedError = new Error(errorDetails.error);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      throw error;
    }
  }

  private static async getPrivateState(
    providers: MidnightSetupContractProviders
  ): Promise<Record<string, unknown>> {
    try {
      const existingPrivateState = await providers.privateStateProvider.get(
        MidnightSetupPrivateStateId
      );
      
      // If no existing state, return empty object (the contract will initialize it)
      return existingPrivateState ?? {};
    } catch (error) {
      console.warn("Error getting private state, returning empty object:", error);
      return {};
    }
  }
}

/**
 * Extract error details from various error types including wallet extension errors
 */
function extractErrorDetails(error: unknown): { error: string; stack?: string; errorType?: string } {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      error: error.message || error.toString() || 'Unknown error occurred',
      stack: error.stack,
      errorType: error.constructor.name
    };
  }
  
  // Handle objects with error properties (wallet extension errors)
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    
    // Try various common error property names
    const errorMsg = 
      (err.message as string) ||
      (err.error as string) ||
      (err.description as string) ||
      (err.reason as string) ||
      (err.info as string);
    
    if (errorMsg) {
      return {
        error: errorMsg,
        stack: err.stack as string | undefined,
        errorType: err.constructor?.name || 'APIError'
      };
    }
    
    // If no standard error property, try to stringify
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return {
          error: `Error details: ${stringified}`,
          errorType: err.constructor?.name || 'Unknown'
        };
      }
    } catch {
      // JSON.stringify failed
    }
    
    // Last resort: use toString or constructor name
    return {
      error: err.toString?.() || err.constructor?.name || 'Unknown error occurred',
      errorType: err.constructor?.name
    };
  }
  
  // Handle primitive values
  return {
    error: String(error) || 'Unknown error occurred',
    errorType: typeof error
  };
}

export * as utils from "./utils.js";

export * from "./common-types.js";

// Re-export types for external use
export type { ContractStateData, LedgerStateData, ContractInstance, DeployedContract } from "./common-types.js";
