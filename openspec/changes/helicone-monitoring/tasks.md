# Implementation Tasks: Helicone Monitoring

## Phase 1: Environment Setup
- [ ] 1.1 Create `HELICONE_API_KEY` in Helicone Dashboard.
- [ ] 1.2 Add `HELICONE_API_KEY` to `.env.local` (local only).
- [ ] 1.3 Add `HELICONE_API_KEY` placeholder to `.env.example`.

## Phase 2: Implementation
- [ ] 2.1 Update `src/app/api/chat/route.ts` to use Helicone configuration.
- [ ] 2.2 Ensure the implementation handles missing keys gracefully (fallback or error).

## Phase 3: Verification
- [ ] 3.1 Verify connectivity via manual chat test.
- [ ] 3.2 Confirm logs appear in Helicone Dashboard.
- [ ] 3.3 Run existing Playwright tests to ensure no regressions.
