import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// multi-scrobbler's own config.json schema is upstream-defined and large (30+
// source types, 8 client types) — modeled here as raw text, not a zod shape.
// The `edit-config` action is the only writer; validation (valid JSON,
// sources/clients are arrays) happens there, not in this file model.
export const defaultConfig = JSON.stringify({ sources: [], clients: [] }, null, 2)

export const configJson = FileHelper.string({ base: sdk.volumes.config, subpath: 'config.json' })
