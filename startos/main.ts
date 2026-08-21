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
  //
  // addressInfo.format() with no filter includes the LXC bridge address
  // (10.0.3.x) — reachable only container-to-container on this box, never
  // from the user's own browser. An OAuth provider's redirect back to that
  // address times out mid-flow. `.nonLocal` excludes bridge/localhost/
  // link-local so BASE_URL lands on an address the user's browser can
  // actually reach (confirmed: Last.fm's callback redirect timed out
  // against the raw bridge address before this fix).
  const host = await sdk.host.getOwn(effects, 'ui').const()
  const ui = Object.values(host?.bindings ?? {})
    .flatMap(b => Object.values(b.interfaces))
    .find(i => i.id === 'ui')
  // Prefer the mDNS (.local) hostname: it resolves for any device on the LAN
  // regardless of which physical interface answers, so it doesn't depend on
  // array order picking the "right" one among several private addresses
  // (e.g. a WireGuard tunnel IP sorting ahead of the actual LAN IP). Fall
  // back to whatever else `.nonLocal` finds if mDNS isn't enabled.
  const nonLocal = ui?.addressInfo.nonLocal
  const baseUrl =
    nonLocal?.filter({ kind: 'mdns' }).format('urlstring')[0] ??
    nonLocal?.format('urlstring')[0]

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
