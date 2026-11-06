import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.20.3:0',
  releaseNotes: {
    en_US: `Updated multi-scrobbler to 0.20.3, which shuts down cleanly on its own, so StartOS no longer overrides the stop signal.`,
    es_ES: `multi-scrobbler actualizado a la versión 0.20.3, que se apaga correctamente por sí mismo, por lo que StartOS ya no modifica la señal de parada.`,
    de_DE: `multi-scrobbler auf 0.20.3 aktualisiert; es fährt jetzt selbstständig sauber herunter, daher überschreibt StartOS das Stoppsignal nicht mehr.`,
    pl_PL: `Zaktualizowano multi-scrobbler do wersji 0.20.3, która sama poprawnie się zamyka, więc StartOS nie zmienia już sygnału zatrzymania.`,
    fr_FR: `multi-scrobbler est passé à la version 0.20.3, qui s’arrête proprement de lui-même ; StartOS ne remplace donc plus le signal d’arrêt.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
