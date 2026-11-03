import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARCHETYPES } from '../src/archetypes.js';
import { build } from '../scripts/build.js';
import { serve } from '../scripts/preview.js';

// Serves the real build over HTTP with Cloudflare Pages routing, so the deployed site's
// routing and asset loading are checked offline before anything is pushed.
const site = (async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'court-type-preview-'));
  await build({ siteUrl: 'https://court.example', outDir });
  const server = serve(outDir);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
})();

test.after(async () => (await site).server.close());

const get = async (path) => fetch(new URL(path, (await site).base), { redirect: 'manual' });

// Local URLs a page will request: its href/src attributes, then the module graph from app.js,
// plus the images app.js resolves at runtime through asset().
async function localRefs(pageUrl, html) {
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(([, ref]) => new URL(ref, pageUrl))
    .filter((url) => url.origin === pageUrl.origin);
  const queue = refs.filter((url) => url.pathname.endsWith('.js'));
  for (const script of queue) {
    const source = await (await fetch(script)).text();
    for (const [, spec] of source.matchAll(/from '(\.[^']+)'/g)) {
      const url = new URL(spec, script);
      if (!refs.some((seen) => seen.href === url.href)) { refs.push(url); queue.push(url); }
    }
    for (const [, name] of source.matchAll(/asset\('([^']+)'\)/g)) refs.push(new URL(`../public/images/${name}`, script));
  }
  return refs;
}

for (const path of ['/', ...Object.keys(ARCHETYPES).map((slug) => `/t/${slug}/`)]) {
  test(`${path} serves and every asset it loads resolves`, async () => {
    const res = await get(path);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    const refs = await localRefs(new URL(res.url), await res.text());
    assert.ok(refs.length > 5, 'expected the page to reference its stylesheet, scripts and images');
    for (const url of refs) assert.equal((await fetch(url)).status, 200, `${url.pathname} from ${path}`);
  });
}

test('an archetype page without a trailing slash redirects to the canonical URL', async () => {
  const [slug] = Object.keys(ARCHETYPES);
  const res = await get(`/t/${slug}`);
  assert.equal(res.status, 308);
  assert.equal(res.headers.get('location'), `/t/${slug}/`);
});

test('a retired slug gets the 404 page, which sends visitors home', async () => {
  const res = await get('/t/not-a-court-type/');
  assert.equal(res.status, 404);
  assert.match(await res.text(), /http-equiv="refresh" content="0; url=https:\/\/court\.example\/"/);
});

test('paths outside the build are not served', async () => {
  const res = await get('/..%2Fpackage.json');
  assert.equal(res.status, 404);
  assert.doesNotMatch(await res.text(), /"name": "court-type"/);
});

test('the module scripts are served as JavaScript', async () => {
  const res = await get('/src/app.js');
  assert.match(res.headers.get('content-type'), /javascript/);
  assert.equal(await res.text(), await readFile(new URL('../src/app.js', import.meta.url), 'utf8'));
});
