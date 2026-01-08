# Copilot Instructions for Invest Dash

**InvestDash** is a full-featured investment management platform (like Status Invest + Investidor10) built with React + tRPC + Drizzle ORM. This document guides AI agents on architecture, workflows, and project conventions.

## Architecture Overview

### Monorepo Structure
```
invest-dash/
├── client/        # React SPA (Vite, React 19, TailwindCSS, Radix UI)
├── server/        # Express + tRPC API, database operations
├── shared/        # Type definitions, constants shared across client/server
├── drizzle/       # Database schema and migrations (MySQL)
```

### Full-Stack Data Flow
1. **Client** (`client/src/lib/trpc.ts`) → HTTP to tRPC endpoints
2. **Server** (`server/routers.ts`) → Routes to specific routers (e.g., `market.*`, `portfolio.*`)
3. **Database** (Drizzle ORM) → MySQL via `server/db.ts` helper functions
4. **External APIs** → Brapi (primary), HG Brasil (fallback) via `server/services/brapiService.ts`

**Key insight:** tRPC provides type-safe, end-to-end validation. Always export types from `shared/types.ts` for client consumption.

## Critical Workflows

### Development
- `npm run dev` - Start server (tsx watch) + client dev server (Vite proxy at /trpc, /api)
- Server runs on available port 3000+, client at 5173 in Vite dev mode
- HMR available for both client and server changes

### Build & Deploy
- `npm run build` - Vite build (client → dist/public) + esbuild (server → dist/index.js)
- `npm run start` - Production server start
- `npm run check` - Type check all code (TS strict mode)
- `npm run test` - Vitest suite (test files: `*.test.ts`)

### Database
- `npm run db:push` - Generate migrations + migrate (uses Drizzle Kit)
- Schema in [drizzle/schema.ts](drizzle/schema.ts) - always use Drizzle types for new entities
- New migrations auto-generated; review in `drizzle/migrations/` before pushing

## Project Patterns

### tRPC Router Organization
Each feature domain has its own router file in `server/routers/`:
- `assetsRouter.ts` - Market data, quotes, fundamentals, valuation (18+ endpoints)
- Main router in `routers.ts` - Combines all routers and auth procedures

**Pattern:** Use `publicProcedure`, `protectedProcedure`, `adminProcedure` from `server/_core/trpc.ts`:
```typescript
// Public endpoint
market.getQuote: publicProcedure.input(z.object({ ticker: z.string() })).query(...)

// Protected (user logged in)
portfolio.getUserHoldings: protectedProcedure.query(({ ctx }) => {
  // ctx.user is guaranteed; ctx.db is database client
})
```

### Component Structure
- Components in `client/src/components/` with UI components in `components/ui/` (Radix primitives)
- Pages in `client/src/pages/` - routed via Wouter in `App.tsx`
- Hooks in `client/src/hooks/` - e.g., `useMobile.tsx` for responsive logic
- Context providers in `client/src/contexts/` (e.g., `ThemeContext.tsx`)

**Pattern:** Use React Query (TanStack Query) + tRPC hooks for data fetching:
```typescript
const { data, isLoading } = trpc.portfolio.getUserHoldings.useQuery()
```

### Database Operations
All database queries in `server/db.ts` as exported functions. Use Drizzle ORM patterns:
- `eq()`, `and()`, `desc()`, `gte()`, `lte()` for conditions
- `db.query.table.findFirst()` for single records
- `db.query.table.findMany()` for lists with filters
- Return native types (e.g., `User`, `Holding`) or `null`/arrays

**Example:**
```typescript
export async function getUserHoldings(userId: number) {
  const db = await getDb();
  return db.query.holdings.findMany({ where: eq(holdings.userId, userId) });
}
```

### External Data Integration (Brapi)
Located in [server/services/brapiService.ts](server/services/brapiService.ts):
- Methods: `getQuote()`, `getCompleteData()`, `getFundamentals()`, `getDividends()`, `getHistoricalData()`
- **Always cache** - built-in cache layers with different TTLs per data type
- Rate limiting prepared but not fully enforced (watch Brapi limits)
- Returns TypeScript-typed responses

### Valuation Calculations
[server/services/valuationCalculations.ts](server/services/valuationCalculations.ts) - pure logic:
- **Graham Price** formula: √(22.5 × EPS × Book Value)
- **Bazin Price** (dividend ceiling): Average Dividend / Target Yield (6% default)
- Dividend analysis, Magic Formula, simplified DCF
- No side effects; safe to call in both routers and components

### Authentication
OAuth flow in `server/_core/oauth.ts` and `server/_core/google-oauth.ts`:
- Google OAuth configured via env vars (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URL)
- Session stored in httpOnly cookie (name: `session.investdash`)
- User context added to tRPC via `createContext()` - pulled from cookie
- Redirect unauthenticated API errors to login via error handling in `client/src/main.tsx`

## Key Technologies & Trade-offs

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React 19 + TSX | Modern, functional, JSX in TS |
| UI Components | Radix UI | Accessible primitives + TailwindCSS utilities |
| Server | Express + tRPC | Type safety + minimal overhead |
| Database | Drizzle ORM + MySQL | Type-safe SQL, schema-first |
| Styling | TailwindCSS | Utility-first, no CSS specificity hell |
| Routing | Wouter | Lightweight, ~5KB alternative to React Router |
| Data Fetching | TanStack Query + tRPC | Caching + real-time updates |
| Market Data | Brapi API | Comprehensive BR market data, caching ready |

## Common Tasks

### Adding a New Feature (e.g., new router endpoint)
1. Define types in `shared/types.ts` (or extend existing)
2. Add database function in `server/db.ts` if needed
3. Create/extend router in `server/routers/` - use `protectedProcedure` for user data
4. Export from `server/routers.ts` nested under appropriate namespace
5. Call in component: `trpc.namespace.method.useQuery()`
6. Run `npm run check` to validate types end-to-end

### Adding a UI Component
1. Create in `client/src/components/` (or `ui/` for reusable primitives)
2. Import Radix primitives from `@radix-ui/react-*` if needed
3. Compose with TailwindCSS classes
4. Export types (Props interfaces) for documentation

### Database Schema Changes
1. Edit [drizzle/schema.ts](drizzle/schema.ts) - add table or columns
2. Run `npm run db:push` - auto-generates migration file
3. Review generated SQL in `drizzle/migrations/`
4. Commit both schema and migration files
5. Update `server/db.ts` queries if new tables added

### Debugging
- **Server errors:** Watch dev terminal for Express/tRPC errors - include stack traces
- **API failures:** Check browser DevTools Network tab for tRPC call response (HTTP status, error message)
- **DB issues:** Use `console.log(query)` in `server/db.ts` or check Drizzle logs with `DEBUG=drizzle:*`
- **OAuth:** Verify env vars (GOOGLE_CLIENT_ID set?), check callback URL matches console.google.com config

## File Organization Rules

- **New routers:** `server/routers/{featureName}Router.ts` → export as router, combine in `routers.ts`
- **New services:** `server/services/{serviceName}.ts` → Pure logic, no side effects (testable)
- **New pages:** `client/src/pages/{PageName}.tsx` → Register route in `App.tsx`
- **New contexts:** `client/src/contexts/{contextName}Context.tsx` → Provider + hook combo
- **Shared types:** Always in `shared/types.ts`, never duplicate in client/server separately

## Testing Notes

- Test files co-located: `*.test.ts` (e.g., `server/portfolio.test.ts`)
- Use Vitest framework (`npm run test`)
- tRPC routers can be tested directly without HTTP layer
- Database functions mock with test DB or use fixtures

## Dependencies & Environment

**Key packages:**
- `@trpc/server`, `@trpc/client`, `@trpc/react-query` (type-safe RPC)
- `drizzle-orm/mysql2` (database)
- `express` (HTTP server)
- `zod` (runtime validation for tRPC inputs)
- `react-hook-form` (forms) + `recharts` (graphs)

**Environment vars:**
- `NODE_ENV` - development or production
- `DATABASE_URL` - MySQL connection string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIRECT_URL` - OAuth config
- Check `.env.local` (not committed) for secrets

## Performance & Scalability Considerations

- **Caching:** Brapi calls cached per endpoint with different TTLs (quotes: 1min, fundamentals: 1hr)
- **Database:** Indexes on `users.openId`, `holdings.userId`, `assets.ticker` for lookups
- **Pagination:** Not yet implemented; watch for large result sets on big portfolios
- **Real-time:** Currently polling; consider WebSockets if live updates needed
- **File uploads:** Express body limit set to 50MB for S3 integration support

---

**Last Updated:** Jan 2026 | **Status:** 45% Complete | **Active Contributors:** Building toward full portfolio + analytics suite
