# Midnight MCP implementation

We are building an MCP server for the Midnight blockchain.

## System components

- [Bun runtime](https://bun.com/llms.txt)
- [Effect-TS](https://effect.website/llms-full.txt).
- Midnight blockchain (stored in `./reference/midnight`
  - Start with `./reference/midnight/midnight-docs`
  - Examine the other repos to understand how the Midnight blockchain works at
    the low-level, most importantly:
    - Midnight ledger: `./reference/midnight/midnight-ledger`
    - Compact language: `./reference/midnight/compact`
    - Smart contract examples: `./reference/midnight/examples`
- Model context protocol (MCP); stored in `./reference/mcp`
  - Start with top-level specs (stored in
    `./reference/mcp/modelcontextprotocol`)
  - Examine other repos to understand how the protocol gets implemented for
    different use-cases in general:
    - Typescript SDK: `./reference/mcp/typescript-sdk`
    - Implementation examples: `./reference/mcp/examples`

This is a lot of content, but the success of this project will require your
ability to internalize and properly apply all of it. You need to understand as
much as possible.

## DevOps/tooling

We use a Nix flake, along with [flake-parts](https://flake.parts) and
[Devenv](https://devenv.sh), for provisioning. We recommend that developers
either use NixOS or
[Determinate Nix](https://manual.determinate.systems/introduction.html) with
MacOS or an FHS-based Linux distro such as Ubuntu.

Midnight uses Docker, so we plan to set up Podman with Devenv for local
implementation/testing and deploy on a home-grown Kubernetes cluster running
[Talos Linux](https://docs.siderolabs.com) with Sidero Omni.
