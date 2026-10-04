import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.19.2:0',
  releaseNotes: {
    en_US: `Updated Multi-Scrobbler to 0.19.2.

**Features**

- The MusicBrainz transformer is now built in and works without any setup
- New Rocksky, Spotify and Cover Art Archive transformers
- The Rocksky client writes scrobbles directly to your PDS and supports Now Playing
- Teal.fm and Rocksky sources no longer need an app password
- ListenBrainz and Koito clients can submit scrubbed device info
- MusicBrainz can exclude audiobooks and music videos
- Smaller Docker image

**Fixes**

- Fixed a transformer startup race condition and noisy startup logging

**Before you update**

- Rocksky: API key authentication is removed and access tokens are deprecated. Switch to handle and app password.
- Discord: automatic Cover Art Archive artwork is deprecated. Add the \`coverartarchive\` transform to your Discord client instead.
- Transforms: if you use the \`MSDefault\` name and also configure transforms through environment variables, rename it to \`MSEnv\`.

[Full upstream release notes](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.19.0)`,
    es_ES: `Multi-Scrobbler actualizado a 0.19.2.

**Novedades**

- El transformador de MusicBrainz ahora está integrado y funciona sin configuración
- Nuevos transformadores de Rocksky, Spotify y Cover Art Archive
- El cliente de Rocksky escribe los scrobbles directamente en tu PDS y admite Now Playing
- Las fuentes Teal.fm y Rocksky ya no necesitan contraseña de aplicación
- Los clientes ListenBrainz y Koito pueden enviar información de dispositivo depurada
- MusicBrainz puede excluir audiolibros y videos musicales
- Imagen de Docker más pequeña

**Correcciones**

- Se corrigió una condición de carrera al iniciar los transformadores y el registro ruidoso al arrancar

**Antes de actualizar**

- Rocksky: se elimina la autenticación con clave de API y los tokens de acceso quedan obsoletos. Cambia a usuario y contraseña de aplicación.
- Discord: la carátula automática de Cover Art Archive queda obsoleta. Añade en su lugar la transformación \`coverartarchive\` a tu cliente de Discord.
- Transformaciones: si usas el nombre \`MSDefault\` y también configuras transformaciones mediante variables de entorno, cámbialo a \`MSEnv\`.

[Notas completas de la versión de origen](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.19.0)`,
    de_DE: `Multi-Scrobbler auf 0.19.2 aktualisiert.

**Neuerungen**

- Der MusicBrainz-Transformer ist jetzt integriert und funktioniert ohne Einrichtung
- Neue Transformer für Rocksky, Spotify und Cover Art Archive
- Der Rocksky-Client schreibt Scrobbles direkt in dein PDS und unterstützt Now Playing
- Teal.fm- und Rocksky-Quellen benötigen kein App-Passwort mehr
- ListenBrainz- und Koito-Clients können bereinigte Geräteinformationen senden
- MusicBrainz kann Hörbücher und Musikvideos ausschließen
- Kleineres Docker-Image

**Fehlerbehebungen**

- Eine Race Condition beim Start der Transformer und störende Startprotokolle wurden behoben

**Vor dem Update**

- Rocksky: Die Authentifizierung per API-Schlüssel wurde entfernt, Zugriffstoken sind veraltet. Wechsle zu Handle und App-Passwort.
- Discord: Das automatische Cover-Art-Archive-Artwork ist veraltet. Füge stattdessen die Transformation \`coverartarchive\` zu deinem Discord-Client hinzu.
- Transformationen: Wenn du den Namen \`MSDefault\` verwendest und zusätzlich Transformationen über Umgebungsvariablen konfigurierst, benenne ihn in \`MSEnv\` um.

[Vollständige Upstream-Versionshinweise](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.19.0)`,
    pl_PL: `Zaktualizowano Multi-Scrobbler do 0.19.2.

**Nowości**

- Transformator MusicBrainz jest teraz wbudowany i działa bez konfiguracji
- Nowe transformatory Rocksky, Spotify i Cover Art Archive
- Klient Rocksky zapisuje scrobble bezpośrednio w twoim PDS i obsługuje Now Playing
- Źródła Teal.fm i Rocksky nie wymagają już hasła aplikacji
- Klienci ListenBrainz i Koito mogą wysyłać oczyszczone informacje o urządzeniu
- MusicBrainz może wykluczać audiobooki i teledyski
- Mniejszy obraz Dockera

**Poprawki**

- Naprawiono wyścig przy uruchamianiu transformatorów oraz zbędne logi startowe

**Przed aktualizacją**

- Rocksky: uwierzytelnianie kluczem API zostało usunięte, a tokeny dostępu są przestarzałe. Przejdź na login i hasło aplikacji.
- Discord: automatyczna okładka z Cover Art Archive jest przestarzała. Zamiast tego dodaj transformację \`coverartarchive\` do klienta Discord.
- Transformacje: jeśli używasz nazwy \`MSDefault\` i konfigurujesz też transformacje zmiennymi środowiskowymi, zmień ją na \`MSEnv\`.

[Pełne informacje o wydaniu źródłowym](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.19.0)`,
    fr_FR: `Multi-Scrobbler mis à jour vers 0.19.2.

**Nouveautés**

- Le transformateur MusicBrainz est désormais intégré et fonctionne sans configuration
- Nouveaux transformateurs Rocksky, Spotify et Cover Art Archive
- Le client Rocksky écrit les scrobbles directement dans votre PDS et prend en charge Now Playing
- Les sources Teal.fm et Rocksky n’ont plus besoin de mot de passe d’application
- Les clients ListenBrainz et Koito peuvent envoyer des informations d’appareil épurées
- MusicBrainz peut exclure les livres audio et les clips vidéo
- Image Docker plus légère

**Corrections**

- Correction d’une condition de concurrence au démarrage des transformateurs et des journaux de démarrage bruyants

**Avant de mettre à jour**

- Rocksky : l’authentification par clé d’API est supprimée et les jetons d’accès sont obsolètes. Passez à l’identifiant et au mot de passe d’application.
- Discord : la pochette automatique de Cover Art Archive est obsolète. Ajoutez plutôt la transformation \`coverartarchive\` à votre client Discord.
- Transformations : si vous utilisez le nom \`MSDefault\` et configurez aussi des transformations par variables d’environnement, renommez-le en \`MSEnv\`.

[Notes de version amont complètes](https://github.com/FoxxMD/multi-scrobbler/releases/tag/0.19.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
