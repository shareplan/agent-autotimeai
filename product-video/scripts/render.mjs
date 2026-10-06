import { execFileSync } from 'node:child_process'
import { stat } from 'node:fs/promises'
import path from 'node:path'

import { browserExecutable } from './env.mjs'

const project = path.resolve(process.argv[2] || 'project')
const cli = path.join(project, 'node_modules/.bin/remotion')
const browser = browserExecutable ? [`--browser-executable=${browserExecutable}`] : []
const listed = execFileSync(cli, ['compositions', 'src/index.ts', '-q', ...browser], {
  cwd: project, timeout: 120_000, encoding: 'utf8',
})
const noise = new Set(['Bundling', 'Bundled', 'Cached', 'Rendering'])
const ids = listed.split('\n').map(line => line.trim()).filter(line => /^[A-Za-z0-9-]+$/.test(line) && !noise.has(line))
const composition = ids.includes('ProductVideo') ? 'ProductVideo' : ids[0]
if (!composition) throw new Error('No Remotion composition registered')
execFileSync(cli, ['render', 'src/index.ts', composition, 'out/video.mp4', ...browser], {
  cwd: project, timeout: 300_000, stdio: 'inherit',
})
if (!(await stat(path.join(project, 'out/video.mp4'))).size) throw new Error('Render produced no video')
