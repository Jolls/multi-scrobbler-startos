# TODO — bring Multi-Scrobbler to release-ready

Consult the packaging guide as you go (`start-technologies/projects/start-sdk/docs/src/recipes.md`
is the intent index).

## Identity & metadata

- [x] `startos/manifest/index.ts`: `packageRepo` set to github.com/Jolls/multi-scrobbler-startos.

## The service

- [x] Verify `PUID`/`PGID` behavior empirically on a running install — confirmed via logs
      on 2026-07-26: image logs "User UID: 1000 / User GID: 1000" and starts cleanly with
      the pinned values in `startos/main.ts`.
- [x] `BASE_URL` is derived from the enabled `ui` interface address in `startos/main.ts`.
      Confirmed on a real install (2026-07-26): app log shows
      "User-defined base URL for UI and redirect URLs (spotify, deezer, lastfm):
      http://10.0.3.1:9078/", matching the enabled LAN address.

## The service (config)

- [x] Added an `edit-config` action (`startos/actions/editConfig.ts`) — a `Value.textarea`
      holding the raw `config.json`, so sources/clients can be added from inside the
      StartOS UI without Filebrowser/SSH. Validates JSON + array-typed `sources`/`clients`
      only, not per-source/client fields (30+ source types, 8 client types — see README
      "Limitations" for why full validation isn't attempted). `startos/main.ts` watches
      `config.json` reactively so submitting the action restarts the daemon.
- [ ] Consider a small curated action (e.g. `DEBUG_MODE` toggle) for settings that are
      common enough to warrant a real form, per the original design discussion — not done
      yet since `edit-config` covers the actual need.
- [x] Added an optional `maloja` dependency (`startos/dependencies.ts`,
      `startos/manifest/index.ts`) plus a `maloja-connection-info` action
      (`startos/actions/malojaConnectionInfo.ts`) that resolves Maloja's bridge address via
      `sdk.host.getBridgeAddress`, for pasting into a Maloja client's `url` field.
      `maloja-startos` was updated to export `uiHostId` (pushed to
      github.com/Jolls/maloja-startos) so this package imports it instead of hardcoding it.

## Build, test, ship

- [x] First test build: `make` (or `start-cli s9pk pack`) — clean `tsc`, both arches packed.
- [x] Install on a StartOS box and verify the service runs and is reachable — confirmed
      2026-07-26 on the x86_64 test box (192.168.121.132): clean boot, DB/migrations ran,
      health check passed, dashboard reachable.
- [x] `edit-config` action verified end-to-end on the test box (2026-07-26): prefills with
      the `{ sources: [], clients: [] }` skeleton on first run, `action run` with a
      Maloja client wrote `config.json` exactly as submitted, and the daemon auto-restarted
      and attempted to connect to it (confirmed via logs) — reset back to empty afterward.
- [x] `maloja-connection-info` action verified end-to-end (2026-07-26): resolved
      `http://10.0.3.1:53212` for the box's Maloja install; updating a real Maloja client's
      `url` in `config.json` from its LAN address to this bridge address fixed a
      "self-signed certificate in certificate chain" connection error and the client
      immediately preloaded existing scrobbles and resumed processing.
- [x] Configure at least one *real* source and confirm a scrobble actually lands end-to-end —
      confirmed 2026-07-27 on the x86_64 test box: Navidrome configured as a ListenBrainz-
      compatible endpoint source pointed at multi-scrobbler's LAN address. Required trusting
      the StartOS root CA inside Navidrome's container (Alpine-based `deluan/navidrome` image,
      mounting a combined CA bundle over `/etc/ssl/certs/ca-certificates.crt`) since StartOS
      terminates TLS at the platform edge for every LAN interface regardless of the package's
      declared internal `protocol`, so an external (non-StartOS) client always sees the
      self-signed cert. Logs confirm the Navidrome source and both clients (Maloja,
      ListenBrainz external) fully initialized and scrobble processing started.
- [ ] Backup / restore sanity check — confirm OAuth tokens in `ms-auth.cache` survive
      restore without re-authorization. Needs a StartOS box (backup requires the server's
      encryption password).
- [x] Reviewed README.md against the current `writing-readmes.md` heading set/order
      (2026-08-20) — rewrote to add the required **File Models** and **Tasks** sections
      (both missing), reorder into the four required groups, rename **Actions (StartOS
      UI)** to **Actions**, and drop the disallowed **Configuration Management**, **What Is
      Unchanged from Upstream**, and **Contributing** sections (folded into other required
      sections or removed as out-of-scope, matching the treatment `navidrome-startos` got in
      its own audit, Start9-Community/navidrome-startos#1). The stale
      `README.md:75`/`importScrobbles.ts` drift this item used to flag no longer exists —
      the referenced import content was already gone from both docs. `instructions.md` not
      yet re-reviewed against this pass.
- [ ] **Crash-loop bug, filed as #3, not yet root-caused:** the container can end up with a
      stray `s6-supervise svc-node` respawn loop (`EACCES` on `/tmp/tsx-*.pipe`, or later
      `unable to spawn ./run`) if a stop/start is issued while a prior stop is still in
      flight. The real daemon keeps serving through it, so it's silent unless you check
      logs. Workaround is `start-cli package rebuild <id>` (clean fix, no data loss).
      Needs a reproduction on a StartOS box (exact race window, logs, StartOS version) to
      root-cause and close out — see the issue for what's still missing.
- [ ] **Community Registry submission** (see `publishing.md`): once the two box-dependent
      items above are resolved, email <submissions@start9.com> with a link to
      github.com/Jolls/multi-scrobbler-startos. Start9 forks it into Start9-Community;
      after that, `packageRepo` in `startos/manifest/index.ts` gets repointed to the fork
      (matching what `navidrome-startos` did) and further changes go through PRs against
      the fork, not this repo directly.
