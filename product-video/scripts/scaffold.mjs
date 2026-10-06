import fs from 'node:fs'
import path from 'node:path'

export function scaffoldRemotionWorkspace(workDir) {
  const srcDir = path.join(workDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  fs.writeFileSync(
    path.join(workDir, 'package.json'),
    JSON.stringify({
      name: 'product-video-workspace',
      version: '1.0.0',
      private: true,
      dependencies: {
        '@remotion/cli': '4.0.433',
        '@remotion/player': '4.0.433',
        '@remotion/animated-emoji': '4.0.433',
        'remotion': '4.0.433',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        'typescript': '^5.0.0',
      },
    }, null, 2),
  )

  fs.writeFileSync(
    path.join(workDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020', 'DOM'],
        jsx: 'react-jsx',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
    }, null, 2),
  )

  fs.writeFileSync(
    path.join(workDir, 'remotion.config.ts'),
    `import { Config } from '@remotion/cli/config'\n\nConfig.setVideoImageFormat('jpeg')\nConfig.setOverwriteOutput(true)\n`,
  )

  fs.writeFileSync(
    path.join(srcDir, 'index.ts'),
    `import { registerRoot } from 'remotion'\nimport { RemotionRoot } from './Root'\n\nregisterRoot(RemotionRoot)\n`,
  )

  fs.writeFileSync(
    path.join(srcDir, 'Root.tsx'),
    `import React from 'react'\nimport { Composition } from 'remotion'\nimport { ProductVideo } from './Composition'\n\nexport const RemotionRoot: React.FC = () => {\n  return (\n    <Composition\n      id="ProductVideo"\n      component={ProductVideo}\n      durationInFrames={300}\n      fps={30}\n      width={1920}\n      height={1080}\n    />\n  )\n}\n`,
  )

  fs.writeFileSync(
    path.join(srcDir, 'Composition.tsx'),
    `import React from 'react'\nimport { AbsoluteFill } from 'remotion'\n\nexport const ProductVideo: React.FC = () => {\n  return (\n    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>\n      <h1 style={{ color: '#fff', fontSize: 60 }}>Product Video</h1>\n    </AbsoluteFill>\n  )\n}\n`,
  )

  fs.mkdirSync(path.join(workDir, 'out'), { recursive: true })
}


if (process.argv[1] === new URL(import.meta.url).pathname) scaffoldRemotionWorkspace(path.resolve(process.argv[2] || 'project'))
