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
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
