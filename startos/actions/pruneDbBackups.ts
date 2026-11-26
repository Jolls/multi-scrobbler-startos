import { readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Upstream copies ms.db to ms.db.<unix-seconds>.bak before each migrating
// upgrade and never reads or removes the copies. The digits are required:
// an unsuffixed ms.db.bak is upstream's manual-restore file, never touched.
const backupName = /^ms\.db\.(\d+)\.bak$/

export const pruneDbBackups = sdk.Action.withoutInput(
  'prune-db-backups',

  async () => ({
    name: i18n('Delete Old Database Backups'),
    description: i18n(
      'Delete all but the newest of the database copies Multi-Scrobbler saves before each upgrade. These copies are also included in every StartOS backup, so they add to its size.',
    ),
    warning: i18n(
      'Deleted copies can only be recovered from a StartOS backup taken before you run this.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async () => {
    const dir = sdk.volumes.config.path
    const backups = (await readdir(dir))
      .map((name) => ({ name, match: backupName.exec(name) }))
      .filter((b) => b.match)
      .map((b) => ({ name: b.name, time: Number(b.match![1]) }))
      .sort((a, b) => b.time - a.time)

    // A backup is written in place during startup migrations, so a newest
    // file touched in the last few minutes may still be partial: keep the
    // one before it too.
    const [newest, ...rest] = backups
    const newestBusy =
      newest &&
      Date.now() - (await stat(join(dir, newest.name))).mtimeMs < 10 * 60e3
    const old = newestBusy ? rest.slice(1) : rest
    if (!old.length) {
      return {
        version: '1' as const,
        title: i18n('Database Backups'),
        message: i18n(
          'Nothing to delete: there is no more than one database backup.',
        ),
        result: null,
      }
    }

    let bytes = 0
    for (const { name } of old) {
      const path = join(dir, name)
      bytes += (await stat(path)).size
      await rm(path)
    }

    return {
      version: '1' as const,
      title: i18n('Database Backups'),
      message: i18n(
        'Deleted ${count} older database backups and freed ${size} MB. The newest, from ${date}, was kept.',
        {
          count: old.length,
          size: Math.round(bytes / 1e5) / 10,
          date: new Date(newest.time * 1000),
        },
      ),
      result: null,
    }
  },
)
