# ClipsOS V2 — Dev / Test Credentials

> **For development and testing only.** These credentials are used by the testing agent to sign in to the app.

## Owner Account (Primary Dev Account)

- **Email:** `adib@theclips.agency`
- **Password:** `ClipsOS2026!`
- **Role:** `owner`

## Login Flow

1. Navigate to `/login`
2. Enter email and password
3. Click "Sign in"
4. Redirects to `/{role}/dashboard` based on assigned role

## Dev Server

- **Default port:** `8080` (may increment to 8081, 8082, etc. if ports are in use)
- **Start command:** `npm run dev` from `/Users/madibbaroudi/Desktop/Dashboards/New Clips App`

## Production

- **Hosted on:** Lovable Cloud (auto-deploy from GitHub)
- **Supabase:** Lovable Cloud (no agent MCP access)
- **Repo:** `M-ADIB/clipsos-hub`
