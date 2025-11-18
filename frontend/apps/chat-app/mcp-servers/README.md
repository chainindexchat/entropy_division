# Midnight MCP Server Configuration for Better-Chatbot

This directory contains MCP server configurations for integrating the Midnight blockchain MCP server with better-chatbot.

## Configuration Files

### `midnight-mcp.json` (Docker - Recommended)
Uses the Docker image for the Midnight MCP server. This is the recommended approach for production use.

**Prerequisites:**
- Docker installed and running
- Midnight MCP Docker image built: `docker build -t midnight-mcp:latest /Users/dixieflatline/Documents/Repositories/midnight-mcp`

**Configuration:**
```json
{
  "name": "midnight-mcp",
  "config": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e",
      "MIDNIGHT_GRAPHQL_ENDPOINT=http://host.docker.internal:8080/graphql",
      "midnight-mcp:latest"
    ]
  }
}
```

### `midnight-mcp-nix.json` (Nix Development)
Uses the Nix development environment directly. Useful for development and debugging.

**Prerequisites:**
- Nix installed with flakes enabled
- midnight-mcp repository at `/Users/dixieflatline/Documents/Repositories/midnight-mcp`
- Bun installed via Nix devenv

**Configuration:**
```json
{
  "name": "midnight-mcp-nix",
  "config": {
    "command": "/nix/var/nix/profiles/default/bin/nix",
    "args": [
      "develop",
      "--no-pure-eval",
      "/Users/dixieflatline/Documents/Repositories/midnight-mcp",
      "--command",
      "bun",
      "run",
      "src/index.ts"
    ]
  }
}
```

## How to Add to Better-Chatbot

1. **Import the configuration** through the better-chatbot UI:
   - Go to the MCP Dashboard in better-chatbot
   - Click "Add MCP Server"
   - Import one of the JSON configuration files from this directory

2. **Verify the connection:**
   - The server should show as "connected" in the dashboard
   - Available tools should be listed

## Available Tools

The Midnight MCP server provides the following tools:

- **`echo`** - Simple echo test tool
- **`get_latest_block`** - Get the latest block from the Midnight ledger
- **`get_block`** - Get a specific block by height or hash
- **`get_transaction`** - Get transaction details by hash or identifier
- **`get_contract_action`** - Get contract action details by address and offset
- **`get_dust_generation_status`** - Get DUST generation status for Cardano stake keys

## GraphQL Endpoint Configuration

The Midnight MCP server needs to connect to a Midnight blockchain GraphQL indexer.

**Default endpoint:** `http://localhost:8080/graphql`

To change the endpoint, modify the `MIDNIGHT_GRAPHQL_ENDPOINT` environment variable in the configuration:

```json
"env": {
  "MIDNIGHT_GRAPHQL_ENDPOINT": "http://your-indexer:8080/graphql"
}
```

For Docker configurations, use `host.docker.internal` to access services on the host machine:
```
http://host.docker.internal:8080/graphql
```

## Troubleshooting

### Server won't connect
- Ensure Docker is running (for Docker config)
- Verify the Midnight MCP image is built: `docker images | grep midnight-mcp`
- Check that the GraphQL endpoint is accessible

### Tool calls fail
- Verify the Midnight GraphQL indexer is running
- Check the `MIDNIGHT_GRAPHQL_ENDPOINT` is correct
- View server logs in the better-chatbot console

### Nix configuration issues
- Ensure Nix is properly installed: `/nix/var/nix/profiles/default/bin/nix --version`
- Verify the midnight-mcp path is correct
- Try running the command manually to debug

## Development

For development and testing, you can run the MCP server manually:

```bash
# Using Docker
docker run -i -e MIDNIGHT_GRAPHQL_ENDPOINT=http://host.docker.internal:8080/graphql midnight-mcp:latest

# Using Nix
cd /Users/dixieflatline/Documents/Repositories/midnight-mcp
nix develop --no-pure-eval --command bun run src/index.ts
```

Then interact with it via the MCP protocol on stdin/stdout.
