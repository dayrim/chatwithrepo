import esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc'
import { dtsPlugin } from 'esbuild-plugin-d.ts'
import copy from 'esbuild-plugin-copy'

esbuild
  .build({
    entryPoints: ['src/index.ts', 'src/client.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outdir: 'build',
    plugins: [
      esbuildPluginTsc({
        force: true
      }),
      dtsPlugin({}),
      copy({
        // Specify assets to be copied
        assets: {
          from: ['config/*'], // Matches all files in the 'config' directory
          to: ['config'] // Copies them to 'build/config'
        }
      }),
      copy({
        assets: {
          from: ['migrations/*'],
          to: ['migrations']
        }
      })
    ]
  })
  .catch(() => process.exit(1))
