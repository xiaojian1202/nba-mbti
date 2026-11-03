import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = (path) => stat(path).then((s) => s.isFile(), () => false);

// Serves a built site the way Cloudflare Pages does: files as-is, directories via index.html
// (redirecting to the trailing-slash URL), and anything else as 404.html with status 404.
export function serve(dir) {
  const root = resolve(dir);
  return createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const path = resolve(join(root, decodeURIComponent(pathname)));
    const send = async (status, file) => {
      res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await readFile(file));
    };

    if (path === root || path.startsWith(root + sep)) {
      if (await isFile(path)) return send(200, path);
      if (await isFile(join(path, 'index.html'))) {
        if (pathname.endsWith('/')) return send(200, join(path, 'index.html'));
        res.writeHead(308, { Location: `${pathname}/` });
        return res.end();
      }
    }
    return send(404, join(root, '404.html'));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = 4173;
  const siteUrl = `http://localhost:${port}`;
  const outDir = fileURLToPath(new URL('../dist', import.meta.url));
  await build({ siteUrl, outDir });
  serve(outDir).listen(port, '127.0.0.1', () => console.log(`Previewing the production build at ${siteUrl}/`));
}
