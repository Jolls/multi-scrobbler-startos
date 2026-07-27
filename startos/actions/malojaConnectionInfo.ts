import { uiHostId as malojaUiHostId, uiPort as malojaUiPort } from 'maloja-startos/startos/utils'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// "localhost"/"127.0.0.1" inside multi-scrobbler's container refers to its
// own container, not Maloja's — this resolves the address that actually
// reaches Maloja over the inter-service bridge, for pasting into a Maloja
// client's "url" field in config.json (see edit-config.ts).
export const malojaConnectionInfo = sdk.Action.withoutInput(
  'maloja-connection-info',
  async () => ({
    name: i18n('Get Maloja Connection Info'),
    description: i18n(
      'Look up the URL to use for a Maloja client in config.json. "localhost" will not work — this container cannot reach Maloja that way.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const address = await sdk.host
      .getBridgeAddress(effects, {
        packageId: 'maloja',
        hostId: malojaUiHostId,
        internalPort: malojaUiPort,
        ssl: false,
      })
      .once()

    if (!address) {
      return {
        version: '1',
        title: i18n('Maloja Not Available'),
        message: i18n('The Maloja dependency is not installed or not running.'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Maloja Connection Info'),
      message: i18n('Paste this into the "url" field of a Maloja client entry in config.json.'),
      result: {
        type: 'single',
        name: i18n('Maloja URL'),
        description: null,
        value: `http://${address}`,
        masked: false,
        copyable: true,
        qr: false,
      },
    }
  },
)
