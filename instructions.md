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

The dashboard and its API are behind an admin login. The addresses music players and browser
extensions send scrobbles to (ListenBrainz, Last.fm and WebScrobbler endpoints, and Navidrome
on this server) don't need the login, and keep working with it set. In **Edit config.json**,
set `data.token` on a ListenBrainz endpoint source and the same token in the player. For a
Last.fm or WebScrobbler endpoint source, set `data.slug` and append that slug to the player's
base URL: `/api/lastfm/<slug>` or `/api/webscrobbler/<slug>`. Use a hard-to-guess slug if
others can reach the endpoint. Last.fm's `data.apiKey` selects a source but does not reject
requests with a missing or different key, so it does not protect the endpoint on its own.
Upstream is phasing out endpoint sources without a token, API key or slug: they still work,
with a warning in the logs, but a future release will reject them.

## Getting set up

1. Run **Set Admin Password** when StartOS asks you to. The service won't start until you do.
   Keep the password it shows, and sign in to the **Web Interface** with the username `admin`.
2. A new install also asks you to run **Set Callback Address**. Pick the address you will be
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
- **Set Admin Password** — creates a new random password for the admin account and shows it
  to you. The service restarts and you're signed out in every browser. Run it again any time
  to change the password, or if you've forgotten one you set in the dashboard. You can also
  change the password or username under Settings → Account in the dashboard. This action
  replaces the password but leaves the username unchanged (`admin` unless you renamed it).
  If you forget the username, run the action and find it in the password-reset message in
  the service logs after the restart.
- **Delete Old Database Backups** — before an update changes its database, Multi-Scrobbler
  saves a copy of it, and it never deletes these. Every copy is also saved in each StartOS
  backup, so they make your backups bigger with each update. This action deletes all but the
  newest copy, after checking that it is a readable database. Once you've checked the service
  works after an update, stop it, run this action, and start it again. If the newest copy
  cannot be verified, nothing is deleted.

## Limitations

If you have already authorized a source and later change the callback address, that source
stays authorized — but a service that needs different addresses for different providers can
be handled by setting `redirectUri` on that individual source or client in **Edit
config.json**.
