
# Project Status & Handover

**Last Updated:** 2026-02-10
**Current Status:** Stable / Maintenance

## Recent Changes
1. **Renteon Sync Fixes:**
   - Implemented "Calculation Strategy" (1-day dummy booking) to fetch accurate prices and price types (Daily vs Fixed) for Extras.
   - Fixed `Border Crossing` (50€ fixed), `GPS` (10€ fixed), `Child Seats` (Daily) pricing logic.
   - Updated `renteon-sync.ts` to use this strategy automatically.

2. **Cron Job Configured:**
   - **Schedule:** Daily at 00:01 (`1 0 * * *`).
   - **Endpoint:** `/api/cron/sync`
   - **Actions:** Updates cars, prices, availability, and extras automatically.

3. **Email Improvements:**
   - Fixed car image distortion and background issues in emails.

## Next Steps / Todo
- Monitor the first few Cron executions in Vercel dashboard to ensure timing and execution are correct.
- If `CRON_SECRET` is used in Vercel, ensure it matches the check in `src/app/api/cron/sync/route.ts` (currently checks for Bearer token if env var exists).

## How to Resume
- The project is in a good state. The cron job is set up to keep data fresh.
- To manually trigger sync, you can use the Admin Dashboard or run `npx tsx src/scripts/trigger-sync.ts`.
