import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'multi-scrobbler',
  title: 'Multi-Scrobbler',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/multi-scrobbler-startos',
  upstreamRepo: 'https://github.com/FoxxMD/multi-scrobbler',
  marketingUrl: 'https://docs.multi-scrobbler.app',
  donationUrl: null,
  description: { short, long },
  volumes: ['config', 'startos'],
  images: {
    'multi-scrobbler': {
      source: { dockerTag: 'foxxmd/multi-scrobbler:0.20.2' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
