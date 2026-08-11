/*
 * 搶答遊戲的客戶端。純瀏覽器 script，沒有 bundler：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.BUZZER 帶進來。
 *
 * 四個畫面（首頁 / 填暱稱 / 主持人 / 玩家）都在同一份 HTML 裡，靠 showView() 切換，
 * 房間代碼放在查詢字串 ?room=XXXX——QR code 掃進來就是這個網址。
 *
 * 「我是主持人還是玩家」不由前端決定：連上 WebSocket 送 hello 之後，
 * 由 Durable Object 比對 clientId 跟房間的 hostId 回答。主持人重整頁面也是走同一條路，
 * clientId 存在 localStorage，所以重整後還是主持人。
 */
(function () {
  'use strict';

  var T = window.T;
  var LANG = window.BUZZER.lang;
  var BASE = window.BUZZER.base;

  var CLIENT_KEY = 'web100-buzzer-client';
  var ROOM_KEY_PREFIX = 'web100-buzzer-room-';

  var CODE_RE = /^[A-Z0-9]{4}$/;
  var MIN_PLAYERS = 2;
  var MAX_PLAYERS = 30;
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 8000;

  var socket = null;
  var reconnectTimer = null;
  var reconnectDelay = RECONNECT_MIN_MS;
  var giveUp = false; // 致命錯誤（房間不存在、人數滿了）之後就不要再重連
  var roomCode = null;
  var me = null; // { id, role, nickname }
  var lastState = null;
  var pendingNickname = '';
  var questionSynced = false; // 主持人重整後只從伺服器補一次題目，之後以他正在打的內容為準
  var renderedQrUrl = null;
  var currentView = null;

  var el = {};

  init();

  function init() {
    cacheElements();
    // 深淺色與語言切換在 header.js（規則頁也要用），這裡只管遊戲本身
    bindHome();
    bindJoin();
    bindHost();
    bindPlay();
    bindExit();

    document.addEventListener('visibilitychange', function () {
      // 手機鎖屏或切到別的 App 時連線常被系統收掉，回來時馬上補連，不要等退避計時器
      if (!document.hidden && roomCode && !giveUp && !isOpen()) connect();
    });

    var code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    if (CODE_RE.test(code)) {
      enterRoom(code, false);
    } else {
      showView('home');
    }
  }

  function cacheElements() {
    [
      'view-home', 'view-join', 'view-host', 'view-play', 'view-error',
      'max-players', 'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'nickname', 'enter-room', 'nickname-error',
      'host-room-code', 'share-url', 'copy-link', 'qr-box',
      'player-count', 'player-list', 'player-empty',
      'question', 'show-question', 'start-buzz', 'reset-round',
      'host-rank-list', 'host-rank-empty',
      'play-title', 'play-desc', 'play-question', 'play-question-text',
      'buzz', 'buzz-label', 'play-rank-list', 'play-rank-empty',
      'error-title', 'error-desc', 'conn-banner',
      'close-room', 'leave-room',
      'confirm-dialog', 'confirm-title', 'confirm-desc', 'confirm-cancel', 'confirm-ok',
      'closed-dialog', 'closed-ok',
    ].forEach(function (id) {
      el[id] = document.getElementById(id);
    });
  }

  /* ---------- 共用小工具 ---------- */

  // 文案裡的 {name} 換成實際的值
  function t(key, vars) {
    var text = T[key] || '';
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole;
    });
  }

  function readStore(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null; // 無痕模式或封鎖 storage：功能照走，只是記不住
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* 記不住就算了 */
    }
  }

  function clientId() {
    var id = readStore(CLIENT_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2);
      writeStore(CLIENT_KEY, id);
    }
    return id;
  }

  function readRoomNickname(code) {
    return readStore(ROOM_KEY_PREFIX + code) || '';
  }

  function saveRoomNickname(code, nickname) {
    writeStore(ROOM_KEY_PREFIX + code, nickname);
  }

  function showView(name) {
    ['home', 'join', 'host', 'play', 'error'].forEach(function (view) {
      el['view-' + view].hidden = view !== name;
    });

    // render() 每收到一次廣播就會呼叫 showView，只有真的換畫面才送統計
    if (name !== currentView) {
      currentView = name;
      trackView(name);
    }
  }

  // 四個畫面共用同一個網址，GA4 的自動 page_view 只會看到一筆，
  // 分不出有多少人真的開了房間、有多少人只是看了首頁就走。
  function trackView(name) {
    window.trackPageView(BASE + '/' + LANG + '/' + name);
  }

  function showFieldError(node, message) {
    node.textContent = message;
    node.hidden = false;
  }

  function hideFieldError(node) {
    node.hidden = true;
  }

  function showBanner(message) {
    el['conn-banner'].textContent = message;
    el['conn-banner'].hidden = false;
  }

  function hideBanner() {
    el['conn-banner'].hidden = true;
  }

  function showFatal(titleKey, descKey) {
    giveUp = true;
    hideBanner();
    el['error-title'].textContent = t(titleKey);
    el['error-desc'].textContent = t(descKey);
    showView('error');
  }

  /* ---------- 首頁 ---------- */

  function bindHome() {
    el['create-room'].addEventListener('click', createRoom);

    el['join-code'].addEventListener('input', function () {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      hideFieldError(el['join-error']);
    });

    el['join-room'].addEventListener('click', joinByCode);
    el['join-code'].addEventListener('keydown', function (event) {
      if (event.key === 'Enter') joinByCode();
    });
  }

  function createRoom() {
    hideFieldError(el['create-error']);

    var maxPlayers = parseInt(el['max-players'].value, 10);
    if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
      showFieldError(el['create-error'], T.maxPlayersHint);
      return;
    }

    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;

    fetch(BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ maxPlayers: maxPlayers, hostId: clientId() }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        enterRoom(data.code, true);
      })
      .catch(function () {
        showFieldError(el['create-error'], T.createFailed);
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = T.createButton;
      });
  }

  function joinByCode() {
    var code = el['join-code'].value.trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      showFieldError(el['join-error'], T.joinCodeInvalid);
      return;
    }
    enterRoom(code, true);
  }

  // pushUrl：從首頁進來要把 ?room= 寫進網址（重整、分享都靠它）；
  // 本來就是掃 QR code 進來的話網址已經有了，不用再動。
  function enterRoom(code, pushUrl) {
    roomCode = code;
    pendingNickname = readRoomNickname(code);
    if (pushUrl) {
      var url = new URL(location.href);
      url.searchParams.set('room', code);
      history.replaceState(null, '', url.toString());
    }
    connect();
  }

  /* ---------- 填暱稱 ---------- */

  function bindJoin() {
    el['enter-room'].addEventListener('click', submitNickname);
    el['nickname'].addEventListener('keydown', function (event) {
      if (event.key === 'Enter') submitNickname();
    });
  }

  function submitNickname() {
    var nickname = el['nickname'].value.trim();
    if (!nickname) {
      showFieldError(el['nickname-error'], T.nicknameRequired);
      return;
    }
    hideFieldError(el['nickname-error']);
    pendingNickname = nickname;
    saveRoomNickname(roomCode, nickname);

    // 連線還在，重送一次 hello 就好；斷了才重連
    if (isOpen()) sendHello();
    else connect();
  }

  /* ---------- WebSocket ---------- */

  function isOpen() {
    return socket && socket.readyState === WebSocket.OPEN;
  }

  function send(message) {
    if (isOpen()) socket.send(JSON.stringify(message));
  }

  function connect() {
    clearTimeout(reconnectTimer);
    if (socket) {
      // 換掉舊的 handler，免得舊連線關閉時又觸發一次重連
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
      try {
        socket.close();
      } catch (e) {
        /* 已經關了 */
      }
    }

    showBanner(T.connecting);

    var url = new URL(BASE + '/api/rooms/' + roomCode + '/ws', location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(url.toString());

    socket.onopen = function () {
      reconnectDelay = RECONNECT_MIN_MS;
      sendHello();
    };

    socket.onmessage = function (event) {
      handleMessage(event.data);
    };

    socket.onclose = function (event) {
      if (giveUp) return;
      if (event.reason === 'room_expired') {
        showFatal('roomExpiredTitle', 'roomExpiredDesc');
        return;
      }
      showBanner(T.reconnecting);
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
    };
  }

  function sendHello() {
    send({ t: 'hello', clientId: clientId(), nickname: pendingNickname });
  }

  function handleMessage(raw) {
    var msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (msg.t === 'welcome') {
      me = msg.you;
      if (me.role === 'player' && me.nickname) saveRoomNickname(roomCode, me.nickname);
      hideBanner();
      return;
    }

    if (msg.t === 'state') {
      lastState = msg.state;
      render();
      return;
    }

    if (msg.t === 'closed') {
      // 主持人關了房間。giveUp 擋掉自動重連，否則跳出通知的同時還會一直重試
      giveUp = true;
      hideBanner();
      el['closed-dialog'].showModal();
      return;
    }

    if (msg.t === 'error') {
      handleServerError(msg.code);
    }
  }

  function handleServerError(code) {
    if (code === 'nickname_required') {
      // 連線留著，等使用者填完暱稱再送一次 hello
      hideBanner();
      el['join-title'].textContent = t('joinTitleWithCode', { code: roomCode });
      el['nickname'].value = pendingNickname;
      showView('join');
      el['nickname'].focus();
      return;
    }
    if (code === 'room_not_found') {
      showFatal('roomNotFoundTitle', 'roomNotFoundDesc');
      return;
    }
    if (code === 'room_full') {
      showFatal('roomFullTitle', 'roomFullDesc');
      return;
    }
    // host_only / player_only / not_buzzing 這類是「按了現在不該按的東西」，
    // 畫面本來就會把按鈕鎖住，靜靜忽略即可，不用打斷使用者
  }

  /* ---------- 畫面 ---------- */

  function render() {
    if (!lastState || !me) return;
    if (me.role === 'host') {
      showView('host');
      renderHost();
    } else {
      showView('play');
      renderPlay();
    }
  }

  function renderHost() {
    var state = lastState;

    el['host-room-code'].textContent = state.code;

    var joinUrl = location.origin + BASE + '/' + LANG + '/?room=' + state.code;
    el['share-url'].textContent = joinUrl;
    renderQr(joinUrl);

    el['player-count'].textContent = t('playerCount', {
      n: state.players.length,
      max: state.maxPlayers,
    });
    renderPlayers(state.players);

    // 主持人重整後把伺服器上的題目補回輸入框，但只補一次——
    // 之後以他正在打的內容為準，不然每次廣播都會把游標和未送出的字洗掉
    if (!questionSynced) {
      el['question'].value = state.question;
      questionSynced = true;
    }

    el['show-question'].disabled = state.status === 'buzzing';
    el['start-buzz'].disabled = state.status === 'buzzing';
    el['reset-round'].disabled = state.status === 'waiting';

    renderRanks(el['host-rank-list'], el['host-rank-empty'], state.buzzOrder);
  }

  function renderPlayers(players) {
    var list = el['player-list'];
    list.replaceChildren();
    el['player-empty'].hidden = players.length > 0;

    players.forEach(function (player) {
      var item = document.createElement('li');
      if (!player.online) item.classList.add('is-offline');

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = player.nickname;
      item.append(name);

      if (!player.online) {
        var tag = document.createElement('span');
        tag.className = 'offline';
        tag.textContent = T.offlineTag;
        item.append(tag);
      }
      list.append(item);
    });
  }

  function renderPlay() {
    var state = lastState;
    var open = state.status === 'buzzing' || state.status === 'buzzed';

    var myPlace = -1;
    for (var i = 0; i < state.buzzOrder.length; i += 1) {
      if (state.buzzOrder[i].playerId === me.id) {
        myPlace = i + 1;
        break;
      }
    }

    if (state.status === 'waiting') {
      el['play-title'].textContent = T.waitingTitle;
      el['play-desc'].textContent = T.waitingDesc;
    } else if (myPlace > 0) {
      el['play-title'].textContent = T.buzzedTitle;
      el['play-desc'].textContent = t('yourRank', { n: myPlace });
    } else {
      el['play-title'].textContent = T.readyTitle;
      el['play-desc'].textContent = open ? T.readyDesc : T.buzzClosedHint;
    }

    el['play-question'].hidden = !state.question;
    el['play-question-text'].textContent = state.question;

    // 已經搶答過還是可以按（規格要求不鎖死畫面），只是視覺上退一階
    el['buzz'].disabled = !open;
    el['buzz'].classList.toggle('buzzed', myPlace > 0);

    renderRanks(el['play-rank-list'], el['play-rank-empty'], state.buzzOrder);
  }

  function renderRanks(list, empty, buzzOrder) {
    list.replaceChildren();
    empty.hidden = buzzOrder.length > 0;

    buzzOrder.forEach(function (entry, index) {
      var item = document.createElement('li');
      if (index === 0) item.classList.add('first');
      if (me && entry.playerId === me.id) item.classList.add('me');

      var place = document.createElement('span');
      place.className = 'place';
      place.textContent = t('rankLabel', { n: index + 1 });

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = entry.nickname;

      item.append(place, name);

      if (entry.ms !== null && entry.ms !== undefined) {
        var delta = document.createElement('span');
        delta.className = 'delta';
        delta.textContent = t('deltaLabel', { s: (entry.ms / 1000).toFixed(2) });
        item.append(delta);
      }

      list.append(item);
    });
  }

  // QR code 只在網址變的時候重畫：每次廣播都重畫的話，主持人畫面會一直閃
  function renderQr(url) {
    if (renderedQrUrl === url) return;
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    // margin 給 4 個模組＝規格要求的靜區，掃描率差在這裡
    el['qr-box'].innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
    renderedQrUrl = url;
  }

  /* ---------- 主持人控制 ---------- */

  function bindHost() {
    el['show-question'].addEventListener('click', function () {
      send({ t: 'question', text: el['question'].value });
    });

    el['start-buzz'].addEventListener('click', function () {
      // 主持人可能沒先按「送出題目」就直接開搶答，題目一起帶過去
      send({ t: 'start', text: el['question'].value });
    });

    el['reset-round'].addEventListener('click', function () {
      el['question'].value = '';
      send({ t: 'reset' });
    });

    el['copy-link'].addEventListener('click', function () {
      var url = el['share-url'].textContent;
      var button = el['copy-link'];
      navigator.clipboard
        .writeText(url)
        .then(function () {
          button.textContent = T.copied;
          setTimeout(function () {
            button.textContent = T.copyLink;
          }, 1600);
        })
        .catch(function () {
          button.textContent = T.copyFailed;
        });
    });
  }

  /* ---------- 離開 / 關閉房間 ---------- */

  function bindExit() {
    el['close-room'].addEventListener('click', function () {
      askConfirm('closeConfirmTitle', 'closeConfirmDesc', 'closeRoomButton', function () {
        // 不等伺服器回覆就離開：房間關掉之後這條連線本來就會斷，
        // 停在原地等只會讓主持人看到一瞬間的「重新連線中」
        send({ t: 'close' });
        goHome();
      });
    });

    el['leave-room'].addEventListener('click', function () {
      askConfirm('leaveConfirmTitle', 'leaveConfirmDesc', 'leaveRoomButton', function () {
        send({ t: 'leave' });
        goHome();
      });
    });

    el['confirm-cancel'].addEventListener('click', function () {
      el['confirm-dialog'].close();
    });

    el['closed-ok'].addEventListener('click', goHome);
  }

  function askConfirm(titleKey, descKey, confirmKey, onConfirm) {
    el['confirm-title'].textContent = T[titleKey];
    el['confirm-desc'].textContent = T[descKey];
    el['confirm-ok'].textContent = T[confirmKey];

    // 每次都換一顆新的按鈕，才不會把上一次的 handler 累積上去
    var ok = el['confirm-ok'];
    var fresh = ok.cloneNode(true);
    ok.parentNode.replaceChild(fresh, ok);
    el['confirm-ok'] = fresh;
    fresh.addEventListener('click', function () {
      el['confirm-dialog'].close();
      onConfirm();
    });

    el['confirm-dialog'].showModal();
  }

  // 回搶答首頁。giveUp 先立起來，離開途中連線斷掉不會又跳出重連橫幅
  function goHome() {
    giveUp = true;
    location.href = BASE + '/' + LANG + '/';
  }

  /* ---------- 玩家搶答 ---------- */

  function bindPlay() {
    // pointerdown 而不是 click：click 要等 pointerup，搶答差的就是這幾十毫秒
    el['buzz'].addEventListener('pointerdown', function () {
      send({ t: 'buzz' });
    });

    // 鍵盤使用者按不到 pointerdown，補一條（滑鼠按下時不會重複觸發，
    // 因為 click 的 detail 在鍵盤操作下是 0）
    el['buzz'].addEventListener('click', function (event) {
      if (event.detail === 0) send({ t: 'buzz' });
    });
  }
})();
