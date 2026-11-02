import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.20.2:1',
  releaseNotes: {
    en_US: `Set Web UI Password now warns that the password also blocks other services on this server, including Navidrome's scrobble feed. Clear the password to scrobble from Navidrome.`,
    es_ES: `Establecer contraseña de la interfaz web ahora advierte de que la contraseña también bloquea a otros servicios de este servidor, incluido el envío de scrobbles de Navidrome. Borra la contraseña para enviar scrobbles desde Navidrome.`,
    de_DE: `„Weboberflächen-Passwort festlegen“ warnt jetzt, dass das Passwort auch andere Dienste auf diesem Server aussperrt, darunter Navidromes Scrobble-Feed. Lösche das Passwort, um aus Navidrome zu scrobbeln.`,
    pl_PL: `Akcja „Ustaw hasło interfejsu webowego” ostrzega teraz, że hasło blokuje też inne usługi na tym serwerze, w tym przesyłanie scrobbli przez Navidrome. Usuń hasło, aby scrobblować z Navidrome.`,
    fr_FR: `« Définir le mot de passe de l’interface web » avertit désormais que le mot de passe bloque aussi les autres services de ce serveur, dont le flux de scrobbles de Navidrome. Effacez le mot de passe pour scrobbler depuis Navidrome.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
