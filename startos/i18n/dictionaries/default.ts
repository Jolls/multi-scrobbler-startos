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
  // actions/setAdminPassword.ts
  'Set Admin Password': 20,
  'Generate a new random password for the dashboard’s admin account. Replaces any existing password, including one changed in the dashboard.': 21,
  'Replaces the current admin password and signs the admin out in every browser. Multi-Scrobbler restarts to apply it.': 22,
  'Admin Password': 23,
  'Sign in with this password and your current username (admin unless changed in the dashboard). The password-reset message in the service logs shows the current username. Scrobble endpoints such as ListenBrainz, Last.fm and WebScrobbler do not use this login.': 24,
  Password: 26,
  // init/adminPasswordTask.ts
  'Set an admin password: until one is set, anyone who can reach the dashboard can control it.': 27,
  // actions/pruneDbBackups.ts
  'Delete Old Database Backups': 28,
  'Delete all but the newest of the database copies Multi-Scrobbler saves before each upgrade. These copies are also included in every StartOS backup, so they add to its size.': 29,
  'Deleted copies can only be recovered from a StartOS backup taken before you run this.': 30,
  'Database Backups': 31,
  'Nothing to delete: there is no more than one database backup.': 32,
  'Deleted ${count} older database backups and freed ${size} MB. The newest, from ${date}, was kept.': 33,
  'The newest database backup could not be verified. No backups were deleted.': 34,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
