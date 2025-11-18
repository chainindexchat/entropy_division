/**
 * Midnight Contract Deployment Utility
 * Uses the midnight-api package for proper provider-based deployment
 */

import { MidnightSetupAPI } from "@meshsdk/midnight-setup";
import type { MidnightSetupContractProviders } from "@meshsdk/midnight-setup";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import type {
  BalancedTransaction,
  UnbalancedTransaction,
} from "@midnight-ntwrk/midnight-js-types";
import { Transaction, type CoinInfo } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
  setNetworkId,
  NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionId?: string;
  error?: string;
}

export interface JoinResult {
  success: boolean;
  contractAddress?: string;
  error?: string;
}

/**
 * Initialize Midnight providers from wallet
 * Based on midnight-ui/lib/actions.ts initialWalletAndProviders
 */
async function initializeProviders(
  wallet: DAppConnectorWalletAPI,
  uris: any,
): Promise<MidnightSetupContractProviders> {
  const walletState = await wallet.state();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "midnight-setup-private-state",
    }),
    zkConfigProvider: new FetchZkConfigProvider(
      window.location.origin,
      fetch.bind(window),
    ),
    proofProvider: httpClientProofProvider(uris.proverServerUri),
    publicDataProvider: indexerPublicDataProvider(
      uris.indexerUri,
      uris.indexerWsUri,
    ),
    walletProvider: {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(
        tx: UnbalancedTransaction,
        newCoins: CoinInfo[],
      ): Promise<BalancedTransaction> {
        return wallet
          .balanceAndProveTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId(),
            ),
            newCoins,
          )
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId(),
            ),
          )
          .then(createBalancedTx);
      },
    },
    midnightProvider: {
      submitTx(tx: BalancedTransaction) {
        return wallet.submitTransaction(tx);
      },
    },
  };
}

/**
 * Deploy a Midnight contract using proper SDK providers
 * This uses the same approach as the dapp/midnight-ui packages
 */
export async function deployMidnightContract(
  contractName: string,
): Promise<DeploymentResult> {
  try {
    console.log("Starting contract deployment:", contractName);

    // Set network ID to TestNet - required for address validation
    // This must be set before any Midnight SDK operations to match wallet configuration
    setNetworkId(NetworkId.TestNet);
    console.log("Network ID set to: TestNet");

    // Check if Midnight wallet connector is available
    if (typeof window === "undefined" || !(window as any).midnight?.mnLace) {
      throw new Error(
        "Midnight wallet (mnLace) not available. Please install and connect the wallet extension.",
      );
    }

    const mnLace = (window as any).midnight.mnLace;

    // Enable wallet
    const wallet = await mnLace.enable();
    const uris = await mnLace.serviceUriConfig();

    console.log("Wallet enabled, service URIs:", {
      proverServerUri: uris.proverServerUri,
      indexerUri: uris.indexerUri,
      indexerWsUri: uris.indexerWsUri,
    });

    // Initialize providers
    const providers = await initializeProviders(wallet, uris);

    console.log("Wallet and providers initialized successfully");

    // Dynamically import the contract
    const { Contract } = await import(
      "@midnight-setup/midnight-setup-contract"
    );
    const contractInstance = new Contract({});

    console.log("Contract instance created, deploying...");

    // Deploy using the MidnightSetupAPI (same as midnight-ui does)
    const api = await MidnightSetupAPI.deployContract(
      providers,
      contractInstance,
    );

    console.log("Contract deployed successfully!");

    return {
      success: true,
      contractAddress: api.deployedContractAddress,
    };
  } catch (error) {
    console.error("Contract deployment failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Join an existing Midnight contract using proper SDK providers
 * This uses the same approach as deployMidnightContract
 */
export async function joinMidnightContract(
  contractAddress: string,
): Promise<JoinResult> {
  try {
    console.log("Starting contract join:", contractAddress);

    // Set network ID to TestNet
    setNetworkId(NetworkId.TestNet);
    console.log("Network ID set to: TestNet");

    // Check if Midnight wallet connector is available
    if (typeof window === "undefined" || !(window as any).midnight?.mnLace) {
      throw new Error(
        "Midnight wallet (mnLace) not available. Please install and connect the wallet extension.",
      );
    }

    const mnLace = (window as any).midnight.mnLace;

    // Enable wallet
    const wallet = await mnLace.enable();
    const uris = await mnLace.serviceUriConfig();

    console.log("Wallet enabled, service URIs:", {
      proverServerUri: uris.proverServerUri,
      indexerUri: uris.indexerUri,
      indexerWsUri: uris.indexerWsUri,
    });

    // Initialize providers
    const providers = await initializeProviders(wallet, uris);

    console.log("Wallet and providers initialized successfully");

    // Dynamically import the contract
    const { Contract } = await import(
      "@midnight-setup/midnight-setup-contract"
    );
    const contractInstance = new Contract({});

    console.log("Contract instance created, joining...");

    // Join using the MidnightSetupAPI
    const api = await MidnightSetupAPI.joinContract(
      providers,
      contractInstance,
      contractAddress,
    );

    console.log("Successfully joined contract!");

    return {
      success: true,
      contractAddress: api.deployedContractAddress,
    };
  } catch (error) {
    console.error("Contract join failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
