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

test('image provenance notes stay in the repo, not on the site', async () => {
  const outDir = await built;
  const images = await readdir(join(outDir, 'public', 'images'));
  assert.ok(images.includes('hero-basketball.jpg'));
  assert.deepEqual(images.filter((name) => name.endsWith('.prompt.txt')), []);
});

test('each archetype page carries its own share metadata', async () => {
  const outDir = await built;
  for (const [slug, { name }] of Object.entries(ARCHETYPES)) {
    const html = await readFile(join(outDir, 't', slug, 'index.html'), 'utf8');
    assert.ok(meta(html, 'og:title').includes(name), `${slug} og:title should name ${name}`);
    assert.equal(meta(html, 'og:url'), `${siteUrl}/t/${slug}/`);
    assert.ok(html.includes(`<title>${name} — Court Type</title>`), `${slug} <title> should name ${name}`);
  }
  const root = await readFile(join(outDir, 'index.html'), 'utf8');
  assert.equal(meta(root, 'og:url'), `${siteUrl}/`);
});

test('every page shares the landscape card image, with its size and the site name', async () => {
  const outDir = await built;
  const pages = ['index.html', ...Object.keys(ARCHETYPES).map((slug) => join('t', slug, 'index.html'))];
  for (const page of pages) {
    const html = await readFile(join(outDir, page), 'utf8');
    assert.equal(meta(html, 'og:image'), `${siteUrl}/public/images/og-card.jpg`, page);
    assert.equal(meta(html, 'og:image:width'), '1024', page);
    assert.equal(meta(html, 'og:image:height'), '536', page);
    assert.equal(meta(html, 'og:site_name'), 'Court Type', page);
  }
  assert.ok((await readdir(join(outDir, 'public', 'images'))).includes('og-card.jpg'));
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

test('the GoatCounter script is added to every page only when a site code is given', async () => {
  const pages = (dir) => [join(dir, 'index.html'), ...Object.keys(ARCHETYPES).map((slug) => join(dir, 't', slug, 'index.html'))];
  for (const file of pages(await built)) assert.ok(!(await readFile(file, 'utf8')).includes('goatcounter'), `${file} has analytics without a code`);

  const outDir = await mkdtemp(join(tmpdir(), 'court-type-build-'));
  await build({ siteUrl, outDir, goatcounter: 'court-type' });
  const tag = '<script data-goatcounter="https://court-type.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>';
  for (const file of pages(outDir)) assert.ok((await readFile(file, 'utf8')).includes(tag), `${file} is missing the GoatCounter script`);

  const badDir = await mkdtemp(join(tmpdir(), 'court-type-build-'));
  await assert.rejects(build({ siteUrl, outDir: badDir, goatcounter: 'x" onload="alert(1)' }), /GOATCOUNTER/);
});
