import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.16.4:0',
  releaseNotes: {
    en_US: 'Updates Multi-Scrobbler to 0.16.4 (from 0.14.2), adding an Apple Music source and improved Subsonic playback reporting, plus stability fixes for the ENV config validation introduced along the way. Existing config.json setups are unaffected: the breaking changes in this range (data directory layout, systemScrobble rename, mandatory source/client IDs) only apply to Icecast/Azuracast or non-Docker installs, and our container already sets CONFIG_DIR/DATA_DIR to /config.',
    es_ES: 'Actualiza Multi-Scrobbler a 0.16.4 (desde 0.14.2), añadiendo una fuente de Apple Music y mejor reporte de reproducción de Subsonic, además de correcciones de estabilidad para la validación de configuración por variables de entorno introducida en el camino. Las configuraciones existentes de config.json no se ven afectadas: los cambios importantes en este rango (diseño de directorios de datos, renombrado de systemScrobble, IDs obligatorios de source/client) solo afectan a instalaciones Icecast/Azuracast o sin Docker, y nuestro contenedor ya fija CONFIG_DIR/DATA_DIR en /config.',
    de_DE: 'Aktualisiert Multi-Scrobbler auf 0.16.4 (von 0.14.2): neue Apple-Music-Quelle, verbesserte Subsonic-Wiedergabeberichte sowie Stabilitätskorrekturen für die dabei eingeführte ENV-Konfigurationsvalidierung. Bestehende config.json-Einrichtungen sind nicht betroffen: die Breaking Changes in diesem Bereich (Datenverzeichnis-Layout, Umbenennung von systemScrobble, verpflichtende Source/Client-IDs) betreffen nur Icecast/Azuracast oder Nicht-Docker-Installationen, und unser Container setzt CONFIG_DIR/DATA_DIR bereits auf /config.',
    pl_PL: 'Aktualizuje Multi-Scrobbler do wersji 0.16.4 (z 0.14.2), dodając źródło Apple Music i lepsze raportowanie odtwarzania Subsonic, a także poprawki stabilności dla wprowadzonej po drodze walidacji konfiguracji ENV. Istniejące konfiguracje config.json nie są dotknięte: zmiany łamiące kompatybilność w tym zakresie (układ katalogów danych, zmiana nazwy systemScrobble, obowiązkowe ID source/client) dotyczą tylko instalacji Icecast/Azuracast lub instalacji spoza Dockera, a nasz kontener już ustawia CONFIG_DIR/DATA_DIR na /config.',
    fr_FR: "Met à jour Multi-Scrobbler vers la 0.16.4 (depuis la 0.14.2), ajoutant une source Apple Music et un meilleur rapport de lecture Subsonic, ainsi que des correctifs de stabilité pour la validation de configuration ENV introduite en chemin. Les configurations config.json existantes ne sont pas affectées : les changements majeurs sur cette plage (organisation des répertoires de données, renommage de systemScrobble, IDs source/client obligatoires) ne concernent que les installations Icecast/Azuracast ou hors Docker, et notre conteneur définit déjà CONFIG_DIR/DATA_DIR sur /config.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
