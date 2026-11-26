import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_21_1_0 } from './v0.21.1_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_21_1_0],
})
