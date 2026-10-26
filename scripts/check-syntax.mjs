import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.next'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else if (/\.(?:mjs|js|ts)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) process.exit(result.status ?? 1);
    }
  }
}

await check(fileURLToPath(new URL('..', import.meta.url)));
