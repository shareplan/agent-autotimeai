import { createWriteStream } from 'node:fs'
import { mkdir, lstat, readdir } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

import archiver from 'archiver'
import unzipper from 'unzipper'

const excluded = new Set(['node_modules', 'out', '.git', '.claude', '.npm', '.aws', '.ssh', '.config', '.cache', '.npmrc', '.netrc', '.yarnrc', '.yarnrc.yml', '.gitconfig', '.onecli', 'identity.json', 'task.json', 'result.json'])
export function safeEntry(name) {
  const normalized = name.replaceAll('\\', '/')
  const parts = normalized.split('/')
  if (normalized.startsWith('/') || /^[a-z]:/i.test(name) || parts.includes('..') || parts.some(part => part.includes('\0'))) throw new Error('Unsafe archive entry')
  return parts.filter(Boolean).length > 0 && !parts.some(part => excluded.has(part) || part.startsWith('.env'))
}

export async function pack(project, destination) {
  const archive = archiver('zip', { zlib: { level: 6 } })
  const output = createWriteStream(destination)
  const done = pipeline(archive, output)
  async function add(dir, prefix = '') {
    for (const name of await readdir(dir)) {
      const relative = prefix ? `${prefix}/${name}` : name
      if (!safeEntry(relative)) continue
      const file = path.join(dir, name)
      const info = await lstat(file)
      if (info.isSymbolicLink()) throw new Error('Source archive cannot contain symbolic links')
      if (info.isDirectory()) await add(file, relative)
      else if (info.isFile()) archive.file(file, { name: relative })
    }
  }
  try { await add(project); await archive.finalize(); await done }
  catch (error) { archive.abort(); output.destroy(); await done.catch(() => {}); throw error }
}

export async function restore(source, destination) {
  const zip = await unzipper.Open.file(source)
  // Validate the whole archive before creating any files.
  for (const entry of zip.files) {
    safeEntry(entry.path)
    const mode = (entry.externalFileAttributes >>> 16) & 0o170000
    if (mode && mode !== 0o100000 && mode !== 0o040000) throw new Error('Unsupported archive entry type')
  }
  await mkdir(destination, { recursive: true })
  if ((await lstat(destination)).isSymbolicLink() || (await readdir(destination)).length) throw new Error('Restore requires an empty directory without symbolic links')
  for (const entry of zip.files) {
    if (!safeEntry(entry.path)) continue
    const target = path.resolve(destination, entry.path.replaceAll('\\', '/'))
    if (!target.startsWith(`${path.resolve(destination)}/`)) throw new Error('Archive escapes project')
    if (entry.type === 'Directory') { await mkdir(target, { recursive: true }); continue }
    await mkdir(path.dirname(target), { recursive: true })
    await pipeline(entry.stream(), createWriteStream(target, { flags: 'wx' }))
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [command, source, destination] = process.argv.slice(2)
  if (!source || !destination) throw new Error('Usage: archive.mjs pack|restore <source> <destination>')
  if (command === 'pack') await pack(source, destination)
  else if (command === 'restore') await restore(source, destination)
  else throw new Error('Unknown archive command')
}
