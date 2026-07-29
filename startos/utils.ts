// multi-scrobbler's web UI / API port. Configurable upstream via the `PORT`
// env var (default 9078) — we pin it here and pass the same value through.
export const uiPort = 9078

// The host id the 'ui' interface is bound under (see interfaces.ts). Exported
// so dependent packages can resolve our bridge address without hardcoding it.
export const uiHostId = 'ui'
