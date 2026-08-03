/*
 * 把 app/ 的樣板組成 dist/，給 wrangler 的 assets binding 用。
 *
 * 每個語言各產生一份完整的靜態 HTML（title / description / canonical / hreflang 都填好，
 * 首頁文案直接寫進 HTML）。沒有這道 build 的話，所有語言會共用同一份中文 title、
 * 而且爬蟲看不到任何內容——首頁專案踩過同樣的坑，做法保持一致。
 *
 * 樣板裡對不到值的 {{token}} 會直接讓 build 失敗，不會靜靜產出半空的頁面。
 */

import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LANGS,
  DEFAULT_LANG,
  LOCALE_LABELS,
  STRINGS,
  ORIGIN,
  BASE_PATH,
  PROJECT_ID,
} from '../app/strings.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const outBase = join(dist, BASE_PATH.replace(/^\//, ''));

// 這兩個 token 是直接塞 HTML / JSON，不做跳脫；其餘一律當純文字處理
const RAW_TOKENS = new Set(['hreflang', 'stringsJson', 'langOptions']);

await main();

async function main() {
  checkStrings();

  await cleanDist();
  await mkdir(outBase, { recursive: true });

  const template = await readFile(join(root, 'app', 'template.html'), 'utf8');

  for (const lang of LANGS) {
    const html = render(template, tokensFor(lang));
    const dir = join(outBase, lang);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html, 'utf8');
    console.log(`  ${BASE_PATH}/${lang}/`);
  }

  await cp(join(root, 'app', 'app.js'), join(outBase, 'app.js'));
  await cp(join(root, 'app', 'app.css'), join(outBase, 'app.css'));

  // QR 產生器整包放進來，不走 CDN：多一個網路請求、多一個第三方故障點都不值得
  await mkdir(join(outBase, 'vendor'), { recursive: true });
  await cp(
    join(root, 'node_modules', 'qrcode-generator', 'qrcode.js'),
    join(outBase, 'vendor', 'qrcode.js'),
  );

  await cp(join(root, 'public'), outBase, { recursive: true });
  await writeFile(join(outBase, 'sitemap.xml'), sitemap(), 'utf8');

  console.log(`\nbuild ok → dist${BASE_PATH}/`);
}

// 先清掉舊的產出，免得刪掉語言或資源之後還留著孤兒檔案。
// npm run dev 會在 wrangler dev 還開著的時候重跑 build，這時 Windows 會鎖住 dist 而刪不掉——
// 那種情況下所有檔案本來就會被逐一覆寫，警告一聲繼續就好，不需要讓整個 build 失敗。
async function cleanDist() {
  try {
    await rm(dist, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
    console.warn('  (dist 正在被使用，改成直接覆寫，沒有清掉舊檔)');
  }
}

// 漏翻的 key 在執行期會變成空字串，很難發現，所以在這裡先擋下來
function checkStrings() {
  const reference = Object.keys(STRINGS[DEFAULT_LANG]).sort();

  for (const lang of LANGS) {
    if (!STRINGS[lang]) throw new Error(`strings.js 少了 ${lang} 這份文案`);

    const keys = Object.keys(STRINGS[lang]).sort();
    const missing = reference.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !reference.includes(key));

    if (missing.length) throw new Error(`${lang} 少了這些 key：${missing.join(', ')}`);
    if (extra.length) throw new Error(`${lang} 多了 ${DEFAULT_LANG} 沒有的 key：${extra.join(', ')}`);
  }
}

function tokensFor(lang) {
  const strings = STRINGS[lang];

  return {
    ...strings,
    lang,
    langOptions: langOptions(lang),
    base: BASE_PATH,
    projectId: PROJECT_ID,
    canonical: `${ORIGIN}${BASE_PATH}/${lang}/`,
    hreflang: hreflangTags(),
    stringsJson: toScriptJson(strings),
  };
}

// selected 直接寫進 HTML：JS 還沒跑的時候下拉就已經指著當前語言，不會先閃成第一個選項
function langOptions(current) {
  return LANGS.map(
    (lang) =>
      `<option value="${lang}"${lang === current ? ' selected' : ''}>${escapeHtml(LOCALE_LABELS[lang])}</option>`,
  ).join('\n            ');
}

function hreflangTags() {
  const tags = LANGS.map(
    (lang) =>
      `<link rel="alternate" hreflang="${lang}" href="${ORIGIN}${BASE_PATH}/${lang}/" />`,
  );
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${BASE_PATH}/${DEFAULT_LANG}/" />`,
  );
  return tags.join('\n    ');
}

function sitemap() {
  const urls = LANGS.map((lang) => {
    const alternates = LANGS.map(
      (other) =>
        `    <xhtml:link rel="alternate" hreflang="${other}" href="${ORIGIN}${BASE_PATH}/${other}/" />`,
    ).join('\n');
    return [
      '  <url>',
      `    <loc>${ORIGIN}${BASE_PATH}/${lang}/</loc>`,
      alternates,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

function render(template, tokens) {
  const html = template.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in tokens)) throw new Error(`樣板用了 {{${name}}}，但 strings.js 沒有這個 key`);
    return RAW_TOKENS.has(name) ? tokens[name] : escapeHtml(tokens[name]);
  });

  const leftover = html.match(/\{\{\w+\}\}/g);
  if (leftover) throw new Error(`還有沒替換掉的 token：${[...new Set(leftover)].join(', ')}`);

  return html;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 內嵌進 <script> 的 JSON，把 < 跳掉才不會被文案裡的 </script> 提早關掉標籤
function toScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
