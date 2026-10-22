/* Kani Life - 恋愛・家族・知り合いの近況 */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U, E = KL.EVENTS;
  var L = KL.Love = {};
  function age(S) { return KL.age(S); }
  function first(n) { return n ? (n.name.split(' ')[1] || n.name) : ''; }
  function prof(S, n) { return '（' + KL.profileLine(S, n) + '）'; }

  // ======================================================
  //  知り合いの人生（毎年すこしずつ進む）
  // ======================================================
  L.CITIES = ['東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '横浜', '京都', '神戸', '広島', '沖縄', 'シンガポール', 'ロンドン', 'ニューヨーク'];
  L.important = function (S) {
    return S.npcs.filter(function (n) {
      return !n.dead && (n.id === S.partnerId || n.id === S.spouseId || n.id === S.crushId || ['best', 'friend', 'oldfriend', 'ex', 'teammate'].indexOf(n.rel) >= 0 || n.role === 'osana');
    }).slice(-14);
  };
  function news(S, n, text, imp) {
    n.hist = n.hist || []; n.hist.push({ y: KL.year(S), text: text }); if (n.hist.length > 12) n.hist.shift();
    S.news = S.news || []; S.news.push({ t: S.t, id: n.id, text: n.name + 'が' + text, imp: imp || 0 }); if (S.news.length > 40) S.news.shift();
  }
  L.news = news;
  L.npcYear = function (S, n) {
    KL.ensureProfile(S, n);
    var a = KL.npcAge(S, n), mine = n.id === S.partnerId || n.id === S.spouseId;
    if (a === 18 && !n.edu) { n.edu = U.pick(['東京の大学', '地元の大学', '専門学校', '就職']); if (n.edu === '就職') { n.job = U.pick(KL.PROF.jobs[n.sex || 'f']); news(S, n, '高校を出て' + n.job + 'として働き始めた'); } else news(S, n, n.edu + 'に進学した'); return; }
    if (a === 22 && !n.jobSet) { n.jobSet = true; n.job = n.job && n.job !== '大学生' ? n.job : U.pick(KL.PROF.jobs[n.sex || 'f']); n.city = n.city || U.pick(L.CITIES.slice(0, 11)); news(S, n, n.city + 'で' + n.job + 'として就職した'); return; }
    if (a < 23) return;
    if (!mine && !n.married && a >= 24 && a <= 40 && U.chance(0.1)) { n.married = true; news(S, n, '結婚した', 1); if (['best', 'friend', 'oldfriend'].indexOf(n.rel) >= 0 || n.role === 'osana') S._invite = n.id; if (n.id === S.crushId) S.crushId = null; return; }
    if ((n.married || n.id === S.spouseId) && !mine && a <= 42 && U.chance(0.14)) { n.kidsN = (n.kidsN || 0) + 1; news(S, n, (n.kidsN === 1 ? '親になった。第一子が生まれたらしい' : n.kidsN + '人目の子どもが生まれた')); return; }
    if (a >= 60 && !n.retired && U.chance(0.3)) { n.retired = true; n.job = '年金暮らし'; news(S, n, '定年退職した'); return; }
    if (a > 58) return;
    var r = Math.random();
    if (r < 0.05) { var j = U.pick(KL.PROF.jobs[n.sex || 'f']); if (j !== n.job) { n.job = j; news(S, n, j + 'に転職した'); } }
    else if (r < 0.09) { n.pos = (n.pos || 0) + 1; news(S, n, ['主任', '係長', '課長', '部長', '役員'][Math.min(4, n.pos - 1)] + 'に昇進した'); }
    else if (r < 0.12) { var c = U.pick(L.CITIES); if (c !== n.city) { n.city = c; news(S, n, c + 'に引っ越した'); } }
    else if (r < 0.14) { n.job = '経営者'; news(S, n, '起業して社長になった', 1); }
    else if (r < 0.155) { n.city = U.pick(L.CITIES.slice(11)); news(S, n, n.city + 'に海外赴任になった'); }
  };
  // 恋人・配偶者の「最近」
  L.NOW = [
    function (S, n) { return '最近は' + n.hobby + 'にハマっている'; },
    function (S, n) { return '仕事が繁忙期で、ちょっと疲れ気味'; },
    function (S, n) { return '資格の勉強を始めたらしい'; },
    function (S, n) { return '友達と旅行に行って、お土産をくれた'; },
    function (S, n) { return '新しい料理のレシピに挑戦中'; },
    function (S, n) { return '職場で大きな仕事を任されて張り切っている'; },
    function (S, n) { return 'あなたの' + (S.track === 'soccer' ? '試合' : S.track === 'idol' ? 'ライブ' : '話') + 'を楽しみにしている'; },
    function (S, n) { return '最近ジムに通い始めた'; },
    function (S, n) { return '昔の友達と久しぶりに会ったらしい'; },
    function (S, n) { return '気になる映画をリストにまとめている'; },
    function (S, n) { return n.like >= 70 ? 'あなたのことを周りに自慢しているらしい' : n.like < 40 ? '最近ちょっとそっけない' : '変わらず元気にしている'; }
  ];
  L.nowOf = function (S, n) {
    if (!n) return '';
    if (n.dead) return '';
    var a = KL.npcAge(S, n);
    if (a < 18) return KL.npcJob(S, n) + '。' + (a >= 12 ? '部活と勉強で忙しそう' : '毎日元気に遊んでいる');
    var seed = Math.abs(Math.sin(S.t * 31 + n.id * 7)), f = L.NOW[Math.floor(seed * L.NOW.length)];
    var base = (n.city ? n.city + 'で' : '') + KL.npcJob(S, n);
    return base + '。' + f(S, n);
  };
  L.statusOf = function (S, n) { // 知り合い一覧用の短い近況
    var a = KL.npcAge(S, n), bits = [];
    if (n.dead) return '故人';
    bits.push((n.city && a >= 22 ? n.city + '・' : '') + KL.npcJob(S, n));
    if (n.married && n.id !== S.spouseId) bits.push('既婚');
    if (n.kidsN) bits.push('子ども' + n.kidsN + '人');
    return bits.join('・');
  };

  // ======================================================
  //  子ども
  // ======================================================
  L.ensureKid = function (S, k, i) {
    if (k.tal) return k;
    k.id = 9000 + i; k.tal = {};
    var sp = KL.npc(S, S.spouseId);
    KL.STATS.forEach(function (s) { var p = S.tal[s.k] || 3; k.tal[s.k] = U.clamp(Math.round((p + U.ri(2, 4)) / 2 + U.gauss() * 0.6), 1, 5); });
    if (sp && sp.look >= 75) k.tal.look = Math.min(5, k.tal.look + 1);
    k.vt = U.pick(KL.PROF.vt[k.sex]); k.pers = U.pick(KL.PROF.pers); k.hist = k.hist || [];
    k.dream = S.soccer && S.soccer.proYears && k.tal.ath >= 4 ? 'soccer' : (S.idol && S.idol.debuted && k.tal.look >= 4 ? 'idol' : '');
    return k;
  };
  function kidNews(S, k, text, imp) { k.hist.push({ y: KL.year(S), text: text }); S.news = S.news || []; S.news.push({ t: S.t, kid: true, text: S.sei + ' ' + k.name + '（' + (k.sex === 'm' ? '息子' : '娘') + '）が' + text, imp: imp || 0 }); if (S.news.length > 40) S.news.shift(); KL.line(S, '👪 ' + k.name + 'が' + text); }
  L.kidYear = function (S, k, i) {
    L.ensureKid(S, k, i);
    var a = Math.floor((S.t - k.born) / 2), t = k.tal;
    if (a === 3) kidNews(S, k, '幼稚園に入園した');
    if (a === 6) kidNews(S, k, '小学校に入学した。ランドセル姿がまぶしい');
    if (a === 9) {
      if (k.dream === 'soccer') { k.club = 'サッカー少年団'; kidNews(S, k, 'サッカー少年団に入った。親譲りのボールさばきで、もうエース候補だ', 1); }
      else k.club = U.pick(['スイミング', 'ピアノ', '野球', 'ダンス', 'そろばん', '空手']);
    }
    if (a === 12) { k.club = k.dream === 'soccer' ? (t.ath >= 5 ? 'Jクラブのジュニアユース' : 'サッカー部') : U.pick((KL.CLUBS_SPORT || ['バスケ部']).concat(KL.CLUBS_CULTURE || ['吹奏楽部'])); kidNews(S, k, '中学生になった。' + k.club + 'で頑張っている'); }
    if (a === 15) { var hs = t.int >= 5 ? 'トップ進学校' : t.int >= 4 ? '進学校' : t.int >= 3 ? '地元の公立高校' : '地元の高校'; k.hs = hs; kidNews(S, k, hs + 'に合格した'); }
    if (a === 18 && !k.path) {
      if (k.dream === 'soccer' && t.ath >= 4 && U.chance(t.ath >= 5 ? 0.75 : 0.35)) { var c = U.pick(KL.CLUBS.filter(function (x) { return x.l === 'J1' || x.l === 'J2'; })); k.path = 'pro'; k.job = 'プロサッカー選手（' + c.n + '）'; kidNews(S, k, c.n + 'に入団し、プロサッカー選手になった！ 親子二代のプロだ', 2); KL.title(S, '親子二代のプロサッカー選手'); }
      else if (k.dream === 'idol' && t.look >= 4 && U.chance(0.5)) { k.path = 'idol'; k.job = 'アイドル'; kidNews(S, k, 'オーディションに合格して、アイドルとしてデビューした！', 2); }
      else { var u = t.int >= 5 ? '最難関国立大' : t.int >= 4 ? '難関私大' : t.int >= 3 ? '有名私大' : U.pick(['地元の大学', '専門学校', '就職']); k.path = u; kidNews(S, k, u === '就職' ? '高校を卒業して就職した' : u + 'に進学した'); if (u === '就職') k.job = U.pick(KL.PROF.jobs[k.sex]); }
    }
    if (a === 22 && !k.job) { k.job = U.pick(KL.PROF.jobs[k.sex]); kidNews(S, k, k.job + 'として社会人になった'); }
    if (a >= 30 && k.married && !k.kidsN && U.chance(0.3)) { k.kidsN = 1; }
  };
  L.kidStatus = function (S, k) {
    var a = Math.floor((S.t - k.born) / 2);
    if (k.job && a >= 18) return k.job + (k.married ? '・既婚' : '');
    if (a < 3) return '赤ちゃん'; if (a < 6) return '幼稚園児'; if (a < 12) return '小学' + (a - 5) + '年' + (k.club ? '・' + k.club : '');
    if (a < 15) return '中学' + (a - 11) + '年' + (k.club ? '・' + k.club : ''); if (a < 18) return (k.hs || '高校') + (a - 14) + '年';
    return k.path || '学生';
  };

  // ======================================================
  //  毎ターンの処理（runTurn から呼ばれる）
  // ======================================================
  L.turn = function (S) {
    if (KL.isB(S)) { // 1年に1回
      L.important(S).forEach(function (n) { L.npcYear(S, n); });
      S.kids.forEach(function (k, i) { L.kidYear(S, k, i); });
      var fresh = (S.news || []).filter(function (x) { return x.t === S.t && !x.kid; });
      fresh.slice(0, 3).forEach(function (x) { KL.line(S, '📱 ' + x.text); });
    }
  };

  // ======================================================
  //  恋愛イベント
  // ======================================================
  function P(S) { return KL.partner(S); }
  function dating(S) { return !!S.partnerId && !!P(S); }
  L.PLACES = ['遊園地', '水族館', 'カフェ巡り', '映画', '夜景ドライブ', '美術館', 'キャンプ', '温泉', 'ショッピング', 'おうちで手料理', 'カラオケ', 'ボウリング'];
  L.LIKES = { '明るくて元気': ['遊園地', 'カラオケ', 'ボウリング'], 'おっとり癒し系': ['カフェ巡り', '温泉', '水族館'], 'クールで落ち着いてる': ['美術館', '映画', '夜景ドライブ'], 'しっかり者': ['ショッピング', '美術館'], 'ツンデレ': ['遊園地', '映画'], '天然': ['水族館', 'カフェ巡り'], '甘えん坊': ['おうちで手料理', '映画'], '面倒見がいい': ['キャンプ', 'おうちで手料理'], '真面目で一途': ['水族館', '美術館'], 'ミステリアス': ['夜景ドライブ', '美術館'], '負けず嫌い': ['ボウリング', 'カラオケ'], 'よく笑う': ['遊園地', 'カラオケ'], 'マイペース': ['温泉', 'カフェ巡り'], '気配り上手': ['おうちで手料理', 'ショッピング'] };
  E.push({ id: 'l_date', people: function (S) { return [S.partnerId]; }, w: function (S) { return dating(S) ? 3 : 0; }, repeat: true, cond: function (S) { return dating(S) && age(S) >= 13 && age(S) < 70; }, title: 'デートの行き先', icon: '💑',
    text: function (S) { var p = P(S), opts = U.shuffle(L.PLACES).slice(0, 3); if (opts.indexOf(p.hobby) < 0 && U.chance(0.5)) opts[2] = p.hobby; S._dp = opts; return first(p) + 'と週末にデート。どこに行こう？'; },
    choices: [0, 1, 2].map(function (i) {
      return { t: function (S) { return S._dp ? S._dp[i] : ''; }, req: function (S) { return S._dp && S._dp[i]; }, fx: function (S) {
        var p = P(S); if (!p) return 'デートの予定は流れてしまった。'; var pl = S._dp[i], like = (L.LIKES[p.pers] || []).indexOf(pl) >= 0, hob = pl === p.hobby;
        KL.moneyAdd(S, -(pl === '温泉' || pl === 'キャンプ' ? 30000 : 8000));
        if (hob) { KL.likeAdd(p, 14); return '「' + pl + '、ずっと一緒に行きたかったんだ！」' + first(p) + 'は子どもみたいにはしゃいでいた。'; }
        if (like) { KL.likeAdd(p, 9); return first(p) + 'にぴったりの場所だったみたい。帰り道、手をつなぐ力がいつもより強かった。'; }
        KL.likeAdd(p, 3); return 'まあまあ楽しかった。' + first(p) + 'は' + (p.pers === 'ツンデレ' ? '「別に…楽しかったけど」と言っていた。' : 'もう少し違う場所が好みかもしれない。');
      } };
    }) });
  E.push({ id: 'l_bday', people: function (S) { return [S.partnerId || S.spouseId]; }, w: function (S) { return P(S) ? 1.5 : 0; }, repeat: true, cond: function (S) { var p = P(S); return !!p && !p.dead && age(S) >= 13 && (S.flags.bdayT || -9) <= S.t - 2; }, title: function (S) { return first(P(S)) + 'の誕生日'; }, icon: '🎂',
    text: function (S) { S.flags.bdayT = S.t; return 'もうすぐ' + first(P(S)) + 'の誕生日。プレゼントはどうしよう？'; },
    choices: [
      { t: '手作りのプレゼント', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; var good = /真面目|甘えん坊|面倒見|おっとり|気配り/.test(p.pers); KL.likeAdd(p, good ? 14 : 6); KL.add(S, 'art', 1); return good ? '「一生大事にする」と目をうるませていた。' : '「器用だね〜」と笑っていた。'; } },
      { t: 'ブランドのアクセサリー（5万円）', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; KL.moneyAdd(S, -50000); var good = /クール|しっかり|ミステリアス|大人/.test(p.pers + p.vt); KL.likeAdd(p, good ? 13 : 7); return good ? 'センスがいいと褒められた。毎日つけてくれている。' : '「高かったでしょ…ありがとう」と喜んでくれた。'; } },
      { t: 'サプライズパーティー', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; var good = /明るく|よく笑う|天然|負けず嫌い/.test(p.pers); KL.likeAdd(p, good ? 15 : 5); KL.add(S, 'com', 1); return good ? 'クラッカーの音に飛び上がって、そのあと大笑いしていた。' : 'びっくりしすぎて、少し固まっていた。'; } }
    ] });
  E.push({ id: 'l_jealous', people: function (S) { return [S.partnerId || S.spouseId]; }, w: function (S) { return P(S) && KL.mote(S) >= 55 ? 1.5 + (KL.mote(S) - 55) / 15 : 0; }, repeat: true, cond: function (S) { var p = P(S); return !!p && !p.dead && age(S) >= 14 && age(S) < 60; }, title: 'やきもち', icon: '😤',
    text: function (S) { return '異性と楽しそうに話しているところを、' + first(P(S)) + 'に見られた。「…誰？今の」'; },
    choices: [
      { t: '正直に説明して安心させる', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (KL.chk(S, 'com', 45, 8)) { KL.likeAdd(p, 6); return '「そっか、ならいい」。少し照れたように笑った。'; } KL.likeAdd(p, -4); return '説明すればするほど、言い訳っぽくなってしまった。'; } },
      { t: '「やきもち？」とからかう', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (/ツンデレ|負けず嫌い|明るく/.test(p.pers)) { KL.likeAdd(p, 5); return '「ち、違うし！」。顔が真っ赤だった。'; } KL.likeAdd(p, -8); return '本気で怒らせてしまった…。'; } }
    ] });
  E.push({ id: 'l_ldr', people: function (S) { return [S.partnerId]; }, sched: true, pri: 6, repeat: true, cond: function (S) { var p = KL.npc(S, S.partnerId); var far = (S.soccer && S.soccer.club && KL.LEAGUES[KL.clubById(S.soccer.club).l].europe) || !!S.flags.tenkin; return !!p && far && p.ldrFor !== (S.soccer && S.soccer.club || S.flags.tenkin); }, title: '遠距離恋愛', icon: '✈️',
    text: function (S) { var p = KL.npc(S, S.partnerId); p.ldrFor = S.soccer && S.soccer.club || S.flags.tenkin; return '遠くに住むことになり、' + first(p) + 'とは遠距離になった。時差のある電話で「寂しい」とこぼされた。'; },
    choices: [
      { t: '毎日ビデオ通話する', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (!p) return '…'; KL.likeAdd(p, 4); KL.fatAdd(S, 5); return '画面越しの「おやすみ」が毎日の習慣になった。'; } },
      { t: '「一緒に来てほしい」と伝える', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (!p) return '…'; if (p.like >= 65 && age(S) >= 21) { KL.marry(S, p); return '「…うん、ついていく」。その場で結婚が決まった！'; } KL.likeAdd(p, -6); return '「今の仕事は辞められない」と言われてしまった。'; } },
      { t: 'お互いのために別れる', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (!p) return '…'; p.rel = 'ex'; S.partnerId = null; S.exCount++; KL.add(S, 'men', -5); KL.log(S, p.name + 'と別れた（遠距離）。'); return '最後の電話で、二人とも泣いた。'; } }
    ] });
  E.push({ id: 'l_tempt', w: function (S) { return P(S) && KL.mote(S) >= 60 ? 0.8 + (KL.mote(S) - 60) / 20 : 0; }, repeat: true, cond: function (S) { var p = P(S); return !!p && !p.dead && age(S) >= 20 && age(S) < 55; }, title: '誘惑', icon: '🍷',
    text: function (S) { var n = KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: '飲み会', like: 70, look: U.ri(80, 97), ad: U.ri(-5, 2), rel: 'classmate' }); S._tm = n.id; return '飲み会で' + n.name + prof(S, n) + 'に「このあと二人で飲み直さない？」と誘われた。' + (S.spouseId ? '左手の指輪が、少し重い。' : ''); },
    people: function (S) { return [S._tm]; },
    choices: [
      { t: 'きっぱり断って帰る', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (p) KL.likeAdd(p, 5); KL.add(S, 'men', 2); return '家に帰ると、' + first(p) + 'が起きて待っていてくれた。'; } },
      { t: '一杯だけ付き合う', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (!p) return '…'; if (U.chance(0.35)) { KL.likeAdd(p, -30); KL.add(S, 'men', -4); return 'その夜のことが、なぜか' + first(p) + 'にバレた。信頼を取り戻すには、時間がかかりそうだ…。'; } KL.add(S, 'men', -1); return '何事もなく終わった。…でも、少し後ろめたい。'; } }
    ] });
  E.push({ id: 'l_parents', people: function (S) { return [S.partnerId]; }, w: 2, repeat: true, cond: function (S) { var p = KL.npc(S, S.partnerId); return !!p && !S.spouseId && age(S) >= 22 && S.t - p.since >= 3 && !p.metParents; }, title: '相手の両親に挨拶', icon: '🙇',
    text: function (S) { var p = P(S); p.metParents = true; return first(p) + 'の実家に、挨拶に行くことになった。お父さんは無口な人らしい。'; },
    choices: [
      { t: 'スーツで手土産を持って行く', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (KL.chk(S, (S.st.com + S.st.men) / 2, 45, 8)) { KL.likeAdd(p, 10); p.parentsOk = true; return '最後にお父さんが「娘（息子）を頼む」と頭を下げてくれた。'; } KL.likeAdd(p, 2); return '緊張でお茶をこぼした。でも、お母さんは笑ってくれた。'; } },
      { t: '自然体でいく', fx: function (S) { var p = P(S); if (!p) return 'その話は、また今度になった。'; if (KL.chk(S, 'com', 55, 8)) { KL.likeAdd(p, 10); p.parentsOk = true; return 'お父さんと趣味の話で意気投合した。'; } KL.likeAdd(p, -2); return '少し気まずい空気のまま帰ってきた。'; } }
    ] });
  E.push({ id: 'l_divorce', people: function (S) { return [S.spouseId]; }, sched: true, pri: 5, repeat: true, cond: function (S) { var p = KL.npc(S, S.spouseId); return !!p && !p.dead && p.like < 12; }, title: '夫婦の危機', icon: '💔',
    text: function (S) { return KL.npc(S, S.spouseId).name + 'から「話がある」と言われた。テーブルの上に、一枚の紙が置かれている。'; },
    choices: [
      { t: 'やり直したいと伝える', fx: function (S) { var p = KL.npc(S, S.spouseId); if (KL.chk(S, (S.st.com + S.st.men) / 2, 50, 8)) { KL.likeAdd(p, 25); return '朝まで話し合った。もう一度、二人で頑張ってみることになった。'; } return L.divorce(S, p) + '…気持ちは、もう戻らなかった。'; } },
      { t: '受け入れる', fx: function (S) { return L.divorce(S, KL.npc(S, S.spouseId)); } }
    ] });
  L.divorce = function (S, p) { p.rel = 'ex'; S.spouseId = null; S.exCount++; S.flags.divorced = (S.flags.divorced || 0) + 1; KL.add(S, 'men', -6); KL.moneyAdd(S, -Math.max(0, Math.round(S.money * 0.3))); KL.log(S, p.name + 'と離婚した。', 2); return p.name + 'と離婚した。'; };
  // 友人の結婚式への招待（近況で結婚したとき）
  E.push({ id: 'l_invite', people: function (S) { return [S._invite]; }, sched: true, pri: 7, repeat: true, cond: function (S) { var n = KL.npc(S, S._invite); return !!n && n.inviteDone !== true; }, title: function (S) { return first(KL.npc(S, S._invite)) + 'の結婚式'; }, icon: '💒',
    text: function (S) { var n = KL.npc(S, S._invite); n.inviteDone = true; return n.name + 'から結婚式の招待状が届いた。「スピーチ、お願いできないかな」'; },
    choices: [
      { t: '引き受けて、心を込めて話す', fx: function (S) { var n = KL.npc(S, S._invite); S._invite = null; KL.moneyAdd(S, -30000); KL.likeAdd(n, 15); if (n.like >= 80) n.rel = 'best'; if (KL.chk(S, 'com', 45, 8)) { KL.add(S, 'com', 2); return '昔の思い出話で会場が笑い、最後は' + first(n) + 'が泣いていた。'; } return '噛みまくったけど、気持ちは伝わったみたいだ。'; } },
      { t: '出席だけする', fx: function (S) { var n = KL.npc(S, S._invite); S._invite = null; KL.moneyAdd(S, -30000); KL.likeAdd(n, 5); return '幸せそうな' + first(n) + 'の顔を見て、こっちまで嬉しくなった。'; } }
    ] });
})();
