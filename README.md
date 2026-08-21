<p align="center">
  <img src="icon.svg" alt="Multi-Scrobbler Logo" width="21%">
</p>

# Multi-Scrobbler on StartOS

> **Upstream docs:** <https://docs.multi-scrobbler.app>
>
> Everything not listed in this document should behave the same as upstream
> Multi-Scrobbler. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable.

Multi-Scrobbler tracks what you play across sources (Spotify, Jellyfin, Plex, Subsonic,
YouTube Music, and more) and scrobbles it to one or more clients (Last.fm, ListenBrainz,
Maloja, etc.). See the [upstream repo](https://github.com/FoxxMD/multi-scrobbler) for the
full list of supported sources and clients.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)

---

## Image and Container Runtime

Unmodified upstream image (`foxxmd/multi-scrobbler`), built on linuxserver.io's
`baseimage-debian` (s6-overlay). Ships `amd64` and `arm64`. The daemon runs in the
`multi-scrobbler-sub` subcontainer, running the image's own entrypoint as PID 1
(`sdk.useEntrypoint()` + `runAsInit: true`), so s6-overlay starts the same way it does
outside StartOS.

The upstream node process only flushes its database connection on `SIGINT` — it has no
`SIGTERM` handler, so s6's default stop signal kills it ungracefully. `startos/main.ts`
mounts `assets/svc-node-down-signal` (contents: `SIGINT`) over s6-rc's
`/etc/s6-overlay/s6-rc.d/svc-node/down-signal`, overriding the signal s6 sends the node
process on stop, without modifying the upstream image. See
[issue #3](https://github.com/Jolls/multi-scrobbler-startos/issues/3) for the crash-loop
bug this was investigated for.

## Volume and Data Layout

Where the service's data lives.

| Volume | Mount point | Contents |
| ------ | ----------- | -------- |
| `config` | `/config` | `config.json` (sources/clients config), `ms.db` (SQLite play-history database), `ms-auth.cache` (OAuth token cache) |

`CONFIG_DIR` and `DATA_DIR` both point at `/config`, matching the upstream Docker image's
own layout.

## File Models

`config.json`, at `/config/config.json`, is modeled as raw text (`FileHelper.string`), not
a typed schema — upstream's own shape (30+ source types, 8 client types) is too large to
mirror and keep in sync. Nothing seeds it: no file exists on disk until the **Edit
config.json** action is run for the first time, at which point it becomes entirely
user-owned — nothing StartOS-managed rewrites it afterward, and a hand edit made outside
the action (e.g. over SSH) survives untouched until the next action submission. The daemon
reads it once at startup only; `startos/main.ts` watches the file reactively and restarts
the daemon whenever the action writes a new version, since multi-scrobbler itself does not
pick up config changes on a running process.

## Dependencies

What this service needs from other services.

- **Maloja** (`maloja`) — optional. multi-scrobbler works standalone or with any other
  client; this dependency only matters if you add a Maloja client to `config.json`.
  `kind: 'running'`, `healthChecks: ['maloja']`. No volumes are mounted from it — connection
  is over the network only, via the **Get Maloja Connection Info** action.

## Network Access and Interfaces

What the service exposes.

| Interface | Port | Protocol | Purpose |
| --------- | ---- | -------- | ------- |
| Web Interface (`ui`) | 9078 | HTTP | Dashboard, OAuth authorization links, and REST API |

Reachable via whatever LAN/Tor/clearnet addresses the user enables in the Interfaces tab,
same as any other StartOS service.

## Installation and First-Run Flow

No wizard is skipped and no credentials are auto-generated — multi-scrobbler has no login
of its own (see [Network Access and Interfaces](#network-access-and-interfaces)). On first
boot the app creates `ms.db` on its own; you then add sources/clients through the
**Edit config.json** action (see [Actions](#actions)) or via environment variables, per the
[upstream configuration docs](https://docs.multi-scrobbler.app/configuration/). `PORT`,
`CONFIG_DIR`, `DATA_DIR`, `PUID`, `PGID`, `TZ`, and `BASE_URL` (derived from the enabled Web
Interface address) are StartOS-managed; everything else — sources, clients, retention,
caching — is upstream-managed via `config.json` or additional env vars. Sources that use
OAuth (Spotify, Last.fm, YouTube Music) are authorized from a link on the dashboard after
startup.

## Actions

What can be done to the service, and when.

- **Edit config.json** (`edit-config`) — a single `textarea` action holding the raw
  `config.json` content, in the same format as [upstream's own schema](https://docs.multi-scrobbler.app/configuration/)
  (sources, clients, retention, caching, etc.). This is a thin passthrough, not a
  structured form: the handler only checks that the submission is valid JSON and that
  `sources`/`clients`, if present, are arrays — it does not validate individual source or
  client fields (30+ source types and 8 client types make that impractical to mirror and
  keep in sync). A wrong per-source field will save without a StartOS-level error and
  surface only as an app-level error in the logs/dashboard once the daemon restarts.
  Prefilled from the file on disk, or a `{ "sources": [], "clients": [] }` skeleton on
  first run. Available any time; writing a new config restarts the daemon to apply it.
  Safe to re-run — it always overwrites with exactly what was submitted.
- **Get Maloja Connection Info** (`maloja-connection-info`) — resolves the Maloja
  dependency's inter-container bridge address (`sdk.host.getBridgeAddress`, per
  [Service-to-Service Networking](https://docs.start9.com/packaging/service-to-service.html))
  and returns it as a copyable URL for pasting into a Maloja client's `url` field in
  `config.json`. Necessary because `localhost` doesn't reach another service's container,
  and the LAN address goes through StartOS's reverse proxy with a self-signed cert that
  multi-scrobbler's TLS validation rejects — the bridge address is the one that actually
  works. Read-only and safe to re-run at any time. Returns an informational "not available"
  result if Maloja isn't installed/running, rather than an error.

## Tasks

None — the package raises no tasks. The service's ordinary controls are always available,
and nothing blocks it from starting.

## Health Checks

`checkPortListening` on port 9078 — reports ready once the web server binds its port.
Upstream also exposes `GET /api/health`, which reflects per-source/client connectivity;
that endpoint is not used for the StartOS readiness check because it can legitimately
return a non-200 status while sources are still being configured/authorized, which would
otherwise read as a crash. A failure here means the web server itself never bound its
port — check the container logs for a startup error, not source/client connectivity.

## Backups and Restore

The entire `config` volume is backed up (config, database, and auth token cache) — a
wholesale volume copy, not a database dump. Restoring a backup restores sources/clients and
play history exactly as they were; OAuth tokens in `ms-auth.cache` are restored too, so
re-authorization is normally not required.

## Limitations and Differences

1. `BASE_URL` is derived automatically from the service's own enabled Web Interface address
   and reapplied on every restart; it cannot currently be pinned to a specific address
   independent of interface state. Among the non-bridge addresses available,
   `startos/main.ts` prefers the mDNS (`.local`) hostname when one is enabled, since it
   resolves consistently for any device on the LAN regardless of which physical interface
   answers — a private IPv4/IPv6 address is picked otherwise, in unspecified order among
   however many the box has (LAN NIC, WireGuard tunnel, etc). This matters for the
   `redirectUri` that OAuth-based sources/clients (Spotify, Last.fm, Deezer) derive from
   `BASE_URL` by default: **the browser completing that provider's auth flow must be able to
   resolve/reach whatever address was picked.** A user configuring OAuth while connected
   over WireGuard (or Tor, or a public domain) rather than the plain LAN may find the
   mDNS-derived callback times out, since `.local` names don't resolve off the LAN segment.
   The fix is to override that source/client's `redirectUri` explicitly in `config.json`
   with an address reachable from wherever the browser actually is (confirmed working
   2026-08-21: WireGuard-connected browser, `redirectUri` manually set to the box's LAN IP,
   completed the Last.fm auth flow that the default mDNS address could not reach).
2. `PUID`/`PGID` are fixed at `1000:1000` rather than user-configurable.
3. The **Edit config.json** action validates only that the submission is JSON with
   array-typed `sources`/`clients`, not the fields of individual source/client entries — a
   config with a valid JSON shape but wrong per-source fields (e.g. a missing required key
   for a given source type) will save without a StartOS-level error, surfacing instead as
   an app-level error in the logs/dashboard once the daemon restarts.

---

## Quick Reference for AI Consumers

```yaml
package_id: multi-scrobbler
image: foxxmd/multi-scrobbler
architectures: [x86_64, aarch64]
subcontainers: [multi-scrobbler-sub]
volumes:
  config: /config
file_models:
  - config.json
startos_managed_env_vars:
  - PORT
  - CONFIG_DIR
  - DATA_DIR
  - PUID
  - PGID
  - TZ
  - BASE_URL
dependencies:
  - maloja (optional)
interfaces:
  ui: { type: ui, port: 9078 }
actions:
  - edit-config
  - maloja-connection-info
tasks: none
health_checks:
  - checkPortListening
```
