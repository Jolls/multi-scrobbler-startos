import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { configJson } from './fileModels/config.json'
import { primaryUrl } from './primaryUrl'

export const main = sdk.setupMain(async ({ effects }) => {
  // multi-scrobbler only reads config.json at startup, so restart the daemon
  // whenever the edit-config action writes a new one.
  await configJson.read().const(effects)

  const baseUrl = await primaryUrl.bestUsable(effects).const()

  return sdk.Daemons.of(effects).addDaemon('multi-scrobbler', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'multi-scrobbler' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'config',
        subpath: null,
        mountpoint: '/config',
        readonly: false,
      }),
      'multi-scrobbler-sub',
    ),
    exec: {
      // The image is built on linuxserver's s6-overlay base, which must run
      // as PID 1.
      command: sdk.useEntrypoint(),
      runAsInit: true,
      env: {
        PORT: `${uiPort}`,
        CONFIG_DIR: '/config',
        DATA_DIR: '/config',
        PUID: '1000',
        PGID: '1000',
        TZ: 'Etc/UTC',
        ...(baseUrl ? { BASE_URL: baseUrl } : {}),
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
    requires: [],
  })
})
