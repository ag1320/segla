# Migrating Segla to the homelab server (VM1)

Written 2026-08-23, revised 2026-09-08 to make Caddy the *only* access path
(no Tailscale-address fallback — this app is reached exclusively at
`segla.keylimedesigns.dev`). Companion to the homelab vault's
`Software Stack.md` and `homelab_charter.md` (Segla + Strata Games section) -
read those for the *why*, this file is the *how*, specific to this repo.

Code/config changes already made and committed so the app is ready for this
move without further edits (details below): the backend port, the
frontend's hardcoded API URL, the database's host port exposure, the CSV
export rewrite, and — new as of this revision — dropping host port
publishing entirely for `frontend`/`server` (Caddy reaches both over the
Docker network) and switching the frontend from CRA's dev server to a
production build. Everything else in this doc is what **you** do at deploy
time - no further code changes needed for the move itself.

---

## 1. Ports

**The collision that mattered:** this app's backend used port **3001**, which
`Software Stack.md` has already assigned to Uptime Kuma on VM1. Also, Strata
Games shares this exact stack (Node/Express + React + Postgres) and would
have defaulted to the *same* 3000/3001 pair if deployed as-is - a collision
with Segla itself, not just Kuma. Both are fixed now by moving Segla off the
stack's default ports entirely:

| Service | Old (WSL/laptop) | New | Host-exposed? |
|---|---|---|---|
| Frontend | 3000 | **4000** | **No** - Caddy-only, see §8 |
| Backend/API | 3001 | **4001** | **No** - Caddy-only, see §8 |
| Postgres | 5432 (host-exposed) | *(not host-exposed)* | No - internal Docker network only, see §3 |

Neither app container publishes a `ports:` entry in `docker-compose.yaml`
any more - this app has zero access paths other than through Caddy (no
Tailscale-IP fallback, unlike some other services in this stack). Caddy
reaches both containers by joining this app's Docker network and proxying
by container name (`frontend:4000`, `server:4001`) - see §8.

**Reserve 4010/4011 for Strata Games** when that migration happens, so the
two apps never collide with each other or with anything else in
`Software Stack.md`'s port table. Update that table (and the charter's open
question about Segla/Strata ports) once both are actually deployed.

If a future service on VM1 ever needs 4000/4001/4010/4011, check
`Software Stack.md`'s VM1 Port Map first - that table is the single source of
truth for what's taken.

---

## 2. The hardcoded API URL (already fixed, but you still act on it)

`ui/src/utilities/serverCalls.js` used to hardcode
`const BASE_URL = "http://localhost:3001"`. That only ever worked because the
browser and the backend were on the same machine. Once the backend moves to
VM1, the browser (still running on your laptop/phone) needs a different
address entirely - and since access is Caddy-only, that address is Segla's
own Caddy-fronted hostname, not a Tailscale address.

Fixed: `BASE_URL` now reads `process.env.REACT_APP_API_BASE_URL`, set in
`.env`:

```
# .env
REACT_APP_API_BASE_URL=https://segla-api.keylimedesigns.dev
```

**This value is baked into the JS bundle at Docker *build* time, not
container start.** The frontend now runs a production build (`ui/Dockerfile`
is a two-stage build: `npm run build`, then serve the static output via
`serve` — see §7a for why the dev server had to go). CRA still inlines
`REACT_APP_*` vars at the moment `npm run build` runs, but that moment is
now inside the image build, not `react-scripts start` on container launch.
Practically: **if you ever change `REACT_APP_API_BASE_URL`, you must rebuild
the image** (`docker compose build frontend && docker compose up -d
frontend`) - editing `.env` and restarting the container alone will not
pick it up, because `docker-compose.yaml` passes it through as a `build:
args:` value, not a runtime `environment:` value. This is the one thing
that behaves differently from typical `.env`-driven config in this stack.

---

## 3. Database: exposing it to the host is now opt-in, not default

`docker-compose.yaml`'s `database` service no longer maps a host port. The
`server` container still reaches it fine - it connects over the internal
Docker network at hostname `database`, same as always, untouched by this
change. This only removes the ability to `psql -h localhost` or point
pgAdmin at it *from outside Docker*.

Why: the charter is explicit that once multiple apps run simultaneously on
VM1, "each app's Compose file must map distinct host-side ports... for
Postgres, if exposed to the host at all." Since nothing in this app needs
external DB access day-to-day, the simplest fix is not exposing it at all -
matches the pattern already used for Nextcloud's own Postgres container.

To reach the DB directly when you need to (backups, spot-checking data):

```bash
docker exec -it database psql -U postgres -d database
```

If you want host access back for a GUI tool, add back to the `database`
service in `docker-compose.yaml`:

```yaml
    ports:
      - "5432:5432"
```

Just pick a port that doesn't collide if you ever expose Strata Games' DB
too (they should not share a Postgres instance - see the charter, each app
gets its own container).

---

## 4. Database data: it does not travel with `git pull` or a fresh `docker compose up`

This is the "export/import" step you were expecting. The actual table data
lives in the `./database` directory (bind-mounted into the Postgres
container, gitignored) - `git clone`-ing this repo onto VM1 gives you the
*code*, an *empty* database, and migrations that will happily create fresh
empty tables. Your real data has to be moved separately, once, as part of
the move.

**On this machine (source), with containers running:**

```bash
docker exec database pg_dump -U postgres -d database -F c -f /tmp/segla_backup.dump
docker cp database:/tmp/segla_backup.dump ./segla_backup.dump
```

(`-F c` = pg_dump's custom compressed format - smaller, and restorable with
`pg_restore` regardless of exact Postgres point-version differences between
this machine's `postgres:14` image and whatever VM1 ends up running, as long
as it's also Postgres 14.x or newer.)

**Copy `segla_backup.dump` to VM1** (scp, or via Nextcloud once that's live,
or a USB drive if it's easier for a one-time transfer - your call).

**On VM1, after `docker compose up -d` has created an empty `database`
container and the `knex migrate:latest` in the server's start script has run
once (creating the empty schema):**

```bash
docker cp segla_backup.dump database:/tmp/segla_backup.dump
docker exec database pg_restore -U postgres -d database --clean --if-exists /tmp/segla_backup.dump
```

`--clean --if-exists` drops the empty auto-migrated tables first so the
restore doesn't collide with them. Verify afterward:

```bash
docker exec database psql -U postgres -d database -c '\dt'
docker exec database psql -U postgres -d database -c "select count(*) from monthly_expenses where type='income';"
```

(That second query returned 292 rows on this machine as of this writing -
useful as a specific sanity number if you want to confirm nothing got lost
in transit.)

Do a **test restore now**, before the actual move, against a throwaway local
Postgres container - cheap to verify the dump/restore commands work with
zero risk, rather than discovering a syntax issue mid-move.

---

## 5. Environment variables: what's new, what's the same, what you must not forget

`.env` is gitignored (correctly - it holds `DB_PASSWORD` and the CoinGecko
API key) and will **not** arrive via `git clone` on VM1. You have to create
it there by hand. Full picture:

| Variable | Same value as today? | Notes |
|---|---|---|
| `DB_USER` | Yes | |
| `DB_PASSWORD` | Yes (or rotate it - your call, just update `DB_CONNECTION_STRING` to match) | |
| `DB_NAME` | Yes | |
| `DB_PORT` | Yes (`5432`) | Still used internally for `DB_CONNECTION_STRING` even though it's no longer host-exposed - don't delete it |
| `DB_CONNECTION_STRING` | Yes, unchanged format | Uses hostname `database`, not `localhost` - already correct for Docker networking, nothing to change here |
| `NODE_ENV` | Yes (`development`) | Only revisit if that ever meaningfully affects the backend's runtime behavior - unrelated to the frontend's dev-server-vs-production-build change in §7a, which is a separate `ui/Dockerfile` concern, not a `NODE_ENV` toggle |
| `COIN_GECKO_API_KEY` | Yes | Copy the same key over |
| `PORT` | **New** - set to `4001` | Backend's own listen port |
| `REACT_APP_API_BASE_URL` | **New** - `https://segla-api.keylimedesigns.dev` | See §2 - a build-time value now, not a runtime one. Same value on VM1 as in this repo's own `.env` (already set for Caddy, not Tailscale) |

---

## 6. Things that will NOT break (verified or by design) - short version

- **CORS**: `origin: "*"` in `server/src/app.js` already allows any origin, so
  the browser calling `segla-api.keylimedesigns.dev` while the page itself
  is served from `segla.keylimedesigns.dev` (two different origins) isn't
  blocked by CORS. No change needed.
- **`DB_CONNECTION_STRING`'s use of the Docker service name `database`**:
  already correct, not a `localhost` reference, works identically on VM1.
- **`docker-compose.yaml`'s Docker network name** (`finance-app_network1`,
  auto-prefixed from this directory's name): cosmetic only. Deploying into
  `/opt/segla` per the charter's convention renames it to
  `segla_network1` - that's the name you join Caddy to in §8, doesn't
  affect anything else since nothing hardcodes the network name.

---

## 7. Things that WILL break or need a decision - the real risk list

### 7a. Frontend dev server behind a real domain - FIXED (switched to production build)

`ui/Dockerfile` used to run `react-scripts start` (CRA's dev server,
webpack-dev-server underneath) indefinitely in the container. That's fine
reached at `localhost` or even a Tailscale IP, but webpack-dev-server
rejects requests carrying an unrecognized `Host` header by default
("Invalid Host header") - and once this app is reachable *only* through
Caddy at `segla.keylimedesigns.dev`, every request arrives with exactly
that kind of Host header. This was optional-to-fix under the original
Tailscale-address plan; it stopped being optional the moment Caddy-only
access was decided.

Fixed: `ui/Dockerfile` is now a two-stage build - `npm run build` produces
a static bundle, then a slim stage serves it with `serve` on port 4000.
No dev server running in production, no Host-header rejection possible,
and it's lighter on memory/CPU for an always-on deployment besides. See §2
for the one behavior change this brings: `REACT_APP_API_BASE_URL` is now
baked in at build time.

**Verified locally (2026-09-08):** built the image, ran it standalone, and
confirmed both an HTTP 200 on `/` and that
`segla-api.keylimedesigns.dev` is actually present in the compiled JS
bundle (`grep` against `build/static/js/*.js` inside the built image).

### 7b. CSV export writes to a Windows-only path - FIXED

`server/src/controllers/notesController.js`'s `exportCSV` used to write
budget CSVs to a path built from `process.env.USERPROFILE` (a Windows
environment variable), with `docker-compose.yaml` bind-mounting the Windows
OneDrive folder specifically to catch that write. **Confirmed while writing
this doc, not just theoretical:** I triggered a live export against the
running container and checked where the file landed - `USERPROFILE` was
never actually reaching the container (never listed in `docker-compose.yaml`'s
`environment:` block), so the code fell to its `os.homedir()` fallback and
the export landed in `/root/` *inside the container*, not the OneDrive
folder. This was already silently broken today, before any server move -
not something the move would have introduced.

Fixed: `exportCSV` now returns the CSV as a string instead of writing a file,
the `/exportCSV` route sends it as the HTTP response body with
`Content-Disposition: attachment`, and the frontend
(`ui/src/utilities/serverCalls.js`) turns that into a normal browser
download via a Blob URL. No server-side file, no path resolution, works
identically regardless of where the backend runs - the OneDrive bind-mount
line and the `windowsDocsPath()`/`fs`/`path`/`os` code are gone entirely.
Verified locally: an export now downloads a real CSV through the browser.

### 7c. Directory/volume permissions

`./database`'s bind-mount needs to exist and be writable by whatever UID the
`postgres:14` image's container runs as. This "just works" on WSL because
of how Windows/WSL handles bind-mount permissions permissively; a hardened
Ubuntu Server VM (per `SSH Hardening Guide.md`'s posture) may be stricter.
If `docker compose up -d` fails on the `database` container with a
permissions error, that's the first thing to check - `sudo chown` the
directory appropriately or let Docker create it fresh (letting the first
`docker compose up` create `./database` itself, before you `pg_restore` into
it, tends to get ownership right automatically).

### 7d. Local dev/testing loses its browser-reachable localhost URLs

Because `frontend`/`server` no longer publish `ports:` at all (§1), running
`docker compose up` on this laptop for local testing no longer gets you
anything at `localhost:4000`/`localhost:4001` - there's no Caddy in front of
it here. If you want to keep testing changes locally in a browser before
deploying: temporarily add the `ports:` lines back (the comments left in
`docker-compose.yaml` show the exact syntax) - just don't commit that
change, or use an uncommitted `docker-compose.override.yml` (Compose
auto-merges it) so it never accidentally ships to VM1. Not a blocker for
this move, just a workflow change worth knowing about going in.

---

## 8. Caddy integration (new - required for this migration, not a follow-up)

Segla is Caddy-only from day one on VM1 - no Tailscale-address access path
exists for this app. Follow `Adding a New Service Behind Caddy.md`'s
Pattern 1 (no host port publish); the specifics for this app:

**Two hostnames, not one** - unlike single-container services (Nextcloud,
HA), Segla's browser-side JS calls the backend directly, so both pieces
need their own Caddy-fronted hostname:

| Hostname | Proxies to | Notes |
|---|---|---|
| `segla.keylimedesigns.dev` | `frontend:4000` | What you actually browse to |
| `segla-api.keylimedesigns.dev` | `server:4001` | What the browser's JS calls - see §2 |

**1. Join Caddy to Segla's network** - in `/opt/caddy/docker-compose.yml`:

```yaml
services:
  caddy:
    networks:
      - nextcloud_default   # existing
      - segla_network1      # add this (project name segla + network1, see §6)
      - caddy_net

networks:
  segla_network1:
    external: true
```

**2. Caddyfile blocks** - append to `/opt/caddy/Caddyfile` (after the global
options block, if any - see the template's parsing warning):

```
segla.keylimedesigns.dev {
    reverse_proxy frontend:4000
    log {
        output file /var/log/caddy/segla.access.log
        format json
    }
}

segla-api.keylimedesigns.dev {
    reverse_proxy server:4001
    log {
        output file /var/log/caddy/segla-api.access.log
        format json
    }
}
```

Add these **only once Segla is actually deployed and running** - a block
pointing at a container that doesn't exist yet is a live door with none of
Segla's own protections the moment something with that name does start
(see the template's warning). Reload after adding:

```bash
cd /opt/caddy
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

**3. DNS - both hostnames, both records:**

- Public A record for `segla` and `segla-api`, both pointed at the same
  public IPv4 as every other hostname (see `Hardware Stack.md` for the
  current value - it changes; DDNS keeps it current, next step).
- Local DNS override on the GL.iNet Flint 2 (LuCI: Network → DHCP and DNS →
  Resolv and Hosts Files → **Addresses** field, not Hosts):
  ```
  /segla.keylimedesigns.dev/10.0.0.45
  /segla-api.keylimedesigns.dev/10.0.0.45
  ```
  (replace `10.0.0.45` with VM1's actual reserved LAN IP.) Without this,
  every LAN device - including phones on home WiFi - hits a NAT-hairpin
  failure resolving to the public IP instead. Verify:
  ```bash
  dig @10.0.0.1 segla.keylimedesigns.dev
  dig @10.0.0.1 segla-api.keylimedesigns.dev
  ```

**4. Add both hostnames to `ddclient`** - `/etc/ddclient.conf` on VM1, same
comma-separated host list, same Porkbun block, don't create a second block:

```
nextcloud.keylimedesigns.dev,ha.keylimedesigns.dev,inbox.keylimedesigns.dev,segla.keylimedesigns.dev,segla-api.keylimedesigns.dev
```

Then verify in the foreground, not a silent restart:

```bash
sudo systemctl restart ddclient
sudo ddclient -daemon=0 -verbose -noquiet
```

Confirm both new hostnames specifically show a successful update (or "no
update needed").

**5. App-side proxy awareness** - checked, nothing to configure. Segla has
no trusted-hostname allowlist, no `overwriteprotocol`/`trusted_proxies`
equivalent, and CORS is already `origin: "*"` (§6). The one thing that
*did* need proxy-awareness work was the frontend dev server's Host-header
check - already handled by the production-build switch in §7a, not by
anything Caddy-side.

**6. fail2ban** - Segla has no authentication (single-user, family-only,
no login screen) - the template's Step 5 doesn't apply here. Skip it,
same as it's skipped for anything else in this stack with no auth surface.

**7. External verification** - from cellular data, off home WiFi:

```bash
curl -I https://segla.keylimedesigns.dev
curl -I https://segla-api.keylimedesigns.dev
```

Valid cert, no warnings, `200`/expected response on both.

---

## 9. Deployment checklist (do in this order)

- [ ] On VM1: `git clone git@github.com:ag1320/segla.git /opt/segla`
- [ ] Create `/opt/segla/.env` by hand (§5 table) - copy secrets from this
      machine's `.env` via a secure channel (NordPass note, not Slack/email),
      don't commit it. `REACT_APP_API_BASE_URL` should already read
      `https://segla-api.keylimedesigns.dev` per §2/§5 - confirm it, don't
      assume
- [ ] `docker compose up -d` on VM1 - confirm all three containers start,
      confirm `knex migrate:latest` runs cleanly against the fresh DB, and
      that `frontend`/`server` came up with **no** `ports:` published
      (`docker compose ps` should show no host-port mapping for either)
- [ ] Run the `pg_dump`/`pg_restore` steps from §4
- [ ] From VM1 itself, sanity-check both containers respond over the
      internal Docker network before involving Caddy/DNS at all:
      `docker exec caddy wget -qO- http://frontend:4000` and
      `http://server:4001/<some real route>` (adjust for whatever routes
      exist) - isolates "the app itself is broken" from "Caddy/DNS is
      broken" if something doesn't work later
- [ ] Do §8 in full: join Caddy to `segla_network1`, add both Caddyfile
      blocks, both DNS records (public + local override), both ddclient
      entries
- [ ] From your laptop, over cellular (off home WiFi): load
      `https://segla.keylimedesigns.dev`, confirm real data displays (Home
      page totals are the fastest sanity check - compare a number or two
      against what you see on the laptop version right now)
- [ ] Update `Software Stack.md`'s VM1 Port Map: mark 4000/4001 as Segla
      (not host-exposed), move Segla's row from "Planned" to "Active" with
      the real hostnames
- [ ] Decommission the laptop/WSL copy once you've confirmed the server
      copy is solid - don't run both against the same restored data
      simultaneously (two backends writing to two different Postgres
      instances that started from the same dump will drift immediately)
