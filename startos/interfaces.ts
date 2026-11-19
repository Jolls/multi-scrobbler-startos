import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import { uiHostId, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, uiHostId)
  const origin = await multi.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 9078,
  })

  // Access control is multi-scrobbler's own login (Set Admin Password). A
  // proxy auth gate would also block the scrobble endpoints upstream leaves
  // open (/1/, /2.0/, /api/listenbrainz, /api/lastfm, /api/webscrobbler).
  const ui = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'ui',
    description: i18n('The multi-scrobbler dashboard and API'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
    preferredLauncherAddress: await primaryUrl.bestUsable(effects).const(),
  })

  return [await origin.export([ui])]
})
