# Decisions Log

## Decision: Use GitHub-provided contribution levels instead of recalculating intensity

### Context

GitHub’s GraphQL API provides `contributionLevel` for each day in the contribution calendar.

### Alternatives considered

1. **Computing quartiles from contribution counts**
2. **Normalizing contribution intensity based on maximum daily contributions**
3. **Recomputing levels separately on backend or frontend**

### Why these were rejected

- GitHub’s internal contribution thresholds are undocumented and subject to change.
- Recomputing levels risks visual mismatch with GitHub’s official UI.
- Adds unnecessary complexity and processing overhead.
- The assignment focuses on visualization, not re-deriving GitHub heuristics.

### Final decision

- **Treat GitHub as the source of truth.**
- Pass `contributionLevel` through the backend unchanged.
- Focus implementation effort on custom heatmap rendering, caching, and live updates.

## Decision: Use periodic backend polling instead of GitHub webhooks for live updates

### Context

The dashboard supports searching analytics for any public GitHub user or organization.

### Alternatives considered

1. **GitHub webhooks via GitHub Apps**
2. **Repository-level webhook subscriptions**

### Why these were rejected

- Webhooks require ownership or admin permissions.
- Cannot dynamically register webhooks for arbitrary users.
- Adds significant setup and infrastructure complexity.
- Out of scope for a read-only analytics dashboard.

### Final decision

- **Periodically poll GitHub’s public APIs on the backend.**
- Detect changes by diffing against cached data.
- Push live updates to the frontend using SSE.

## Decision: Use SSE for incremental live updates, not initial data loading

### Context

Initial analytics data is fetched via a REST API.

### Alternatives considered

1. **Streaming initial data readiness via SSE**
2. **Polling from the frontend**

### Why these were rejected

- Streaming initial data adds unnecessary complexity.
- Frontend polling causes redundant network requests.
- Assignment explicitly calls for SSE-based live updates.

### Final decision

- **Use REST API for initial load.**
- Keep SSE connections open.
- Push only incremental updates (new activity, contribution changes).

## Decision: Combine TanStack Query with SSE for frontend server-state management

### Context

The frontend consumes aggregated analytics data and must update reactively.

### Final decision

- **Use TanStack Query to cache server-state.**
- Update query cache directly when SSE events arrive.
- Avoid manual state synchronization and prop drilling.

## Decision: Hybrid "Tiered" Caching Strategy

### Context

We initially considered strict Redis or simple In-Memory caching. The requirement is "Production Grade", which implies high availability. A strict dependency on a single cache service (Redis) creates a single point of failure.

### Alternatives Considered

1. **Strict Redis**: System crashes if Redis is unreachable. (Rejected: Too brittle for a demo/monolith)
2. **Strict In-Memory**: Limited by server RAM, clears on restart. (Rejected: Doesn't scale)

### Final Decision

- **Use a Hybrid Approach (Redis Priority + Memory Fallback).**
- Writes go to **both** layers (Dual-write).
- Reads happen from Redis first; if that fails or is slow/empty, fall back to process memory.
- **Why?** This ensures "Zero Downtime" even if the cache infrastructure goes down. It is the most robust solution for a critical hiring assignment.
