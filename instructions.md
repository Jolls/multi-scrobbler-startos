# Multi-Scrobbler

## Documentation

- [Multi-Scrobbler docs](https://docs.multi-scrobbler.app) — full configuration reference for every source (Spotify, Jellyfin, Plex, Subsonic, YouTube Music, and more) and client (Last.fm, ListenBrainz, Maloja, and more).
- [Upstream repository](https://github.com/FoxxMD/multi-scrobbler) — issues and release notes.

## What you get on StartOS

- A **Web Interface** — the multi-scrobbler dashboard, OAuth authorization links, and REST API — reachable via whichever LAN/Tor/clearnet addresses you enable in the Interfaces tab.
- An **Edit config.json** action, so you can add sources and clients from inside the StartOS UI without needing a separate file manager or SSH access.
- One persistent volume holding your configuration, play-history database, and cached authorization tokens, included in StartOS backups.

Multi-Scrobbler's dashboard has no login of its own — treat access to it like access to
any unauthenticated local service, and only enable the addresses (e.g. public clearnet)
you're comfortable exposing it on.

## Getting set up

1. Install and start the service, then open the **Web Interface** to confirm it's running.
2. Run the **Edit config.json** action (Actions tab) to add the sources you want to track
   from (Spotify, Jellyfin, Plex, etc.) and the clients you want to scrobble to (Last.fm,
   ListenBrainz, Maloja, etc.). It's a plain text box holding the same `config.json` format
   multi-scrobbler uses everywhere else — see the
   [configuration docs](https://docs.multi-scrobbler.app/configuration/) for the exact
   fields each source/client type needs. The action only checks that what you submit is
   valid JSON; it does not validate individual source/client fields, so double-check
   against the docs before saving.
   - **Connecting to a Maloja instance also installed on this StartOS box?** Don't use
     `localhost` or the LAN address — run the **Get Maloja Connection Info** action first
     and paste the URL it returns into that client's `url` field. `localhost` can't reach
     another service's container, and the LAN address goes through a proxy whose
     certificate multi-scrobbler won't trust.
3. Submitting the action restarts the service automatically to apply the new config — no
   separate restart needed.
4. For sources that use OAuth (Spotify, Last.fm, YouTube Music), open the dashboard —
   it shows an authorization link for each one that still needs it.
5. Once a source is authorized and a client is configured, plays start showing up on the
   dashboard and scrobbling to your configured clients automatically.
