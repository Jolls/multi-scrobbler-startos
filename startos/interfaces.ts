import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'ui')
  const origin = await multi.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 9078,
  })

  // multi-scrobbler's own dashboard has no login (confirmed against
  // src/backend/server/auth.ts upstream), so this interface is exposed as-is
  // — access control is whatever gateways/addresses the user enables.
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
  })

  return [await origin.export([ui])]
})
