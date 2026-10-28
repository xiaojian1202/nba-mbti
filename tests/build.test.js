import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARCHETYPES } from '../src/archetypes.js';
import { build } from '../scripts/build.js';

const siteUrl = 'https://court.example';
const meta = (html, key) => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];

async function buildOnce() {
  const outDir = await mkdtemp(join(tmpdir(), 'court-type-build-'));
  await build({ siteUrl, outDir });
  return outDir;
}

const built = buildOnce();

test('the build emits one page per archetype', async () => {
  const outDir = await built;
  const pages = await readdir(join(outDir, 't'));
  assert.equal(pages.length, Object.keys(ARCHETYPES).length);
  for (const slug of Object.keys(ARCHETYPES)) assert.ok(pages.includes(slug), `missing page for ${slug}`);
});

test('each archetype page carries its own share metadata', async () => {
  const outDir = await built;
  for (const [slug, { name }] of Object.entries(ARCHETYPES)) {
    const html = await readFile(join(outDir, 't', slug, 'index.html'), 'utf8');
    assert.ok(meta(html, 'og:title').includes(name), `${slug} og:title should name ${name}`);
    assert.equal(meta(html, 'og:url'), `${siteUrl}/t/${slug}/`);
    assert.equal(meta(html, 'og:image'), `${siteUrl}/public/images/hero-basketball.jpg`);
    assert.ok(html.includes(`<title>${name} — Court Type</title>`), `${slug} <title> should name ${name}`);
  }
  const root = await readFile(join(outDir, 'index.html'), 'utf8');
  assert.equal(meta(root, 'og:url'), `${siteUrl}/`);
});

test('no site url placeholder survives the build', async () => {
  const outDir = await built;
  const files = [join(outDir, 'index.html')];
  for (const slug of Object.keys(ARCHETYPES)) files.push(join(outDir, 't', slug, 'index.html'));
  for (const file of files) assert.ok(!(await readFile(file, 'utf8')).includes('%SITE_URL%'), `${file} keeps %SITE_URL%`);
});

test('archetype pages load assets from the site root', async () => {
  const outDir = await built;
  const html = await readFile(join(outDir, 't', 'sniper', 'index.html'), 'utf8');
  assert.ok(html.includes('src="../../src/app.js"'));
  assert.ok(html.includes('href="../../src/styles.css"'));
  assert.ok(!/(?:href|src)="\.\//.test(html), 'no ./ references should remain on a nested page');
});

test('unknown paths get a 404 page that sends visitors to the landing page', async () => {
  const outDir = await built;
  const html = await readFile(join(outDir, '404.html'), 'utf8');
  assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${siteUrl}/" />`));
  assert.ok(html.includes(`<a href="${siteUrl}/">`));
});

test('a missing meta marker fails the build', async () => {
  const sourceDir = await mkdtemp(join(tmpdir(), 'court-type-src-'));
  for (const dir of ['src', 'public']) await cp(new URL(`../${dir}`, import.meta.url), join(sourceDir, dir), { recursive: true });
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  await writeFile(join(sourceDir, 'index.html'), html.replace('<!-- meta:end -->', ''));
  const outDir = await mkdtemp(join(tmpdir(), 'court-type-build-'));
  await assert.rejects(build({ siteUrl, outDir, rootDir: sourceDir }), /meta/);
});
