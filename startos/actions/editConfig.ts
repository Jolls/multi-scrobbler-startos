import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { configJson, defaultConfig } from '../fileModels/config.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  config: Value.textarea({
    name: i18n('config.json'),
    description: i18n(
      'The raw multi-scrobbler config.json — same format as upstream. See https://docs.multi-scrobbler.app/configuration/ for the schema of each source and client type.',
    ),
    warning: null,
    footnote: i18n(
      'Adding a Maloja client? Run the "Get Maloja Connection Info" action first — "localhost" will not reach it from here.',
    ),
    default: null,
    required: true,
    minLength: null,
    maxLength: null,
    minRows: 20,
    maxRows: 40,
    placeholder: null,
  }),
})

export const editConfig = sdk.Action.withInput(
  'edit-config',
  async () => ({
    name: i18n('Edit config.json'),
    description: i18n('Add or change sources and clients by editing the raw config file.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  // Prefill with the file as it exists on disk, or a minimal skeleton on first run.
  async ({ effects }) => {
    const current = await configJson.read().once()
    return { config: current ?? defaultConfig }
  },
  // Handler — reject invalid JSON with a clear error rather than writing it.
  async ({ effects, input }) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(input.config)
    } catch (e) {
      throw new Error(`config.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}`)
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('config.json must be a JSON object.')
    }
    for (const key of ['sources', 'clients'] as const) {
      const value = (parsed as Record<string, unknown>)[key]
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error(`config.json's "${key}" field must be an array.`)
      }
    }

    await configJson.write(effects, input.config)
  },
)
