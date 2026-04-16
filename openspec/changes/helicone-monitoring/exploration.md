## Exploration: Helicone Monitoring Integration

### Current State
The project uses `@google/generative-ai` version `^0.24.1`. The initialization occurs in `src/app/api/chat/route.ts` where a `GoogleGenerativeAI` instance is created using `process.env.GEMINI_API_KEY`. It uses the default base URL (`https://generativelanguage.googleapis.com`) and standard headers.

### Affected Areas
- `src/app/api/chat/route.ts`: This is the primary location where the Gemini SDK is initialized and used for chat and RAG (embeddings).
- `.env`: Will require new environment variables for Helicone.

### Approaches

1. **Global Proxy Configuration (Constructor Level)**
   - Description: Pass `requestOptions` to the `GoogleGenerativeAI` constructor to set a global `baseUrl` and `customHeaders`.
   - Pros: Consistent across all model instances (embeddings, chat).
   - Cons: Less flexible if some calls shouldn't be proxied.
   - Effort: Low

2. **Per-Model Proxy Configuration (getGenerativeModel Level)**
   - Description: Pass `requestOptions` specifically to `getGenerativeModel`.
   - Pros: Surgical. Can enable/disable monitoring for specific features (e.g., chat vs. embeddings).
   - Cons: Requires passing options in multiple places if we have many models.
   - Effort: Low

### Recommendation
I recommend **Approach 2 (Per-Model Proxy Configuration)** but applied consistently in `src/app/api/chat/route.ts`. This allows us to explicitly monitor the chat generation (which is the main cost/trace driver) while having the flexibility to handle embeddings separately if needed.

**Implementation Details:**
- `baseUrl`: `https://gateway.helicone.ai`
- `customHeaders`:
  - `Helicone-Auth`: `Bearer ${process.env.HELICONE_API_KEY}`
  - `Helicone-Target-URL`: `https://generativelanguage.googleapis.com`

### Risks
- **Dependency on Helicone**: If Helicone is down, the Gemini API calls will fail. We should consider a fallback or ensure high availability.
- **Latency**: Adding a proxy introduces a small overhead in request time.
- **API Versioning**: We must ensure Helicone supports the specific `v1` or `v1beta` endpoints used by the SDK.

### Ready for Proposal
Yes — The research confirms that the `@google/generative-ai` SDK supports `baseUrl` and `customHeaders` via `RequestOptions`, which is the standard way to integrate Helicone.
