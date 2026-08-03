/*
 * 所有文案的唯一來源。scripts/build.js 會用這裡的內容替換 template.html 的 {{token}}，
 * 每個語言各產生一份靜態頁（爬蟲看得到內容），同時把該語言的物件內嵌成 window.T 給 app.js 用。
 *
 * 加語言 = 在 LANGS 加代碼 + 在 STRINGS 加一份完整的物件。build.js 會檢查 key 有沒有漏，
 * 漏了直接讓 build 失敗，不會靜靜產出半空的頁面。
 *
 * 導覽列/頁尾的品牌字（Web100、02_BuzzerGame、© 2026 Web100 Series）依 ARCHITECTURE.md
 * 第 7 節維持語言中性，不放進這裡。
 */

export const LANGS = ['zh-TW', 'en'];
export const DEFAULT_LANG = 'zh-TW';

// 每個語言用自己的名字顯示（跟阿瓦隆的 localeLabels 一樣）：
// 使用者要找的是自己看得懂的那一個，翻譯成當前介面語言反而找不到
export const LOCALE_LABELS = {
  'zh-TW': '繁體中文',
  en: 'English',
};
export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/buzzer';
export const PROJECT_ID = '02_BuzzerGame';

export const STRINGS = {
  'zh-TW': {
    htmlLang: 'zh-TW',
    ogLocale: 'zh_TW',
    langSwitchLabel: '切換語言',
    themeToggleLabel: '切換深色／淺色模式',

    seoTitle: '現場搶答遊戲｜手機掃碼即玩、免下載免註冊 - Web100',
    seoDesc:
      '多人聚會、教學課堂、公司活動用的線上搶答器。主持人建立房間分享 QR code，大家用手機掃碼輸入暱稱就能加入，按下搶答即時顯示排名。免下載、免註冊、免費使用。',

    navTitle: '現場搶答',

    heroTitle: '掃碼就能搶答',
    heroDesc:
      '聚會、上課、公司活動用的搶答器。主持人開房間、其他人掃 QR code 加入，按下去就即時排名。不用下載 App，也不用註冊帳號。',

    createHeading: '建立房間',
    maxPlayersLabel: '預計人數',
    maxPlayersHint: '2～30 人，不含主持人自己',
    createButton: '建立房間',
    creating: '建立中…',

    joinHeading: '加入現有房間',
    codeLabel: '房間代碼',
    codePlaceholder: '例如 A3KP',
    joinButton: '加入',

    howHeading: '怎麼玩',
    howStep1: '主持人選好人數，按「建立房間」。',
    howStep2: '其他人掃 QR code 或輸入房間代碼，填暱稱加入。',
    howStep3: '主持人唸完題目，按「開始搶答」。',
    howStep4: '所有人的手機同時變成搶答鍵，按下去就依先後排名。',

    joinTitle: '加入房間',
    nicknameLabel: '你的暱稱',
    nicknamePlaceholder: '大家認得出你就好',
    enterButton: '進入房間',

    hostBadge: '主持人',
    playerBadge: '玩家',
    roomCodeLabel: '房間代碼',
    shareHint: '請其他人掃這個 QR code，或直接輸入房間代碼加入',
    qrAlt: '加入房間用的 QR code',
    copyLink: '複製連結',
    copied: '已複製',
    copyFailed: '複製失敗，請手動選取網址',

    playersHeading: '已加入玩家',
    emptyPlayers: '還沒有人加入，等大家掃碼進來',
    offlineTag: '離線',

    questionLabel: '題目',
    questionPlaceholder: '在這裡輸入題目，唸完之後按「開始搶答」',
    showQuestionButton: '送出題目',
    startButton: '開始搶答',
    resetButton: '重置／下一題',

    rankingHeading: '搶答排名',
    noBuzzYet: '還沒有人搶答',

    waitingTitle: '等待主持人出題',
    waitingDesc: '把手機拿好，題目出來就會顯示在這裡。',
    questionHeading: '題目',
    readyTitle: '準備搶答',
    readyDesc: '聽主持人唸完題目，按鈕亮起來就按下去。',
    buzzButton: '搶答！',
    buzzedTitle: '已搶答，等待結果',
    notBuzzedTitle: '還沒按下搶答',
    buzzClosedHint: '這一輪還沒開始搶答',

    // 需要帶參數的字串，用 {name} 佔位，app.js 的 fmt() 會替換
    joinTitleWithCode: '加入房間 {code}',
    playerCount: '{n} / {max} 人',
    rankLabel: '第 {n} 名',
    deltaLabel: '+{s} 秒',
    yourRank: '你是第 {n} 名',

    connecting: '連線中…',
    reconnecting: '連線中斷，重新連線中…',
    roomNotFoundTitle: '找不到這個房間',
    roomNotFoundDesc: '房間可能已經結束，或是代碼打錯了。請跟主持人確認房間代碼。',
    roomFullTitle: '房間人數已滿',
    roomFullDesc: '這個房間已經達到主持人設定的人數上限，請跟主持人說一聲。',
    roomExpiredTitle: '房間已經結束',
    roomExpiredDesc: '房間閒置太久被自動清除了，請主持人重新建立一個。',
    errorTitle: '發生錯誤',
    errorDesc: '請重新整理頁面再試一次。',
    backHome: '回到搶答首頁',
    createFailed: '建立房間失敗，請再試一次。',
    joinCodeInvalid: '房間代碼是 4 個英數字，請再確認一次。',
    nicknameRequired: '請先填暱稱。',
  },

  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    langSwitchLabel: 'Switch language',
    themeToggleLabel: 'Toggle dark / light mode',

    seoTitle: 'Live Buzzer Game | Scan and Play, No App, No Signup - Web100',
    seoDesc:
      'A free online buzzer for parties, classrooms and company events. The host creates a room and shares a QR code, everyone joins from their phone with a nickname, and buzz order is ranked in real time. No download, no account needed.',

    navTitle: 'Buzzer',

    heroTitle: 'Scan the code, hit the buzzer',
    heroDesc:
      'A buzzer for parties, classrooms and company events. The host opens a room, everyone else scans the QR code, and the buzz order shows up live. No app to install, no account to create.',

    createHeading: 'Create a room',
    maxPlayersLabel: 'Expected players',
    maxPlayersHint: '2–30 players, not counting the host',
    createButton: 'Create room',
    creating: 'Creating…',

    joinHeading: 'Join an existing room',
    codeLabel: 'Room code',
    codePlaceholder: 'e.g. A3KP',
    joinButton: 'Join',

    howHeading: 'How it works',
    howStep1: 'The host picks the number of players and creates a room.',
    howStep2: 'Everyone else scans the QR code or types the room code, then picks a nickname.',
    howStep3: 'The host reads the question out loud and hits “Start buzzing”.',
    howStep4: 'Every phone turns into a buzzer — first press, first place.',

    joinTitle: 'Join room',
    nicknameLabel: 'Your nickname',
    nicknamePlaceholder: 'Anything the others will recognise',
    enterButton: 'Enter room',

    hostBadge: 'Host',
    playerBadge: 'Player',
    roomCodeLabel: 'Room code',
    shareHint: 'Have everyone scan this QR code, or type the room code to join',
    qrAlt: 'QR code for joining the room',
    copyLink: 'Copy link',
    copied: 'Copied',
    copyFailed: 'Could not copy — please select the link manually',

    playersHeading: 'Players joined',
    emptyPlayers: 'Nobody yet — waiting for people to scan in',
    offlineTag: 'offline',

    questionLabel: 'Question',
    questionPlaceholder: 'Type the question here, then hit “Start buzzing” once you have read it out',
    showQuestionButton: 'Show question',
    startButton: 'Start buzzing',
    resetButton: 'Reset / next question',

    rankingHeading: 'Buzz order',
    noBuzzYet: 'Nobody has buzzed yet',

    waitingTitle: 'Waiting for the host',
    waitingDesc: 'Keep your phone handy — the question will show up here.',
    questionHeading: 'Question',
    readyTitle: 'Get ready',
    readyDesc: 'Wait for the host to finish reading, then hit the buzzer.',
    buzzButton: 'BUZZ!',
    buzzedTitle: 'Buzzed — waiting for the result',
    notBuzzedTitle: 'You have not buzzed yet',
    buzzClosedHint: 'Buzzing has not opened for this round',

    joinTitleWithCode: 'Join room {code}',
    playerCount: '{n} / {max}',
    rankLabel: '#{n}',
    deltaLabel: '+{s}s',
    yourRank: 'You are #{n}',

    connecting: 'Connecting…',
    reconnecting: 'Connection lost, reconnecting…',
    roomNotFoundTitle: 'Room not found',
    roomNotFoundDesc:
      'The room may have ended, or the code was mistyped. Double-check the code with the host.',
    roomFullTitle: 'Room is full',
    roomFullDesc: 'This room has reached the limit the host set. Let the host know.',
    roomExpiredTitle: 'Room has ended',
    roomExpiredDesc: 'The room was idle for too long and was cleared. Ask the host to create a new one.',
    errorTitle: 'Something went wrong',
    errorDesc: 'Please reload the page and try again.',
    backHome: 'Back to the buzzer home',
    createFailed: 'Could not create the room. Please try again.',
    joinCodeInvalid: 'A room code is 4 letters or digits. Please check it again.',
    nicknameRequired: 'Please enter a nickname first.',
  },
};
