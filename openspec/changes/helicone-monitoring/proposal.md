# Change Proposal: Helicone Monitoring Integration

## Problem
Currently, we have no visibility into the costs, latency, or specific prompts being sent to the Gemini API. This makes it difficult to optimize costs and debug complex AI behaviors in production.

## Solution
Integrate **Helicone** as an observability proxy. By routing our Gemini API calls through Helicone's gateway, we get:
- Real-time cost tracking.
- Detailed prompt/response tracing.
- Response caching to save tokens on repeated queries.

## Impact
- **Security:** Requires a `HELICONE_API_KEY`.
- **Performance:** Negligible overhead (proxy latency).
- **Architecture:** Changes how the `@google/generative-ai` SDK is initialized in the API routes.

## Rollback Plan
Revert the `baseUrl` and custom headers in the `GoogleGenerativeAI` constructor to point back to the default Google API endpoint.
