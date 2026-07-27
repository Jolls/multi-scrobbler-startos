import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'multi-scrobbler',
  title: 'Multi-Scrobbler',
  license: 'MIT', // Confirmed: upstream README + Dockerfile OCI label both say MIT.
  packageRepo: 'https://github.com/Jolls/multi-scrobbler-startos',
  upstreamRepo: 'https://github.com/FoxxMD/multi-scrobbler',
  marketingUrl: 'https://docs.multi-scrobbler.app',
  donationUrl: null,
  description: { short, long },
  volumes: ['config'],
  images: {
    // Confirmed on Docker Hub 2026-07-26: foxxmd/multi-scrobbler:0.14.2 ships
    // both amd64 and arm64. See UPDATING.md for how to re-check this on bump.
    'multi-scrobbler': {
      source: { dockerTag: 'foxxmd/multi-scrobbler:0.14.2' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    // Optional: multi-scrobbler works fine with any client (or none), but
    // when Maloja is used as a client, its config.json "url" must point at
    // this dependency's bridge address, not "localhost" — see
    // actions/malojaConnectionInfo.ts.
    maloja: {
      description: 'Optional scrobble client — used if you add a Maloja client to config.json.',
      optional: true,
      metadata: {
        title: 'Maloja',
        icon: 'https://raw.githubusercontent.com/Jolls/maloja-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
