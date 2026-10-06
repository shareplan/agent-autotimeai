import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { expect, it } from 'vitest'

import { pack, restore, safeEntry } from './archive.mjs'

it('rejects traversal and excludes runtime credentials', () => {
  for (const entry of ['../secret', '/etc/passwd', 'C:\\secret', 'src/../../secret']) expect(() => safeEntry(entry)).toThrow()
  for (const entry of ['.env', 'sub/.env.local', '.git/config', '.claude/settings.json', 'identity.json']) expect(safeEntry(entry)).toBe(false)
})

it('round trips code and excludes dependencies, videos, and secrets', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'video-archive-'))
  try {
    const project = path.join(root, 'project')
    await mkdir(path.join(project, 'src'), { recursive: true })
    await mkdir(path.join(project, 'out'))
    await writeFile(path.join(project, 'src/Composition.tsx'), 'export const Video = () => null')
    await writeFile(path.join(project, '.env'), 'PRIVATE=secret')
    await writeFile(path.join(project, 'out/video.mp4'), 'video')
    const archive = path.join(root, 'code.zip')
    await pack(project, archive)
    const restored = path.join(root, 'restored')
    await restore(archive, restored)
    expect(await readFile(path.join(restored, 'src/Composition.tsx'), 'utf8')).toContain('Video')
    await expect(readFile(path.join(restored, '.env'))).rejects.toThrow()
    await expect(readFile(path.join(restored, 'out/video.mp4'))).rejects.toThrow()
  } finally { await rm(root, { recursive: true, force: true }) }
})
