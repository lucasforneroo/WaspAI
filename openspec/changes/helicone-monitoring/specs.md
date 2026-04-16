# Specifications: Helicone Monitoring

## Scenarios

### Scenario 1: Successful Proxied Chat Request
**Given** a valid `HELICONE_API_KEY` and `GEMINI_API_KEY` are configured.
**When** a user sends a message to the `/api/chat` endpoint.
**Then** the request MUST be routed through `https://gateway.helicone.ai`.
**And** the request MUST include the `Helicone-Auth` and `Helicone-Target-URL` headers.
**And** the Gemini API SHOULD return a valid response as if called directly.

### Scenario 2: Helicone Authentication Failure
**Given** an invalid `HELICONE_API_KEY`.
**When** a chat request is initiated.
**Then** the system SHOULD handle the error gracefully and report a 500 error or similar to the client (depending on current error handling).

## Non-Functional Requirements
- **Transparency:** The user experience should remain identical.
- **Observability:** All metadata (model name, tokens used) MUST appear in the Helicone dashboard.
