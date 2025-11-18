import { Data, Effect, Schema } from "effect";

import {
  BlockSchema,
  ContractActionSchema,
  DustGenerationStatusSchema,
  EchoSchema,
  TransactionSchema,
} from "../schema.ts";
import type { LevelPrivateStateProviderConfig } from "@midnight-ntwrk/midnight-js-level-private-state-provider";

export const echoTool = ({ message }: Schema.Schema.Type<typeof EchoSchema>) =>
  Effect.sync(() =>
    Data.struct({
      content: Data.array([
        Data.struct({
          type: "text" as const,
          text: `Echo: ${message}`,
        }),
      ]),
    })
  );

export const latestBlockTool = (
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({
      block: { hash: true, height: true, timestamp: true },
    }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        content: Data.array([
          Data.struct({
            type: "text" as const,
            text: JSON.stringify(data.block),
          }),
        ]),
      })
    ),
  );

export const blockTool = (
  params: Schema.Schema.Type<typeof BlockSchema>,
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({
      block: {
        hash: true,
        height: true,
        protocolVersion: true,
        timestamp: true,
        author: true,
        parent: { hash: true },
        transactions: { id: true, hash: true },
      },
    }).withVariables({ offset: params }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        content: Data.array([
          Data.struct({
            type: "text" as const,
            text: JSON.stringify(data.block),
          }),
        ]),
      })
    ),
  );

export const transactionTool = (
  params: Schema.Schema.Type<typeof TransactionSchema>,
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({
      transactions: {
        id: true,
        hash: true,
        protocolVersion: true,
        merkleTreeRoot: true,
        block: { height: true, hash: true },
        identifiers: true,
        contractActions: {
          __typename: true,
          on_ContractDeploy: { address: true, state: true },
          on_ContractCall: { address: true, entryPoint: true },
          on_ContractUpdate: { address: true },
        },
        fees: { paidFees: true, estimatedFees: true },
        transactionResult: { status: true },
      },
    }).withVariables({ offset: params }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        content: Data.array([
          Data.struct({
            type: "text" as const,
            text: JSON.stringify(data.transactions),
          }),
        ]),
      })
    ),
  );

export const contractActionTool = (
  params: Schema.Schema.Type<typeof ContractActionSchema>,
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({
      contractAction: {
        __typename: true,
        on_ContractDeploy: {
          address: true,
          state: true,
          zswapState: true,
          unshieldedBalances: { tokenType: true, amount: true },
        },
        on_ContractCall: {
          address: true,
          state: true,
          entryPoint: true,
          zswapState: true,
          unshieldedBalances: { tokenType: true, amount: true },
        },
        on_ContractUpdate: {
          address: true,
          state: true,
          zswapState: true,
          unshieldedBalances: { tokenType: true, amount: true },
        },
      },
    }).withVariables({ address: params.address, offset: params.offset }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        content: Data.array([
          Data.struct({
            type: "text" as const,
            text: JSON.stringify(data.contractAction),
          }),
        ]),
      })
    ),
  );

export const dustGenerationStatusTool = (
  params: Schema.Schema.Type<typeof DustGenerationStatusSchema>,
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({
      dustGenerationStatus: {
        cardanoStakeKey: true,
        dustAddress: true,
        registered: true,
        nightBalance: true,
        generationRate: true,
        currentCapacity: true,
      },
    }).withVariables({ cardanoStakeKeys: params.stake_keys }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        content: Data.array([Data.struct({
          type: "text" as const,
          text: JSON.stringify(data.dustGenerationStatus),
        })]),
      })
    ),
  );

export const deployContractTool = () =>
  Effect.succeed(
    Data.struct({
      content: Data.array([Data.struct({
        type: "text" as const,
        text:
          "Contract deployment not yet implemented. Requires wallet setup and contract compilation.",
      })]),
    }),
  );

export const callContractTool = () =>
  Effect.succeed(
    Data.struct({
      content: Data.array([Data.struct({
        type: "text" as const,
        text:
          "Contract calling not yet implemented. Requires wallet setup and contract interface.",
      })]),
    }),
  );
