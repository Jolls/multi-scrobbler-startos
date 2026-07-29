import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => ({
  maloja: {
    kind: 'running',
    // Matches the version currently installed alongside this package during
    // development; bump if maloja-startos ships a breaking change.
    versionRange: '>=3.2.4:0',
    healthChecks: ['maloja'],
  },
}))
