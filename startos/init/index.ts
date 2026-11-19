import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { adminPasswordTask } from './adminPasswordTask'
import { primaryUrlTask } from './primaryUrlTask'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  actions,
  primaryUrlTask,
  adminPasswordTask,
  dependencies,
)

export const uninit = sdk.setupUninit(versionGraph)
