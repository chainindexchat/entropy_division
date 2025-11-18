# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Commands

### Development & Build
- `pnpm dev` — Start Next.js dev server at http://localhost:3000
- `pnpm build` — Production build
- `pnpm build:local` — Local build (sets NO_HTTPS=1 for correct cookie settings)
- `pnpm start` — Run production build

### Testing
- `pnpm test` — Run unit tests (Vitest)
- `pnpm test:watch` — Watch mode for unit tests
- `pnpm test:e2e` — Run E2E tests (Playwright; starts app via webServer config)
- `pnpm test:e2e:ui` — Playwright UI mode
- `pnpm test:e2e:seed` — Seed test users for E2E tests
- `pnpm test:e2e:clean` — Clean up all test data
- Unit test files: `*.test.ts(x)` co-located with code or in `tests/`
- E2E test files: `tests/**/*.spec.ts`

### Quality Checks
- `pnpm lint` — ESLint + Biome checks
- `pnpm lint:fix` — Auto-fix linting issues
- `pnpm format` — Format code with Biome (2 spaces, LF, width 80, double quotes)
- `pnpm check-types` — TypeScript type checking
- `pnpm check` — Run all checks (lint, types, tests) before PR

### Database (Drizzle ORM)
- `pnpm db:push` — Push schema changes to database
- `pnpm db:studio` — Open Drizzle Studio (GUI)
- `pnpm db:migrate` — Run migrations
- `pnpm db:generate` — Generate migrations from schema
- `pnpm db:reset` — Drop and recreate database

### Docker
- `pnpm docker-compose:up` — Start full stack (app + PostgreSQL)
- `pnpm docker-compose:down` — Stop all services
- `pnpm docker:pg` — Start PostgreSQL only
- `pnpm docker:redis` — Start Redis only

## Project Architecture

### Core Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript with strict mode
- **AI SDK**: Vercel AI SDK with multi-provider support
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Better Auth (session-based)
- **Styling**: Tailwind CSS + Radix UI components
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Formatting/Linting**: Biome + ESLint

### Directory Structure
```
src/
├── app/                    # Next.js routes & API endpoints
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (chat)/            # Chat interface routes
│   ├── (public)/          # Public routes (exports, etc.)
│   ├── api/               # API routes
│   └── store/             # State management setup
├── components/            # React UI components (PascalCase.tsx)
├── lib/                   # Core business logic
│   ├── ai/               # AI-related functionality
│   │   ├── agent/        # Custom agent system
│   │   ├── mcp/          # Model Context Protocol integration
│   │   ├── tools/        # Built-in tools (code, web, image, etc.)
│   │   ├── workflow/     # Visual workflow system
│   │   └── models.ts     # LLM provider configurations
│   ├── auth/             # Better Auth configuration
│   ├── db/               # Database layer
│   │   ├── pg/           # PostgreSQL schema & queries
│   │   └── repository.ts # Data access patterns
│   ├── file-storage/     # File storage abstraction (Vercel Blob, S3)
│   └── validations/      # Zod validation schemas
├── hooks/                 # React hooks (useX pattern)
└── types/                 # TypeScript type definitions

tests/                     # E2E test suites
scripts/                   # Utility scripts
docker/                    # Docker configurations
public/                    # Static assets
```

### Key Architecture Patterns

#### AI System Architecture
This is an AI chatbot with extensible tool support:

1. **MCP (Model Context Protocol)**: Core integration system for external tools
   - Config storage: DB-based or file-based (FILE_BASED_MCP_CONFIG env var)
   - Client management: `src/lib/ai/mcp/create-mcp-clients-manager.ts`
   - Tool discovery: MCP servers expose tools that become callable in chat

2. **Built-in Tools** (`src/lib/ai/tools/`):
   - Code execution (JS/Python)
   - Web search (Exa AI integration)
   - Image generation (OpenAI, Gemini)
   - Data visualization (charts, tables)
   - HTTP client

3. **Custom Agents** (`src/lib/ai/agent/`):
   - Specialized AI assistants with custom system prompts
   - Can be invoked with `@agent_name` mentions
   - Access to specific tool subsets

4. **Visual Workflows** (`src/lib/ai/workflow/`):
   - Node-based automation builder
   - Connects LLM reasoning + tool execution nodes
   - Published workflows become callable tools in chat

5. **Multi-Provider LLM Support** (`src/lib/ai/models.ts`):
   - OpenAI, Anthropic, Google Gemini, xAI, Groq, Ollama, OpenRouter
   - Provider-agnostic via Vercel AI SDK

#### Authentication & Authorization
- **Auth Library**: Better Auth (session cookies)
- **Entry Point**: `src/lib/auth/auth-instance.ts`
- **Middleware**: `src/middleware.ts` protects routes
- **Roles & Permissions**: `src/lib/auth/roles.ts`, `src/lib/auth/permissions.ts`
- **OAuth Providers**: Google, GitHub, Microsoft (optional)

#### Database Layer
- **ORM**: Drizzle with PostgreSQL
- **Schema**: `src/lib/db/pg/schema.pg.ts`
- **Migrations**: Auto-generated in `src/lib/db/migrations/pg/`
- **Repository Pattern**: `src/lib/db/repository.ts` for data access

#### File Storage
- Abstraction layer in `src/lib/file-storage/`
- Supports: Vercel Blob (default), S3
- Configuration via FILE_STORAGE_TYPE env var

### Path Aliases (tsconfig.json)
- `@/*` → `src/*`
- `ui/*` → `src/components/ui/*`
- `auth/*` → `src/lib/auth/*`
- `lib/*` → `src/lib/*`
- `app-types/*` → `src/types/*`
- `logger` → `src/lib/logger.ts`

## Coding Standards

### Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useX.ts` (camelCase)
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### Style Rules
- Biome formatting: 2 spaces, LF, 80 char width, double quotes
- TypeScript everywhere; use `zod` for runtime validation
- Co-locate small tests next to code; larger suites in `tests/`
- Avoid circular dependencies; extract shared logic to `src/lib`

### Testing Requirements
- Add tests for new features and bug fixes
- Cover happy path + at least one failure mode
- Unit tests run before E2E in CI/CD

## Development Workflow

### Initial Setup
1. `pnpm i` (auto-creates `.env` from `.env.example`)
2. Fill required env vars (at minimum: one LLM API key + POSTGRES_URL + BETTER_AUTH_SECRET)
3. Start database: `pnpm docker:pg` or use existing PostgreSQL
4. Build: `pnpm build:local`
5. Run: `pnpm start` (or `pnpm dev` for development)

### Making Changes
1. Create feature branch: `feat/`, `fix/`, `chore/`
2. Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
3. Before PR: run `pnpm check` (lint + types + tests must pass)
4. Ensure E2E tests pass if UI/API changes made

### Environment Configuration
- **Required**: POSTGRES_URL, BETTER_AUTH_SECRET, at least one LLM API key
- **Recommended**: EXA_API_KEY (for web search tool)
- **Optional**: Redis (for multi-instance support), OAuth credentials, file storage config
- For local HTTPS: use `pnpm dev:https` or set BETTER_AUTH_URL to https://localhost:3000

## Special Considerations

### MCP Tool Development
- MCP servers can be DB-stored or file-based
- Tool IDs format: `mcp__{server_name}__{tool_name}`
- OAuth flow supported for MCP servers requiring auth
- See `docs/tips-guides/mcp-server-setup-and-tool-testing.md`

### Internationalization
- Uses `next-intl` for i18n
- Translation files in `messages/`
- Language contributions welcome (see `messages/language.md`)

### Security
- Never commit `.env` or secrets
- Use `NO_HTTPS=1` or `pnpm build:local` for local HTTP testing
- Session cookies require correct BETTER_AUTH_URL in production

### Performance
- Next.js App Router with React Server Components
- Code execution tools run in sandboxed environments
- File uploads handled via storage abstraction (Vercel Blob/S3)
- Optional Redis for multi-instance coordination

## Resources
- README.md: Full feature documentation & quick start guides
- AGENTS.md: Existing repository rules and conventions
- docs/tips-guides/: Detailed setup guides for OAuth, Docker, Vercel, MCP, E2E testing, etc.
