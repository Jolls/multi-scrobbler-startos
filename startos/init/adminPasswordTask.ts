import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const adminPasswordTask = sdk.setupOnInit(async (effects) => {
  if (!(await storeJson.read((s) => s.adminPassword).const(effects))) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n(
        'Set an admin password: until one is set, anyone who can reach the dashboard can control it.',
      ),
    })
  }
})
