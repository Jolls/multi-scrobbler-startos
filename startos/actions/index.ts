import { sdk } from '../sdk'
import { primaryUrl } from '../primaryUrl'
import { editConfig } from './editConfig'
import { pruneDbBackups } from './pruneDbBackups'
import { malojaConnectionInfo } from './malojaConnectionInfo'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(primaryUrl.action)
  .addAction(editConfig)
  .addAction(malojaConnectionInfo)
  .addAction(setAdminPassword)
  .addAction(pruneDbBackups)
