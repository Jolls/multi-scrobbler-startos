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
      The 2026-07-26 note here ("http://10.0.3.1:9078/, matching the enabled LAN address")
      was wrong — 10.0.3.1 is the LXC bridge address, not a LAN address, and was never
      checked against what it actually was. Found and fixed 2026-08-21 while debugging why
      Last.fm OAuth wouldn't complete on `multi-scrobbler-test`: the unfiltered
      `addressInfo.format('urlstring')[0]` picked the bridge address, which timed out when
      the browser tried to load the OAuth callback against it (only reachable
      container-to-container, never from a real browser). Fixed by using `.nonLocal`
      (excludes bridge/localhost/link-local) and preferring the mDNS `.local` hostname when
      present, since address order among several non-local candidates (LAN NIC, WireGuard
      tunnel, etc.) isn't otherwise meaningful. Verified end-to-end 2026-08-21: Last.fm auth
      completed via the mDNS address for a LAN browser; a WireGuard-connected browser needed
      to override `redirectUri` manually to the LAN IP instead (documented as a known
      limitation in README, since mDNS doesn't resolve off-LAN).

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
      restore without re-authorization. Attempted 2026-08-21: backup/restore of
      `multi-scrobbler-test` came back up clean, but proves nothing about OAuth survival —
      that instance has never had a `config.json` or `ms-auth.cache` (empty shell, no
      sources/clients ever configured). Checked production (`multi-scrobbler`) as a
      stand-in too: its real config only uses `endpointlz` (Navidrome), `maloja` (×2), and
      `listenbrainz` — none of which are OAuth-based, and it has no `ms-auth.cache` either.
      There is currently no OAuth data anywhere on the test box to validate against. Closing
      this out for real requires configuring an actual OAuth-flow source (Spotify, Last.fm,
      or Deezer — needs registering an API app with that service and completing a real
      consent screen), then backup/restore/confirm-no-reauth on that.
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
- [x] **Crash-loop bug, #3, mitigation verified, leaving open briefly for real-world
      confirmation:** the container could end up with a stray `s6-supervise svc-node`
      respawn loop if a stop/start was issued while a prior stop was still in flight. A
      claimed `start-technologies` filing from the 2026-08-21 reproduction was never
      actually posted (no such issue exists — retracted). Extracting the upstream image
      showed multi-scrobbler only flushes its DB on `SIGINT`, not `SIGTERM` (s6's default
      stop signal), so every platform stop was already hitting the app ungracefully —
      likely why this reproduced here and not on other s6-based packages tested. Mitigation
      shipped: `assets/svc-node-down-signal` mounted over s6-rc's `down-signal` file for
      `svc-node`, so stop now asks s6 to deliver `SIGINT` (see README "Image and Container
      Runtime"). Verified on the test box (2026-08-21): sideloaded as `multi-scrobbler-test`,
      confirmed the mount landed, then repeated the original trigger — including 5 fully
      concurrent stop+start pairs, tighter timing than the original ~1-2s trigger — with no
      recurrence across 8 attempts (single node process each time, no orphaned supervisors,
      clean logs). Not a formal proof the race can never occur; leave #3 open a little
      longer for everyday-usage confirmation before closing.
- [x] Fresh-install sanity check of the fixed build — `multi-scrobbler-test` reinstalled
      and started clean (2026-08-21 19:52): boot → migrations → transformers → web server →
      scheduler, no errors. Confirmed the fix works from a cold install, not just across a
      sideload-in-place.
- [ ] **Community Registry submission** (see `publishing.md`): once the box-dependent item
      above (backup/restore) is resolved, email <submissions@start9.com> with a link to
      github.com/Jolls/multi-scrobbler-startos. Start9 forks it into Start9-Community;
      after that, `packageRepo` in `startos/manifest/index.ts` gets repointed to the fork
      (matching what `navidrome-startos` did) and further changes go through PRs against
      the fork, not this repo directly.
