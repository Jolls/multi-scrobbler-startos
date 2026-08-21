import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { configJson } from './fileModels/config.json'

export const main = sdk.setupMain(async ({ effects }) => {
  // multi-scrobbler only reads config.json at startup, so restart the daemon
  // whenever the edit-config action writes a new one.
  await configJson.read().const(effects)

  // multi-scrobbler uses BASE_URL to build OAuth redirect URIs (Spotify,
  // Last.fm, etc.) and other self-referential links. `.const()` watches the
  // 'ui' host, so setupMain re-runs (and the daemon restarts with the new
  // env) whenever the user changes which addresses are enabled.
  const host = await sdk.host.getOwn(effects, 'ui').const()
  const ui = Object.values(host?.bindings ?? {})
    .flatMap(b => Object.values(b.interfaces))
    .find(i => i.id === 'ui')
  const baseUrl = ui?.addressInfo.format('urlstring')[0]

  return sdk.Daemons.of(effects).addDaemon('multi-scrobbler', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'multi-scrobbler' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'config',
          subpath: null,
          mountpoint: '/config',
          readonly: false,
        })
        // multi-scrobbler's node process only flushes its DB connection on
        // SIGINT (not SIGTERM, s6's default stop signal), so a platform
        // stop kills it ungracefully. This overrides s6-rc's down-signal
        // for svc-node so a stop delivers SIGINT instead — see
        // github.com/Jolls/multi-scrobbler-startos/issues/3.
        .mountAssets({
          subpath: 'svc-node-down-signal',
          mountpoint: '/etc/s6-overlay/s6-rc.d/svc-node/down-signal',
          type: 'file',
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
