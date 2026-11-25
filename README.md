# Scent Lab

## Local development

Requirements: Node.js 20+ and a running Docker-compatible container engine.

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Start the local Supabase services (the first run downloads their Docker images):

   ```bash
   npm run supabase:start
   ```

3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the Project URL and Publishable
   key printed by:

   ```bash
   npm run supabase:status
   ```

4. Start the Next.js app:

   ```bash
   npm run dev
   ```

Supabase Studio is available at [http://127.0.0.1:54323](http://127.0.0.1:54323).
The local API is at `http://127.0.0.1:54321`.

Use `npm run supabase:stop` when you are done. Database migrations belong in
`supabase/migrations`; `npm run supabase:reset` reapplies them to the local
database.

The browser client helper is in `src/lib/supabase/client.ts`. Supabase
publishable keys are intended for client use; never put a secret/service-role
key in a `NEXT_PUBLIC_` variable. Protect tables with Row Level Security and
appropriate policies.
