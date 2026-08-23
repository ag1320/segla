# Migrating Segla to the homelab server (VM1)

Written 2026-08-23, ahead of the actual move, so this can be followed step-by-step
once VM1/Docker/Tailscale are ready. Companion to the homelab vault's
`Software Stack.md` and `homelab_charter.md` (Segla + Strata Games section) -
read those for the *why*, this file is the *how*, specific to this repo.

Four code/config changes have already been made and committed so the app is
ready for this move without further edits (details below): the backend port,
the frontend's hardcoded API URL, the database's host port exposure, and the
CSV export rewrite. Everything else in this doc is what **you** do at deploy
time - no further code changes needed for the move itself.

---

## 1. Ports

**The collision that mattered:** this app's backend used port **3001**, which
`Software Stack.md` has already assigned to Uptime Kuma on VM1. Also, Strata
Games shares this exact stack (Node/Express + React + Postgres) and would
have defaulted to the *same* 3000/3001 pair if deployed as-is - a collision
with Segla itself, not just Kuma. Both are fixed now by moving Segla off the
stack's default ports entirely:

| Service | Old (WSL/laptop) | New | Notes |
|---|---|---|---|
| Frontend | 3000 | **4000** | `docker-compose.yaml` + `PORT` env var |
| Backend/API | 3001 | **4001** | `docker-compose.yaml` + `PORT` env var |
| Postgres | 5432 (host-exposed) | *(not host-exposed)* | Internal Docker network only now - see §3 |

This local dev environment already runs on these new ports - verified working
end to end before writing this doc.

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
address entirely.

Fixed: `BASE_URL` now reads `process.env.REACT_APP_API_BASE_URL`, set in
`.env`. **This is the one setting you must change on the server:**

```
# .env on VM1
REACT_APP_API_BASE_URL=http://<vm1-tailscale-hostname-or-IP>:4001
```

Use whatever `tailscale status` / `New Laptop Initialization.md` shows as
VM1's stable Tailscale address (the vault's convention is an alias like
`vm1`). Don't use VM1's local LAN IP - per `Server Move Reconfiguration.md`,
that changes on every physical move and isn't the documented access pattern
for this stack anyway.

CRA inlines `REACT_APP_*` vars when the dev server starts (this app runs
`react-scripts start` in Docker, not a production build - see §6), so this
takes effect on container start, no rebuild needed if you only change `.env`.

If Phase 3's Caddy reverse proxy later fronts this app for phone access,
`REACT_APP_API_BASE_URL` will need to change again to whatever public/proxied
URL Caddy exposes for the backend - treat that as a follow-up when Phase 3
actually happens, not now.

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
| `NODE_ENV` | Yes (`development`) | See §6 - only revisit if you decide to switch to a production build |
| `COIN_GECKO_API_KEY` | Yes | Copy the same key over |
| `PORT` | **New** - set to `4001` | Backend's own listen port |
| `REACT_APP_API_BASE_URL` | **New** - change to VM1's Tailscale address | See §2 - the one value that's genuinely different on the server |

---

## 6. Things that will NOT break (verified or by design) - short version

- **CORS**: `origin: "*"` in `server/src/app.js` already allows any origin, so
  reaching the backend from a browser on a different machine than the
  backend itself (the whole point of this move) isn't blocked by CORS. No
  change needed.
- **`DB_CONNECTION_STRING`'s use of the Docker service name `database`**:
  already correct, not a `localhost` reference, works identically on VM1.
- **`docker-compose.yaml`'s Docker network name** (`finance-app_network1`,
  auto-prefixed from this directory's name): cosmetic only. If you deploy
  into a differently-named directory on VM1 (the charter suggests
  `/opt/segla/`), the network just gets renamed to match - doesn't affect
  anything since nothing hardcodes the network name.
- **The dev server running in Docker instead of a production build**: see
  §7 below - not a migration blocker, just a known inefficiency.

---

## 7. Things that WILL break or need a decision - the real risk list

### 7a. CSV export writes to a Windows-only path - FIXED

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

### 7b. Directory/volume permissions

`./database`'s bind-mount needs to exist and be writable by whatever UID the
`postgres:14` image's container runs as. This "just works" on WSL because
of how Windows/WSL handles bind-mount permissions permissively; a hardened
Ubuntu Server VM (per `SSH Hardening Guide.md`'s posture) may be stricter.
If `docker compose up -d` fails on the `database` container with a
permissions error, that's the first thing to check - `sudo chown` the
directory appropriately or let Docker create it fresh (letting the first
`docker compose up` create `./database` itself, before you `pg_restore` into
it, tends to get ownership right automatically).

---

## 8. Optional, not required for the move

- **Switch from `react-scripts start` (dev server) to a production build.**
  Right now the frontend container runs the CRA dev server indefinitely -
  fine for a single always-on personal app, but heavier (memory, rebuild
  time) and less optimized than `npm run build` served by something like
  `serve` or nginx. Worth doing eventually for an always-on deployment, not
  a blocker for the initial move - the dev server works fine 24/7, just
  isn't the most efficient choice.
- **Node 18 base image** (already on `server/Dockerfile` from the earlier
  Redux migration work) - no action needed, just noting it's already
  server-ready.
- **Bump `postgres:14` to a newer tag** if VM1's other apps standardize on a
  newer Postgres version - only worth doing if there's already a reason to,
  not something this move requires.

---

## 9. Deployment checklist (do in this order)

- [ ] On VM1: `git clone git@github.com:ag1320/segla.git /opt/segla` (or
      wherever the charter's directory convention lands)
- [ ] Create `/opt/segla/.env` by hand (§5 table) - copy secrets from this
      machine's `.env` via a secure channel (NordPass note, not Slack/email),
      don't commit it
- [ ] `docker compose up -d` on VM1 - confirm all three containers start,
      confirm `knex migrate:latest` runs cleanly against the fresh DB
- [ ] Run the `pg_dump`/`pg_restore` steps from §4
- [ ] Update `REACT_APP_API_BASE_URL` in `/opt/segla/.env` to VM1's
      Tailscale address, restart the `frontend` container
- [ ] From your laptop, over Tailscale: load the frontend URL, confirm real
      data displays (Home page totals are the fastest sanity check - compare
      a number or two against what you see on the laptop version right now)
- [ ] Update `Software Stack.md`'s VM1 Port Map: mark 4000/4001 as Segla,
      move Segla's row from "Planned" to "Active" with the real ports
- [ ] Decommission the laptop/WSL copy once you've confirmed the server
      copy is solid - don't run both against the same restored data
      simultaneously (two backends writing to two different Postgres
      instances that started from the same dump will drift immediately)
