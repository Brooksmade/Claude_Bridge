import { build } from 'esbuild';
import { builtinModules } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Node built-in modules to mark as external (everything else gets bundled)
const nodeBuiltins = builtinModules.flatMap((mod) => [mod, `node:${mod}`]);

// Plugin to resolve @bridge-to-fig/shared to its TypeScript source
const resolveWorkspacePlugin = {
  name: 'resolve-workspace',
  setup(build) {
    build.onResolve({ filter: /^@bridge-to-fig\/shared$/ }, () => ({
      path: path.resolve(__dirname, '..', 'shared', 'types', 'index.ts'),
    }));
  },
};

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/bundle.cjs',
  external: nodeBuiltins,
  plugins: [resolveWorkspacePlugin],
  sourcemap: false,
  minify: false,
  target: 'node18',
  logLevel: 'info',
});

console.log('Bundle created: dist/bundle.cjs');
