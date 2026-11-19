import { i18n } from './i18n'
import { sdk } from './sdk'
import { appUid, uiPort } from './utils'
import { configJson } from './fileModels/config.json'
import { storeJson } from './fileModels/store.json'
import { primaryUrl } from './primaryUrl'

export const main = sdk.setupMain(async ({ effects }) => {
  // multi-scrobbler only reads config.json at startup, so restart the daemon
  // whenever the edit-config action writes a new one.
  await configJson.read().const(effects)

  const baseUrl = await primaryUrl.bestUsable(effects).const()
  const adminPassword = await storeJson
    .read((s) => s.adminPassword)
    .const(effects)

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'multi-scrobbler' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'config',
      subpath: null,
      mountpoint: '/config',
      readonly: false,
    }),
    'multi-scrobbler-sub',
  )

  // The distroless image runs as uid 65532 and has no shell or chown, so use
  // its own node, as root, to hand /config to that user. Releases before
  // 0.21.0 left it owned by 1000 (linuxserver PUID), and a fresh volume
  // mounts root-owned.
  return sdk.Daemons.of(effects)
    .addOneshot('chown', {
      subcontainer,
      exec: {
        command: [
          '/nodejs/bin/node',
          '-e',
          `const fs = require('fs'), path = require('path')
const own = (p) => fs.lchownSync(p, ${appUid}, ${appUid})
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    own(p)
    if (e.isDirectory()) walk(p)
  }
}
own('/config')
walk('/config')`,
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('multi-scrobbler', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          PORT: `${uiPort}`,
          CONFIG_DIR: '/config',
          DATA_DIR: '/config',
          TZ: 'Etc/UTC',
          // better-auth fixes the cookie's Secure flag once at startup, and
          // upstream turns it on whenever BASE_URL is https. That would break
          // logging in over any plain-http address (e.g. Tor), so keep it off.
          SECURE_COOKIES: 'false',
          ...(baseUrl ? { BASE_URL: baseUrl } : {}),
          // Applied once per distinct value (upstream stores a fingerprint),
          // so it sets the first password and every rotation, but never
          // overwrites a password later changed in the dashboard.
          ...(adminPassword ? { ADMIN_RESET_PW: adminPassword } : {}),
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['chown'],
    })
})
