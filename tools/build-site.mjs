import { build, transform } from 'esbuild';
import { cp, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRelative = 'tools/designer-source';
const source = path.join(root, sourceRelative);
const output = path.join(root, 'dist');
const designer = path.join(output, 'designer');

// Never clean a symlink/junction or a path outside this checkout.
try {
  const stat = await lstat(output);
  if (stat.isSymbolicLink() || await realpath(output) !== path.join(await realpath(root), 'dist')) {
    throw new Error('Refusing to clean dist outside this checkout.');
  }
  await rm(output, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await mkdir(designer, { recursive: true });

// Explicit public inputs: never publish the repository, tests, build reports,
// package metadata, author tools, source maps or original Designer modules.
async function copyPublic(relative) {
  await cp(path.join(root, relative), path.join(output, relative), {
    recursive: true,
    filter: async (file) => {
      if ((await lstat(file)).isSymbolicLink()) throw new Error(`Public symlink: ${file}`);
      return !file.endsWith('.map');
    },
  });
}
for (const name of ['assets', 'images', 'vi', 'playground', 'index.html', 'updateAvailable.json', '.nojekyll', 'LICENSE']) {
  await copyPublic(name);
}
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md') && !['README.md', 'CHANGELOG.md'].includes(entry.name)) {
    await copyPublic(entry.name);
  }
}
let hasSource = false;
try {
  hasSource = (await lstat(source)).isDirectory();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (process.argv.includes('--prebuilt') || !hasSource) {
  // Render receives only the checked-in protected artifact. Never require the
  // ignored, local-only author source to package a fresh checkout for hosting.
  const publicDesigner = path.join(root, 'designer');
  const html = await readFile(path.join(publicDesigner, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
  if (scripts.length !== 2 || scripts.some(name => !/^e-[A-Z0-9]+\.m?js$/.test(name))) {
    throw new Error('designer/ must contain a protected build. Build locally before committing.');
  }
  for (const script of scripts) await readFile(path.join(publicDesigner, script));
  for (const name of await readdir(publicDesigner)) {
    if (name === 'README.md') continue;
    if (!/^[ec]-[A-Z0-9]+\.m?js$/.test(name) && !/^[\w-]+\.css$/.test(name) && !['index.html', 'fonts', 'robot.png'].includes(name)) {
      throw new Error(`Unexpected Designer artifact: ${name}`);
    }
    await copyPublic('designer/' + name);
  }
  console.log('Packaged protected designer/ into dist/ without reading local author source.');
} else {
await cp(path.join(source, 'fonts'), path.join(designer, 'fonts'), { recursive: true });
await cp(path.join(source, 'robot.png'), path.join(designer, 'robot.png'));

const options = {
  absWorkingDir: root,
  bundle: true,
  minify: true,
  sourcemap: false,
  sourcesContent: false,
  legalComments: 'none',
  platform: 'browser',
  target: 'es2022',
  format: 'esm',
  outdir: designer,
  outExtension: { '.js': '.mjs' },
  entryNames: 'e-[hash]',
  chunkNames: 'c-[hash]',
  metafile: true,
  logLevel: 'warning',
};
// Keep chunks beside the entry: workspace font URLs use import.meta.url.
// Workers have their own bundle and module scope, preserving the PSD pool.
function entryFile(result, entry) {
  const file = Object.entries(result.metafile.outputs).find(([, data]) => data.entryPoint === entry)?.[0];
  if (!file) throw new Error(`Missing built entry: ${entry}`);
  return path.basename(file);
}
const worker = await build({ ...options, entryPoints: [sourceRelative + '/psd-worker.mjs'] });
const workerFile = entryFile(worker, sourceRelative + '/psd-worker.mjs');
const app = await build({
  ...options,
  entryPoints: [sourceRelative + '/app.mjs'],
  splitting: true,
  plugins: [{
    name: 'designer-worker-url',
    setup(builder) {
      builder.onLoad({ filter: /[\\/]ui-studio\.mjs$/ }, async ({ path: file }) => {
        const contents = await readFile(file, 'utf8');
        const references = contents.match(/(['"])\.\/psd-worker\.mjs\1/g);
        if (references?.length !== 2) throw new Error('PSD worker references changed; update the production build.');
        return {
          contents: contents.replace(/(['"])\.\/psd-worker\.mjs\1/g, JSON.stringify('./' + workerFile)),
          loader: 'js',
          resolveDir: path.dirname(file),
        };
      });
    },
  }],
});
const preferences = await build({
  ...options,
  entryPoints: [sourceRelative + '/preferences.js'],
  format: 'iife',
  outExtension: { '.js': '.js' },
});
// Keep CSS paths/order and runtime stylesheet loading unchanged.
for (const name of await readdir(source)) {
  if (!name.endsWith('.css')) continue;
  const result = await transform(await readFile(path.join(source, name), 'utf8'), {
    loader: 'css', minify: true, legalComments: 'none', sourcemap: false,
  });
  await writeFile(path.join(designer, name), result.code);
}
let html = await readFile(path.join(source, 'index.html'), 'utf8');
for (const [original, built] of [
  ['app.mjs', entryFile(app, sourceRelative + '/app.mjs')],
  ['preferences.js', entryFile(preferences, sourceRelative + '/preferences.js')],
]) {
  if (!html.includes(`src="${original}"`)) throw new Error(`Missing HTML entry: ${original}`);
  html = html.replace(`src="${original}"`, `src="${built}"`);
}
await writeFile(path.join(designer, 'index.html'), html);

// A fail-closed publication check. Metadata stays in memory, outside dist.
const builtFiles = new Set([
  ...Object.keys(worker.metafile.outputs),
  ...Object.keys(app.metafile.outputs),
  ...Object.keys(preferences.metafile.outputs),
].map(file => path.basename(file)));
for (const name of await readdir(designer)) {
  if (/\.(m?js|map)$/.test(name) && !builtFiles.has(name)) throw new Error(`Unexpected public code: ${name}`);
  if (builtFiles.has(name)) {
    const code = await readFile(path.join(designer, name), 'utf8');
    if (/\/\/[#@]\s*source(?:Mapping)?URL\s*=|\/\*[#@]\s*source(?:Mapping)?URL\s*=|\.\/psd-worker\.mjs/.test(code)) throw new Error(`Source reference leaked: ${name}`);
  }
}
const bytes = result => Object.values(result.metafile.outputs).reduce((sum, file) => sum + file.bytes, 0);
// Also apply the verified artifact to the checked-in /designer/ route. Never
// read source here: every subsequent rebuild starts from tools/designer-source.
const applied = path.join(root, 'designer');
async function rejectLinks(directory) {
  if ((await lstat(directory)).isSymbolicLink()) throw new Error(`Refusing to replace public symlink: ${directory}`);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Public symlink: ${entry.name}`);
    if (entry.isDirectory()) await rejectLinks(path.join(directory, entry.name));
  }
}
await rejectLinks(applied);
if (await realpath(applied) !== path.join(await realpath(root), 'designer')) throw new Error('Designer must stay inside this checkout.');
// Write assets before switching HTML, then remove obsolete module URLs.
for (const name of await readdir(designer)) {
  if (name !== 'index.html') await cp(path.join(designer, name), path.join(applied, name), { recursive: true });
}
await cp(path.join(designer, 'index.html'), path.join(applied, 'index.html'));
for (const name of await readdir(applied)) {
  if (/\.(m?js|map)$/.test(name) && !builtFiles.has(name)) await rm(path.join(applied, name));
}
console.log(`Production site: dist/ (Designer JS: ${Math.round((bytes(worker) + bytes(app) + bytes(preferences)) / 1024)} KiB).`);
console.log('Applied the same protected build to designer/. Edit tools/designer-source/ and rebuild.');
console.log('Deploy dist only. Original Designer modules and source maps are not published.');
}
