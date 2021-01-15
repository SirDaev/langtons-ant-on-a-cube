
require('esbuild').build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'build/script.js',
}).catch(() => process.exit(1));