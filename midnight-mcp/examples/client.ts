import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CallToolResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  Config,
  Console,
  Context,
  Data,
  Effect,
  Layer,
  Option,
  Schema,
} from "effect";
import { Args, Command, Options } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";

import _ from "lodash";

import * as z from "zod";

const CallToolParamsSchema = Schema.Struct({
  name: Schema.String,
  arguments: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

const ReadResourceParamsSchema = Schema.Struct({
  uri: Schema.String,
});

class MCPClient extends Context.Tag("Client")<Client, {
  readonly callTool: (
    params: Schema.Schema.Type<typeof CallToolParamsSchema>,
  ) => Effect.Effect<z.infer<typeof CallToolResultSchema>>;
  readonly listTools: () => Effect.Effect<
    z.infer<typeof ListToolsResultSchema>
  >;
  readonly listResources: () => Effect.Effect<
    z.infer<typeof ListResourcesResultSchema>
  >;
  readonly readResource: (
    params: Schema.Schema.Type<typeof ReadResourceParamsSchema>,
  ) => Effect.Effect<z.infer<typeof ReadResourceResultSchema>>;
}>() {}

const mcpClientLayer = Effect.sync(() =>
  new Client(
    {
      name: "midnight-client",
      version: "0.0.1",
    },
    {
      capabilities: {},
    },
  )
).pipe(
  Effect.tap((client) =>
    Config.string("SERVER_EXE_PATH").pipe(
      Effect.flatMap((serverExePath) =>
        Effect.promise(() =>
          client.connect(new StdioClientTransport({ command: serverExePath }))
        )
      ),
    )
  ),
  Effect.acquireRelease(
    (client) => Effect.promise(() => client.close()),
  ),
  Effect.map((client) => {
    return {
      callTool: (
        params: Schema.Schema.Type<typeof CallToolParamsSchema>,
      ) =>
        Effect.promise(() =>
          client.request(
            {
              method: "tools/call",
              params,
            },
            CallToolResultSchema,
          )
        ),
      listTools: () =>
        Effect.promise(() =>
          client.request(
            { method: "tools/list" },
            ListToolsResultSchema,
          )
        ),
      listResources: () =>
        Effect.promise(() =>
          client.request(
            { method: "resources/list" },
            ListResourcesResultSchema,
          )
        ),
      readResource: (
        params: Schema.Schema.Type<typeof ReadResourceParamsSchema>,
      ) =>
        Effect.promise(() =>
          client.request(
            {
              method: "resources/read",
              params,
            },
            ReadResourceResultSchema,
          )
        ),
    };
  }),
  Layer.effect(MCPClient),
);

// CLI Commands
const echoCommand = Command.make(
  "echo",
  { message: Args.text() },
  ({ message }) =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool(Data.struct({
          name: "echo",
          arguments: { message },
        }))
      ),
      Effect.map(CallToolResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.content)),
      Effect.flatMap(Console.log),
    ),
);

const getLatestBlockCommand = Command.make(
  "get-latest-block",
  Data.struct({}),
  () =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool({
          name: "get_latest_block",
          arguments: Data.struct({}),
        })
      ),
      Effect.map(CallToolResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.content)),
      Effect.flatMap(Console.log),
    ),
);

const getBlockCommand = Command.make("get-block", {
  height: Options.optional(Options.integer("height")),
  hash: Options.optional(Options.text("hash")),
}, ({ height, hash }) =>
  MCPClient.pipe(
    Effect.flatMap((client) =>
      client.callTool({
        name: "get_block",
        arguments: _.omitBy({
          height: Option.getOrUndefined(height),
          hash: Option.getOrUndefined(hash),
        }, _.isUndefined),
      })
    ),
  ));

const getTransactionCommand = Command.make("get-transaction", {
  hash: Options.optional(Options.text("hash")),
  identifier: Options.optional(Options.text("identifier")),
}, ({ hash, identifier }) =>
  MCPClient.pipe(
    Effect.flatMap((client) =>
      client.callTool({
        name: "get_transaction",
        arguments: _.omitBy({
          hash: Option.getOrUndefined(hash),
          identifier: Option.getOrUndefined(identifier),
        }, _.isUndefined),
      })
    ),
  ));

const getContractActionCommand = Command.make(
  "get-contract-action",
  {
    address: Args.text(),
    blockHeight: Options.integer("block-height").pipe(Options.optional),
    blockHash: Options.text("block-hash").pipe(Options.optional),
    txHash: Options.text("tx-hash").pipe(Options.optional),
    txIdentifier: Options.text("tx-identifier").pipe(Options.optional),
  },
  ({ address, blockHeight, blockHash, txHash, txIdentifier }) =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool({
          name: "get_contract_action",
          arguments: Data.struct({
            address: address.valueOf(),
            ...(_.omitBy({
              block_height: Option.getOrUndefined(blockHeight),
              block_hash: Option.getOrUndefined(blockHash),
              tx_hash: Option.getOrUndefined(txHash),
              tx_identifier: Option.getOrUndefined(txIdentifier),
            }, _.isUndefined)),
          }),
        })
      ),
    ),
);

const getDustGenerationStatusCommand = Command.make(
  "get-dust-generation-status",
  {
    stakeKeys: Args.repeated(Args.text()),
  },
  ({ stakeKeys }) =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool({
          name: "get_dust_generation_status",
          arguments: { stake_keys: stakeKeys },
        })
      ),
      Effect.map(CallToolResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.content)),
      Effect.flatMap(Console.log),
    ),
);

const deployContractCommand = Command.make(
  "deploy-contract",
  {
    contractType: Args.text(),
    walletSeed: Args.text(),
    indexer: Args.text(),
    indexerWs: Args.text(),
    node: Args.text(),
    proofServer: Args.text(),
  },
  ({ contractType, walletSeed, indexer, indexerWs, node, proofServer }) =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool({
          name: "deploy_contract",
          arguments: {
            contract_type: contractType,
            wallet_seed: walletSeed,
            network_config: {
              indexer,
              indexer_ws: indexerWs,
              node,
              proof_server: proofServer,
            },
          },
        })
      ),
      Effect.map(CallToolResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.content)),
      Effect.flatMap(Console.log),
    ),
);

const callContractCommand = Command.make(
  "call-contract",
  {
    contractAddress: Args.text(),
    method: Args.text(),
    walletSeed: Args.text(),
    indexer: Args.text(),
    indexerWs: Args.text(),
    node: Args.text(),
    proofServer: Args.text(),
    args: Args.text().pipe(Args.optional),
  },
  (
    {
      contractAddress,
      method,
      walletSeed,
      indexer,
      indexerWs,
      node,
      proofServer,
      args,
    },
  ) =>
    MCPClient.pipe(
      Effect.flatMap((client) =>
        client.callTool({
          name: "call_contract",
          arguments: {
            contract_address: contractAddress,
            method,
            wallet_seed: walletSeed,
            network_config: {
              indexer,
              indexer_ws: indexerWs,
              node,
              proof_server: proofServer,
            },
            ...(_.omitBy({
              args: Option.match(args, {
                onNone: () => undefined,
                onSome: (value) => JSON.parse(value),
              }),
            }, _.isUndefined)),
          },
        })
      ),
      Effect.map(CallToolResultSchema.parse),
      Effect.flatMap(Console.log),
    ),
);

const listToolsCommand = Command.make(
  "list-tools",
  {},
  () =>
    MCPClient.pipe(
      Effect.flatMap((client) => client.listTools()),
      Effect.map(ListResourcesResultSchema.parse),
      Effect.flatMap(Console.log),
    ),
);

const listResourcesCommand = Command.make(
  "list-resources",
  {},
  () =>
    MCPClient.pipe(
      Effect.flatMap((client) => client.listResources()),
      Effect.map(ListResourcesResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.resources)),
      Effect.flatMap(Console.log),
    ),
);

const readResourceCommand = Command.make(
  "read-resource",
  { uri: Args.text() },
  ({ uri }) =>
    MCPClient.pipe(
      Effect.flatMap((client) => client.readResource({ uri })),
      Effect.map(ReadResourceResultSchema.parse),
      Effect.map((result) => JSON.stringify(result.contents)),
      Effect.flatMap(Console.log),
    ),
);

// Root command with subcommands
const rootCommand = Command.make("midnight-client")
  .pipe(
    Command.withSubcommands([
      echoCommand,
      getLatestBlockCommand,
      getBlockCommand,
      getTransactionCommand,
      getContractActionCommand,
      getDustGenerationStatusCommand,
      deployContractCommand,
      callContractCommand,
      listToolsCommand,
      listResourcesCommand,
      readResourceCommand,
    ]),
    Command.run({ name: "Midnight MCP client CLI", version: "0.0.1" }),
  );

rootCommand(process.argv).pipe(
  Effect.provide(mcpClientLayer),
  Effect.scoped,
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
);
