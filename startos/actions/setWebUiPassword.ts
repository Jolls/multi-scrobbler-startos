import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'

function getDefaultPassword(): string {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 24 })
}

export const setWebUiPassword = sdk.Action.withoutInput(
  'set-web-ui-password',

  async ({ effects }) => ({
    name: i18n('Set Web UI Password'),
    description: i18n(
      'Gate the web interface behind a username and password, enforced by the StartOS reverse proxy. Only affects your browser and off-box callers — other packages on this server (e.g. Navidrome’s scrobble feed) reach this service over the internal network directly, unaffected either way.',
    ),
    warning: (await storeJson.read((s) => s.uiPassword).const(effects))
      ? i18n(
          'Replaces the current web interface password with a new one. The old password stops working, and anything signing in with it must be given the new one.',
        )
      : i18n(
          'This locks the whole web interface port, including the endpoints push-based sources send scrobbles to without a browser: the WebScrobbler browser extension, ListenBrainz-compatible clients, Last.fm-compatible clients, and Plex/Tautulli/Jellyfin webhooks. Any of those already configured will stop working until you point them at credentials that support basic auth, or run Clear Web UI Password. Pull-based sources (Spotify, Subsonic, Last.fm, YouTube Music) are unaffected.',
        ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = getDefaultPassword()
    await storeJson.merge(effects, { uiPassword: password })
    return {
      version: '1' as const,
      title: i18n('Web UI Login'),
      message: i18n(
        'Use these credentials to sign in to the web interface. Run Clear Web UI Password to turn the gate back off.',
      ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: uiUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)

export const clearWebUiPassword = sdk.Action.withoutInput(
  'clear-web-ui-password',

  async () => ({
    name: i18n('Clear Web UI Password'),
    description: i18n(
      'Turn off the web interface password gate. The interface goes back to having no authentication.',
    ),
    warning: i18n(
      'Removes the login from the web interface. Anyone who can reach one of its addresses can use the dashboard and its API again without a password.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => storeJson.merge(effects, { uiPassword: undefined }),
)
