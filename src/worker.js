/*
 * Worker 進入點。這個 Worker 只負責 /buzzer/*：
 * 正式網域上 /buzzer/* 以外的請求根本不會進來（由首頁的 rewrite / 之後的 Worker 路由總機決定），
 * 所以所有 API 路徑、靜態資源都要待在 /buzzer/ 底下。
 *
 * 靜態頁由 assets binding 處理（wrangler.jsonc），找不到才落到這裡：
 *   /buzzer/api/rooms          POST  建立房間
 *   /buzzer/api/rooms/:code    GET   查房間是否存在（加入頁先擋掉打錯的代碼）
 *   /buzzer/api/rooms/:code/ws GET   升級成 WebSocket，轉給對應的 Durable Object
 *   /buzzer/ 或 /buzzer        依語言轉址到 /buzzer/{lang}/
 */

import { BuzzerRoom } from './room.js';

export { BuzzerRoom };

const BASE = '/buzzer';
const LANGS = ['zh-TW', 'en'];
const DEFAULT_LANG = 'zh-TW';

// 去掉 0/O/1/I/L：房間代碼會被唸出來、也會被手動輸入，形近字一定會有人打錯
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;
const MAX_CREATE_ATTEMPTS = 5;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30;

const ROOM_PATH = new RegExp(`^${BASE}/api/rooms/([A-Z0-9]{${CODE_LENGTH}})(/ws)?$`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === `${BASE}/api/rooms`) {
      if (request.method !== 'POST') return methodNotAllowed('POST');
      return createRoom(request, env);
    }

    const room = url.pathname.match(ROOM_PATH);
    if (room) {
      const [, code, isWs] = room;
      if (request.method !== 'GET') return methodNotAllowed('GET');
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      // 用原本的 request 當 init，Upgrade 之類的標頭才會一起帶進 Durable Object
      return stub.fetch(new Request(isWs ? 'https://room/ws' : 'https://room/info', request));
    }

    if (url.pathname === BASE || url.pathname === `${BASE}/`) {
      return Response.redirect(new URL(`${BASE}/${pickLang(request)}/`, url).toString(), 302);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function createRoom(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const hostId = typeof body.hostId === 'string' ? body.hostId.slice(0, 64) : '';
  if (!hostId) return json({ error: 'bad_request' }, 400);

  const maxPlayers = Number(body.maxPlayers);
  if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
    return json({ error: 'bad_max_players' }, 400);
  }

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    const stub = env.ROOM.get(env.ROOM.idFromName(code));
    const created = await stub.fetch('https://room/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, maxPlayers, hostId }),
    });

    if (created.ok) return json({ code, maxPlayers });
    // 409 = 抽到的代碼已經有房間在用，換一個再試；其他錯誤沒有重試的意義
    if (created.status !== 409) return json({ error: 'create_failed' }, 500);
  }

  return json({ error: 'code_exhausted' }, 503);
}

function randomCode() {
  const out = [];
  const buf = new Uint8Array(CODE_LENGTH * 2);
  // 248 = 31 × 8：砍掉尾巴那幾個值，取餘數才不會偏向字母表前面幾個字
  const limit = Math.floor(256 / CODE_ALPHABET.length) * CODE_ALPHABET.length;

  while (out.length < CODE_LENGTH) {
    crypto.getRandomValues(buf);
    for (const byte of buf) {
      if (out.length === CODE_LENGTH) break;
      if (byte < limit) out.push(CODE_ALPHABET[byte % CODE_ALPHABET.length]);
    }
  }
  return out.join('');
}

// 跟系列其他專案一致：cookie 優先於瀏覽器語言（使用者手動選過的不該被覆蓋）
function pickLang(request) {
  const cookie = request.headers.get('Cookie') || '';
  const saved = cookie.match(/(?:^|;\s*)web100_lang=([^;]+)/);
  if (saved && LANGS.includes(decodeURIComponent(saved[1]))) return decodeURIComponent(saved[1]);

  const header = request.headers.get('Accept-Language') || '';
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase();
    if (!tag) continue;
    const match = LANGS.find((lang) => lang.toLowerCase() === tag);
    if (match) return match;
    // zh-HK / zh-MO 這類繁體變體歸到 zh-TW，其餘 zh-* 不猜，交給下面的預設值
    if (tag === 'zh-hk' || tag === 'zh-mo' || tag === 'zh') return 'zh-TW';
    if (tag.startsWith('en-')) return 'en';
  }
  return DEFAULT_LANG;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function methodNotAllowed(allow) {
  return new Response('Method not allowed', { status: 405, headers: { Allow: allow } });
}
