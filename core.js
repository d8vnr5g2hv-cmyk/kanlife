/* Kani Life - コア（状態・時間・成長・評判・人間関係・ターン進行） */
(function () {
  'use strict';
  var KL = window.KL;

  // ---------- ユーティリティ ----------
  var U = KL.U = {
    ri: function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
    rf: function (a, b) { return Math.random() * (b - a) + a; },
    pick: function (a) { return a[Math.floor(Math.random() * a.length)]; },
    chance: function (p) { return Math.random() < p; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    sig: function (x) { return 1 / (1 + Math.exp(-x)); },
    gauss: function () { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
    wpick: function (arr, wf) {
      var tot = 0, i; for (i = 0; i < arr.length; i++) tot += Math.max(0, wf(arr[i]));
      if (tot <= 0) return null; var r = Math.random() * tot;
      for (i = 0; i < arr.length; i++) { r -= Math.max(0, wf(arr[i])); if (r <= 0) return arr[i]; }
      return arr[arr.length - 1];
    },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    yen: function (y) {
      var s = y < 0 ? '-' : ''; y = Math.abs(Math.round(y));
      if (y >= 1e8) return s + (y / 1e8).toFixed(y >= 1e9 ? 0 : 1) + '億円';
      if (y >= 1e4) return s + Math.round(y / 1e4).toLocaleString() + '万円';
      return s + y + '円';
    },
    r1: function (v) { return Math.round(v * 10) / 10; }
  };

  KL.BIRTH_YEAR = 2008;
  KL.TAL_MULT = [0, 0.55, 0.75, 1, 1.25, 1.5];
  KL.TAL_CAP = [0, 62, 74, 85, 94, 100];
  KL.AP = { baby: 0, kinder: 4, elem: 5, jhs: 6, hs: 6, univ: 6, senmon: 6, work: 6, pro: 6, idol: 6, free: 6, retired: 4 };

  // ---------- 時間 ----------
  KL.age = function (S) { return Math.floor(S.t / 2); };
  KL.isB = function (S) { return S.t % 2 === 0; }; // B = 2〜7月 / A = 8〜1月
  KL.year = function (S) { return KL.BIRTH_YEAR + Math.floor(S.t / 2); };
  KL.period = function (S) {
    var y = KL.year(S);
    return KL.isB(S) ? y + '年 2〜7月' : y + '年8月〜' + (y + 1) + '年1月';
  };
  KL.seasonStart = function (S) { return KL.isB(S) ? KL.year(S) - 1 : KL.year(S); };
  KL.seasonLabel = function (S) { var s = KL.seasonStart(S); return s + '-' + String((s + 1) % 100).padStart(2, '0'); };

  KL.stageLabel = function (S) {
    var a = KL.age(S);
    switch (S.stage) {
      case 'baby': return a === 0 ? '赤ちゃん' : a + '歳（未就園）';
      case 'kinder': return '幼稚園 ' + ['年少', '年中', '年長'][a - 3];
      case 'elem': return '小学' + (a - 5) + '年';
      case 'jhs': return '中学' + (a - 11) + '年';
      case 'hs': return '高校' + (a - 14) + '年';
      case 'univ': return '大学' + (a - 17) + '年';
      case 'senmon': return '専門学校' + (a - 17) + '年';
      case 'work': return S.job ? S.job.name + '・' + KL.jobTitles(S)[S.job.title] : '会社員';
      case 'pro': return S.soccer && S.soccer.club ? 'プロサッカー選手' : 'サッカー選手';
      case 'idol': return 'アイドル';
      case 'free': return S.talent ? S.talent : 'フリーター';
      case 'retired': return a >= 65 ? '隠居' : '引退後';
    }
    return '';
  };
  KL.isStudent = function (S) { return ['kinder', 'elem', 'jhs', 'hs', 'univ', 'senmon'].indexOf(S.stage) >= 0; };
  KL.schoolStage = function (S) { return ['elem', 'jhs', 'hs', 'univ', 'senmon'].indexOf(S.stage) >= 0; };

  // ---------- 新しい人生 ----------
  KL.newGame = function (cfg) {
    var S = {
      v: 1, t: 0, sei: cfg.sei, mei: cfg.mei, sex: cfg.sex, loveSex: cfg.loveSex, pref: cfg.pref,
      family: cfg.family, tal: cfg.tal, luck: cfg.luck || null,
      st: { hp: 8, ath: 4, int: 3, look: 10 + cfg.tal.look * 6, com: 3, men: 8, art: 3 },
      fat: 0, money: 0, rep: { sch: 5, loc: 3, nat: 0 },
      stage: 'baby', plan: null, school: null, nextSchool: null,
      npcs: [], crushId: null, partnerId: null, spouseId: null, kids: [], exCount: 0,
      family_members: [], job: null, talent: null,
      track: null, soccer: null, idol: null,
      flags: {}, done: {}, log: [], titles: [], history: [], dead: false, nid: 1,
      choc: 0, confessOk: 0, confessNg: 0
    };
    var fam = KL.FAMILIES.filter(function (f) { return f.id === cfg.family; })[0] || KL.FAMILIES[0];
    S.money = fam.money;
    S.family_members = [
      { rel: '父', name: S.sei + U.pick(KL.NAMES.m) }, { rel: '母', name: S.sei + U.pick(KL.NAMES.f) }
    ];
    if (U.chance(0.5)) S.family_members.push({ rel: U.chance(0.5) ? '兄' : '姉', name: S.sei + U.pick(U.chance(0.5) ? KL.NAMES.m : KL.NAMES.f) });
    S._d = {};
    KL.log(S, S.pref + 'の' + fam.name + 'に、' + S.sei + ' ' + S.mei + 'として生まれた。', 2);
    return S;
  };

  KL.familyOf = function (S) { return KL.FAMILIES.filter(function (f) { return f.id === S.family; })[0] || KL.FAMILIES[0]; };

  // ---------- 数値の変化 ----------
  KL.add = function (S, k, v) {
    var before = S.st[k];
    S.st[k] = U.clamp(S.st[k] + v, 0, 100);
    var d = S.st[k] - before;
    S._d = S._d || {}; S._d[k] = (S._d[k] || 0) + d;
    return d;
  };
  function ageF(S, k) {
    var a = KL.age(S);
    if (a < 3) return 0.6;
    if (a < 13) return k === 'int' ? 0.95 : 1.15;
    if (a < 23) return 1;
    if (a < 35) return 0.75;
    if (a < 50) return 0.5;
    return 0.3;
  }
  KL.ageF = ageF;
  KL.capOf = function (S, k) { return KL.TAL_CAP[S.tal[k] || 3]; };
  KL.grow = function (S, k, base) {
    var star = S.tal[k] || 3, cap = KL.TAL_CAP[star], s = S.st[k];
    var g = base * KL.TAL_MULT[star] * ageF(S, k) * (1 - S.fat / 250);
    var room = (cap - s) / cap;
    g *= room > 0 ? Math.max(0.05, Math.min(1, room * 1.6)) : 0.03;
    return KL.add(S, k, g);
  };
  KL.repAdd = function (S, k, v) { S.rep[k] = U.clamp(S.rep[k] + v, 0, 100); };
  KL.moneyAdd = function (S, y) { S.money += y; S._money = (S._money || 0) + y; };
  KL.fatAdd = function (S, v) { S.fat = U.clamp(S.fat + v, 0, 100); };
  KL.log = function (S, text, imp) { S.log.push({ t: S.t, age: KL.age(S), p: KL.period(S), text: text, imp: imp || 0 }); };
  KL.title = function (S, name) { S.titles.push({ name: name, age: KL.age(S), year: KL.year(S) }); };
  // 判定：能力値(または数値)が難易度を上回るほど成功しやすい
  KL.chk = function (S, k, diff, spread) {
    var v = typeof k === 'number' ? k : S.st[k];
    return Math.random() < U.sig((v - diff) / (spread || 8));
  };
  KL.he = function (S) { return S.sex === 'm' ? '彼' : '彼女'; };

  // ---------- 人間関係 ----------
  KL.newNPC = function (S, role, sex, extra) {
    var n = {
      id: S.nid++, role: role, sex: sex,
      name: U.pick(KL.NAMES.sei) + ' ' + U.pick(sex === 'm' ? KL.NAMES.m : KL.NAMES.f),
      like: U.ri(25, 45), rel: 'classmate', look: U.ri(35, 90), met: KL.stageLabel(S) || '近所', since: S.t
    };
    if (extra) for (var k in extra) n[k] = extra[k];
    KL.ensureProfile(S, n);
    S.npcs.push(n);
    return n;
  };

  // ---------- 人物プロフィール ----------
  KL.PROF = {
    vt: { f: ['清楚系', 'かわいい系', '美人系', 'ギャル系', 'スポーティ', '大人っぽい', 'ふんわり系', 'クール系美人'], m: ['爽やか系', '塩顔', 'かわいい系', 'ワイルド', '王子様系', '知的', '韓国アイドル系', '体育会系'] },
    pers: ['明るくて元気', 'おっとり癒し系', 'クールで落ち着いてる', 'しっかり者', 'ツンデレ', '天然', '甘えん坊', '面倒見がいい', '真面目で一途', 'ミステリアス', '負けず嫌い', 'よく笑う', 'マイペース', '気配り上手'],
    hobby: ['カフェ巡り', '映画', '音楽フェス', 'お菓子作り', '読書', 'ゲーム', 'アニメ', 'サウナ', 'キャンプ', 'カメラ', 'ダンス', 'ヨガ', '筋トレ', '旅行', '料理', 'ファッション', '推し活', 'サッカー観戦', '漫画', '食べ歩き'],
    pref: [
      { k: 'look', n: '見た目がいい人' }, { k: 'com', n: '一緒にいて楽しい人' }, { k: 'int', n: '頭のいい人' },
      { k: 'ath', n: 'スポーツができる人' }, { k: 'men', n: '頼りがいのある人' }, { k: 'art', n: 'センスのいい人' },
      { k: 'money', n: '経済力のある人' }, { k: 'fame', n: '夢を追いかけてる人' }
    ],
    jobs: { f: ['会社員', '看護師', '保育士', '美容師', '受付', '公務員', 'デザイナー', 'エンジニア', '薬剤師', '販売員', '教師', '銀行員', 'CA'], m: ['会社員', 'エンジニア', '公務員', '営業マン', '美容師', '料理人', '消防士', '教師', '銀行員', '医師', '研究者', '経営者'] },
    celeb: { f: ['女優', '女子アナ', 'モデル', 'タレント', '歌手'], m: ['俳優', 'モデル', 'ミュージシャン', 'プロ野球選手', '若手実業家'] }
  };
  KL.ensureProfile = function (S, n) {
    if (n.pers) return n;
    var P = KL.PROF, sx = n.sex || 'f';
    n.vt = U.pick(P.vt[sx]); n.pers = U.pick(P.pers); n.hobby = U.pick(P.hobby);
    n.ht = sx === 'm' ? U.ri(163, 186) : U.ri(148, 170);
    n.pref = U.pick(P.pref).k;
    if (n.ad === undefined) n.ad = KL.age(S) >= 22 ? U.ri(-4, 4) : 0; // 自分との年齢差
    if (n.look === undefined) n.look = U.ri(35, 90);
    return n;
  };
  KL.npcAge = function (S, n) { return KL.age(S) + (n.ad || 0); };
  KL.npcJob = function (S, n) {
    var a = KL.npcAge(S, n);
    if (n.job) return n.job;
    if (a < 6) return '園児'; if (a < 12) return '小学生'; if (a < 15) return '中学生'; if (a < 18) return '高校生';
    if (a < 22) return '大学生';
    if (a >= 65) return '年金暮らし';
    n.job = U.pick(KL.PROF.jobs[n.sex || 'f']);
    return n.job;
  };
  KL.prefName = function (k) { var p = KL.PROF.pref.filter(function (x) { return x.k === k; })[0]; return p ? p.n : ''; };
  // 相手の好みに自分がどれだけ合っているか（-20〜+20くらい）
  KL.prefFit = function (S, n) {
    var k = n.pref, v;
    if (k === 'money') v = Math.min(100, Math.log10(Math.max(1, S.money + (S.job ? KL.salary(S) * 3 : 0) + (S.soccer && S.soccer.salary ? S.soccer.salary * 3 : 0)) / 1e4 + 1) * 22);
    else if (k === 'fame') v = Math.max(S.rep.nat * 1.4, S.track ? 60 : 30);
    else v = S.st[k] || 50;
    return (v - 50) * 0.35;
  };
  KL.lookWord = function (n) { return n.look >= 82 ? 'とびきり' : n.look >= 68 ? 'かなり' : ''; };
  KL.profileLine = function (S, n) {
    KL.ensureProfile(S, n);
    return (KL.lookWord(n) ? KL.lookWord(n) + '' : '') + n.vt + '・' + n.pers;
  };

  // ---------- モテ度 ----------
  KL.mote = function (S) {
    var a = KL.age(S), st = S.st;
    var v = st.look * 0.42 + st.com * 0.25 + (a < 22 ? st.ath * 0.1 + S.rep.sch * 0.15 : st.men * 0.08 + Math.min(60, S.rep.nat) * 0.2);
    if (S.track === 'soccer' && S.soccer && S.soccer.club) v += 6;
    if (S.idol && S.idol.active && S.idol.status !== 'trainee') v += 8;
    if (a >= 22 && S.money >= 3e7) v += 4;
    if (a >= 45) v -= (a - 45) * 0.5;
    return U.clamp(Math.round(v * 1.15), 0, 100);
  };
  KL.moteLabel = function (S) {
    var m = KL.mote(S), a = KL.age(S), stu = KL.isStudent(S);
    if (m >= 85) return stu ? '学年一モテる' : '異常にモテる';
    if (m >= 72) return 'かなりモテる';
    if (m >= 60) return 'モテる';
    if (m >= 45) return 'そこそこモテる';
    return a < 10 ? 'まだ恋愛は早い' : 'モテ期待ち';
  };
  KL.npc = function (S, id) { for (var i = 0; i < S.npcs.length; i++) if (S.npcs[i].id === id) return S.npcs[i]; return null; };
  KL.loveSexPick = function (S) { return S.loveSex === 'any' ? U.pick(['m', 'f']) : S.loveSex; };
  KL.likeAdd = function (n, v) { if (n) n.like = U.clamp(n.like + v, 0, 100); };
  KL.partner = function (S) { return KL.npc(S, S.spouseId || S.partnerId); };
  // 恋愛対象かどうか（性別の指定に合っているか）
  KL.canLove = function (S, n) { return !!n && (S.loveSex === 'any' || n.sex === S.loveSex); };
  KL.crush = function (S) { var c = KL.npc(S, S.crushId); if (c && !KL.canLove(S, c)) { S.crushId = null; return null; } return c && c.rel !== 'partner' && c.rel !== 'spouse' ? c : null; };
  KL.newCohort = function (S, place) {
    S.npcs.forEach(function (n) { if (n.rel === 'classmate' || n.rel === 'friend') n.rel = n.like >= 70 ? 'oldfriend' : 'old'; });
    var friend = KL.newNPC(S, 'friend', S.sex, { met: place, like: U.ri(40, 55) });
    KL.newNPC(S, 'rival', S.sex, { met: place, like: U.ri(20, 40) });
    var c1 = KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: place, like: U.ri(20, 45) });
    KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: place, like: U.ri(15, 40) });
    if (!S.partnerId && !S.spouseId) S.crushId = c1.id;
    friend.rel = 'friend';
    if (place === '職場' && S.job) S.npcs.slice(-4).forEach(function (n) { n.job = S.job.name; n.ad = U.ri(-3, 5); });
    S.rep.sch = Math.round(S.rep.sch * 0.4);
  };
  KL.relLabel = function (n) {
    return { classmate: '同級生', friend: '友達', best: '親友', oldfriend: '昔の友達', old: '昔の同級生', partner: '恋人', spouse: '配偶者', ex: '元恋人', colleague: '同僚', teammate: 'チームメイト' }[n.rel] || n.rel;
  };
  KL.roleLabel = function (n) { return { osana: '幼なじみ', friend: '友人', rival: 'ライバル', crush: '', colleague: '' }[n.role] || ''; };

  // ---------- 周りからの見られ方（他者評価） ----------
  KL.perception = function (S) {
    var p = KL._perception(S), a = KL.age(S);
    if (S.track === 'soccer' && S.soccer && S.soccer.num && !S.soccer.retired) { p.tags = (p.tags || []).slice(); p.tags.push('背番号' + S.soccer.num); }
    if (a >= 12 && a < 50 && KL.mote(S) >= 60) {
      p.tags = (p.tags || []).slice(); var ml = KL.moteLabel(S);
      if (p.tags.indexOf(ml) < 0) p.tags.unshift(ml);
    }
    return p;
  };
  KL._perception = function (S) {
    var a = KL.age(S), st = S.st, traits = [];
    var hikaku = S.sex === 'm' ? 'イケメン' : '美人';
    if (S.track === 'soccer' && S.soccer) {
      var sc = KL.Soccer.perception(S); if (sc) return sc;
    }
    if (S.track === 'idol' && S.idol) {
      var id = KL.Idol.perception(S); if (id) return id;
    }
    if (a < 3) return { main: 'すくすく育つ' + (st.look > 40 ? 'かわいい' : '元気な') + '赤ちゃん', tags: [] };
    if (st.look >= 82) traits.push([st.look, a >= 12 ? '学年一の' + hikaku : 'とびきりかわいい']);
    else if (st.look >= 68) traits.push([st.look - 6, a >= 12 ? '顔がいいって噂の' : 'かわいい']);
    if (st.int >= 80) traits.push([st.int, '成績トップの秀才']);
    else if (st.int >= 66) traits.push([st.int - 6, '頭がいい']);
    if (st.ath >= 78) traits.push([st.ath, '運動神経バツグンの']);
    else if (st.ath >= 64) traits.push([st.ath - 6, 'スポーツが得意な']);
    if (st.com >= 76) traits.push([st.com, '誰とでも仲良い人気者の']);
    else if (st.com >= 62) traits.push([st.com - 6, '友達が多い']);
    if (st.art >= 76) traits.push([st.art, 'センスが光る']);
    if (st.men >= 78) traits.push([st.men - 4, '何事にも動じない']);
    traits.sort(function (x, y) { return y[0] - x[0]; });
    var tags = traits.slice(1, 4).map(function (t) { return t[1].replace(/の$/, ''); });
    if (S.stage === 'work' && S.job) {
      var tt = KL.jobTitles(S)[S.job.title];
      var pre = S.job.title >= 6 ? '業界で名の知れた' : S.job.title >= 4 ? '頼れる' : S.job.perf > 60 ? '仕事ができると評判の' : '';
      return { main: pre + S.job.name + 'の' + tt, tags: traits.slice(0, 3).map(function (t) { return t[1].replace(/の$/, ''); }) };
    }
    if (S.stage === 'retired' || a >= 65) {
      var g = S.sex === 'm' ? 'おじいさん' : 'おばあさん';
      var w = S.kids.length >= 2 ? '孫に囲まれた' : st.com >= 60 ? '近所で慕われる' : '穏やかな';
      return { main: w + g, tags: tags };
    }
    var scope = S.rep.nat >= 40 ? '全国区の' : S.rep.loc >= 50 ? '地元で有名な' : S.rep.sch >= 60 ? '学校中が知ってる' : S.rep.sch >= 30 ? '学年で有名な' : '隣のクラスの';
    if (!KL.isStudent(S)) scope = S.rep.nat >= 40 ? '全国区の' : S.rep.loc >= 40 ? '地元で有名な' : '';
    if (!traits.length) return { main: scope + (scope ? '、' : '') + (a < 6 ? '元気な子' : '目立たない普通の人'), tags: [] };
    var t0 = traits[0][1];
    var noun = /の$/.test(t0) ? (a < 12 ? '子' : '人') : '';
    if (!noun && !/人$|秀才$|気者$/.test(t0)) noun = a < 12 ? '子' : '人';
    return { main: (scope ? scope + '、' : '') + t0 + noun, tags: tags };
  };

  // ---------- 行動 ----------
  function act(id, n, d, fat, fx, extra) { var o = { id: id, n: n, d: d, fat: fat, fx: fx }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  KL.lifeActions = function (S) {
    var a = KL.age(S), st = S.stage, L = [];
    var fam = KL.familyOf(S);
    if (st === 'baby') return L;
    if (st === 'kinder') {
      L.push(act('play', '外で遊ぶ', '体力・運動神経', 4, function (S, p) { KL.grow(S, 'ath', 2.4 * p); KL.grow(S, 'hp', 1.8 * p); }));
      L.push(act('book', '絵本・お勉強', '学力', 3, function (S, p) { KL.grow(S, 'int', 2.4 * p); }));
      L.push(act('friends', '友達と遊ぶ', 'コミュ力', 3, function (S, p) { KL.grow(S, 'com', 2.4 * p); friendsLike(S, p); }));
      L.push(act('lesson_art', 'お絵かき・ピアノ', '感性', 3, function (S, p) { KL.grow(S, 'art', 2.4 * p); }));
      if (!S.track) {
        L.push(act('lesson_soccer', 'サッカー教室', '運動神経・サッカー経験', 5, function (S, p) { KL.grow(S, 'ath', 1.8 * p); KL.grow(S, 'hp', 0.8 * p); S.flags.soccerExp = (S.flags.soccerExp || 0) + p; }));
        L.push(act('lesson_dance', 'ダンス・歌の教室', '感性・表現の経験', 4, function (S, p) { KL.grow(S, 'art', 1.6 * p); KL.grow(S, 'ath', 0.6 * p); S.flags.idolExp = (S.flags.idolExp || 0) + p; }));
      }
      L.push(act('rest', 'のんびりする', '疲労回復・メンタル', -18, function (S, p) { KL.grow(S, 'men', 1.2 * p); }));
      return L;
    }
    var student = KL.isStudent(S);
    if (st === 'work') {
      L.push(act('work', '仕事に打ち込む', '評価・昇進', 6, function (S, p) { if (S.job) { S.job.perf = U.clamp(S.job.perf + p * (2 + S.st.int / 60 + S.st.com / 60) * KL.ageF(S, 'int') * 1.4, 0, 100); } KL.grow(S, 'men', 0.6 * p); }));
      L.push(act('skill', '自己研鑽', '学力・コミュ力', 4, function (S, p) { KL.grow(S, 'int', 2 * p); KL.grow(S, 'com', 1 * p); }));
    } else if (st === 'pro' || st === 'idol') {
      L.push(act('study', '勉強・読書', '学力', 3, function (S, p) { KL.grow(S, 'int', 2.2 * p); }));
    } else if (st !== 'retired') {
      L.push(act('study', st === 'free' ? '資格の勉強' : '勉強', '学力', 4, function (S, p) { KL.grow(S, 'int', 2.6 * p); if (student) KL.repAdd(S, 'sch', 0.2 * p); }));
    }
    if (st === 'retired') {
      L.push(act('health', '健康づくり', '体力の衰えを防ぐ', 2, function (S, p) { KL.grow(S, 'hp', 2.5 * p); KL.add(S, 'hp', 0.4 * p); }));
      L.push(act('hobby', '趣味に生きる', '感性・メンタル', 2, function (S, p) { KL.grow(S, 'art', 1.5 * p); KL.grow(S, 'men', 1.5 * p); }));
      L.push(act('local', '地域の活動', 'コミュ力・地元の評判', 2, function (S, p) { KL.grow(S, 'com', 1.5 * p); KL.repAdd(S, 'loc', 1 * p); }));
    }
    if (S.track !== 'soccer' && st !== 'retired') {
      L.push(act('sport', student ? (a >= 12 ? '部活（運動部）' : '外遊び・スポーツ') : 'ジムで運動', '体力・運動神経', 5, function (S, p) { KL.grow(S, 'ath', 2.2 * p); KL.grow(S, 'hp', 1.8 * p); if (student) KL.repAdd(S, 'sch', 0.25 * p); }));
    }
    if (st !== 'retired') {
      L.push(act('friends', st === 'work' ? '同僚・友人と飲み' : '友達と遊ぶ', 'コミュ力・人間関係', 3, function (S, p) { KL.grow(S, 'com', 2.3 * p); friendsLike(S, p); if (student) KL.repAdd(S, 'sch', 0.5 * p); if (st === 'work') KL.moneyAdd(S, -15000 * p); }));
    }
    if (S.track !== 'idol' && st !== 'retired') {
      L.push(act('art', a < 12 ? '習い事（音楽・絵）' : '趣味・創作', '感性', 3, function (S, p) { KL.grow(S, 'art', 2.3 * p); }));
    }
    if (a >= 10 && S.track !== 'idol' && st !== 'retired') {
      L.push(act('beauty', '身だしなみ・美容', '見た目', 2, function (S, p) { KL.grow(S, 'look', 1.5 * p); if (a >= 16) KL.moneyAdd(S, -5000 * p); }));
    }
    if (!S.track && (st === 'elem' || st === 'jhs') && a < 15) {
      L.push(act('lesson_soccer', 'サッカーを頑張る', '運動神経・サッカー経験', 5, function (S, p) { KL.grow(S, 'ath', 2 * p); KL.grow(S, 'hp', 1 * p); S.flags.soccerExp = (S.flags.soccerExp || 0) + p; }));
    }
    if (!S.track && a >= 6 && a < 22 && (student || st === 'free')) {
      L.push(act('lesson_dance', 'ダンス・歌を練習', '感性・アイドルへの道', 4, function (S, p) { KL.grow(S, 'art', 1.8 * p); KL.grow(S, 'look', 0.3 * p); S.flags.idolExp = (S.flags.idolExp || 0) + p; }));
    }
    var cr = KL.crush(S);
    if (a >= 10 && cr && !S.spouseId && st !== 'retired') {
      L.push(act('crush', cr.name + 'と過ごす', '気になる人との距離', 2, function (S, p) { var c = KL.crush(S); if (c) KL.likeAdd(c, p * (4 + S.st.com / 25 + S.st.look / 40)); KL.grow(S, 'com', 0.6 * p); }));
    }
    var pt = KL.partner(S);
    if (pt) {
      L.push(act('date', pt.name + (S.spouseId ? 'と過ごす' : 'とデート'), '関係を深める・メンタル', 1, function (S, p) { var q = KL.partner(S); if (q) KL.likeAdd(q, p * 6); KL.grow(S, 'men', 1 * p); if (a >= 16) KL.moneyAdd(S, -8000 * p); }));
    }
    if (S.kids.length && st !== 'retired') {
      L.push(act('kids', '子育て・家族サービス', 'メンタル・家族の絆', 3, function (S, p) { KL.grow(S, 'men', 1.2 * p); S.flags.kidCare = (S.flags.kidCare || 0) + p; }));
    }
    if ((st === 'hs' || st === 'univ' || st === 'senmon' || st === 'free') && S.track !== 'soccer') {
      L.push(act('baito', 'アルバイト', 'お金・コミュ力', 5, function (S, p) { KL.moneyAdd(S, (st === 'free' ? 110000 : 70000) * p); KL.grow(S, 'com', 0.8 * p); }));
    }
    if (a >= 40 && st !== 'retired') {
      L.push(act('health', '健康管理', '体力の衰えを防ぐ', 2, function (S, p) { KL.grow(S, 'hp', 2 * p); KL.add(S, 'hp', 0.3 * p); }));
    }
    L.push(act('rest', '休養', '疲労回復・メンタル', -18, function (S, p) { KL.grow(S, 'men', 1.3 * p); }));
    return L;
  };
  function friendsLike(S, p) {
    S.npcs.forEach(function (n) { if (n.rel === 'friend' || n.rel === 'best' || n.role === 'osana') KL.likeAdd(n, p * 2.5); if (n.rel === 'classmate') KL.likeAdd(n, p * 0.8); });
  }

  KL.getActions = function (S) {
    var L = KL.lifeActions(S);
    if (S.track === 'soccer' && KL.Soccer) L = KL.Soccer.actions(S).concat(L);
    if (S.track === 'idol' && KL.Idol) L = KL.Idol.actions(S).concat(L);
    return L;
  };
  KL.apOf = function (S) { var ap = KL.AP[S.stage] || 0; if (S.track && S.stage !== 'pro' && S.stage !== 'idol' && S.stage !== 'kinder') ap += 1; return ap; };

  // ---------- ターン進行 ----------
  KL.runTurn = function (S, alloc) {
    S._d = {}; S._sd = {}; S._money = 0; S._lines = []; S._queue = [];
    var acts = KL.getActions(S), fatGain = 0;
    acts.forEach(function (ac) {
      var p = alloc[ac.id] || 0; if (!p) return;
      ac.fx(S, p);
      fatGain += ac.fat * p;
    });
    S._alloc = alloc;
    KL.fatAdd(S, fatGain);
    // 夢の道の処理（試合・活動）
    if (S.track === 'soccer' && KL.Soccer) KL.Soccer.turn(S);
    if (S.track === 'idol' && KL.Idol) KL.Idol.turn(S);
    if (S.stage === 'work') workTurn(S);
    if (KL.Love) { try { KL.Love.turn(S); } catch (e) { if (window.console) console.warn('love.turn', e); } }
    // 出来事
    pickEvents(S);
    return S._queue;
  };

  KL.push = function (S, inst) { S._queue.push(inst); };
  KL.line = function (S, text) { S._lines.push(text); };

  function evInstance(S, ev) {
    var text = typeof ev.text === 'function' ? ev.text(S) : ev.text;
    var choices = (ev.choices || []).map(function (c) {
      var t = '', ok = true;
      try { t = typeof c.t === 'function' ? c.t(S) : c.t; ok = !c.req || !!c.req(S); } catch (e) { t = ''; ok = false; }
      // 同じ半年に先に起きた出来事で状況が変わっていても、止まらずに進める
      var fx = function (S2) { try { return c.fx(S2); } catch (e) { if (window.console) console.warn('choice', ev.id, e); return 'その話は、いつの間にか立ち消えになった。'; } };
      return { t: t, ok: ok, fx: fx, hint: c.hint };
    }).filter(function (c) { return c.t && (c.ok || c.hint); });
    var people = []; try { people = ev.people ? (ev.people(S) || []).filter(Boolean) : []; } catch (e) { people = []; }
    var cards = []; try { cards = ev.cards ? (ev.cards(S) || []) : []; } catch (e) { cards = []; }
    return { id: ev.id, title: typeof ev.title === 'function' ? ev.title(S) : ev.title, text: text, choices: choices, fx: ev.fx, icon: ev.icon || '', people: people, cards: cards };
  }
  KL.evInstance = evInstance;

  function pickEvents(S) {
    var all = KL.EVENTS || [];
    var sched = [], pool = [];
    all.forEach(function (ev) {
      if (ev.once !== false && S.done[ev.id] && !ev.repeat) return;
      var ok; try { ok = ev.cond(S); } catch (e) { ok = false; }
      if (!ok) return;
      if (ev.sched) sched.push(ev); else pool.push(ev);
    });
    sched.sort(function (a, b) { return (a.pri || 5) - (b.pri || 5); });
    sched.forEach(function (ev) { S.done[ev.id] = (S.done[ev.id] || 0) + 1; KL.push(S, evInstance(S, ev)); });
    var n = KL.age(S) < 3 ? 1 : KL.isStudent(S) && KL.age(S) >= 6 ? (U.chance(0.5) ? 3 : 2) : (U.chance(0.65) ? 2 : 1);
    if (sched.length >= 2) n = U.chance(0.4) ? 1 : 0;
    for (var i = 0; i < n && pool.length; i++) {
      var ev = U.wpick(pool, function (e) { return typeof e.w === 'function' ? e.w(S) : (e.w || 1); });
      if (!ev) break;
      pool.splice(pool.indexOf(ev), 1);
      S.done[ev.id] = (S.done[ev.id] || 0) + 1;
      KL.push(S, evInstance(S, ev));
    }
  }

  // ---------- 仕事 ----------
  KL.salary = function (S) {
    var j = S.job; if (!j) return 0;
    var jd = KL.JOBS.filter(function (x) { return x.id === j.id; })[0] || ({ coach: { base: 450, growth: 1.35 }, kigyo: { base: 300, growth: 1.6 } }[j.id]) || { base: 350, growth: 1.15 };
    return Math.round(jd.base * Math.pow(jd.growth, j.title) * (1 + Math.min(0.25, j.years * 0.012)) * (0.9 + j.perf / 500)) * 10000;
  };
  function workTurn(S) {
    var j = S.job; if (!j) return;
    var pay = KL.salary(S) / 2;
    KL.moneyAdd(S, pay);
    KL.line(S, '給料：' + U.yen(pay) + '（年収 ' + U.yen(KL.salary(S)) + '）');
    if (KL.isB(S)) j.years++;
    j.perf = U.clamp(j.perf - 3, 0, 100);
  }
  KL.setJob = function (S, jd) {
    S.job = { id: jd.id, name: jd.name, title: 0, perf: 30, years: 0 };
  };

  // ---------- ターン終了 ----------
  KL.endTurn = function (S) {
    var a = KL.age(S), fam = KL.familyOf(S);
    // 自然な成長と衰え
    if (a < 20) { KL.grow(S, 'hp', 1.4); KL.grow(S, 'ath', a < 3 ? 1.5 : 0.7); if (a < 13) KL.grow(S, 'int', 1.1); KL.grow(S, 'com', a < 6 ? 1.2 : 0.4); KL.grow(S, 'men', 0.4); }
    if (a >= 11 && a <= 19) KL.grow(S, 'look', 0.6);
    if (a >= 30) { var m = (a >= 50 ? 2 : 1) * (a >= 70 ? 2 : 1); KL.add(S, 'hp', -0.35 * m); KL.add(S, 'ath', -0.5 * m); }
    if (a >= 40) KL.add(S, 'look', -0.3);
    if (a >= 72) KL.add(S, 'int', -0.5);
    // 疲労回復
    KL.fatAdd(S, -(14 + S.st.hp / 12));
    // お金
    var stg = S.stage;
    if (stg === 'kinder' || stg === 'elem') KL.moneyAdd(S, 6000 * fam.allowance);
    if (stg === 'jhs') KL.moneyAdd(S, 15000 * fam.allowance);
    if (stg === 'hs') KL.moneyAdd(S, 30000 * fam.allowance);
    if (stg === 'univ' || stg === 'senmon') KL.moneyAdd(S, -250000 + 200000 * Math.min(1.5, fam.allowance));
    if (a >= 22 && stg !== 'univ') {
      var live = 1100000 + (S.spouseId ? 500000 : 0) + S.kids.filter(function (k) { return (S.t - k.born) / 2 < 22; }).length * 450000;
      if (stg === 'retired') live = 900000 + (S.spouseId ? 400000 : 0);
      KL.moneyAdd(S, -live);
    }
    if (stg === 'retired' && a >= 65) KL.moneyAdd(S, 1000000 + (S.flags.richPension ? 600000 : 0));
    if (stg === 'free' && S.talent) KL.moneyAdd(S, 400000 + Math.pow(S.rep.nat, 2) * 300);
    if (S.track === 'soccer' && S.soccer && !S.soccer.club && a >= 18 && stg !== 'univ') KL.moneyAdd(S, 600000);
    // 積立投資の値動き（年率およそ5%、ぶれあり）／65歳で受け取り
    if (S.flags.invest) {
      var add = S.stage === 'work' && S.money >= 600000 ? 300000 : 0; if (add) KL.moneyAdd(S, -add);
      S.flags.invest = Math.max(0, Math.round(S.flags.invest * (1 + 0.025 + U.gauss() * 0.06) + add));
      if (a >= 65) { KL.moneyAdd(S, S.flags.invest); KL.log(S, '積立投資を受け取った（' + U.yen(S.flags.invest) + '）。', 1); S.flags.invest = 0; }
    }
    // 関係の変化
    S.npcs.forEach(function (n) {
      if (n.rel === 'partner') KL.likeAdd(n, -4);
      else if (n.rel === 'spouse') KL.likeAdd(n, -2);
      else if (n.rel === 'old' || n.rel === 'oldfriend' || n.rel === 'ex') KL.likeAdd(n, -1);
    });
    // 評判の減衰
    S.rep.nat = Math.max(0, S.rep.nat * 0.97 - 0.3);
    S.rep.loc = Math.max(0, S.rep.loc * 0.985);
    S.rep.sch = Math.max(0, S.rep.sch * 0.99);
    // 死亡判定
    if (a >= 60) {
      var p = 0.0016 * Math.exp((a - 60) / 8) * (1.7 - S.st.hp / 100);
      if (S.flags.sick) p *= 2;
      if (U.chance(p) || a >= 110) { KL.die(S); return; }
    }
    // 年表用の記録
    S.history.push({ t: S.t, age: a, st: JSON.parse(JSON.stringify(S.st)), money: S.money, label: KL.stageLabel(S) });
    if (S.history.length > 300) S.history.shift();
    // 時間を進める
    S.t++;
    if (KL.isB(S)) stageTransition(S);
  };

  KL.die = function (S) {
    S.dead = true; S.deathAge = KL.age(S); S.deathYear = KL.year(S);
    KL.log(S, KL.age(S) + '歳で、その生涯を閉じた。', 3);
  };

  function stageTransition(S) {
    var a = KL.age(S);
    if (a === 3) { S.stage = 'kinder'; S.school = KL.PLACE[U.ri(0, KL.PLACE.length - 1)] + '幼稚園'; KL.newCohort(S, '幼稚園'); KL.log(S, S.school + 'に入園した。'); }
    else if (a === 6) { S.stage = 'elem'; S.school = S.pref + '市立' + U.pick(KL.PLACE) + '小学校'; KL.newCohort(S, '小学校'); KL.log(S, S.school + 'に入学した。', 1); }
    else if (a === 12) { S.stage = 'jhs'; S.school = S.nextSchool || (U.pick(KL.PLACE) + '中学校'); S.nextSchool = null; KL.newCohort(S, '中学校'); KL.log(S, S.school + 'に入学した。', 1); }
    else if (a === 15) { S.stage = 'hs'; S.school = S.nextSchool || (U.pick(KL.PLACE) + '高校'); S.nextSchool = null; KL.newCohort(S, '高校'); KL.log(S, S.school + 'に入学した。', 1); }
    else if (a === 18) {
      var plan = S.plan;
      if (S.track === 'soccer' && S.soccer && (S.soccer.club || S.soccer.pending)) plan = 'pro';
      if (S.track === 'idol' && S.idol && S.idol.active) plan = 'idol';
      if (plan === 'univ' && S.nextSchool) { S.stage = 'univ'; S.school = S.nextSchool; KL.newCohort(S, '大学'); KL.log(S, S.school + 'に入学した。', 1); }
      else if (plan === 'senmon') { S.stage = 'senmon'; S.school = '専門学校'; KL.newCohort(S, '専門学校'); KL.log(S, '専門学校に進学した。'); }
      else if (plan === 'work' && S.job) { S.stage = 'work'; KL.newCohort(S, '職場'); KL.log(S, S.job.name + 'に就職した。', 1); }
      else if (plan === 'pro') { S.stage = 'pro'; S.job = null; KL.log(S, 'プロサッカー選手としての人生が始まった。', 2); }
      else if (plan === 'idol') { S.stage = 'idol'; KL.log(S, '高校を卒業し、アイドル活動に専念する。', 1); }
      else { S.stage = 'free'; KL.log(S, '高校を卒業し、フリーターになった。'); }
      S.nextSchool = null;
    }
    else if (a === 20 && S.stage === 'senmon') {
      if (S.job) { S.stage = 'work'; KL.newCohort(S, '職場'); KL.log(S, S.job.name + 'に就職した。', 1); } else { S.stage = 'free'; }
    }
    else if (a === 22 && S.stage === 'univ') {
      if (S.track === 'soccer' && S.soccer && (S.soccer.club || S.soccer.pending)) { S.stage = 'pro'; S.job = null; KL.log(S, '大学を卒業し、プロの世界へ。', 2); }
      else if (S.job) { S.stage = 'work'; KL.newCohort(S, '職場'); KL.log(S, '大学を卒業し、' + S.job.name + 'に就職した。', 1); }
      else { S.stage = 'free'; KL.log(S, '大学を卒業したが、就職は決まらなかった。'); }
    }
    if (a === 65 && S.stage === 'work') { S.stage = 'retired'; KL.log(S, '定年退職を迎えた。', 1); S.flags.richPension = S.job && S.job.title >= 3; }
  }

  // ---------- 人生の総括 ----------
  KL.lifeScore = function (S) {
    var sc = 0;
    sc += Math.min(90, S.titles.length * 6);
    sc += Math.min(40, Math.max(0, S.money) / 2e7);
    sc += S.rep.nat * 0.4 + S.rep.loc * 0.2;
    sc += S.kids.length * 6 + (S.spouseId ? 10 : 0);
    sc += (S.deathAge || KL.age(S)) * 0.3;
    var bestNpc = S.npcs.filter(function (n) { return n.like >= 75; }).length; sc += bestNpc * 2;
    if (S.soccer) sc += (S.soccer.totalGoals || 0) * 0.1 + (S.soccer.caps || 0) * 0.3;
    if (S.idol) sc += (S.idol.peakFans || 0) / 20000 + (S.idol.annualTop || 0) * 10;
    if (S.job) sc += S.job.title * 4;
    var rank = sc >= 210 ? 'SS' : sc >= 150 ? 'S' : sc >= 100 ? 'A' : sc >= 65 ? 'B' : sc >= 40 ? 'C' : 'D';
    return { score: Math.round(sc), rank: rank };
  };
  KL.lifeTitle = function (S) {
    var so = S.soccer, id = S.idol;
    if (so && so.ballon) return 'バロンドーラー';
    if (so && so.wcWin) return 'W杯を掲げた男';
    if (so && so.caps >= 50) return '日本代表のレジェンド';
    if (so && so.europe) return '海外で戦い抜いたサッカー選手';
    if (so && so.proYears) return 'プロサッカー選手として生きた人';
    if (id && id.annualTop) return '日本一愛されたアイドル';
    if (id && id.centerCount >= 2 && id.peakFans > 500000) return '国民的アイドル';
    if (id && id.debuted) return 'アイドルとして輝いた人';
    if (S.job && S.job.title >= 6) return '社長まで上りつめた人';
    if (S.job && S.job.title >= 4) return '組織を支えた人';
    if (S.kids.length >= 3) return '大家族の大黒柱';
    if (S.spouseId && S.kids.length) return '家族に囲まれた幸せな人生';
    if (S.st.int >= 85) return '知の人';
    return '自分らしく生きた人';
  };

  // ---------- セーブ ----------
  KL.SAVE_KEY = 'kaniLife.save.v1';
  KL.HALL_KEY = 'kaniLife.hall.v1';
  KL.save = function (S) {
    try { var c = {}; for (var k in S) if (k.charAt(0) !== '_') c[k] = S[k]; localStorage.setItem(KL.SAVE_KEY, JSON.stringify(c)); return true; } catch (e) { return false; }
  };
  KL.load = function () { try { var s = localStorage.getItem(KL.SAVE_KEY); return s ? KL.migrate(JSON.parse(s)) : null; } catch (e) { return null; } };
  // 古いセーブの補正：不具合で恋愛対象と違う性別になった恋人などを直す
  KL.migrate = function (S) {
    if (!S || !S.npcs) return S;
    if (S.loveSex !== 'any') [S.partnerId, S.spouseId, S.crushId].forEach(function (id) {
      var n = KL.npc(S, id); if (!n || n.sex === S.loveSex) return;
      n.sex = S.loveSex; n.name = n.name.split(' ')[0] + ' ' + U.pick(n.sex === 'm' ? KL.NAMES.m : KL.NAMES.f);
      n.vt = U.pick(KL.PROF.vt[n.sex]); n.ht = n.sex === 'm' ? U.ri(163, 186) : U.ri(148, 170);
    });
    S.npcs.forEach(function (n) { KL.ensureProfile(S, n); });
    return S;
  };
  KL.clearSave = function () { try { localStorage.removeItem(KL.SAVE_KEY); } catch (e) { } };
  KL.hall = function () { try { return JSON.parse(localStorage.getItem(KL.HALL_KEY) || '[]'); } catch (e) { return []; } };
  KL.addHall = function (S) {
    try {
      var h = KL.hall(), r = KL.lifeScore(S);
      h.unshift({ name: S.sei + ' ' + S.mei, age: S.deathAge, title: KL.lifeTitle(S), rank: r.rank, score: r.score, when: Date.now() });
      localStorage.setItem(KL.HALL_KEY, JSON.stringify(h.slice(0, 30)));
    } catch (e) { }
  };
})();

/* Kani Life - 周りの声（モブの評価） */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U;
  function rng(seed) { var x = seed % 2147483647; if (x <= 0) x += 2147483646; return function () { x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
  function fill(t, d) { return t.replace(/\{(\w+)\}/g, function (m, k) { return d[k] !== undefined ? d[k] : ''; }); }

  // 実際に登場している人物から話し手を選ぶ
  function speakers(S) {
    var a = KL.age(S), place = KL.stageLabel(S), out = [];
    S.npcs.forEach(function (n) {
      if (n.dead) return;
      var lbl = null;
      if (KL.isStudent(S) && (n.rel === 'classmate' || n.rel === 'friend') && n.since >= S.t - 7) lbl = n.role === 'rival' ? 'ライバルの' : n.role === 'crush' ? '' : '同じクラスの';
      if (S.stage === 'work' && (n.rel === 'colleague' || (n.met === '職場' || n.met === '会社の同期'))) lbl = '同僚の';
      if (n.rel === 'teammate') lbl = 'チームメイトの';
      if (n.rel === 'best') lbl = '親友の';
      if (n.role === 'osana' && a >= 6) lbl = '幼なじみの';
      if (lbl !== null) out.push({ lbl: lbl, n: n });
    });
    return out;
  }

  // [条件, 話し手, セリフ候補, 重み] ※話し手が '@' で始まると実在の人物から選ぶ
  function bank(S) {
    var a = KL.age(S), st = S.st, m = KL.mote(S), so = S.soccer, id = S.idol, stu = KL.isStudent(S), pt = KL.partner(S), sp = !!S.spouseId;
    var school = ['elem', 'jhs', 'hs'].indexOf(S.stage) >= 0, B = [];
    function v(c, who, lines, w) { if (c) B.push({ who: who, lines: lines, w: w || 1 }); }
    // ---- 幼少期 ----
    v(a < 6, '近所のおばちゃん', ['{mei}{kun}、また大きくなったねぇ', 'あら{mei}{kun}、今日も元気ね！', 'お母さんにそっくりになってきたわね'], 2);
    v(a < 6, '保育士さん', ['お昼寝の時間だけは、一番に寝ちゃうんです', '{mei}{kun}、今日は自分でお着替えできました', 'お友達におもちゃを貸してあげられました'], 1);
    v(a < 6 && st.ath >= 25, '保育士さん', ['かけっこはいつも一番なんですよ', '鉄棒の逆上がり、もうできるんです'], 2);
    v(a < 6 && st.com >= 25, '幼稚園の先生', ['お友達の輪の真ん中にいる子です', '新しく来た子にも、一番に声をかけてくれました'], 2);
    v(a < 6 && st.look >= 40, '公園のママ友', ['あそこの子、ほんとにかわいいのよ', '将来モテるわよ〜、あの子'], 2);
    // ---- 小中高 ----
    v(school && st.int >= 65, '担任の先生', ['成績は文句なし。将来が楽しみです', '質問の鋭さに、こちらが驚かされます', 'このままいけば、難関校も十分狙えます'], 2);
    v(school && st.int < 35, '担任の先生', ['もう少し宿題をやってきてくれたら…', '授業中、窓の外ばかり見ているな', 'やればできる子なんですけどね'], 2);
    v(school && st.ath >= 65 && S.track !== 'soccer', '体育の先生', ['運動部に入らないのはもったいない', '体力テスト、学年トップだったぞ'], 2);
    v(school && a >= 9, '@', ['{mei}って、なんかいいやつだよな', '昨日の{mei}の話、めっちゃ笑った', 'テスト前、ノート見せてくれて助かった', '{mei}と同じ班でよかった〜'], 2);
    v(school && a >= 10 && m >= 72, '@', ['{he}ってモテるよね。今月もう何回目の告白？', '{mei}の下駄箱、また手紙入ってたらしいよ', '他のクラスの子が{mei}のこと見に来てた'], 3);
    v(school && a >= 10 && m >= 55 && m < 72, '@', ['正直ちょっといいなって思ってる', '{mei}って、話すと意外と面白いよね', '最近ちょっとかっこよく（かわいく）なった？'], 2);
    v(school && a >= 10 && m < 40, '@', ['いい人なんだけどね〜', '{mei}？ 話したことないかも…', 'あんまり目立たないよね'], 1);
    v(school && a >= 10 && st.com >= 65, '隣のクラスの子', ['誰とでも仲良いよね、{he}', '{mei}がいるとクラスが明るい', '休み時間はいつも人に囲まれてる'], 2);
    v(school && a >= 12 && st.look >= 75, '後輩', ['先輩、マジでかっこいい（かわいい）って噂ですよ', '先輩と同じ部活に入りたくて…！'], 2);
    v(school && a >= 12 && !!S.flags.clubName && !S.flags.clubRetired, '@', ['{club}は{mei}がいないと始まらない', '{club}の練習、今日も最後まで残ってたな', '夏の大会、絶対勝とうな'], 2);
    v(school && S.flags.clubRole === '部長', '部活の後輩', ['部長、厳しいけど優しいんです', '部長の「行くぞ！」で気合い入ります'], 2);
    v(school && a >= 13 && !!pt, '@', ['{partner}と付き合ってるってマジ？', '{mei}と{partner}、お似合いだよね', '昨日、{partner}と一緒に帰ってたでしょ'], 2);
    v(school && a >= 12 && S.rep.sch >= 50, '他校の生徒', ['{school}の{sei}って知ってる？', '{sei}って人、うちの学校でも有名だよ'], 2);
    v(S.stage === 'jhs' && a >= 13, '@', ['最近{mei}、ちょっと大人っぽくなったよな', '修学旅行、同じ部屋がいいな'], 1);
    v(S.stage === 'hs' && a >= 16, '@', ['進路どうすんの？', '卒業したらみんなバラバラか…', '{mei}は将来なにになるんだろうね'], 1);
    // ---- 大学 ----
    v(S.stage === 'univ', 'サークルの先輩', st.com >= 60 ? ['飲み会に{mei}がいると盛り上がる', '次の幹事、{mei}に任せたいな'] : ['真面目でいい後輩だよ', '{mei}は黙々とやるタイプだね'], 2);
    v(S.stage === 'univ', '同じ学部の友達', ['今日の1限、代返しといたぞ', 'レポートの締め切り、明日だっけ？', 'バイト先の店長が面白くてさ'], 1);
    v(S.stage === 'univ' && st.int >= 70, 'ゼミの教授', ['院に来ないか、と本気で思っています', 'あなたの卒論は面白くなりそうだ'], 2);
    // ---- 社会人 ----
    v(S.stage === 'work' && !!S.job, '@', ['{sei}さん、今日ランチ行きません？', 'この前の資料、わかりやすかったです', '{sei}さんがいると現場が回るんだよな'], 2);
    v(S.stage === 'work' && S.job && S.job.perf >= 60, '同僚', ['仕事、早いし正確なんだよな', 'あの案件、{sei}さんじゃなきゃ無理だった', '次の昇進、{sei}さんらしいよ'], 2);
    v(S.stage === 'work' && S.job && S.job.perf < 35, '上司', ['最近ちょっと元気ないな、大丈夫か？', '報告はもう少し早めに頼むよ', '焦らなくていい。一個ずつやっていこう'], 2);
    v(S.stage === 'work' && S.job && S.job.title >= 3, '部下', ['{sei}さんのチームで良かったです', '{sei}課長、相談乗ってもらえて助かりました'], 2);
    v(S.stage === 'work' && S.job && S.job.title >= 5, '業界紙の記者', ['次の社長候補との呼び声も高い', '業界の常識を変えた人物だ'], 2);
    v(S.stage === 'work' && m >= 65 && !sp, '同じフロアの社員', ['あの人、独身らしいよ…！', '{sei}さんって彼女（彼氏）いるのかな'], 2);
    v(S.stage === 'free' && !S.talent, '親戚のおじさん', ['そろそろちゃんと就職したらどうだ', '若いうちはいろいろやってみればいい'], 2);
    v(a >= 27 && a < 45 && !sp, '母', ['いい人はいないの？', '孫の顔が見たいなぁ…なんてね', 'ちゃんとご飯食べてる？'], 2);
    v(a >= 22 && a < 60 && !!S.flags.car, '友人', ['{car}、乗せてくれよ', 'ドライブ行こうぜ'], 1);
    v(sp && a >= 25 && a < 60, '友人', ['{partner}さんと仲良くていいなぁ', '夫婦円満の秘訣、教えてくれよ'], 1);
    v(S.kids.length && a < 60, 'ママ友・パパ友', ['お子さん、しっかりしてますよね', '運動会で一番目立ってましたよ'], 1);
    v(!!S.flags.hobby && a >= 25, '趣味仲間', ['今度の{hobby}、いつにする？', '{mei}さん、{hobby}の腕上がったよね'], 1);
    v(a >= 22 && S.money >= 1e8, '銀行の担当者', ['資産運用のご相談、いつでもどうぞ', 'いつもありがとうございます'], 1);
    // ---- サッカー ----
    if (so && !so.retired) {
      var last = so.seasons[so.seasons.length - 1], g = last ? last.goals : 0, club = so.club ? KL.Soccer.club(S) : null;
      var d = KL.Soccer.ovr(so) - KL.Soccer.E(a);
      v(!club && a >= 8 && d >= 6, 'コーチ', ['こいつは本物になるかもしれない', '教えることがもうあまりない', 'プロのスカウトが見に来てたぞ'], 3);
      v(!club && a >= 12 && d >= 4, '他校の監督', ['#{num}には要注意だ', 'あの{pos}をどう止めるかが鍵だ'], 2);
      v(!club && a >= 15 && so.scout > 40, 'Jクラブのスカウト', ['ずっと追いかけています', '卒業後のこと、一度お話しさせてください'], 3);
      v(!club && a >= 9, '@', ['{mei}のシュート、マジで止められん', '今度の試合、{mei}がいれば勝てる', '練習のあと、一緒にボール蹴ろうぜ'], 2);
      v(!!club, 'サポーター', ['#{num} {sei}！今日も頼むぞ！', '{sei}のユニフォーム買っちゃった', '{sei}のチャント、もう歌えるよ', 'スタジアムで{sei}コール聞くと泣ける'], 2);
      v(!!club && g >= 20, 'ネットの声', ['今季{goals}点はえぐすぎる', '{sei}、また決めたのかよ', '{sei}が出る試合は全部見てる'], 3);
      v(!!club && g >= 30, '海外メディア', ['今、欧州で最も危険なストライカーだ', '{club}の{num}番は別次元だ'], 3);
      v(!!club && last && last.apps < 10, 'ネットの声', ['{sei}もっと使えよ監督', '{sei}、ベンチ温めすぎ問題', '移籍した方がいいんじゃない？'], 2);
      v(!!club && last && last.rating && last.rating < 6.5, '辛口解説者', ['今の{sei}では物足りない', 'もっとゴールに向かってほしいですね'], 2);
      v(!!club && KL.LEAGUES[club.l].europe, '現地メディア', ['日本から来た{sei}は本物だ', '{club}のファンは{sei}を愛している'], 2);
      v(!!club && !!so.badges && so.badges.length >= 3, '解説者', ['{sei}は「{badge}」としても有名ですね', 'ここ一番での勝負強さが違います'], 2);
      v(so.ntNow, '日本代表監督', ['彼は今の日本に欠かせない', '代表のエースは{sei}だ'], 3);
      v(so.ntNow, '小学生', ['大きくなったら{sei}選手みたいになる！', '{sei}選手のサインもらった！'], 2);
      v(so.ballon, '海外のレジェンド', ['彼は今、世界で最高の選手だ', 'メッシやロナウドと並ぶ存在になった'], 5);
      v(!!club && so.contract <= 0, 'サッカー記者', ['去就が注目されている', 'ビッグクラブが獲得に動いているらしい'], 2);
      v(!!club && m >= 60, 'スポーツ紙', ['人気急上昇、女性ファンも急増中', '{sei}の私服がおしゃれと話題'], 1);
      v(!!club, '@', ['{sei}、今日の練習キレてたな', 'あのパス、よく見えてたな', '次の試合も頼むぜ'], 2);
    }
    // ---- アイドル ----
    if (id && id.active) {
      v(id.status === 'trainee', 'ファン', ['研究生の中で一番応援してる！', '{mei}ちゃん、絶対売れる', '公演で目が合った（気がする）'], 2);
      v(id.status === 'center', 'ファン', ['センターの{mei}が尊すぎる', '{mei}がセンターの曲、毎日聴いてる', 'センター{mei}、天下取ってくれ'], 3);
      v(id.status === 'senbatsu', '音楽番組のMC', ['最近よく見かけますね！', '今日も元気いっぱいですね〜'], 2);
      v(id.status === 'member', 'ファン', ['いつか選抜に入ってほしい…！', '{mei}推しです。ずっと応援してる'], 2);
      v(id.fans >= 300000, 'ネットの声', ['ビジュアル強すぎて息できない', '{mei}が出てるだけで番組見ちゃう', '{group}で一番好き'], 2);
      v(true, 'アンチ', id.sk.sing < 60 ? ['歌はまだまだでしょ', '顔だけでしょ'] : ['ちょっと調子乗ってない？', '前の方が好きだった'], id.sk.sing < 60 ? 2 : 0.4);
      v(id.annualTop, '週刊誌', ['今、日本で一番売れているアイドル', '{mei}、CM女王（王）の座も射程圏内'], 4);
      v(!!S.flags.actor, 'ドラマ評論家', ['演技力はアイドルの域を超えている', '主演作が待たれる'], 2);
      v(true, '{group}のメンバー', ['{mei}、今日のダンス揃ってたよ', '次のシングルも一緒に頑張ろうね', '楽屋で{mei}の話になってたよ'], 1);
    }
    // ---- 老後 ----
    v(a >= 65, '近所の子ども', [S.sex === 'm' ? 'おじいちゃん、また遊ぼ！' : 'おばあちゃん、また遊ぼ！', '昔の話、また聞かせて！'], 2);
    v(a >= 65 && !!S.flags.mago, '孫', ['じいじ（ばあば）大好き！', 'お年玉ありがとう！', 'また一緒にお出かけしようね'], 3);
    v(a >= 65 && st.hp < 30, '家族', ['最近ちょっと疲れやすいみたい…', '無理しないでね'], 2);
    v(a >= 22 && st.hp < 30 && a < 65, '友人', ['顔色悪いけど、ちゃんと寝てる？', 'たまには休めよ'], 2);
    v(S.rep.nat >= 60 && !so && !id, 'ネットの声', ['最近テレビでよく見る人だ', '{sei}って誰？ってなってる'], 2);
    v(!!S.talent, 'テレビ局のスタッフ', ['{talent}としての評判も上々です', '{sei}さんがいると現場が和みます'], 2);
    return B;
  }

  // 直近の出来事への反応
  var REACT = [
    [/付き合い始めた/, ['@', ['{partner}と付き合い始めたってほんと！？', 'おめでとう！ どっちから告白したの？', 'えー、いいなぁ…']]],
    [/と別れた/, ['@', ['最近元気ないね。何かあった？', '話ならいつでも聞くよ', 'もっといい人がいるって']]],
    [/結婚した/, ['友人', ['結婚おめでとう！ 式には呼んでね', 'ついに結婚かぁ。幸せになれよ！']]],
    [/が生まれた/, ['友人', ['赤ちゃん、写真見せてよ！', 'パパ（ママ）になったんだね！']]],
    [/合格/, ['@', ['合格おめでとう！', 'さすがだな、本当に受かるとは！']]],
    [/入学した|入園した/, ['近所のおばちゃん', ['制服、似合ってるわよ〜', 'もう{grade}？ 早いわねぇ']]],
    [/優勝|日本一|制覇/, ['@', ['優勝おめでとう！ テレビで見てたよ', '鳥肌立った。本当にすごいよ']]],
    [/加入|移籍|入団/, ['ネットの声', ['新天地でも頑張れ！', '{club}入りは熱い', 'ユニフォーム姿が新鮮']]],
    [/昇進/, ['同僚', ['昇進おめでとうございます！', '次は部長ですね']]],
    [/就職した/, ['母', ['スーツ姿、立派になったね', '体に気をつけて頑張りなさい']]],
    [/バロンドール/, ['小学生', ['{sei}選手みたいになりたい！', '世界一ってすごすぎる！']]],
    [/デビュー/, ['ファン', ['デビューおめでとう！ ずっと応援してる', 'やっと夢が叶ったね']]],
    [/引退|卒業した/, ['ファン', ['今まで本当にありがとう', '次の人生も応援してる']]],
    [/特殊能力/, ['解説者', ['{sei}は「{badge}」ですね。見ていて分かります']]]
  ];

  KL.mobVoices = function (S) {
    var a = KL.age(S), so = S.soccer, id = S.idol, pt = KL.partner(S);
    var club = so && so.club ? KL.Soccer.club(S).n : (so ? so.team : '');
    var dd = {
      mei: S.mei, sei: S.sei, kun: S.sex === 'm' ? 'くん' : 'ちゃん', he: S.sex === 'm' ? 'あいつ' : 'あの子',
      partner: pt ? (pt.name.split(' ')[1] || pt.name) : '', club: club || '', num: so && so.num ? so.num : '', pos: so ? KL.Soccer.POS[so.pos].jp : '',
      goals: so && so.seasons.length ? so.seasons[so.seasons.length - 1].goals : 0, school: S.school || '', group: id ? id.groupName : '',
      talent: S.talent || '', car: S.flags.car || '車', hobby: S.flags.hobby || '趣味', badge: so && so.badges && so.badges.length ? KL.Soccer.badgeName(so.badges[so.badges.length - 1]) : '',
      clubName: S.flags.clubName || '', grade: KL.stageLabel(S)
    };
    dd.club = dd.club || dd.clubName;
    var r = rng(S.t * 7919 + (S.sei + S.mei).length * 131 + 17);
    var sp = speakers(S), used = {}, out = [];
    function speaker(who) {
      if (who !== '@') return { who: fill(who, dd) };
      var c = sp.filter(function (x) { return !used['n' + x.n.id]; });
      if (!c.length) return { who: KL.isStudent(S) ? '同じクラスの子' : S.stage === 'work' ? '同僚' : '友人' };
      var x = c[Math.floor(r() * c.length)]; used['n' + x.n.id] = 1;
      return { who: x.lbl + x.n.name, npc: x.n.id };
    }
    // 1) 直近の出来事への反応（あれば1つ）
    var recent = S.log.filter(function (l) { return l.t >= S.t - 2; }).map(function (l) { return l.text; }).join('\n');
    for (var i = 0; i < REACT.length && out.length < 1; i++) {
      if (REACT[i][0].test(recent)) { var sk = speaker(REACT[i][1][0]), ls = REACT[i][1][1]; out.push({ who: sk.who, npc: sk.npc, text: fill(ls[Math.floor(r() * ls.length)], dd) }); used[sk.who] = 1; }
    }
    // 2) 立場・能力に応じた声
    var pool = bank(S).filter(function (x) { return x.w > 0; });
    var want = a < 6 ? 2 : 4;
    while (out.length < want && pool.length) {
      var tot = pool.reduce(function (t, x) { return t + x.w; }, 0), q = r() * tot, j = 0;
      for (; j < pool.length; j++) { q -= pool[j].w; if (q <= 0) break; }
      j = Math.min(j, pool.length - 1);
      var e = pool.splice(j, 1)[0];
      if (e.who !== '@' && used[e.who]) continue;
      var s2 = speaker(e.who); used[s2.who] = 1;
      var line = fill(e.lines[Math.floor(r() * e.lines.length)], dd);
      if (/\{/.test(line) || /^\s*$/.test(line)) continue;
      out.push({ who: s2.who, npc: s2.npc, text: line });
    }
    if (!out.length) out.push({ who: '近所の人', text: '感じのいい人ですよ' });
    return out;
  };
})();
