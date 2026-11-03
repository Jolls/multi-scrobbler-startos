export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Web Interface': 0,
  'The web interface is ready': 1,
  'The web interface is not ready': 2,
  // interfaces.ts
  'The multi-scrobbler dashboard and API': 3,
  // actions/editConfig.ts
  'config.json': 4,
  'The raw multi-scrobbler config.json — same format as upstream. See https://docs.multi-scrobbler.app/configuration/ for the schema of each source and client type.': 5,
  'Edit config.json': 6,
  'Add or change sources and clients by editing the raw config file.': 7,
  'Adding a Maloja client? Run the "Get Maloja Connection Info" action first — "localhost" will not reach it from here.': 15,
  // actions/malojaConnectionInfo.ts
  'Get Maloja Connection Info': 8,
  'Look up the URL to use for a Maloja client in config.json. "localhost" will not work — this container cannot reach Maloja that way.': 9,
  'Maloja Not Available': 10,
  'The Maloja dependency is not installed or not running.': 11,
  'Maloja Connection Info': 12,
  'Paste this into the "url" field of a Maloja client entry in config.json.': 13,
  'Maloja URL': 14,
  // primaryUrl.ts
  URL: 16,
  'Set Callback Address': 17,
  'Choose which of this service’s addresses Spotify, Last.fm, and other authorization flows should send your browser back to.': 18,
  // init/primaryUrlTask.ts
  'Choose the address Spotify, Last.fm, and other authorization flows send your browser back to.': 19,
  // actions/setWebUiPassword.ts
  'Set Web UI Password': 20,
  'Gate the web interface behind a username and password, enforced by the StartOS reverse proxy. It also blocks other services on this server, including Navidrome’s scrobble feed, which can’t send the login; clear the password to use them.': 21,
  'This locks the whole web interface port, including the endpoints push-based sources send scrobbles to without a browser: the WebScrobbler browser extension, ListenBrainz-compatible clients, Last.fm-compatible clients, and Plex/Tautulli/Jellyfin webhooks. Any of those already configured will stop working until you point them at credentials that support basic auth, or run Clear Web UI Password. Pull-based sources (Spotify, Subsonic, Last.fm, YouTube Music) are unaffected.': 22,
  'Web UI Login': 23,
  'Use these credentials to sign in to the web interface. Run Clear Web UI Password to turn the gate back off.': 24,
  Username: 25,
  Password: 26,
  'Clear Web UI Password': 27,
  'Turn off the web interface password gate. The interface goes back to having no authentication.': 28,
  'Replaces the current web interface password with a new one. The old password stops working, and anything signing in with it must be given the new one.': 29,
  'Removes the login from the web interface. Anyone who can reach one of its addresses can use the dashboard and its API again without a password.': 30,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
