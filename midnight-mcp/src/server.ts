import { Config, Effect, Schema } from "effect";
import { McpServer } from "@effect/ai";
import { Resource, Tool } from "@effect/ai/McpSchema";

import { DocumentBuilder, Graffle } from "graffle";
// import { DocumentBuilder } from "graffle/extensions/document-builder";
import _ from "lodash";

import {
  BlockSchema,
  ContractActionSchema,
  DustGenerationStatusSchema,
  EchoSchema,
  LatestBlockSchema,
  TransactionSchema,
} from "./schema.ts";

import { readResourceRequestHandler } from "./capabilities/resources.ts";
import {
  blockTool,
  callContractTool,
  contractActionTool,
  deployContractTool,
  dustGenerationStatusTool,
  echoTool,
  latestBlockTool,
  transactionTool,
} from "./capabilities/tools.ts";

export const configureServer = Effect.gen(function* () {
  const server = yield* McpServer.McpServer;
  const graffleClient = Graffle.create().use(DocumentBuilder()).transport({
    url: yield* Config.string("GRAPHQL_URL").pipe(
      Config.withDefault("https://rpc.testnet-02.midnight.network/graphql"),
    ),
  });

  yield* server.addTool({
    tool: new Tool({
      name: "echo",
      description: "Echo message",
      inputSchema: EchoSchema,
    }),
    handle: echoTool,
  });

  yield* server.addTool({
    tool: new Tool({
      name: "get_latest_block",
      description: "Get latest block",
      inputSchema: LatestBlockSchema,
    }),
    handle: (_param: Schema.Schema.Type<typeof LatestBlockSchema>) =>
      latestBlockTool(graffleClient),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "get_block",
      description: "Get block",
      inputSchema: BlockSchema,
    }),
    handle: (args: Schema.Schema.Type<typeof BlockSchema>) =>
      blockTool(args, graffleClient),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "get_transaction",
      description: "Get transaction",
      inputSchema: TransactionSchema,
    }),
    handle: (args: Schema.Schema.Type<typeof TransactionSchema>) =>
      transactionTool(args, graffleClient),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "get_contract_action",
      description: "Get contract action",
      inputSchema: ContractActionSchema,
    }),
    handle: (args: Schema.Schema.Type<typeof ContractActionSchema>) =>
      contractActionTool(args, graffleClient),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "get_dust_generation_status",
      description: "Get dust generation status",
      inputSchema: DustGenerationStatusSchema,
    }),
    handle: (args: Schema.Schema.Type<typeof DustGenerationStatusSchema>) =>
      dustGenerationStatusTool(args, graffleClient),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "deploy_contract",
      description: "Deploy contract",
      inputSchema: {},
    }),
    handle: (_args: unknown) => deployContractTool(),
  });
  yield* server.addTool({
    tool: new Tool({
      name: "call_contract",
      description: "Call contract",
      inputSchema: {},
    }),
    handle: (_args: unknown) => callContractTool(),
  });

  yield* server.addResource(
    new Resource({
      uri: "midnight://ledger/status",
      name: "ledger_status",
      description: "Midnight ledger status",
    }),
    readResourceRequestHandler(graffleClient),
  );
});
