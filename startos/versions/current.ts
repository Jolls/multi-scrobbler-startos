import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.20.2:0',
  releaseNotes: {
    en_US: `Updated Multi-Scrobbler to 0.20.2.

**Features**

- Plays can now be edited by hand, with a search mode that fills in fields from MusicBrainz, Spotify and Rocksky
- New Tuneshine client for showing Now Playing on a Tuneshine display
- New Mixcloud source that scrobbles the mixes you listen to
- Spotify periodically backfills songs missed by live playback
- Koito can submit play position, and the Deezer and ListenBrainz parsing is more complete

**Security**

- Node.js security fixes, including a remote code execution fix. Update promptly if Multi-Scrobbler is reachable from the internet
- Stops trusting certificates from a compromised certificate authority (eMudhra)

**Before you update**

- This update migrates the database automatically on first start. You cannot go back to an older version afterward

[Full upstream release notes](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.20.0)`,
    es_ES: `Multi-Scrobbler actualizado a 0.20.2.

**Novedades**

- Ahora puedes editar reproducciones a mano, con un modo de búsqueda que rellena campos desde MusicBrainz, Spotify y Rocksky
- Nuevo cliente Tuneshine para mostrar Now Playing en una pantalla Tuneshine
- Nueva fuente Mixcloud que registra los mixes que escuchas
- Spotify recupera periódicamente las canciones omitidas por la reproducción en vivo
- Koito puede enviar la posición de reproducción, y el análisis de Deezer y ListenBrainz es más completo

**Seguridad**

- Correcciones de seguridad de Node.js, incluida una de ejecución remota de código. Actualiza cuanto antes si Multi-Scrobbler es accesible desde internet
- Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra)

**Antes de actualizar**

- Esta actualización migra la base de datos automáticamente en el primer inicio. Después no se puede volver a una versión anterior

[Notas completas de la versión de origen](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.20.0)`,
    de_DE: `Multi-Scrobbler auf 0.20.2 aktualisiert.

**Neuerungen**

- Wiedergaben lassen sich jetzt von Hand bearbeiten, mit einem Suchmodus, der Felder aus MusicBrainz, Spotify und Rocksky befüllt
- Neuer Tuneshine-Client, um Now Playing auf einem Tuneshine-Display anzuzeigen
- Neue Mixcloud-Quelle, die die gehörten Mixes scrobbelt
- Spotify holt regelmäßig Titel nach, die bei der Live-Wiedergabe verpasst wurden
- Koito kann die Wiedergabeposition senden, und die Auswertung von Deezer und ListenBrainz ist vollständiger

**Sicherheit**

- Node.js-Sicherheitsfixes, darunter ein Fix für Remote-Code-Ausführung. Bitte zeitnah aktualisieren, wenn Multi-Scrobbler aus dem Internet erreichbar ist
- Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr

**Vor dem Update**

- Dieses Update migriert die Datenbank beim ersten Start automatisch. Danach ist keine Rückkehr zu einer älteren Version möglich

[Vollständige Release Notes des Originalprojekts](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.20.0)`,
    pl_PL: `Zaktualizowano Multi-Scrobbler do 0.20.2.

**Nowości**

- Odtworzenia można teraz edytować ręcznie, z trybem wyszukiwania uzupełniającym pola z MusicBrainz, Spotify i Rocksky
- Nowy klient Tuneshine do wyświetlania Now Playing na wyświetlaczu Tuneshine
- Nowe źródło Mixcloud, które scrobbluje słuchane miksy
- Spotify okresowo uzupełnia utwory pominięte przy odtwarzaniu na żywo
- Koito może wysyłać pozycję odtwarzania, a parsowanie danych Deezer i ListenBrainz jest pełniejsze

**Bezpieczeństwo**

- Poprawki bezpieczeństwa Node.js, w tym poprawka zdalnego wykonania kodu. Zaktualizuj szybko, jeśli Multi-Scrobbler jest dostępny z internetu
- Przestaje ufać certyfikatom z zagrożonego urzędu certyfikacji (eMudhra)

**Przed aktualizacją**

- Ta aktualizacja automatycznie migruje bazę danych przy pierwszym uruchomieniu. Potem nie można wrócić do starszej wersji

[Pełne informacje o wydaniu źródłowym](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.20.0)`,
    fr_FR: `Multi-Scrobbler mis à jour vers 0.20.2.

**Nouveautés**

- Les lectures peuvent désormais être modifiées à la main, avec un mode recherche qui remplit les champs depuis MusicBrainz, Spotify et Rocksky
- Nouveau client Tuneshine pour afficher Now Playing sur un écran Tuneshine
- Nouvelle source Mixcloud qui enregistre les mixes que vous écoutez
- Spotify récupère périodiquement les titres manqués par la lecture en direct
- Koito peut envoyer la position de lecture, et l’analyse de Deezer et ListenBrainz est plus complète

**Sécurité**

- Correctifs de sécurité de Node.js, dont un correctif d’exécution de code à distance. Mettez à jour rapidement si Multi-Scrobbler est accessible depuis internet
- Ne fait plus confiance aux certificats d’une autorité de certification compromise (eMudhra)

**Avant de mettre à jour**

- Cette mise à jour migre automatiquement la base de données au premier démarrage. Il est impossible de revenir à une version antérieure ensuite

[Notes de version amont complètes](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.20.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
