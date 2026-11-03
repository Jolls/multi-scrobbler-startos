# Multi-Scrobbler

## Documentation

- [Multi-Scrobbler documentation](https://docs.multi-scrobbler.app) — the full configuration reference for every source (Spotify, Jellyfin, Plex, Subsonic, YouTube Music, and more) and every client (Last.fm, ListenBrainz, Maloja, and more).

## What you get on StartOS

A dashboard showing what is playing and where it is being scrobbled to, plus the REST API
sources can post to. Your configuration, play history, and saved authorizations all live on
your server's storage and are included in StartOS backups.

Sources and clients are added through an action rather than by editing a file over SSH, and
the address that music services send you back to after authorization is one you pick from a
list.

Multi-Scrobbler has no password of its own. By default, anyone who can open the address can do
everything you can — read its logs, pause your scrobbling, and start an authorization flow.
Your account credentials are not on show, but the controls are, so either enable only the
addresses you would hand those controls to, or run **Set Web UI Password** (below) to require a
login.

## Getting set up

1. Start the service and open the **Web Interface** to confirm it is running.
2. A new install asks you to run **Set Callback Address**. Pick the address you will be
   browsing from when you authorize a source through Spotify, Last.fm, Deezer, or YouTube
   Music. This is where those services send your browser back to once you approve access, so
   it has to be an address that browser can reach: a `.local` name works from a device on the
   same network; over a VPN, over Tor, or from a domain name, pick that address instead. Until
   you choose, Multi-Scrobbler uses one of its addresses on its own.
3. Run **Edit config.json** to add the sources you want to track from and the clients you
   want to scrobble to. It is a plain text box holding the same `config.json` that
   multi-scrobbler uses everywhere else — see the configuration reference above for the
   fields each source and client type needs. The action checks that what you submit is valid
   JSON but not that individual fields are right, so check them against the documentation
   before saving.
   - **Adding a Maloja instance running on this same server?** Do not use `localhost` or its
     LAN address. Run **Get Maloja Connection Info** and paste the URL it gives you into that
     client's `url` field. StartOS lists Maloja as a dependency only while a Maloja client
     or source is configured.
4. Submitting the action restarts the service to apply the new configuration — you do not
   need to restart it yourself.
5. For sources that use OAuth, open the dashboard: it shows an authorization link for each
   one still waiting. Complete each from a browser at the address you chose in step 2.
6. Once a source is authorized and a client configured, plays appear on the dashboard and
   scrobble automatically.

## Using Multi-Scrobbler

### Web interface

The dashboard lists every configured source and client with its current state, the
authorization links for anything not yet approved, and the recent plays it has processed.

### Actions

- **Set Callback Address** — pick which of this service's addresses music services send your
  browser back to after you approve access. Run it whenever you start authorizing from
  somewhere new. **Open UI** prefers this address when your connection can reach it. It changes where the *next* authorization goes; sources already authorized
  keep working.
- **Edit config.json** — add or change sources and clients. Submitting restarts the service.
  Re-running replaces the file with exactly what you submit, so it is also how you undo a
  change.
- **Get Maloja Connection Info** — gives you the URL a Maloja client entry needs when Maloja
  is running on this same server.
- **Set Web UI Password** — turns on a login (username `admin`, generated password) for the
  web interface, enforced before the request reaches Multi-Scrobbler. Read the warning before
  running it: because the dashboard, the API, and scrobble ingest all share one port, this
  also locks out push-based sources that can't send a username and password — the WebScrobbler
  browser extension, ListenBrainz-compatible clients, Last.fm-compatible clients, and
  Plex/Tautulli/Jellyfin webhooks. Sources Multi-Scrobbler connects out to instead (Spotify,
  Subsonic, Last.fm, YouTube Music) keep working either way. Re-running it issues a new
  password, and warns you first that the old one stops working. The login also blocks other
  services on this server, including Navidrome's scrobble feed, which can't send it; clear the
  password to use them.
- **Clear Web UI Password** — turns the login back off, after asking you to confirm.

## Limitations

If you have already authorized a source and later change the callback address, that source
stays authorized — but a service that needs different addresses for different providers can
be handled by setting `redirectUri` on that individual source or client in **Edit
config.json**.
