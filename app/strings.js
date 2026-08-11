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
    navRules: '規則',

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

    rulesLinkText: '第一次玩？看看怎麼開始 →',

    // ---- 規則頁 ----
    rulesSeoTitle: '搶答遊戲怎麼玩｜主持人與玩家操作說明 - Web100 現場搶答',
    rulesSeoDesc:
      '現場搶答遊戲的完整玩法說明：主持人如何建立房間、出題與判定，玩家如何掃碼加入與搶答，以及房間人數上限、重新整理、離線等常見問題。',
    rulesH1: '搶答遊戲怎麼玩',
    rulesIntro:
      '一台裝置當主持人、其他人用手機當搶答鍵。不用下載 App、不用註冊帳號，掃個 QR code 就能開始。',

    howHeading: '快速上手',
    howStep1: '主持人選好人數，按「建立房間」。',
    howStep2: '其他人掃 QR code 或輸入房間代碼，填暱稱加入。',
    howStep3: '主持人唸完題目，按「開始搶答」。',
    howStep4: '所有人的手機同時變成搶答鍵，按下去就依先後排名。',

    rulesHostHeading: '主持人',
    rulesHost1:
      '第一個建立房間的裝置就是主持人，不用登入。手機、平板、筆電都可以，投影出來給大家看效果最好。',
    rulesHost2:
      '把題目打進輸入框後有兩個選擇：按「送出題目」讓大家先在自己手機上看到題目，或直接按「開始搶答」一次送出並開放搶答。',
    rulesHost3: '一題結束後按「重置／下一題」，排名和題目會一起清空，接著出下一題。',

    rulesPlayerHeading: '玩家',
    rulesPlayer1: '掃 QR code 或輸入 4 碼房間代碼，填一個大家認得出你的暱稱就能進房。',
    rulesPlayer2: '搶答鍵在主持人按下「開始搶答」之前是暗的，按不下去，不用擔心手滑。',
    rulesPlayer3: '按下去之後畫面會顯示你是第幾名，同時看得到完整的排名榜。',

    rulesJudgeHeading: '搶答怎麼判定',
    rulesJudge1: '依伺服器收到的先後順序排名，不是比手機時間，所以不會因為誰的手機比較快而不公平。',
    rulesJudge2: '同一輪同一個人只記錄一次，重複按不會多一筆，也不會把自己往後推。',
    rulesJudge3:
      '第一個人按下去之後，其他人還是可以繼續按，畫面不會鎖死——排名榜會一路排到最後一位。',

    rulesFaqHeading: '常見問題',
    rulesFaqQ1: '房間人數最多幾個人？',
    rulesFaqA1: '2 到 30 人，由主持人在建立房間時決定，不含主持人自己。',
    rulesFaqQ2: '主持人不小心重新整理頁面會怎樣？',
    rulesFaqA2:
      '還是主持人，房間也不會消失。身份記在這台裝置的瀏覽器裡，重新連上就會自動認回來。玩家重整同理，暱稱不用重填。',
    rulesFaqQ3: '有人手機鎖屏或斷線會怎樣？',
    rulesFaqA3:
      '名單上會標成「離線」，但不會被踢出房間。網路回來會自動重連，之前的暱稱和搶答紀錄都還在。',
    rulesFaqQ4: '房間會一直存在嗎？',
    rulesFaqA4: '閒置 3 小時沒有任何動作就會自動清除。要繼續玩的話請主持人重新建立一個房間。',

    rulesBackToGame: '開始玩',

    joinTitle: '加入房間',
    nicknameLabel: '你的暱稱',
    nicknamePlaceholder: '大家認得出你就好',
    enterButton: '進入房間',

    hostBadge: '主持人',
    playerBadge: '玩家',

    leaveRoomButton: '離開房間',
    closeRoomButton: '關閉房間',
    cancelButton: '取消',
    leaveConfirmTitle: '離開房間？',
    leaveConfirmDesc:
      '你的名字會從名單上移除，這一輪的搶答紀錄也會一起消失。想再回來的話，重新輸入房間代碼就可以。',
    closeConfirmTitle: '關閉房間？',
    closeConfirmDesc: '房間會直接結束，所有玩家都會被退出，題目和排名都不會保留。這個動作無法復原。',
    roomClosedTitle: '主持人已關閉房間',
    roomClosedDesc: '這場遊戲結束了。要繼續玩的話，請主持人重新建立一個房間。',
    roomCodeLabel: '房間代碼',
    shareHint: '請其他人掃這個 QR code，或直接輸入房間代碼加入',
    qrAlt: '加入房間用的 QR code',
    copyLink: '複製連結',
    copied: '已複製',
    copyFailed: '複製失敗，請手動選取網址',

    playersHeading: '已加入玩家',
    emptyPlayers: '還沒有人加入，等大家掃碼進來',
    offlineTag: '離線',

    startGameButton: '開始遊戲',
    startGameHint: '等大家都進來之後再按。開始之後就不再開放新玩家加入。',
    startGameNeedsPlayer: '至少要有一位玩家加入才能開始。',
    kickButton: '移出',
    kickAria: '把 {nickname} 移出房間',
    kickConfirmTitle: '把 {nickname} 移出房間？',
    kickConfirmDesc: '這位玩家會被退出房間，這一輪的搶答紀錄也會一起移除。他之後仍可以重新加入。',
    kickConfirmOk: '移出房間',
    kickedTitle: '你已被主持人移出房間',
    kickedDesc: '如果是誤操作，跟主持人說一聲，重新輸入房間代碼就能再加入。',

    lobbyWaitTitle: '等待主持人開始遊戲',
    lobbyWaitDesc: '已經加入的人會顯示在下面。主持人按下「開始遊戲」之後就可以搶答了。',
    roomStartedTitle: '遊戲已經開始',
    roomStartedDesc: '主持人已經開始這場遊戲，房間不再開放加入。請跟主持人確認要不要重開一局。',

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
    navRules: 'Rules',

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

    rulesLinkText: 'First time here? See how it works →',

    // ---- 規則頁 ----
    rulesSeoTitle: 'How to Play the Buzzer Game | Host and Player Guide - Web100',
    rulesSeoDesc:
      'A full guide to the live buzzer game: how the host creates a room, shows questions and opens buzzing, how players join by QR code, and answers on player limits, refreshing and dropped connections.',
    rulesH1: 'How to play',
    rulesIntro:
      'One device hosts, everyone else uses their phone as a buzzer. No app to install, no account to create — just scan a QR code and start.',

    howHeading: 'Quick start',
    howStep1: 'The host picks the number of players and creates a room.',
    howStep2: 'Everyone else scans the QR code or types the room code, then picks a nickname.',
    howStep3: 'The host reads the question out loud and hits “Start buzzing”.',
    howStep4: 'Every phone turns into a buzzer — first press, first place.',

    rulesHostHeading: 'For the host',
    rulesHost1:
      'Whoever creates the room is the host — no login needed. Phone, tablet or laptop all work; putting it on a big screen works best.',
    rulesHost2:
      'Once the question is typed in, you have two options: “Show question” puts it on everyone’s phone first, or “Start buzzing” sends it and opens buzzing in one go.',
    rulesHost3:
      'When the round is over, hit “Reset / next question” — the ranking and the question are cleared together.',

    rulesPlayerHeading: 'For players',
    rulesPlayer1:
      'Scan the QR code or type the 4-character room code, pick a nickname the others will recognise, and you are in.',
    rulesPlayer2:
      'The buzzer stays dimmed and unclickable until the host opens buzzing, so there is no way to jump the gun by accident.',
    rulesPlayer3:
      'After you press it, your place shows up right away, along with the full ranking of everyone else.',

    rulesJudgeHeading: 'How the order is decided',
    rulesJudge1:
      'Ranking follows the order the server receives the presses, not the clock on anyone’s phone — a faster phone gains nothing.',
    rulesJudge2:
      'Each player is recorded once per round. Pressing again changes nothing and never pushes you further down.',
    rulesJudge3:
      'Once the first person buzzes, everyone else can still press — nothing freezes, and the ranking fills in all the way down.',

    rulesFaqHeading: 'Common questions',
    rulesFaqQ1: 'How many players fit in a room?',
    rulesFaqA1: '2 to 30, set by the host when creating the room. The host does not count towards it.',
    rulesFaqQ2: 'What if the host reloads the page by accident?',
    rulesFaqA2:
      'They stay the host and the room stays put — the role is remembered in that device’s browser and picked up again on reconnect. Same for players: no need to type the nickname again.',
    rulesFaqQ3: 'What happens when someone’s phone locks or drops off?',
    rulesFaqA3:
      'They are marked offline in the list but never kicked out. The connection comes back on its own, with the nickname and buzz record intact.',
    rulesFaqQ4: 'Do rooms last forever?',
    rulesFaqA4:
      'A room is cleared after 3 hours with no activity. To keep playing, the host just creates a new one.',

    rulesBackToGame: 'Start playing',

    joinTitle: 'Join room',
    nicknameLabel: 'Your nickname',
    nicknamePlaceholder: 'Anything the others will recognise',
    enterButton: 'Enter room',

    hostBadge: 'Host',
    playerBadge: 'Player',

    leaveRoomButton: 'Leave room',
    closeRoomButton: 'Close room',
    cancelButton: 'Cancel',
    leaveConfirmTitle: 'Leave this room?',
    leaveConfirmDesc:
      'Your name comes off the list and your buzz for this round goes with it. You can come back any time by entering the room code again.',
    closeConfirmTitle: 'Close this room?',
    closeConfirmDesc:
      'The room ends immediately, everyone is removed, and the question and ranking are not kept. This cannot be undone.',
    roomClosedTitle: 'The host closed the room',
    roomClosedDesc: 'This game is over. To keep playing, ask the host to create a new room.',
    roomCodeLabel: 'Room code',
    shareHint: 'Have everyone scan this QR code, or type the room code to join',
    qrAlt: 'QR code for joining the room',
    copyLink: 'Copy link',
    copied: 'Copied',
    copyFailed: 'Could not copy — please select the link manually',

    playersHeading: 'Players joined',
    emptyPlayers: 'Nobody yet — waiting for people to scan in',
    offlineTag: 'offline',

    startGameButton: 'Start game',
    startGameHint: 'Press once everyone is in. No new players can join after this.',
    startGameNeedsPlayer: 'At least one player has to join first.',
    kickButton: 'Remove',
    kickAria: 'Remove {nickname} from the room',
    kickConfirmTitle: 'Remove {nickname} from the room?',
    kickConfirmDesc:
      'This player is dropped from the room and their buzz for this round goes with them. They can join again later.',
    kickConfirmOk: 'Remove',
    kickedTitle: 'The host removed you from the room',
    kickedDesc: 'If that was a mistake, ask the host — entering the room code again lets you back in.',

    lobbyWaitTitle: 'Waiting for the host to start',
    lobbyWaitDesc:
      'Everyone who has joined shows up below. Once the host hits “Start game”, buzzing begins.',
    roomStartedTitle: 'The game already started',
    roomStartedDesc:
      'The host has already started this game and the room is closed to new players. Check with the host about running another round.',

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
