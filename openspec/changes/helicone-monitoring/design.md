# Technical Design: Helicone Integration

## Architecture Overview
The integration leverages the `GoogleGenerativeAI` SDK's ability to accept a custom `baseUrl` and headers.

### Flow:
1. `src/app/api/chat/route.ts` reads `HELICONE_API_KEY`.
2. Initializes `GoogleGenerativeAI` with:
   - `baseUrl`: `https://gateway.helicone.ai`
3. Each request to `getGenerativeModel` or subsequent calls will include:
   - `headers`: {
       "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
       "Helicone-Target-URL": "https://generativelanguage.googleapis.com"
     }

## Data Flow Diagram
`Client` -> `Next.js Route Handler` -> `Helicone Gateway` -> `Gemini API` -> `Helicone Gateway (Logs)` -> `Next.js Route Handler` -> `Client`
