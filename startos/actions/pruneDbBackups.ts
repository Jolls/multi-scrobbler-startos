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
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const dir = sdk.volumes.config.path
    const backups = (await readdir(dir))
      .map((name) => ({ name, match: backupName.exec(name) }))
      .filter((b) => b.match)
      .map((b) => ({ name: b.name, time: Number(b.match![1]) }))
      .sort((a, b) => b.time - a.time)

    const [newest, ...old] = backups
    if (!old.length) {
      return {
        version: '1',
        title: i18n('Database Backups'),
        message: i18n(
          'Nothing to delete: there is no more than one database backup.',
        ),
        result: null,
      }
    }

    // Never delete older copies without a verified, quiescent retained backup.
    try {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'multi-scrobbler' },
        sdk.Mounts.of().mountVolume({
          volumeId: 'config',
          subpath: null,
          mountpoint: '/config',
          readonly: true,
        }),
        'verify-db-backup',
        async (sub) => {
          await sub.execFail(
            [
              '/nodejs/bin/node',
              '-e',
              `const { DatabaseSync } = require('node:sqlite')
const db = new DatabaseSync(process.argv[1], { readOnly: true })
try {
  const table = db.prepare("SELECT 1 FROM sqlite_schema WHERE type = 'table' LIMIT 1").get()
  const check = db.prepare('PRAGMA quick_check(1)').get()
  if (!table || check.quick_check !== 'ok') throw new Error('Backup is empty or corrupt')
} finally {
  db.close()
}`,
              join('/config', newest.name),
            ],
            { user: 'root', timeout: null },
          )
        },
      )
    } catch (cause) {
      throw new Error(
        i18n(
          'The newest database backup could not be verified. No backups were deleted.',
        ),
        { cause },
      )
    }

    let bytes = 0
    for (const { name } of old) {
      const path = join(dir, name)
      bytes += (await stat(path)).size
      await rm(path)
    }

    return {
      version: '1',
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
