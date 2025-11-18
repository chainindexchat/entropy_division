# Midnight MCP

This project implements a Model Context Protocol (MCP) server for the Midnight
blockchain, enabling AI assistants to interact with Midnight's decentralized
ledger and smart contracts.

## Overview

The Midnight MCP server provides a standardized interface for AI models to query
blockchain data, execute transactions, and interact with Midnight's
privacy-preserving smart contracts built using the Compact language.

## System Components

- **[Bun runtime](https://bun.com/)**: Fast JavaScript runtime for server
  execution
- **[Effect-TS](https://effect.website/)**: Functional programming library for
  TypeScript
- **Midnight blockchain**: Privacy-focused blockchain platform
  - Core ledger implementation in `./reference/midnight/midnight-ledger`
  - Compact smart contract language in `./reference/midnight/compact`
  - Example contracts in `./reference/midnight/examples`
- **Model Context Protocol (MCP)**: Standardized protocol for AI-tool
  integration
  - Protocol specifications in `./reference/mcp/modelcontextprotocol`
  - TypeScript SDK in `./reference/mcp/typescript-sdk`
  - Implementation examples in `./reference/mcp/examples`

## DevOps/Tooling

- **Nix flake** with [flake-parts](https://flake.parts) and
  [Devenv](https://devenv.sh) for development environment provisioning
- **Docker/Podman** for containerized local testing
- **Kubernetes** cluster running [Talos Linux](https://docs.siderolabs.com) with
  Sidero Omni for production deployment

## Getting Started

### Prerequisites

We use Nix. If you don't run NixOS, then provision
[Determinate Nix](https://docs.determinate.systems/determinate-nix/) on MacOS or
an FHS-based Linux distros such as Ubuntu.

Furthermore, make sure you have `nix-direnv`; you can either add it to your
`nixosConfiguration` or `homeManagerConfiguration` if you use either of those
with Nix/OS, or you can `nix profile install nixpkgs#nix-direnv` if you use
Determinate Nix.

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd midnight-mcp
   ```

2. Enter the development environment:
   ```bash
   direnv allow
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Start development:
   ```bash
   bun run dev
   ```

## Usage

### MCP Server

The MCP server provides tools for querying Midnight blockchain data:

- `echo`: Echo a message back
- `get_latest_block`: Get the latest block from the Midnight ledger
- `get_block`: Get a block by height or hash
- `get_transaction`: Get transactions by hash or identifier
- `get_contract_action`: Get contract action by address and optional offset
- `get_dust_generation_status`: Get DUST generation status for Cardano stake
  keys

### MCP Client

A command-line client is provided to interact with the MCP server:

```bash
# Echo a message
bun run client echo "Hello World"

# Get the latest block
bun run client get-latest-block

# Get a block by height
bun run client get-block --height 123

# Get a block by hash
bun run client get-block --hash "abc123..."

# Get a transaction by hash
bun run client get-transaction --hash "tx123..."

# Get contract actions
bun run client get-contract-action "contract_address" --block-height 123

# Get DUST status
bun run client get-dust-status "stake_key1" "stake_key2"

# List available tools
bun run client list-tools

# List available resources
bun run client list-resources

# Read a resource
bun run client read-resource "midnight://ledger/status"
```

To use the client with a running MCP server, pipe the server output to the
client:

```bash
bun run dev | bun run client <command>
```

## Project Structure

- `src/index.ts`: MCP server implementation
- `src/client.ts`: MCP client implementation
- `reference/`: Midnight and MCP reference repos as submodules
- `flake.nix`: Nix flake configuration
