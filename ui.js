/* Kani Life - 画面 */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U;
  var app = document.getElementById('app');
  var sheet = document.getElementById('sheet');
  var sheetBody = sheet.querySelector('.sheet-body');
  var S = null, alloc = {}, tab = 'home', setup = null, flow = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stars(n, fam) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? (fam && i > n - fam ? '<span class="fam">★</span>' : '★') : '<span class="off">★</span>'; return s; }
  function r0(v) { return Math.round(v); }
  function openSheet(html) { sheetBody.innerHTML = html; sheet.hidden = false; sheetBody.scrollTop = 0; }
  function closeSheet() { sheet.hidden = true; sheetBody.innerHTML = ''; }

  // ================= 似顔絵（SVG） =================
  var HAIR = {
    '清楚系': '#2B2220', 'かわいい系': '#6B4430', '美人系': '#3A2A25', 'ギャル系': '#C49A5A', 'スポーティ': '#4A3326', '大人っぽい': '#5A3A2E', 'ふんわり系': '#9C6B4A', 'クール系美人': '#1E1A1A',
    '爽やか系': '#3B2B22', '塩顔': '#1E1A1A', 'ワイルド': '#2B2220', '王子様系': '#B88A5A', '知的': '#2B2220', '韓国アイドル系': '#D9CFC6', '体育会系': '#1E1A1A'
  };
  var SKIN = ['#F8DCC4', '#F3CBA8', '#EDC19C', '#F6D7C3'];
  var SHIRT = ['#20999C', '#E07A95', '#5B7FD0', '#F2B84B', '#7C6BC4', '#4FA36B', '#E58A55', '#61797F'];
  function hash(n) { var x = Math.sin((n || 1) * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function avatar(n, size) {
    size = size || 40;
    var sx = n.sex || 'm', seed = n.id || (n.name ? n.name.length * 7 : 3);
    var r1 = hash(seed), r2 = hash(seed + 11), r3 = hash(seed + 23);
    var old = n.old;
    var hair = old ? '#B9B4AE' : (HAIR[n.vt] || (sx === 'f' ? '#4A3326' : '#2B2220'));
    var skin = SKIN[Math.floor(r1 * SKIN.length)], shirt = SHIRT[Math.floor(r2 * SHIRT.length)];
    var g = '';
    // 体
    g += '<path d="M10 64 Q10 49 32 49 Q54 49 54 64Z" fill="' + shirt + '"/>';
    // 後ろ髪
    var style = sx === 'f' ? (n.vt === 'スポーティ' ? 'pony' : n.vt === 'かわいい系' || r3 < 0.3 ? 'bob' : 'long') : (n.vt === '体育会系' ? 'buzz' : n.vt === '韓国アイドル系' || n.vt === 'かわいい系' || r3 < 0.3 ? 'mash' : 'short');
    if (style === 'long') g += '<path d="M13 31 Q13 11 32 11 Q51 11 51 31 L52 56 Q32 60 12 56 Z" fill="' + hair + '"/>';
    if (style === 'bob') g += '<path d="M13 31 Q13 11 32 11 Q51 11 51 31 L51 44 Q32 47 13 44 Z" fill="' + hair + '"/>';
    if (style === 'pony') g += '<circle cx="49" cy="20" r="6.5" fill="' + hair + '"/><path d="M50 22 Q58 32 52 42 Q50 32 47 26Z" fill="' + hair + '"/>';
    // 顔
    g += '<ellipse cx="32" cy="32" rx="15.5" ry="16.5" fill="' + skin + '"/>';
    // 前髪
    if (style === 'long' || style === 'bob' || style === 'pony') g += '<path d="M16 31 Q15 13 32 13 Q49 13 48 31 Q45 22 37 20 Q33 25 26 22 Q20 23 16 31Z" fill="' + hair + '"/>';
    if (style === 'short') g += '<path d="M16 30 Q15 12 32 12 Q49 12 48 30 Q46 21 40 20 Q32 23 25 20 Q18 22 16 30Z" fill="' + hair + '"/>';
    if (style === 'mash') g += '<path d="M15 32 Q14 11 32 11 Q50 11 49 32 Q47 25 42 26 Q37 23 32 27 Q27 23 22 26 Q17 25 15 32Z" fill="' + hair + '"/>';
    if (style === 'buzz') g += '<path d="M17 27 Q17 14 32 14 Q47 14 47 27 Q40 20 32 20 Q24 20 17 27Z" fill="' + hair + '"/>';
    // 目
    var smile = /明るく|よく笑う|天然|甘えん坊/.test(n.pers || '');
    if (smile) g += '<path d="M23.5 34 Q26 31 28.5 34" stroke="#2B2220" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M35.5 34 Q38 31 40.5 34" stroke="#2B2220" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    else g += '<ellipse cx="26" cy="33.5" rx="1.9" ry="' + (sx === 'f' ? 2.6 : 2.2) + '" fill="#2B2220"/><ellipse cx="38" cy="33.5" rx="1.9" ry="' + (sx === 'f' ? 2.6 : 2.2) + '" fill="#2B2220"/>';
    if (n.vt === '知的') g += '<circle cx="26" cy="33.5" r="4.2" stroke="#2B2220" stroke-width="1.2" fill="none"/><circle cx="38" cy="33.5" r="4.2" stroke="#2B2220" stroke-width="1.2" fill="none"/><path d="M30.2 33.5 H33.8" stroke="#2B2220" stroke-width="1.2"/>';
    // ほほ・口
    if (sx === 'f' || n.vt === 'かわいい系') g += '<ellipse cx="22.5" cy="38.5" rx="2.6" ry="1.5" fill="#F29C9C" opacity=".55"/><ellipse cx="41.5" cy="38.5" rx="2.6" ry="1.5" fill="#F29C9C" opacity=".55"/>';
    g += '<path d="M29 41 Q32 43.5 35 41" stroke="#B5524F" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    var bg = sx === 'f' ? '#FCE8EE' : '#E4F1F6';
    return '<svg class="av" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="' + bg + '"/>' + g + '</svg>';
  }
  function npcAvatar(n, size) { var a = n.id ? KL.npcAge(S, n) : 30; return avatar({ id: n.id, sex: n.sex, vt: n.vt, pers: n.pers, name: n.name, old: a >= 62 }, size); }
  function meAvatar(size) { var st = S.st; return avatar({ id: 777 + (S.sei + S.mei).length, sex: S.sex, vt: S.sex === 'f' ? (st.look >= 70 ? '美人系' : 'ふんわり系') : (S.track === 'soccer' ? '体育会系' : st.look >= 70 ? '爽やか系' : '塩顔'), pers: 'よく笑う', old: KL.age(S) >= 62 }, size); }
  KL.avatar = avatar;

  function fitLabel(n) { var f = KL.prefFit(S, n); return f >= 6 ? '◎ 好みにドンピシャ' : f >= 1 ? '○ 好みに合っている' : f >= -5 ? '△ 好みとは少し違う' : '× タイプではないかも'; }
  function pcard(n, opt) {
    KL.ensureProfile(S, n);
    var a = KL.npcAge(S, n);
    var rows = [['年齢', a + '歳' + (n.ad ? '（' + (n.ad > 0 ? n.ad + '歳上' : (-n.ad) + '歳下') + '）' : '')], ['身長', n.ht + 'cm'], ['職業', KL.npcJob(S, n)], ['趣味', n.hobby], ['好きなタイプ', KL.prefName(n.pref)]];
    if (KL.canLove(S, n)) rows.push(['相性', fitLabel(n)]);
    return '<div class="pcard"' + (opt && opt.tap ? ' data-a="who" data-id="' + n.id + '" role="button"' : '') + '><div class="pcard-h">' + npcAvatar(n, 56) + '<div><b>' + esc(n.name) + '</b><span>' + esc(KL.profileLine(S, n)) + '</span></div></div>' +
      '<dl class="pgrid">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="like" style="margin-top:6px"><i style="width:' + n.like + '%"></i></div></div>';
  }
  // 汎用の情報カード（移籍オファー・仕事のオファー・子どもなど）
  function infoCard(c) {
    return '<div class="icard">' + (c.img || '') + '<div class="icard-b"><b>' + esc(c.title) + '</b>' + (c.sub ? '<span>' + esc(c.sub) + '</span>' : '') +
      (c.rows && c.rows.length ? '<dl class="pgrid">' + c.rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' : '') + '</div></div>';
  }
  // 出来事の挿絵：ev-◯◯.png を置くと表示（なければ非表示）
  var SOCCER_EV = /^s_(join_kid|join_jhs|jr_select|u12|jhs_choice|u15|youthnt|u17wc|hs_choice|senshuken|youth_cup|top_debut|pro_offer|univ_start|univ_offer|ballon|transfer|offseason|convert|bigmatch|media|slump|retire)$/;
  function imgKey(ev) {
    var id = ev.id || '';
    if (id === 'birth' || /^baby_|^first_/.test(id)) return 'birth';
    if (/^k_/.test(id)) return 'kinder';
    if (SOCCER_EV.test(id)) return 'soccer';
    if (/^m_|^s_nego$/.test(id)) return 'soccer';
    if (/^(l_date|l_bday|l_jealous|l_ldr|l_tempt)$/.test(id)) return 'date';
    if (/^(l_parents|l_invite)$/.test(id)) return 'wedding';
    if (id === 'l_divorce') return 'old';
    if (/^s_club/.test(id)) return 'club';
    if (/^(r_confess|r_confessed|r_moteki|r_newcrush|s_koibana|s_button|s_senpai|k_first_love|r_valentine)$/.test(id)) return 'love';
    if (/^(s_firstdate|s_hanabi|s_xmas|r_celeb|r_fight|r_breakup)$/.test(id)) return 'date';
    if (id === 'r_propose' || id === 'r_goldwed') return 'wedding';
    if (/^(r_baby|r_kid_grow|r_mago)$/.test(id)) return 'family';
    if (/^i_/.test(id)) return 'idol';
    if (/^(w_|f_|u_shukatsu)/.test(id)) return 'work';
    if (/^(o_|r_spouse_bye|w_parent)/.test(id)) return 'old';
    if (/^(e_|j_|h_|u_|s_)/.test(id)) return 'school';
    if (!id && /[🏆⚽🌍👟🥇]|🇯🇵/.test(ev.icon || '') && S.soccer) return 'soccer';
    return '';
  }
  function evImg(ev) { var k = imgKey(ev); return k ? '<img class="ev-img" src="ev-' + k + '.png" alt="" onerror="this.remove()">' : ''; }

  // ================= タイトル =================
  function title() {
    var sv = KL.load(), hall = KL.hall();
    var hallHtml = hall.length ? '<div class="hall"><h3>これまでの人生</h3>' + hall.slice(0, 6).map(function (h) {
      return '<div class="hall-row"><b>' + esc(h.rank) + '</b><div>' + esc(h.name) + '（' + h.age + '歳）<br><small style="color:var(--sub)">' + esc(h.title) + '</small></div><span>' + new Date(h.when).toLocaleDateString('ja-JP') + '</span></div>';
    }).join('') + '</div>' : '';
    app.innerHTML =
      '<div class="title-screen">' +
      '<h1 class="logo">Kani Life<small>もしもの人生シミュレーター</small></h1>' +
      '<p class="title-lead">生まれてから老後まで、<br>半年ずつ、もうひとつの人生を。</p>' +
      '<p class="title-sub">選択と積み重ねで能力が育ち、周りの見る目が変わっていく。サッカー選手にも、アイドルにも、会社員にもなれる。</p>' +
      '<div class="title-actions">' +
      (sv && !sv.dead ? '<button class="btn btn-main" data-a="continue">続きから（' + esc(sv.sei + ' ' + sv.mei) + '・' + KL.age(sv) + '歳）</button>' : '') +
      '<button class="btn ' + (sv && !sv.dead ? 'btn-ghost' : 'btn-main') + '" data-a="new">新しい人生をはじめる</button>' +
      '</div>' + hallHtml + '</div>';
  }

  // ================= 人生の設定 =================
  function rollFamily() { return U.wpick(KL.FAMILIES, function (f) { return f.w; }); }
  function newSetup() {
    var tal = {}; KL.STATS.forEach(function (s) { tal[s.k] = 2; });
    setup = { sei: '', mei: '', sex: 'm', loveSex: 'f', pref: '大阪', family: rollFamily(), tal: tal, pts: 7 };
  }
  function famBonus(k) { return setup.family.bonus.indexOf(k) >= 0 ? 1 : 0; }
  function setupView() {
    var st = setup;
    var talRows = KL.STATS.map(function (s) {
      var fb = famBonus(s.k), v = Math.min(5, st.tal[s.k] + fb);
      return '<div class="tal-row"><span class="n">' + s.n + '</span><span class="stars">' + stars(v, Math.min(fb, v - st.tal[s.k])) + '</span>' +
        '<div class="step"><button data-a="tal" data-k="' + s.k + '" data-d="-1" ' + (st.tal[s.k] <= 1 ? 'disabled' : '') + ' aria-label="' + s.n + 'を下げる">−</button>' +
        '<button data-a="tal" data-k="' + s.k + '" data-d="1" ' + (st.pts <= 0 || st.tal[s.k] >= 5 ? 'disabled' : '') + ' aria-label="' + s.n + 'を上げる">＋</button></div></div>';
    }).join('');
    app.innerHTML =
      '<div class="page">' +
      '<button class="btn btn-sm btn-line" data-a="toTitle">戻る</button>' +
      '<h2>どんなふうに生まれる？</h2>' +
      '<p class="lead">' + KL.BIRTH_YEAR + '年生まれ。18歳でちょうど2026-27シーズンを迎える世代です。</p>' +
      '<div class="field"><label>名前</label><div class="row2"><input class="input" id="sei" placeholder="姓（空欄でおまかせ）" value="' + esc(st.sei) + '"><input class="input" id="mei" placeholder="名（空欄でおまかせ）" value="' + esc(st.mei) + '"></div></div>' +
      '<div class="field"><label>性別</label><div class="seg"><button data-a="sex" data-v="m" class="' + (st.sex === 'm' ? 'on' : '') + '">男性</button><button data-a="sex" data-v="f" class="' + (st.sex === 'f' ? 'on' : '') + '">女性</button></div></div>' +
      '<div class="field"><label>恋愛の対象</label><div class="seg"><button data-a="love" data-v="f" class="' + (st.loveSex === 'f' ? 'on' : '') + '">女性</button><button data-a="love" data-v="m" class="' + (st.loveSex === 'm' ? 'on' : '') + '">男性</button><button data-a="love" data-v="any" class="' + (st.loveSex === 'any' ? 'on' : '') + '">どちらも</button></div></div>' +
      '<div class="field"><label>出身地</label><select class="input" id="pref">' + KL.PREFS.map(function (p) { return '<option' + (p === st.pref ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>生まれる家庭</label><div class="family"><div><b>' + esc(st.family.name) + '</b><p>' + esc(st.family.desc) + '</p></div><button class="btn btn-sm btn-ghost" data-a="reroll">引き直す</button></div></div>' +
      '<div class="field"><div class="tal-head"><label>素質（伸びしろ）</label><span class="pts">残り ' + st.pts + 'pt</span></div>' + talRows +
      '<p class="note">素質は「どこまで・どれだけ速く伸びるか」。今の能力ではなく、行動で積み上げていきます。<span style="color:var(--gold)">金色の★</span>は家庭からのボーナス。</p></div>' +
      '<button class="btn btn-main" data-a="start" style="margin:8px 0 32px">この条件で生まれる</button>' +
      '</div>';
    ['sei', 'mei'].forEach(function (id) { document.getElementById(id).addEventListener('input', function (e) { setup[id] = e.target.value.trim(); }); });
    document.getElementById('pref').addEventListener('change', function (e) { setup.pref = e.target.value; });
  }
  function startLife() {
    var st = setup, tal = {};
    KL.STATS.forEach(function (s) { tal[s.k] = Math.min(5, st.tal[s.k] + famBonus(s.k)); });
    var luck = null, r = Math.random();
    if (r < 0.02) { var ks = U.shuffle(Object.keys(tal)).slice(0, 2); ks.forEach(function (k) { tal[k] = Math.min(5, tal[k] + 1); }); luck = '神童の素質！（' + ks.map(function (k) { return KL.STATS.filter(function (s) { return s.k === k; })[0].n; }).join('・') + 'の素質が上がった）'; }
    else if (r < 0.12) { var k = U.pick(Object.keys(tal).filter(function (x) { return tal[x] < 5; })) || 'men'; tal[k] = Math.min(5, tal[k] + 1); luck = '天賦の才（' + KL.STATS.filter(function (s) { return s.k === k; })[0].n + 'の素質が上がった）'; }
    S = KL.newGame({
      sei: st.sei || U.pick(KL.NAMES.sei), mei: st.mei || U.pick(st.sex === 'm' ? KL.NAMES.m : KL.NAMES.f),
      sex: st.sex, loveSex: st.loveSex, pref: st.pref, family: st.family.id, tal: tal, luck: luck
    });
    alloc = {}; tab = 'home';
    KL.save(S);
    render();
    // 誕生イベントだけ先に見せる
    S._queue = []; S._lines = [];
    var birth = KL.EVENTS.filter(function (e) { return e.id === 'birth'; })[0];
    S.done.birth = 1;
    showEvent(KL.evInstance(S, birth), true);
  }

  // ================= メイン =================
  function render() {
    if (!S) return title();
    if (S.dead) return resultView();
    var body = tab === 'home' ? homeView() : tab === 'rec' ? recView() : tab === 'rel' ? relView() : logView();
    app.innerHTML = topbar() + body + tabsView() + (tab === 'home' ? goView() : '');
  }
  function topbar() {
    return '<div class="topbar"><div class="age num">' + KL.age(S) + '<small>歳</small></div>' +
      '<div class="who"><b>' + esc(S.sei + ' ' + S.mei) + '・' + esc(KL.stageLabel(S)) + '</b><span>' + esc(KL.period(S)) + '</span></div>' +
      '<div class="money"><span>所持金</span><b class="num">' + U.yen(S.money) + '</b></div>' +
      '<button class="menu-btn" data-a="menu" aria-label="メニュー">≡</button></div>';
  }
  function tabsView() {
    var t = [['home', '🏠', 'ホーム'], ['rec', '🏆', '成績'], ['rel', '💞', '人間関係'], ['log', '📜', '年表']];
    return '<nav class="tabs">' + t.map(function (x) { return '<button data-a="tab" data-v="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '"><i>' + x[1] + '</i>' + x[2] + '</button>'; }).join('') + '</nav>';
  }
  function fromLabel() {
    var a = KL.age(S);
    if (S.stage === 'pro' || S.stage === 'idol' || (S.track && S.rep.nat >= 40) || S.talent) return '世間から見たあなた';
    if (a < 6 || S.stage === 'retired') return '近所の人から見たあなた';
    if (KL.isStudent(S)) return '同級生から見たあなた';
    if (S.stage === 'work') return '職場の人から見たあなた';
    return '周りから見たあなた';
  }
  function homeView() {
    var p = KL.perception(S);
    var h = '<div class="eyes"><p class="from">' + fromLabel() + '</p><div class="bubble"><p class="q">「' + esc(p.main) + '」</p>' +
      (p.tags && p.tags.length ? '<div class="tags">' + p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '</div><div class="me">' + meAvatar(34) + esc(S.sei + ' ' + S.mei) + '</div></div>' + voicesView() + loveRow() + newsView();
    if (S.track === 'soccer' && S.soccer) h += soccerCard();
    if (S.track === 'idol' && S.idol) h += idolCard();
    h += '<div class="sec"><div class="sec-h"><h3>能力</h3><span>★＝素質</span></div><div class="panel">' +
      KL.STATS.map(function (s) {
        var v = S.st[s.k], cap = KL.capOf(S, s.k);
        return '<div class="bar"><span class="n">' + s.n + '<small>' + '★'.repeat(S.tal[s.k]) + '</small></span><div class="track"><div class="fill" style="width:' + v + '%"></div><div class="cap" style="left:' + cap + '%"></div></div><span class="v num">' + r0(v) + '</span></div>';
      }).join('') +
      '<div class="bar ' + (S.fat > 60 ? 'warn' : '') + '"><span class="n">疲労</span><div class="track"><div class="fill" style="width:' + S.fat + '%;' + (S.fat <= 60 ? 'background:#9DC7C8' : '') + '"></div></div><span class="v num">' + r0(S.fat) + '</span></div>' +
      '</div></div>';
    h += actionsView();
    return h;
  }
  function voicesView() {
    if (KL.age(S) < 1 || !KL.mobVoices) return '';
    var vs = KL.mobVoices(S);
    if (!vs.length) return '';
    return '<div class="sec"><div class="sec-h"><h3>周りの声</h3><span>半年ごとに変わる</span></div><div class="voices">' + vs.map(function (x, i) {
      var sx = /女子|ママ|おばちゃん|母|おばあ/.test(x.who) ? 'f' : /男子|おじさん|監督|記者|教授/.test(x.who) ? 'm' : (hash(x.who.length * 31 + i) > 0.5 ? 'f' : 'm');
      var nn = x.npc ? KL.npc(S, x.npc) : null;
      var face = nn ? npcAvatar(nn, 30) : avatar({ id: 5000 + x.who.length * 97 + i * 13 + S.t, sex: sx, vt: '', pers: /！|尊|最高|大好き/.test(x.text) ? 'よく笑う' : '', old: /おばちゃん|おじさん|教授|おばあ/.test(x.who) }, 30);
      return '<div class="voice"' + (nn ? ' data-a="who" data-id="' + nn.id + '" role="button"' : '') + '>' + face + '<div><small>' + esc(x.who) + '</small><p>「' + esc(x.text) + '」</p></div></div>';
    }).join('') + '</div></div>';
  }
  function newsView() {
    var ns = (S.news || []).filter(function (x) { return x.t >= S.t - 2; }).slice(-4).reverse();
    if (!ns.length) return '';
    return '<div class="sec"><div class="sec-h"><h3>知り合いの近況</h3><span>📱 SNSより</span></div><div class="panel">' + ns.map(function (x) {
      var n = x.id ? KL.npc(S, x.id) : null;
      return '<div class="person"' + (n ? ' data-a="who" data-id="' + n.id + '" role="button"' : '') + '>' + (n ? '<div class="ava pic">' + npcAvatar(n, 36) + '</div>' : '<div class="ava pic">' + avatar({ id: 9100 + x.text.length, sex: /娘/.test(x.text) ? 'f' : 'm', vt: '' }, 36) + '</div>') + '<div class="p"><p style="margin:0;font-size:14px">' + esc(x.text) + '</p></div></div>';
    }).join('') + '</div></div>';
  }
  function loveRow() {
    var pt = KL.partner(S), cr = KL.age(S) >= 10 ? KL.crush(S) : null, h = '';
    if (!pt && !cr) return '';
    h += '<div class="sec"><div class="lrow">';
    if (pt) h += '<button class="lchip" data-a="who" data-id="' + pt.id + '">' + npcAvatar(pt, 38) + '<span><small>' + (S.spouseId ? (pt.dead ? '亡き配偶者' : '配偶者') : '恋人') + '</small><b>' + esc(pt.name) + '</b><em>' + esc(KL.profileLine(S, pt)) + '</em></span></button>';
    if (cr && !S.spouseId) h += '<button class="lchip" data-a="who" data-id="' + cr.id + '">' + npcAvatar(cr, 38) + '<span><small>気になる人</small><b>' + esc(cr.name) + '</b><em>' + esc(KL.profileLine(S, cr)) + '</em></span></button>';
    return h + '</div></div>';
  }
  function skillBars(defs, vals, caps) {
    return defs.map(function (d) {
      var v = vals[d.k];
      return '<div class="bar"><span class="n">' + d.n + '</span><div class="track" style="background:#fff"><div class="fill" style="width:' + v + '%"></div>' + (caps ? '<div class="cap" style="left:' + caps[d.k] + '%"></div>' : '') + '</div><span class="v num">' + r0(v) + '</span></div>';
    }).join('');
  }
  function soccerCard() {
    var so = S.soccer, SO = KL.Soccer, ovr = SO.ovr(so), c = so.club ? SO.club(S) : null;
    var sub = c ? KL.LEAGUES[c.l].name + '・年俸' + U.yen(so.salary) + '・契約残り' + Math.max(0, so.contract) + '年' : SO.leagueName(S);
    if (so.pending) sub += '（' + KL.clubById(so.pending.club).n + 'に内定）';
    var defs = SO.SK.filter(function (s) { return so.pos === 'GK' ? ['gk', 'iq', 'phy', 'pas'].indexOf(s.k) >= 0 : s.k !== 'gk'; });
    var mates = c ? SO.teammates(S).slice(0, 5) : [];
    return '<div class="sec"><div class="sec-h"><h3>サッカー</h3><span>' + esc(SO.POS[so.pos].jp) + '</span></div><div class="track-card">' +
      '<div class="track-head"><div class="ovr"><div><b class="num">' + ovr + '</b><small>OVR</small></div></div>' + (so.num ? '<div class="shirt" aria-label="背番号' + so.num + '"><b class="num">' + so.num + '</b><small>背番号</small></div>' : '') + '<div class="t"><b>' + esc(SO.teamName(S)) + '</b><span>' + esc(sub) + '</span></div></div>' +
      skillBars(defs, so.sk) +
      (so.badges && so.badges.length ? '<div class="badges">' + so.badges.map(function (k) { return '<span class="badge">🏅 ' + esc(SO.badgeName(k)) + '</span>'; }).join('') + '</div>' : '') +
      (so.ntNow ? '<p class="mates">🇯🇵 日本代表に招集中・背番号' + (so.ntNum || '-') + '（通算' + so.caps + '試合' + so.ntGoals + '得点）</p>' : '') +
      (mates.length ? '<p class="mates">チームメイト：' + mates.map(function (m) { return esc(m.name) + '（' + m.pos + ' ' + m.ovr + '）'; }).join('、') + '</p>' : '') +
      '</div></div>';
  }
  function idolCard() {
    var id = S.idol, ID = KL.Idol;
    return '<div class="sec"><div class="sec-h"><h3>アイドル</h3><span>' + esc(id.agency) + '</span></div><div class="track-card">' +
      '<div class="track-head"><div class="ovr" style="background:var(--gold)"><div><b class="num">' + ID.power(id) + '</b><small>総合</small></div></div><div class="t"><b>' + esc(id.groupName) + '・' + ID.STATUS[id.status] + '</b><span>ファン ' + id.fans.toLocaleString() + '人・人気' + (id.rank || ID.calcRank(id)) + '位/' + id.size + '人</span></div></div>' +
      skillBars(ID.SK, id.sk) + '</div></div>';
  }
  function actionsView() {
    var acts = KL.getActions(S), ap = KL.apOf(S);
    if (!acts.length || !ap) return '<div class="sec"><div class="panel"><p class="empty">まだ小さいので、すくすく育つのを見守ろう。</p></div></div>';
    var ids = acts.map(function (a) { return a.id; });
    Object.keys(alloc).forEach(function (k) { if (ids.indexOf(k) < 0) delete alloc[k]; });
    var used = used0();
    while (used > ap) { var k0 = Object.keys(alloc).filter(function (k) { return alloc[k] > 0; }).pop(); alloc[k0]--; used--; }
    var dots = ''; for (var i = 0; i < ap; i++) dots += '<i class="' + (i < used ? '' : 'off') + '"></i>';
    return '<div class="sec"><div class="sec-h"><h3>この半年の過ごし方</h3><div class="ap" aria-label="残り' + (ap - used) + '回">' + dots + '</div></div><div class="panel">' +
      acts.map(function (a) {
        var v = alloc[a.id] || 0;
        var tg = a.soccer ? '<span class="tag-s soc">⚽</span>' : a.idol ? '<span class="tag-s idl">🎤</span>' : '';
        return '<div class="act ' + (v ? 'on' : '') + '"><div class="info"><b>' + esc(a.n) + tg + '</b><span>' + esc(a.d) + '</span></div>' +
          '<div class="step"><button data-a="al" data-k="' + a.id + '" data-d="-1" ' + (v <= 0 ? 'disabled' : '') + ' aria-label="減らす">−</button><span class="v num">' + v + '</span>' +
          '<button data-a="al" data-k="' + a.id + '" data-d="1" ' + (used >= ap ? 'disabled' : '') + ' aria-label="増やす">＋</button></div></div>';
      }).join('') + '</div><p class="note">余った回数は「休養」になります。配分は次の半年にも引き継がれます。</p></div>';
  }
  function used0() { return Object.keys(alloc).reduce(function (t, k) { return t + (alloc[k] || 0); }, 0); }
  function goView() {
    var label = KL.apOf(S) ? 'この半年を過ごす' : 'すくすく育つ（半年後へ）';
    return '<div class="go"><button class="btn btn-main" data-a="play">' + label + '</button></div>';
  }

  // ---------- 成績 ----------
  function recView() {
    var h = '';
    var so = S.soccer;
    if (so) {
      var SO = KL.Soccer;
      h += '<div class="sec"><div class="sec-h"><h3>サッカーの成績</h3><span>' + esc(SO.POS[so.pos].jp) + (so.retired ? '・引退' : '') + '</span></div>' +
        '<div class="totals"><div><small>出場</small><b class="num">' + so.totalApps + '</b></div><div><small>得点</small><b class="num">' + so.totalGoals + '</b></div><div><small>アシスト</small><b class="num">' + so.totalAst + '</b></div><div><small>代表</small><b class="num">' + so.caps + '</b></div></div>';
      var ss = so.seasons.slice(); if (so.cur && !so.cur.closed) ss.push(so.cur);
      ss = ss.filter(function (x) { return x.apps > 0 || x.club; }).reverse();
      h += ss.length ? ss.map(function (x) {
        var rt = x.rn ? (x.rs / x.rn).toFixed(2) : '-';
        var notes = (x.notes || []).filter(function (n, i, a) { return a.indexOf(n) === i; });
        return '<div class="season"><div class="season-h"><span class="y num">' + esc(x.label) + '</span><span class="tm">' + (x.num ? '#' + x.num + ' ' : '') + esc(x.team) + '（' + esc(x.lg) + '）' + (x.closed ? '' : ' 進行中') + '</span><span class="o num">OVR ' + (x.ovrEnd || SO.ovr(so)) + '</span></div>' +
          '<div class="cells"><div><small>出場</small><b class="num">' + x.apps + '</b></div><div><small>得点</small><b class="num">' + x.goals + '</b></div><div><small>アシスト</small><b class="num">' + x.ast + '</b></div><div><small>評価</small><b class="num">' + rt + '</b></div><div><small>代表</small><b class="num">' + x.ntApps + '</b></div><div><small>代表点</small><b class="num">' + x.ntGoals + '</b></div></div>' +
          (notes.length ? '<div class="notes">' + notes.map(function (n) { return '<span class="' + (/優勝|王|MVP|イレブン|賞|昇格/.test(n) ? '' : 'plain') + '">' + esc(n) + '</span>'; }).join('') + '</div>' : '') + '</div>';
      }).join('') : '<p class="empty">まだ公式戦の記録はありません。</p>';
      h += '</div>';
    }
    if (S.idol) {
      var id = S.idol, ID = KL.Idol;
      h += '<div class="sec"><div class="sec-h"><h3>アイドルの記録</h3><span>' + esc(id.groupName) + '</span></div><div class="totals"><div><small>ファン</small><b class="num">' + U.r1(id.fans / 10000) + '万</b></div><div><small>最高</small><b class="num">' + U.r1(id.peakFans / 10000) + '万</b></div><div><small>センター</small><b class="num">' + id.centerCount + '</b></div><div><small>シングル</small><b class="num">' + id.singles + '</b></div></div>' +
        (id.hist.length ? '<div class="panel">' + id.hist.slice().reverse().map(function (x) { return '<div class="trophy"><i>🗳️</i>' + x.year + '年 人気投票 ' + x.rank + '位<span>ファン' + x.fans.toLocaleString() + '人</span></div>'; }).join('') + '</div>' : '<p class="empty">人気投票はまだです。</p>') + '</div>';
      var vn = id.venueMax !== undefined ? ID.VENUES[id.venueMax][0] : '—';
      h += '<div class="sec"><div class="sec-h"><h3>ライブ・仕事</h3><span>最大会場：' + esc(vn) + '</span></div><div class="panel">' +
        '<div class="trophy"><i>🏟️</i>これまでで一番大きな会場<span>' + esc(vn) + '</span></div>' +
        '<div class="trophy"><i>📺</i>CM出演<span>通算' + (id.cmTotal || 0) + '本</span></div>' +
        (id.works || []).slice().reverse().slice(0, 12).map(function (w) { return '<div class="trophy"><i>' + (w.ok ? '🌟' : '・') + '</i>' + esc(w.n) + '<span>' + w.year + '年</span></div>'; }).join('') + '</div></div>';
      if (id.discog && id.discog.length) {
        h += '<div class="sec"><div class="sec-h"><h3>ディスコグラフィ</h3><span>' + id.discog.length + '枚</span></div><div class="panel">' +
          id.discog.slice().reverse().slice(0, 30).map(function (d) { return '<div class="trophy"><i>' + (d.rank === 1 ? '🥇' : '💿') + '</i>' + d.no + 'th「' + esc(d.title) + '」' + (d.role ? '<small style="color:var(--sub);margin-left:4px">' + esc(d.role) + '</small>' : '') + '<span>' + (d.sales >= 10000 ? U.r1(d.sales / 10000) + '万枚' : d.sales.toLocaleString() + '枚') + '・' + d.rank + '位</span></div>'; }).join('') + '</div></div>';
      }
    }
    if (S.job) {
      h += '<div class="sec"><div class="sec-h"><h3>仕事</h3><span>勤続' + S.job.years + '年</span></div><div class="panel"><div class="trophy"><i>💼</i>' + esc(S.job.name) + '・' + esc(KL.jobTitles(S)[S.job.title]) + '<span>年収' + U.yen(KL.salary(S)) + '</span></div>' +
        '<div class="bar"><span class="n">評価</span><div class="track"><div class="fill" style="width:' + S.job.perf + '%"></div></div><span class="v num">' + r0(S.job.perf) + '</span></div></div></div>';
    }
    h += '<div class="sec"><div class="sec-h"><h3>獲得タイトル・称号</h3><span>' + S.titles.length + '</span></div><div class="panel">' +
      (S.titles.length ? S.titles.slice().reverse().map(function (t) { return '<div class="trophy"><i>🏅</i>' + esc(t.name) + '<span>' + t.year + '年・' + t.age + '歳</span></div>'; }).join('') : '<p class="empty">まだありません。これからの人生で。</p>') + '</div></div>';
    if (S.track !== 'soccer' && !S.soccer) h += '<div class="sec"><p class="note">サッカー教室や部活でサッカー経験を積むと、少年団やサッカー部から声がかかります。ダンス・歌の経験や見た目が育つと、アイドルのオーディションに挑戦できます。</p></div>';
    return h;
  }

  // ---------- 人間関係 ----------
  function moteStars(m) { var n = Math.max(1, Math.min(5, Math.round(m / 20))); return '<span class="stars" style="flex:none;color:#E07A95">' + '♥'.repeat(n) + '<span class="off">' + '♥'.repeat(5 - n) + '</span></span>'; }
  function profRows(n) {
    KL.ensureProfile(S, n);
    var a = KL.npcAge(S, n), rows = [
      ['見た目', (KL.lookWord(n) ? KL.lookWord(n) + ' ' : '') + n.vt],
      ['性格', n.pers], ['年齢', a + '歳（' + (n.ad > 0 ? n.ad + '歳上' : n.ad < 0 ? (-n.ad) + '歳下' : '同い年') + '）'],
      ['身長', n.ht + 'cm'], ['職業・学校', KL.npcJob(S, n)], ['趣味', n.hobby],
      ['好きなタイプ', KL.prefName(n.pref)], ['出会い', n.met]
    ];
    if (n.how) rows.push(['なれそめ', n.how]);
    return rows;
  }
  function partnerCard(pt) {
    var yrs = Math.floor((S.t - (S.spouseId ? (S.marriedT || pt.since) : pt.since)) / 2);
    return '<div class="sec"><div class="sec-h"><h3>' + (S.spouseId ? '配偶者' : '恋人') + '</h3><span>' + (S.spouseId ? '結婚して' : '付き合って') + (yrs ? yrs + '年' : '半年未満') + '</span></div>' +
      '<div class="track-card"><div class="track-head"><div class="ava pic" style="width:64px;height:64px">' + npcAvatar(pt, 64) + '</div><div class="t"><b>' + esc(pt.name) + (pt.dead ? '（故人）' : '') + '</b><span>' + esc(KL.profileLine(S, pt)) + '</span></div></div>' +
      (KL.Love && !pt.dead ? '<p class="now">💬 ' + esc(KL.Love.nowOf(S, pt)) + '</p>' : '') +
      '<dl class="kv" style="margin:8px 0 6px">' + profRows(pt).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="bar"><span class="n">好感度</span><div class="track" style="background:#fff"><div class="fill" style="width:' + pt.like + '%;background:#E07A95"></div></div><span class="v num">' + r0(pt.like) + '</span></div></div></div>';
  }
  function relView() {
    var h = '', m = KL.mote(S), a = KL.age(S);
    if (a >= 10) {
      h += '<div class="sec"><div class="sec-h"><h3>恋愛</h3><span>' + esc(KL.moteLabel(S)) + '</span></div><div class="panel">' +
        '<div class="bar"><span class="n">モテ度</span><div class="track"><div class="fill" style="width:' + m + '%;background:#E07A95"></div></div><span class="v num">' + m + '</span></div>' +
        '<div class="totals" style="margin:6px 0 8px"><div><small>告白された</small><b class="num">' + (S.flags.confessed || 0) + '</b></div><div><small>告白した</small><b class="num">' + (S.confessOk + S.confessNg) + '</b></div><div><small>交際人数</small><b class="num">' + (S.flags.dated || 0) + '</b></div><div><small>' + (S.sex === 'm' || S.loveSex === 'f' ? 'チョコ' : '成功') + '</small><b class="num">' + (S.sex === 'm' || S.loveSex === 'f' ? S.choc : S.confessOk) + '</b></div></div>' +
        '<p class="note" style="margin:0 0 8px">モテ度は 見た目・コミュ力・' + (a < 22 ? '運動神経・学校での評判' : 'メンタル・知名度') + ' で決まります。</p></div></div>';
    }
    var pt = KL.partner(S);
    if (pt) h += partnerCard(pt);
    var fam = S.family_members.map(function (f) { return person({ name: f.name, sex: /父|兄/.test(f.rel) ? 'm' : 'f' }, f.rel, null); });
    S.kids.forEach(function (k, i) {
      if (KL.Love) KL.Love.ensureKid(S, k, i);
      var ka = Math.floor((S.t - k.born) / 2);
      fam.push('<div class="person" data-a="kid" data-i="' + i + '" role="button"><div class="ava pic">' + avatar({ id: k.id, sex: k.sex, vt: k.vt, pers: k.pers, old: false }, 40) + '</div><div class="p"><b>' + esc(S.sei + ' ' + k.name) + '</b><span class="rel">' + (k.sex === 'm' ? '息子' : '娘') + '・' + ka + '歳</span><div style="font-size:12px;color:var(--sub)">' + esc(KL.Love ? KL.Love.kidStatus(S, k) : '') + '</div></div></div>');
    });
    if (S.flags.cat) fam.push('<div class="person"><div class="ava" style="background:var(--gold)">🐈</div><div class="p"><b>' + esc(S.flags.cat) + '</b><span class="rel">ねこ</span></div></div>');
    h += '<div class="sec"><div class="sec-h"><h3>家族</h3></div><div class="panel">' + fam.join('') + '</div></div>';
    var list = S.npcs.filter(function (n) { return n.id !== S.partnerId && n.id !== S.spouseId; }).sort(function (x, y) { return (y.since - x.since) || (y.like - x.like); });
    var canCrush = function (n) { return !S.spouseId && !S.partnerId && a >= 10 && n.rel !== 'ex' && (S.loveSex === 'any' || n.sex === S.loveSex); };
    h += '<div class="sec"><div class="sec-h"><h3>知り合い</h3><span>' + list.length + '人・タップで詳細</span></div><div class="panel">' +
      (list.length ? list.map(function (n) {
        var lbl = KL.relLabel(n) + (KL.roleLabel(n) ? '・' + KL.roleLabel(n) : '') + '（' + n.met + '）';
        var act = S.crushId === n.id ? '<span class="crush-mark">♥ 気になる人</span>' : canCrush(n) ? '<button class="btn btn-sm btn-ghost" data-a="crush" data-id="' + n.id + '">気になる</button>' : '';
        return person(n, lbl, n.like, act, true);
      }).join('') : '<p class="empty">まだ出会いはこれから。</p>') + '</div></div>';
    h += '<div class="sec"><p class="note">「気になる人」と過ごす時間を増やすと、告白のチャンスがやってきます。成否は好感度・見た目・コミュ力に加えて、相手の「好きなタイプ」に自分が合っているかで決まります。</p></div>';
    return h;
  }
  function person(n, rel, like, act, tap) {
    var ini = (n.name.split(' ')[1] || n.name).charAt(0);
    var love = n.id && KL.canLove(S, n) && n.pers;
    var face = n.id ? '<div class="ava pic">' + npcAvatar(n, 40) + '</div>' : '<div class="ava ' + (n.sex || 'm') + '">' + esc(ini) + '</div>';
    return '<div class="person">' + face + '<div class="p"' + (tap && n.id ? ' data-a="who" data-id="' + n.id + '" role="button" tabindex="0" style="cursor:pointer"' : '') + '><b>' + esc(n.name) + '</b><span class="rel">' + esc(rel) + '</span>' +
      (love ? '<div style="font-size:11px;color:var(--sub)">' + esc(KL.profileLine(S, n)) + '</div>' : '') +
      (n.id && KL.Love && KL.npcAge(S, n) >= 18 ? '<div style="font-size:11px;color:var(--teal-d)">いま：' + esc(KL.Love.statusOf(S, n)) + '</div>' : '') +
      (like != null ? '<div class="like"><i style="width:' + like + '%"></i></div>' : '') + '</div>' + (act || '') + '</div>';
  }
  function kidSheet(i) {
    var k = S.kids[i]; if (!k) return; if (KL.Love) KL.Love.ensureKid(S, k, i);
    var ka = Math.floor((S.t - k.born) / 2);
    openSheet('<div class="ev-title"><div class="ava pic" style="width:64px;height:64px">' + avatar({ id: k.id, sex: k.sex, vt: k.vt, pers: k.pers }, 64) + '</div><h2>' + esc(S.sei + ' ' + k.name) + '<br><small style="font-size:13px;color:var(--sub);font-weight:500">' + (k.sex === 'm' ? '息子' : '娘') + '・' + ka + '歳・' + esc(k.pers) + '</small></h2></div>' +
      '<dl class="kv"><dt>いま</dt><dd>' + esc(KL.Love.kidStatus(S, k)) + '</dd><dt>素質</dt><dd>' + KL.STATS.map(function (s) { return s.n + '★' + k.tal[s.k]; }).join('　') + '</dd>' + (k.dream ? '<dt>夢</dt><dd>' + (k.dream === 'soccer' ? 'サッカー選手' : 'アイドル') + '</dd>' : '') + '</dl>' +
      (k.hist && k.hist.length ? '<div class="log" style="margin-bottom:16px">' + k.hist.slice().reverse().map(function (h) { return '<div class="log-item"><small>' + h.y + '年</small><p>' + esc(h.text) + '</p></div>'; }).join('') + '</div>' : '<p class="note" style="margin-bottom:16px">まだ記録はありません。</p>') +
      '<button class="btn btn-main" data-a="closeSheet">閉じる</button>');
  }
  function whoSheet(id) {
    var n = KL.npc(S, id); if (!n) return;
    openSheet('<div class="ev-title"><div class="ava pic" style="width:64px;height:64px">' + npcAvatar(n, 64) + '</div><h2>' + esc(n.name) + '<br><small style="font-size:13px;color:var(--sub);font-weight:500">' + esc(KL.profileLine(S, n)) + '</small></h2></div>' +
      '<p class="ev-when" style="margin-bottom:10px">' + esc(KL.relLabel(n)) + (S.crushId === n.id ? '・♥ 気になる人' : '') + '</p>' +
      (KL.Love && !n.dead && (n.id === S.partnerId || n.id === S.spouseId) ? '<p class="now">💬 ' + esc(KL.Love.nowOf(S, n)) + '</p>' : '') +
      '<dl class="kv">' + profRows(n).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + (KL.Love && KL.npcAge(S, n) >= 18 ? '<dt>いま</dt><dd>' + esc(KL.Love.statusOf(S, n)) + '</dd>' : '') + '<dt>好感度</dt><dd>' + r0(n.like) + ' / 100</dd></dl>' +
      (n.hist && n.hist.length ? '<div class="sec" style="margin:0 0 16px"><div class="sec-h"><h3>これまで</h3></div><div class="log">' + n.hist.slice().reverse().map(function (h) { return '<div class="log-item"><small>' + h.y + '年</small><p>' + esc(h.text) + '</p></div>'; }).join('') + '</div></div>' : '') +
      '<button class="btn btn-main" data-a="closeSheet">閉じる</button>');
  }

  // ---------- 年表 ----------
  function logView() {
    return '<div class="sec"><div class="sec-h"><h3>年表</h3><span>' + S.log.length + '件</span></div><div class="log">' +
      S.log.slice().reverse().map(function (l) { return '<div class="log-item i' + l.imp + '"><small>' + l.age + '歳・' + esc(l.p) + '</small><p>' + esc(l.text) + '</p></div>'; }).join('') + '</div></div>';
  }

  // ================= ターン進行 =================
  function play() {
    var acts = KL.getActions(S), ap = KL.apOf(S), a = {};
    acts.forEach(function (x) { if (alloc[x.id]) a[x.id] = alloc[x.id]; });
    var left = ap - Object.keys(a).reduce(function (t, k) { return t + a[k]; }, 0);
    if (left > 0 && acts.some(function (x) { return x.id === 'rest'; })) a.rest = (a.rest || 0) + left;
    flow = { period: KL.period(S), age: KL.age(S), stOld: JSON.parse(JSON.stringify(S.st)) };
    KL.runTurn(S, a);
    flow.lines = S._lines.slice();
    nextEvent();
  }
  function nextEvent() {
    if (S._queue && S._queue.length) showEvent(S._queue.shift());
    else finishTurn();
  }
  function showEvent(ev, standalone) {
    flow = flow || {};
    flow.ev = ev; flow.standalone = !!standalone;
    if (ev.fx) { try { ev.fx(S); } catch (e) { console.error(e); } }
    var ch = ev.choices || [];
    var rest = S._queue ? S._queue.length : 0;
    var html = evImg(ev) + '<p class="ev-when">' + KL.age(S) + '歳・' + esc(KL.period(S)) + '</p>' +
      '<div class="ev-title"><i>' + (ev.icon || '✨') + '</i><h2>' + esc(ev.title) + '</h2></div>' +
      '<p class="ev-text">' + esc(ev.text) + '</p>' +
      (ev.people && ev.people.length ? '<div class="pcards">' + ev.people.map(function (id) { var n = KL.npc(S, id); return n ? pcard(n) : ''; }).join('') + '</div>' : '') +
      (ev.cards && ev.cards.length ? '<div class="pcards">' + ev.cards.map(infoCard).join('') + '</div>' : '');
    if (ch.length) html += '<div class="choices">' + ch.map(function (c, i) { return '<button class="choice" data-a="choose" data-i="' + i + '" ' + (c.ok === false ? 'disabled' : '') + '>' + esc(c.t) + '</button>'; }).join('') + '</div>';
    else html += '<button class="btn btn-main" data-a="evnext">' + (rest ? '次へ' : '続ける') + '</button>';
    if (rest) html += '<p class="count" style="margin-top:12px">このあと出来事がもう' + rest + 'つ</p>';
    openSheet(html);
  }
  function choose(i) {
    var ev = flow.ev, c = ev.choices[i];
    if (!c || c.ok === false) return;
    var res = '', before = S.partnerId, beforeSp = S.spouseId;
    try { res = c.fx(S) || ''; } catch (e) { console.error(e); res = 'その話は、いつの間にか立ち消えになった。'; }
    var rest = S._queue ? S._queue.length : 0;
    var newP = (S.partnerId && S.partnerId !== before) ? KL.npc(S, S.partnerId) : (S.spouseId && S.spouseId !== beforeSp) ? KL.npc(S, S.spouseId) : null;
    openSheet(evImg(ev) + '<p class="ev-when">' + KL.age(S) + '歳・' + esc(KL.period(S)) + '</p><div class="ev-title"><i>' + (ev.icon || '✨') + '</i><h2>' + esc(ev.title) + '</h2></div>' +
      '<p class="ev-text" style="color:var(--sub);font-size:14px">' + esc(c.t) + '</p><p class="result">' + esc(res) + '</p>' +
      (newP ? '<p class="note" style="margin:0 0 6px">' + (S.spouseId === newP.id ? '💍 結婚相手' : '💕 新しい恋人') + '</p><div class="pcards">' + pcard(newP) + '</div>' : '') +
      '<button class="btn btn-main" data-a="evnext">' + (rest ? '次へ' : '続ける') + '</button>');
  }
  function evNext() {
    if (flow && flow.standalone) { flow = null; closeSheet(); KL.save(S); render(); return; }
    nextEvent();
  }
  function finishTurn() {
    var d = S._d || {}, sd = S._sd || {}, lines = flow.lines || [];
    var period = flow.period;
    KL.endTurn(S);
    d = S._d || d;
    if (S.dead) { KL.addHall(S); KL.clearSave(); closeSheet(); render(); return; }
    KL.save(S);
    var chips = [];
    KL.STATS.forEach(function (s) { var v = d[s.k] || 0; if (Math.abs(v) >= 0.5) chips.push('<span class="chip ' + (v < 0 ? 'dn' : '') + '">' + s.n + (v > 0 ? '+' : '') + r0(v) + '</span>'); });
    var skn = S.soccer ? KL.Soccer.skName : {}; var ikn = S.idol ? KL.Idol.skName : {};
    Object.keys(sd).forEach(function (k) { var v = sd[k]; if (Math.abs(v) >= 0.5) chips.push('<span class="chip sk ' + (v < 0 ? 'dn' : '') + '">' + (skn[k] || ikn[k] || k) + (v > 0 ? '+' : '') + r0(v) + '</span>'); });
    if (S._money && Math.abs(S._money) >= 1000) chips.push('<span class="chip mo">お金' + (S._money > 0 ? '+' : '') + U.yen(S._money) + '</span>');
    var html = '<p class="ev-when">' + flow.age + '歳・' + esc(period) + '</p><div class="ev-title"><i>🗓️</i><h2>この半年のまとめ</h2></div>' +
      (lines.length ? '<ul class="sum-lines">' + lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
      (chips.length ? '<div class="chips">' + chips.join('') + '</div>' : '<p class="note" style="margin-bottom:16px">大きな変化はなかった。</p>') +
      (flow.age !== KL.age(S) ? '<p class="result">' + KL.age(S) + '歳になった。' + esc(KL.stageLabel(S)) + '</p>' : '') +
      '<button class="btn btn-main" data-a="sumclose">次の半年へ</button>';
    flow = null;
    openSheet(html);
  }

  // ================= 結果 =================
  function resultView() {
    var r = KL.lifeScore(S), p = KL.perception(S);
    var so = S.soccer, id = S.idol, pt = KL.npc(S, S.spouseId);
    var kv = [['生まれ', S.pref + '・' + KL.familyOf(S).name], ['享年', S.deathAge + '歳（' + S.deathYear + '年）'], ['最後の印象', '「' + p.main + '」']];
    if (so && (so.totalApps || so.proYears)) kv.push(['サッカー', SO_sum(so)]);
    if (id) kv.push(['アイドル', id.groupName + '・最高' + (id.hist.length ? Math.min.apply(null, id.hist.map(function (x) { return x.rank; })) + '位' : '-') + '・ファン最大' + id.peakFans.toLocaleString() + '人']);
    if (S.job) kv.push(['仕事', S.job.name + '・' + KL.jobTitles(S)[S.job.title]]);
    kv.push(['恋愛', '告白された' + (S.flags.confessed || 0) + '回・交際' + (S.flags.dated || 0) + '人']);
    kv.push(['家族', (pt ? pt.name + '（' + KL.profileLine(S, pt) + '）と結婚' : '独身') + (S.kids.length ? '・子ども' + S.kids.length + '人' : '') + (S.flags.mago ? '・孫' + S.flags.mago + '人' : '')]);
    kv.push(['遺した財産', U.yen(S.money)]);
    app.innerHTML = '<div class="result-screen"><p class="ending">' + esc(S.sei + ' ' + S.mei) + 'の人生</p><h1>' + esc(KL.lifeTitle(S)) + '</h1>' +
      '<div class="rank"><div class="r ' + r.rank.toLowerCase() + '">' + r.rank + '</div><p>人生スコア<b class="num">' + r.score + '</b>獲得タイトル ' + S.titles.length + '個</p></div>' +
      '<dl class="kv">' + kv.map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
      (S.titles.length ? '<div class="sec" style="margin:0 0 20px"><div class="sec-h"><h3>獲得タイトル</h3></div><div class="panel">' + uniqTitles().map(function (t) { return '<div class="trophy"><i>🏅</i>' + esc(t[0]) + (t[1] > 1 ? ' ×' + t[1] : '') + '</div>'; }).join('') + '</div></div>' : '') +
      '<div class="sec" style="margin:0 0 20px"><div class="sec-h"><h3>年表（ハイライト）</h3></div><div class="log">' + S.log.filter(function (l) { return l.imp >= 2; }).map(function (l) { return '<div class="log-item i' + l.imp + '"><small>' + l.age + '歳</small><p>' + esc(l.text) + '</p></div>'; }).join('') + '</div></div>' +
      '<button class="btn btn-main" data-a="newAfter">新しい人生をはじめる</button><button class="btn btn-line" style="margin-top:10px" data-a="toTitle">タイトルへ</button></div>';
  }
  function SO_sum(so) { return '通算' + so.totalApps + '試合' + so.totalGoals + '得点・代表' + so.caps + '試合' + (so.ballon ? '・バロンドール' : ''); }
  function uniqTitles() { var m = {}, o = []; S.titles.forEach(function (t) { if (!m[t.name]) { m[t.name] = [t.name, 0]; o.push(m[t.name]); } m[t.name][1]++; }); return o; }

  // ================= メニュー =================
  function menu() {
    openSheet('<div class="ev-title"><i>≡</i><h2>メニュー</h2></div><div class="menu-list">' +
      '<button class="btn btn-ghost" data-a="closeSheet">閉じる</button>' +
      '<button class="btn btn-line" data-a="toTitle">タイトルに戻る（自動で保存済み）</button>' +
      '<button class="btn btn-line" style="color:var(--red)" data-a="abandon">この人生を終えて、最初からやり直す</button>' +
      '</div><p class="note" style="margin-top:14px">データはこの端末のブラウザに保存されます。</p>');
  }

  // ================= 操作 =================
  var A = {
    'new': function () { newSetup(); setupView(); window.scrollTo(0, 0); },
    'continue': function () { S = KL.load(); alloc = {}; tab = 'home'; render(); },
    toTitle: function () { closeSheet(); S = null; title(); window.scrollTo(0, 0); },
    sex: function (d) { setup.sex = d.v; if (d.v === 'f' && setup.loveSex === 'f') setup.loveSex = 'm'; else if (d.v === 'm' && setup.loveSex === 'm') setup.loveSex = 'f'; setupView(); },
    love: function (d) { setup.loveSex = d.v; setupView(); },
    reroll: function () { setup.family = rollFamily(); setupView(); },
    tal: function (d) { var k = d.k, dv = +d.d; if (dv > 0 && setup.pts > 0 && setup.tal[k] < 5) { setup.tal[k]++; setup.pts--; } if (dv < 0 && setup.tal[k] > 1) { setup.tal[k]--; setup.pts++; } setupView(); },
    start: startLife,
    tab: function (d) { tab = d.v; render(); window.scrollTo(0, 0); },
    al: function (d) {
      var ap = KL.apOf(S), k = d.k, v = alloc[k] || 0;
      if (+d.d > 0 && used0() < ap) alloc[k] = v + 1;
      if (+d.d < 0 && v > 0) alloc[k] = v - 1;
      var y = window.scrollY; render(); window.scrollTo(0, y);
    },
    play: play,
    choose: function (d) { choose(+d.i); },
    evnext: evNext,
    sumclose: function () { closeSheet(); render(); window.scrollTo(0, 0); },
    menu: menu,
    closeSheet: closeSheet,
    abandon: function () { if (confirm('この人生を終わりにして、新しい人生を始めますか？（今のデータは消えます）')) { KL.clearSave(); closeSheet(); S = null; newSetup(); setupView(); } },
    who: function (d) { whoSheet(+d.id); },
    kid: function (d) { kidSheet(+d.i); },
    crush: function (d) { S.crushId = +d.id; KL.save(S); var y = window.scrollY; render(); window.scrollTo(0, y); },
    newAfter: function () { S = null; newSetup(); setupView(); window.scrollTo(0, 0); }
  };
  function onClick(e) {
    var b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    var f = A[b.dataset.a]; if (f) f(b.dataset);
  }
  app.addEventListener('click', onClick);
  sheetBody.addEventListener('click', onClick);

  try { title(); KL.uiReady = true; } catch (e) { window.__klErr && window.__klErr.push('エラー：' + e.message + '（タイトル画面）'); if (window.__klShow) window.__klShow(); }
})();
