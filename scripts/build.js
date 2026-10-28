import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARCHETYPES } from '../src/archetypes.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const META = /<!-- meta:start -->[\s\S]*?<!-- meta:end -->/;

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function metaBlock({ title, description, url, image }) {
  const [t, d] = [escape(title), escape(description)];
  return `<!-- meta:start -->
    <meta name="description" content="${d}" />
    <title>${t}</title>
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escape(url)}" />
    <meta property="og:image" content="${escape(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <!-- meta:end -->`;
}

export async function build({ siteUrl, outDir, rootDir = repoRoot }) {
  const html = await readFile(join(rootDir, 'index.html'), 'utf8');
  if (!META.test(html)) throw new Error('index.html is missing the <!-- meta:start --> … <!-- meta:end --> markers');

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const dir of ['src', 'public']) await cp(join(rootDir, dir), join(outDir, dir), { recursive: true });

  await writeFile(join(outDir, 'index.html'), html.replaceAll('%SITE_URL%', siteUrl));

  const image = `${siteUrl}/public/images/hero-basketball.jpg`;
  const nested = html.replaceAll('href="./', 'href="../../').replaceAll('src="./', 'src="../../');
  for (const [slug, { name, role, tagline }] of Object.entries(ARCHETYPES)) {
    const page = nested.replace(META, () => metaBlock({
      title: `${name} — Court Type`,
      description: `${role}. ${tagline}.`,
      url: `${siteUrl}/t/${slug}/`,
      image,
    }));
    await mkdir(join(outDir, 't', slug), { recursive: true });
    await writeFile(join(outDir, 't', slug, 'index.html'), page);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteUrl = process.env.SITE_URL?.replace(/\/+$/, '');
  if (!siteUrl) {
    console.error('SITE_URL is required, e.g. SITE_URL=https://example.com npm run build');
    process.exit(1);
  }
  await build({ siteUrl, outDir: join(repoRoot, 'dist') });
  console.log(`Built ${Object.keys(ARCHETYPES).length} archetype pages into dist/ for ${siteUrl}`);
}
