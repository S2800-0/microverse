import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const path = pathname === '/' ? '/examples/motion/index.html' : pathname;
  // Optional existing local QA sprite. Never copied into the repo or uploaded.
  if (path === '/test-fixture.png' && ['GET','HEAD'].includes(req.method) && process.env.MICROVERSE_TEST_SPRITE) {
    try {
      const data = await readFile(resolve(root, process.env.MICROVERSE_TEST_SPRITE));
      res.writeHead(200, {'Content-Type':'image/png','Cache-Control':'no-store'});
      res.end(req.method==='HEAD'?undefined:data);
    } catch { res.writeHead(404);res.end('Local test fixture unavailable'); }
    return;
  }
  if (!['GET','HEAD'].includes(req.method) || !/^\/(?:examples\/motion|src\/motion)\/[a-z-]+\.(?:html|js)$/.test(path)) {
    res.writeHead(404);res.end('Not found');return;
  }
  try {
    const data = await readFile(resolve(root, `.${path}`));
    res.writeHead(200, {'Content-Type':extname(path)==='.html'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:data);
  } catch { res.writeHead(404);res.end('Not found'); }
});
server.listen(Number(process.env.PORT ?? 8895), '127.0.0.1', () => console.log('Motion workbench: http://127.0.0.1:8895/'));
