// multi-scrobbler's web port is whatever we pass as PORT; it is not fixed by the image.
export const uiPort = 9078

// Exported so dependent packages can resolve our bridge address without hardcoding it.
// Keep this module free of value imports: navidrome-startos imports from it, and anything
// reachable from here lands in that package's bundle.
export const uiHostId = 'ui'

// multi-scrobbler's default admin username (ADMIN_SETUP_USER is left unset). The dashboard can
// rename the account; Set Admin Password only ever sets the password.
export const adminUsername = 'admin'

// The uid:gid the distroless image runs as (its USER); the chown oneshot hands /config to it.
export const appUid = 65532
