<p align="center">
  <img src="icon.svg" alt="Multi-Scrobbler Logo" width="21%">
</p>

# Multi-Scrobbler on StartOS

> Everything not listed in this document should behave the same as upstream
> Multi-Scrobbler. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Multi-Scrobbler](https://github.com/FoxxMD/multi-scrobbler) tracks what you play across
sources such as Spotify, Jellyfin, Plex, and Subsonic, and scrobbles it to one or more
clients such as Last.fm, ListenBrainz, and Maloja.

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
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream `foxxmd/multi-scrobbler` image is used unmodified, for `x86_64` and `aarch64`.

Since 0.21.0 it is a distroless image: no shell, no coreutils, only `/nodejs/bin/node`, which
is the entrypoint. It runs as the non-root user `65532:65532` (the image's `USER`), and the
daemon uses the image's own entrypoint and user. The single subcontainer is named
`multi-scrobbler-sub`.

A `chown` oneshot runs before the daemon on every start. With no `chown` binary in the image,
it runs the image's `node` as root with a short inline script that recursively `lchown`s
`/config` to `65532:65532`. That covers both a fresh volume, which mounts root-owned, and data
written by package releases before 0.21.1:0, which ran upstream's old linuxserver base as
`1000:1000`. If it fails, the daemon never starts and upstream would otherwise exit with
`/config is not writable`.

## Volume and Data Layout

Two volumes: the application's data directory, and StartOS's own.

| Volume   | Mount point | Contents                                                                |
| -------- | ----------- | ----------------------------------------------------------------------- |
| `config` | `/config`   | `config.json`, the play-history database, and per-source credential caches |
| `startos`| not mounted | `store.json` — see [File Models](#file-models)                          |

Both `CONFIG_DIR` and `DATA_DIR` point at `/config`, matching the upstream image's own
layout, so configuration and state share one directory. Within it, each authorized OAuth
source or client keeps its tokens in its own `currentCreds-<type>-<name>.json`, not in a
single shared cache — a detail worth knowing when diagnosing why one source lost its
authorization and the others did not.

Before an upgrade migrates the database (`ms.db`), upstream copies it to
`/config/ms.db.<unix-timestamp>.bak` and never deletes the copy. These accumulate with every
such upgrade, each about the size of the database, and every one is included in StartOS
backups. **Delete Old Database Backups** removes all but the newest.

The `startos` volume is never mounted into the container: it holds StartOS-side state the
application has no business reading.

## File Models

Three models, owned by opposite parties.

`config.json`, at `/config/config.json`, is the whole of multi-scrobbler's own
configuration — every source and every client. It is modeled as raw text rather than a
typed schema, because upstream's shape spans more than thirty source types and eight client
types and mirroring it would go stale on the first upstream release. Nothing seeds it: no
file exists until **Edit config.json** is run for the first time. From then on it is
entirely the user's — nothing StartOS-managed rewrites it, and an edit made over SSH or
through a file manager survives untouched until the next time that action is submitted.
The daemon reads it only at startup, so the package watches the file and restarts the daemon
whenever it changes.

`maloja.json`, at `/config/maloja.json`, is upstream's optional per-type file for Maloja
entries. The package never writes it; it reads it raw only to decide whether the Maloja
dependency applies (see [Dependencies](#dependencies)).

`store.json`, on the `startos` volume, holds two keys: `baseUrl`, the address chosen by
**Set Callback Address**, and `adminPassword`, written only by **Set Admin Password**. Nothing
seeds either. `main` reads `adminPassword` reactively and passes it as `ADMIN_RESET_PW` (see
[Network Access and Interfaces](#network-access-and-interfaces)), so running the action
restarts the daemon. Package releases before 0.21.1:0 kept a `uiPassword` key for a StartOS
basic-auth gate. The 0.21.1:0 migration moves it to `adminPassword`, unless that is already
set, and removes it.

The `BASE_URL` environment variable comes from `baseUrl`, followed to its hostname's current
port and scheme. While `baseUrl` is unset or its hostname is no longer one of the interface's
addresses, the package passes a fallback instead — a public domain (HTTPS first), else the
`.local` address, else the first address offered — without writing it to `store.json`, so a
chosen address that comes back is used again. multi-scrobbler reads `BASE_URL` on launch, so a
change takes effect on the restart it triggers, and never mid-run.

## Dependencies

One, and the service runs perfectly well without it.

- **Maloja** (`maloja`) — optional, `kind: 'running'`, gated on its `maloja` health check.
  Enabled only while Maloja is configured: a `clients` or `sources` entry in `config.json`
  with `"type": "maloja"`, or any entry in `/config/maloja.json` (upstream's per-type file).
  Entries with `"enable": false` don't count, matching upstream. The dependency re-evaluates
  whenever either file changes. multi-scrobbler is equally happy with any other client, or
  none. No volume is mounted from it — the two talk over
  the network, at the address **Get Maloja Connection Info** resolves.

## Network Access and Interfaces

One interface, serving the dashboard and the REST API from the same port. Its **Open UI**
control prefers the address `BASE_URL` resolves to (see [File Models](#file-models)) when the
connection Open UI is used from can reach it, so the dashboard opens where OAuth callbacks
return.

| Interface     | Id   | Type | Port | Protocol | Purpose                                              |
| ------------- | ---- | ---- | ---- | -------- | ---------------------------------------------------- |
| Web Interface | `ui` | ui   | 9078 | HTTP     | dashboard, OAuth authorization links, and the REST API |

**Access control is multi-scrobbler's own login** (built-in authentication, new in upstream
0.21.0). It has a single account, initially named `admin`. Until that account has a password,
upstream runs "unsecured": every request is treated as the admin, though requests through a
host it does not recognize are read-only. Hosts it recognizes include IP addresses, `.local`
names and the `BASE_URL` host. Once a password is set, the dashboard and the whole REST API
(logs, starting and stopping sources, the dead-scrobble queue, OAuth flows, `/api/metrics`) require
a login session or an API key created under Settings → Account.

The package sets the password through upstream's environment variables, never by writing to
its database. When `adminPassword` is set, the daemon gets `ADMIN_RESET_PW=<adminPassword>`.
Upstream stores an HMAC fingerprint of each reset value it has applied
(`src/backend/common/auth/ownerPassword.ts`). A new value sets the password and signs out all
admin sessions. A value it has already applied is ignored, with a warning logged on every
start (`ADMIN_RESET_PW was NOT applied: this value was already used…`). That warning is
expected here. So a password changed later in the dashboard survives restarts, and running
**Set Admin Password** again takes the password back.

These endpoints stay open after a password is set: ListenBrainz (`/1/*`,
`/api/listenbrainz*`), Last.fm (`/2.0/`, `/api/lastfm*`), WebScrobbler (`/api/webscrobbler*`),
and `/api/health` and `/api/version`. ListenBrainz matches the source's `data.token` and/or
`data.slug`; WebScrobbler matches `data.slug`. Last.fm matches `data.slug` before reading the
body, then uses `data.apiKey` to select among matching sources. An absent or unknown API key
falls back to the first matching source: an API key is not an access-control gate. To restrict
Last.fm submissions, configure a slug and use `/api/lastfm/<slug>` as the client's base URL.
Since upstream 0.21.3 a scrobble request is dropped unread when no source of that kind is
configured. A source with none of these fields is deprecated: it still catches unmatched
requests, but logs a warning, and upstream says a future release will reject it.
**navidrome-startos**'s scrobble-to-multi-scrobbler feature (`ND_LISTENBRAINZ_BASEURL` in its
`main.ts`) uses `/1/` on the bridge address, so the login doesn't affect it. No StartOS
`proxy.auth` gate is set on the binding, because that would gate those endpoints too.

`SECURE_COOKIES` is forced to `false`. better-auth fixes the cookie's `Secure` flag at startup,
and upstream turns it on whenever `BASE_URL` is `https`. That would make every login over a
plain-`http` address (Tor, or the http port) fail silently. `TRUST_PROXY`, `ALLOWED_HOSTS` and
`AUTH_MODE` are left at upstream defaults: proxy headers aren't trusted, any host is accepted,
and built-in auth is on.

## Installation and First-Run Flow

A new install asks for two things. The first is the admin password: a **critical** task
blocks the service from starting until **Set Admin Password** has run. Upstream's own `/setup`
page and setup token are never needed.

The second is a callback address. `BASE_URL` is what multi-scrobbler
builds its OAuth redirect URIs from, and it must be an address the browser completing that
provider's authorization can actually reach — so a fresh install raises the **Set Callback
Address** task. The service runs before it is answered, on the fallback address described in
[File Models](#file-models). Everything else is upstream-managed: `PORT`, `CONFIG_DIR`, `DATA_DIR`, `TZ`,
`BASE_URL`, `SECURE_COOKIES`, and `ADMIN_RESET_PW` come from StartOS; sources, clients, retention, and caching all
come from `config.json` or additional environment variables.

On first boot the application creates its database on its own. Sources that use OAuth are
authorized afterwards, from a link the dashboard shows for each one.

## Actions

Five actions: one address choice, one configuration editor, one lookup, the admin
password, and a cleanup.

- **Set Callback Address** (`set-base-url`) — run it when the address OAuth providers should
  redirect back to is wrong for where you browse from: over a tunnel, over Tor, or on a
  clearnet domain, where a `.local` name does not resolve. Offers the interface's addresses
  (loopback, link-local and the container bridge left out), pre-filled with the stored one.
  Writes `baseUrl` in `store.json` and nothing else; the daemon restarts to pick it up, which takes seconds and
  interrupts scrobbling briefly. Safe to re-run. Choosing an address does not retroactively
  fix an already-authorized source — it changes where the *next* authorization sends the
  browser.

- **Edit config.json** (`edit-config`) — the only way to add or change sources and clients
  from inside StartOS. A single text field holding the file verbatim, prefilled from disk or
  with a `{ "sources": [], "clients": [] }` skeleton on first run. Validation is deliberately
  shallow: valid JSON, and `sources`/`clients` array-typed if present. A wrong field inside a
  source entry saves without complaint and surfaces later as an application error in the logs
  and on the dashboard. Available in any state; submitting restarts the daemon. Safe to
  re-run — it overwrites with exactly what was submitted, so it is also how you revert.

- **Get Maloja Connection Info** (`maloja-connection-info`) — run it before adding a Maloja
  client, to get the URL that entry's `url` field needs. Reads nothing and changes nothing,
  so it is safe at any time. `localhost` names this container, not Maloja's, and the LAN
  address arrives over a certificate multi-scrobbler will not trust; the address this returns
  is the internal one that avoids both. Returns an informational result rather than an error
  when Maloja is absent or stopped.

- **Set Admin Password** (`set-admin-password`) — generates a random 24-character password,
  writes it to `store.json` as `adminPassword`, and returns the password for one-time viewing.
  The daemon restarts and applies the password through `ADMIN_RESET_PW`, signing the admin
  out in every browser. Once a password is stored, the action warns before replacing it.
  Run it again to rotate the password or to recover a forgotten one, including one changed
  in the dashboard. Password resets preserve the current username: it is `admin` unless
  renamed in Settings → Account. After the reset, the service logs include the full username
  in `Password for admin '<username>' was reset from ADMIN_RESET_PW…`; the ordinary startup
  message redacts it.

- **Delete Old Database Backups** (`prune-db-backups`) — deletes every
  `/config/ms.db.<unix-timestamp>.bak` except the one with the highest timestamp, and reports
  how many it removed and the space freed. Upstream writes these with SQLite's online backup
  API before each migrating upgrade, and never reads, rotates or removes them (see
  [Volume and Data Layout](#volume-and-data-layout)); each StartOS backup carries all of them.
  Stop the service before running it: upstream writes the copies in place during startup.
  The action opens the newest copy read-only with the image's SQLite runtime, requires a
  non-empty schema and a successful `PRAGMA quick_check`, and deletes nothing if validation
  fails. The unsuffixed `ms.db.bak`, which upstream restores from when `ms.db` is missing,
  is never touched. It never touches `ms.db` itself or restarts the service; start it again
  after cleanup. To roll back by hand, stop the service, delete `ms.db`
  and rename the kept copy to `ms.db.bak`. A deleted copy survives only in StartOS backups taken
  before the action ran. With one copy or none it reports there is nothing to delete.

## Tasks

Two tasks.

- **Set Admin Password** — `critical`: the service won't start until it's done. Raised from
  `setupOnInit` while `adminPassword` is unset, which is every fresh install and every update
  from a release before 0.21.1:0 that had no web UI password. It clears when the action runs.

- **Set Callback Address** — `important`, so it is surfaced prominently but never blocks the
  service. Raised while `baseUrl` is unset — so on every fresh install — or its hostname is no
  longer among the interface's addresses, typically because a gateway or domain was turned
  off. It clears when the user picks an address or the stored one returns, and comes back any
  time the stored address stops being available.

## Health Checks

One check, on the daemon.

- **`multi-scrobbler`** — succeeds once port 9078 accepts a connection. It deliberately does
  not use the application's own `/api/health` endpoint, which reports per-source and
  per-client connectivity and legitimately returns a non-200 while sources are still being
  configured or authorized; treating that as the readiness signal would report a correctly
  running service as crashed. A failure here therefore means the web server never bound its
  port at all — read the subcontainer's logs for a startup error. It says nothing about
  whether any source or client is connected; the dashboard is where that lives.

## Backups and Restore

Both volumes are copied wholesale — `sdk.Backups.ofVolumes`, no dump step — so
`config.json`, the play-history database, every `currentCreds-*.json`, and `store.json`
travel together.

Nothing is deliberately excluded, including upstream's pre-upgrade database copies
(`ms.db.*.bak`), which can make a backup several times the size of the live database. Because the credential files are captured as-is, a restored
instance comes back with its OAuth sources still authorized and needs no re-authorization;
because `store.json` comes with it, the callback address is the one that was chosen. The admin
password comes back with the database, and the stored `adminPassword` matches the reset
fingerprint in it, so restore doesn't reset the password. If the
interface is assigned a fresh external port on reinstall, `BASE_URL` follows the stored
hostname to it. Only a hostname that no longer exists on the restored server raises the
**Set Callback Address** task.

## Limitations and Differences

Three things behave differently here than they would running the image yourself.

1. `BASE_URL` is a single address chosen through **Set Callback Address**, not a per-source
   setting. The browser completing an OAuth flow has to be able to reach whatever is chosen,
   which the default mDNS address does not satisfy off the LAN. Choosing a reachable address
   is the general fix; overriding `redirectUri` on the individual source or client in
   `config.json` handles the case where different providers need different addresses.
2. The container user is fixed at the image's `65532:65532`, and the admin password is
   generated by **Set Admin Password**. It can't be typed in, though it can be changed later
   in the dashboard.
3. **Edit config.json** validates only the outer JSON shape, not the fields of individual
   source and client entries, so a configuration that is well-formed but wrong is accepted
   and fails later at the application level.

---

## Quick Reference for AI Consumers

```yaml
package_id: multi-scrobbler
image: foxxmd/multi-scrobbler
architectures: [x86_64, aarch64]
subcontainers: [multi-scrobbler-sub]
oneshots: [chown]
volumes:
  config: /config
  startos: null
file_models:
  - config.json
  - maloja.json
  - store.json
startos_managed_env_vars:
  - PORT
  - CONFIG_DIR
  - DATA_DIR
  - TZ
  - BASE_URL
  - SECURE_COOKIES
  - ADMIN_RESET_PW
dependencies:
  - maloja (optional; enabled while a Maloja client or source is configured)
interfaces:
  ui: { type: ui, port: 9078 }
actions:
  - set-base-url
  - edit-config
  - maloja-connection-info
  - set-admin-password
  - prune-db-backups
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: set-base-url, severity: important }
health_checks:
  - multi-scrobbler
```
