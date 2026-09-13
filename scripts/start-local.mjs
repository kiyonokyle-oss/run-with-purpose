import { spawn } from 'node:child_process';
import { mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const root = fileURLToPath(new URL('..', import.meta.url));
const url = 'http://127.0.0.1:5173';
async function isReady() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok && (await response.text()).includes('<title>The Narrow Path');
  } catch { return false; }
}

if (await isReady()) {
  console.log('The Narrow Path is already running at http://localhost:5173');
} else {
  mkdirSync(resolve(root, '.local'), { recursive: true });
  const log = openSync(resolve(root, '.local/server.log'), 'a');
  const child = spawn(process.execPath, [resolve(root, 'server.mjs')], {
    cwd: root,
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...process.env, PORT: '5173' },
  });
  child.on('error', error => { console.error('Could not start the game:', error.message); process.exitCode = 1; });
  child.unref();
  closeSync(log);
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await isReady()) { ready = true; break; }
    await setTimeout(100);
  }
  if (!ready) {
    console.error('The game did not start. See .local/server.log in the game folder.');
    process.exitCode = 1;
  } else console.log('The Narrow Path is running at http://localhost:5173 (server PID ' + child.pid + ')');
}
