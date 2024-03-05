import esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc'
import { dtsPlugin } from 'esbuild-plugin-d.ts'

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
      dtsPlugin({})
    ]
  })
  .catch(() => process.exit(1))
