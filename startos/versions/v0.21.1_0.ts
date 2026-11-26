import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'

export const v_0_21_1_0 = VersionInfo.of({
  version: '0.21.1:0',
  releaseNotes: {
    en_US: `Updated multi-scrobbler to 0.21.1. The dashboard now has its own login: run Set Admin Password to create it (you are prompted after updating). It replaces the Set/Clear Web UI Password actions. If you had set a web UI password, it becomes the admin password, and Navidrome, WebScrobbler, ListenBrainz- and Last.fm-compatible clients can scrobble again, since the login does not cover those endpoints. Also adds the Blackbox webhook client and an opt-in public dashboard. Requires StartOS 0.4.2 or later.`,
    es_ES: `multi-scrobbler actualizado a la versión 0.21.1. El panel tiene ahora su propio inicio de sesión: ejecuta "Establecer contraseña de administrador" para crearlo (se te pedirá tras actualizar). Sustituye a las acciones para establecer y borrar la contraseña de la interfaz web. Si habías establecido una contraseña de la interfaz web, pasa a ser la contraseña de administrador, y Navidrome, WebScrobbler y los clientes compatibles con ListenBrainz y Last.fm pueden volver a enviar scrobbles, ya que el inicio de sesión no cubre esos extremos. También añade el cliente webhook Blackbox y un panel público opcional. Requiere StartOS 0.4.2 o posterior.`,
    de_DE: `multi-scrobbler auf 0.21.1 aktualisiert. Das Dashboard hat jetzt eine eigene Anmeldung: Führe „Admin-Passwort festlegen“ aus, um sie einzurichten (du wirst nach dem Update dazu aufgefordert). Sie ersetzt die Aktionen zum Festlegen und Entfernen des Weboberflächen-Passworts. Wenn du ein Weboberflächen-Passwort festgelegt hattest, wird es zum Admin-Passwort, und Navidrome, WebScrobbler sowie ListenBrainz- und Last.fm-kompatible Clients können wieder scrobbeln, da die Anmeldung diese Endpunkte nicht abdeckt. Außerdem kommen der Blackbox-Webhook-Client und ein optionales öffentliches Dashboard hinzu. Erfordert StartOS 0.4.2 oder neuer.`,
    pl_PL: `Zaktualizowano multi-scrobbler do wersji 0.21.1. Panel ma teraz własne logowanie: uruchom „Ustaw hasło administratora”, aby je utworzyć (zostaniesz o to poproszony po aktualizacji). Zastępuje ono akcje ustawiania i usuwania hasła interfejsu WWW. Jeśli ustawiono hasło interfejsu WWW, staje się ono hasłem administratora, a Navidrome, WebScrobbler oraz klienci zgodni z ListenBrainz i Last.fm mogą znów wysyłać scrobble, ponieważ logowanie nie obejmuje tych punktów końcowych. Dodano też klienta webhook Blackbox i opcjonalny publiczny panel. Wymaga StartOS 0.4.2 lub nowszego.`,
    fr_FR: `multi-scrobbler est passé à la version 0.21.1. Le tableau de bord a désormais sa propre connexion : exécutez « Définir le mot de passe administrateur » pour la créer (cela vous est demandé après la mise à jour). Elle remplace les actions de définition et de suppression du mot de passe de l’interface web. Si vous aviez défini un mot de passe pour l’interface web, il devient le mot de passe administrateur, et Navidrome, WebScrobbler et les clients compatibles ListenBrainz et Last.fm peuvent de nouveau envoyer des scrobbles, car la connexion ne couvre pas ces points de terminaison. Ajoute aussi le client webhook Blackbox et un tableau de bord public facultatif. Nécessite StartOS 0.4.2 ou version ultérieure.`,
  },
  migrations: {
    // The web UI basic-auth gate is gone; its password becomes the admin
    // password, so whoever had the gate keeps signing in as admin with it.
    up: async ({ effects }) => {
      await storeJson.update(effects, (store) => {
        if (!store) return store
        const { uiPassword, ...rest } = store
        return typeof uiPassword === 'string' &&
          uiPassword &&
          !rest.adminPassword
          ? { ...rest, adminPassword: uiPassword }
          : rest
      })
    },
    down: IMPOSSIBLE,
  },
})
