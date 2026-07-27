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
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)

---

## Image and Container Runtime

Unmodified upstream image (`foxxmd/multi-scrobbler`), built on linuxserver.io's
`baseimage-debian` (s6-overlay). Ships `amd64` and `arm64`. The daemon runs the image's
own entrypoint as PID 1 (`sdk.useEntrypoint()` + `runAsInit: true`), so s6-overlay starts
the same way it does outside StartOS.

## Volume and Data Layout

| Volume | Mount point | Contents |
| ------ | ----------- | -------- |
| `config` | `/config` | `config.json` (sources/clients config), `ms.db` (SQLite play-history database), `ms-auth.cache` (OAuth token cache) |

`CONFIG_DIR` and `DATA_DIR` both point at `/config`, matching the upstream Docker image's
own layout.

## Installation and First-Run Flow

No wizard is skipped and no credentials are auto-generated — multi-scrobbler has no login
of its own (see [Network Access and Interfaces](#network-access-and-interfaces)). On first
boot the app creates `ms.db` on its own; you then add sources/clients through the
**Edit config.json** action (see [Actions](#actions-startos-ui)) or via environment
variables, per the [upstream configuration docs](https://docs.multi-scrobbler.app/configuration/).
Sources that use OAuth (Spotify, Last.fm, YouTube Music) are authorized from a link on the
dashboard after startup.

## Configuration Management

| StartOS-Managed | Upstream-Managed |
| ---------------- | ---------------- |
| `PORT`, `CONFIG_DIR`, `DATA_DIR`, `PUID`, `PGID`, `TZ`, `BASE_URL` (derived from the enabled Web Interface address) | Everything else: sources, clients, retention, caching — via the `config.json` content submitted through the **Edit config.json** action, or additional env vars per upstream docs |

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose |
| --------- | ---- | -------- | ------- |
| Web Interface (`ui`) | 9078 | HTTP | Dashboard, OAuth authorization links, and REST API |

Reachable via whatever LAN/Tor/clearnet addresses the user enables in the Interfaces tab,
same as any other StartOS service.

## Actions (StartOS UI)

- **Edit config.json** (`edit-config`) — a single `textarea` action holding the raw
  `config.json` content, in the same format as [upstream's own schema](https://docs.multi-scrobbler.app/configuration/)
  (sources, clients, retention, caching, etc.). This is a thin passthrough, not a
  structured form: the handler only checks that the submission is valid JSON and that
  `sources`/`clients`, if present, are arrays — it does not validate individual source or
  client fields (30+ source types and 8 client types make that impractical to mirror and
  keep in sync). Prefilled from the file on disk, or a `{ "sources": [], "clients": [] }`
  skeleton on first run. Available any time; writing a new config restarts the daemon to
  apply it (`startos/main.ts` watches `config.json` reactively).
- **Get Maloja Connection Info** (`maloja-connection-info`) — resolves the Maloja
  dependency's inter-container bridge address (`sdk.host.getBridgeAddress`, per
  [Service-to-Service Networking](https://docs.start9.com/packaging/service-to-service.html))
  and returns it as a copyable URL for pasting into a Maloja client's `url` field in
  `config.json`. Necessary because `localhost` doesn't reach another service's container,
  and the LAN address goes through StartOS's reverse proxy with a self-signed cert that
  multi-scrobbler's TLS validation rejects — the bridge address is the one that actually
  works. Returns an informational "not available" result if Maloja isn't installed/running.

## Backups and Restore

The entire `config` volume is backed up (config, database, and auth token cache). Restoring
a backup restores sources/clients and play history exactly as they were; OAuth tokens in
`ms-auth.cache` are restored too, so re-authorization is normally not required.

## Health Checks

`checkPortListening` on port 9078 — reports ready once the web server binds its port.
Upstream also exposes `GET /api/health`, which reflects per-source/client connectivity;
that endpoint is not used for the StartOS readiness check because it can legitimately
return a non-200 status while sources are still being configured/authorized, which would
otherwise read as a crash.

## Dependencies

- **Maloja** (`maloja`) — optional. multi-scrobbler works standalone or with any other
  client; this dependency only matters if you add a Maloja client to `config.json`.
  `kind: 'running'`, `healthChecks: ['maloja']`. No volumes are mounted from it — connection
  is over the network only, via the **Get Maloja Connection Info** action.

## Limitations and Differences

1. `BASE_URL` is derived automatically from the service's own enabled Web Interface address
   and reapplied on every restart; it cannot currently be pinned to a specific address
   independent of interface state.
2. `PUID`/`PGID` are fixed at `1000:1000` rather than user-configurable.
3. The **Edit config.json** action validates only that the submission is JSON with
   array-typed `sources`/`clients`, not the fields of individual source/client entries — a
   config with a valid JSON shape but wrong per-source fields (e.g. a missing required key
   for a given source type) will save without a StartOS-level error, surfacing instead as
   an app-level error in the logs/dashboard once the daemon restarts.

## What Is Unchanged from Upstream

Source/client configuration (`config.json` schema and supported services), the SQLite
play-history database, retention/compaction behavior, and the dashboard/API itself all
work exactly as documented upstream.

## Contributing

See [AGENTS.md](AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: multi-scrobbler
architectures: [x86_64, aarch64]
volumes:
  config: /config
ports:
  ui: 9078
dependencies:
  - maloja (optional)
startos_managed_env_vars:
  - PORT
  - CONFIG_DIR
  - DATA_DIR
  - PUID
  - PGID
  - TZ
  - BASE_URL
actions:
  - edit-config
  - maloja-connection-info
```
