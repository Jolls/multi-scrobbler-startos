import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.16.4:1',
  releaseNotes: {
    en_US: 'Packaging cleanup: removed the dead "alerts" manifest field (the SDK no longer surfaces those prompts). No functional or configuration change.',
    es_ES: 'Limpieza de empaquetado: se eliminó el campo de manifiesto "alerts", inactivo (el SDK ya no muestra esos avisos). Sin cambios funcionales ni de configuración.',
    de_DE: 'Paket-Bereinigung: das inaktive Manifestfeld "alerts" wurde entfernt (das SDK zeigt diese Hinweise nicht mehr an). Keine funktionale oder konfigurationsbezogene Änderung.',
    pl_PL: 'Porządki w pakiecie: usunięto nieaktywne pole manifestu "alerts" (SDK nie wyświetla już tych podpowiedzi). Brak zmian funkcjonalnych ani konfiguracyjnych.',
    fr_FR: "Nettoyage du packaging : suppression du champ de manifeste inactif « alerts » (le SDK n'affiche plus ces invites). Aucun changement fonctionnel ni de configuration.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
