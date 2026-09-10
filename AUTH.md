# Auth setup

Segla now requires login. This is a deliberate, minimal design for what this
app actually is: **one shared family login, not per-person accounts** - no
registration flow, no user table, no password reset UI. If that ever needs
to change (e.g. separate logins per family member), it's a bigger change
than this doc covers.

## How it works

- `POST /auth/login` checks `username`/`password` against `AUTH_USERNAME`
  and `AUTH_PASSWORD_HASH` (bcrypt) in `.env`, and on success sets an
  httpOnly, `Secure` (in production), `SameSite=Strict` cookie holding a
  signed JWT (7-day expiry).
- Every other API route requires that cookie (`server/src/middleware/auth.js`).
  No cookie or an expired/invalid one -> `401`.
- The frontend checks `/auth/me` on load (`RequireAuth`) and redirects to
  `/login` if that comes back `401`.
- `POST /auth/login` is rate-limited: 5 attempts per 15 minutes per IP.

httpOnly cookie + JWT rather than a JWT in `localStorage`: a cookie marked
httpOnly can't be read by JavaScript at all, so it isn't stealable via an
XSS bug in this app or any dependency. A `localStorage` token can be read by
any script that runs on the page. For a finance app, that trade-off isn't
close.

## One-time setup

1. Pick a real username and a strong, unique password (not reused anywhere
   else - this is now the one thing standing between your financial data
   and anyone who finds the URL).
2. Generate the password hash:
   ```bash
   cd server
   npm run hash-password
   # paste the password when prompted
   ```
3. Put the output in `.env`:
   ```
   AUTH_USERNAME=whatever-you-picked
   AUTH_PASSWORD_HASH=<the bcrypt hash from step 2>
   ```
4. `JWT_SECRET` is already set in this machine's `.env` (a random value was
   generated as part of adding this). **Generate a separate, unique one for
   the VM1 deployment** - do not copy this machine's value over:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
5. The server refuses to start if `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`, or
   `JWT_SECRET` are unset - fails closed instead of silently running with
   no real auth configured.

## Rotating the password

Same as steps 1-2 above, then update `AUTH_PASSWORD_HASH` in `.env` and
restart the server. Existing sessions (anyone already logged in) stay valid
until their cookie expires (7 days) or they log out - rotating the password
doesn't invalidate already-issued tokens. To force everyone out immediately,
also rotate `JWT_SECRET` (invalidates every existing token, including your
own next request - you'll need to log in again).

## Deploying to VM1

See `SERVER_MIGRATION.md` §5 for the full env var table. In short, VM1's
`.env` needs its own `JWT_SECRET` (never reuse this machine's), its own
`AUTH_USERNAME`/`AUTH_PASSWORD_HASH` (can be the same credential, your
call), `CORS_ORIGIN=https://segla.keylimedesigns.dev`, and
`NODE_ENV=production` (this now matters - see that doc for why).
