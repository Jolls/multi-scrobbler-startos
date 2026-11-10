import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import { uiHostId, uiPort, uiUsername } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiPassword = await storeJson.read((s) => s.uiPassword).const(effects)

  const multi = sdk.MultiHost.of(effects, uiHostId)
  const origin = await multi.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 9078,
    proxy: {
      auth: uiPassword
        ? {
            type: 'basic',
            credentials: [{ username: uiUsername, password: uiPassword }],
            realm: null,
          }
        : null,
    },
  })

  // multi-scrobbler's own dashboard has no login (confirmed against
  // src/backend/server/auth.ts upstream). By default this interface is exposed
  // as-is — access control is whatever gateways/addresses the user enables — but
  // "Set Web UI Password" (actions/setWebUiPassword.ts) can turn on a StartOS
  // reverse-proxy basic-auth gate. That gate applies to the whole port, including
  // the push-based scrobble endpoints, so it's opt-in rather than default-on.
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
