import { ConfigProvider, Effect, Layer } from "effect";
import { BunContext, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { HttpRouter } from "@effect/platform";
import { McpServer } from "@effect/ai";

import { configureServer } from "./server.ts";

// Create the server layer that combines MCP server with HTTP serving
const ServerLayer = Layer.mergeAll(
  Layer.effectDiscard(configureServer),
  HttpRouter.Default.serve(),
).pipe(
  Layer.provide(
    McpServer.layerHttp({
      name: "midnight-mcp",
      version: "0.0.1",
      path: "/sse",
    }),
  ),
  Layer.provide(BunHttpServer.layer({ port: 3000 })), // Start HTTP server on port 3000
);

// Launch the HTTP server
Layer.launch(ServerLayer).pipe(
  Effect.withConfigProvider(
    ConfigProvider.nested(ConfigProvider.fromEnv(), "MCP"),
  ),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
);
