import { sdk } from '../sdk'
import { editConfig } from './editConfig'
import { malojaConnectionInfo } from './malojaConnectionInfo'

export const actions = sdk.Actions.of().addAction(editConfig).addAction(malojaConnectionInfo)
