import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => ({
  maloja: {
    kind: 'running',
    // Matches the version currently installed alongside this package during
    // development; bump if maloja-startos ships a breaking change.
    versionRange: '>=1.0.0:0',
    healthChecks: ['maloja'],
  },
}))
