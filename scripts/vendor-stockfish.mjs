import { mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('node_modules/stockfish');
const out = resolve('engine');
const wanted = new Map([
  ['stockfish-19-lite-single.js', 'stockfish.js'],
  ['stockfish-19-lite-single.wasm', 'stockfish.wasm']
]);

async function find(dir, found = new Map()) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await find(path, found);
    else if (wanted.has(entry.name)) found.set(entry.name, path);
  }
  return found;
}

const found = await find(root);
for (const name of wanted.keys()) {
  if (!found.has(name)) throw new Error(`Missing Stockfish build asset: ${name}`);
}

await mkdir(out, { recursive: true });
for (const [sourceName, targetName] of wanted) {
  const source = found.get(sourceName);
  const target = join(out, targetName);
  await copyFile(source, target);
  const info = await stat(target);
  if (!info.size) throw new Error(`Vendored Stockfish asset is empty: ${targetName}`);
  console.log(`Vendored ${sourceName} -> engine/${targetName} (${info.size} bytes)`);
}
