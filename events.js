/* Kani Life - 人生の出来事
   sched:true = 条件を満たしたら必ず起きる / それ以外は w(重み)でランダム
   choices の fx は結果の文章を返す */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U;
  var E = KL.EVENTS = KL.EVENTS || [];
  function age(S) { return KL.age(S); }
  function B(S) { return KL.isB(S); }
  function nm(S) { return S.mei; }
  function kun(S) { return S.sex === 'm' ? 'くん' : 'ちゃん'; }
  function stu(S) { return KL.isStudent(S); }
  function single(S) { return !S.partnerId && !S.spouseId; }
  function friendOf(S) { return S.npcs.filter(function (n) { return n.rel === 'friend' || n.rel === 'best'; }).slice(-1)[0]; }
  function osana(S) { return S.npcs.filter(function (n) { return n.role === 'osana'; })[0]; }
  function startDating(S, n, how) {
    if (!n || !KL.canLove(S, n)) return;
    if (S.partnerId) { var old = KL.npc(S, S.partnerId); if (old) { old.rel = 'ex'; S.exCount++; } }
    n.rel = 'partner'; S.partnerId = n.id; n.since = S.t; n.how = how || ''; if (S.crushId === n.id) S.crushId = null;
    KL.likeAdd(n, 10); KL.ensureProfile(S, n);
    S.flags.dated = (S.flags.dated || 0) + 1;
    KL.log(S, n.name + '（' + KL.profileLine(S, n) + '）と付き合い始めた' + (how ? '（' + how + '）' : '') + '。', 1);
    if (!S.flags.firstLove) { S.flags.firstLove = true; }
  }
  KL.startDating = startDating;
  function confessPower(S, n) { if (!n) return 0; KL.ensureProfile(S, n); return n.like + (S.st.look - 50) * 0.35 + (S.st.com - 50) * 0.25 + S.rep.sch * 0.1 + (S.rep.nat > 30 ? 6 : 0) + KL.prefFit(S, n) - Math.max(0, n.look - S.st.look - 15) * 0.3; }

  // ================= 赤ちゃん =================
  E.push({ id: 'birth', sched: true, pri: 1, cond: function (S) { return S.t === 0; }, title: '誕生', icon: '👶',
    text: function (S) {
      var fam = KL.familyOf(S), best = KL.STATS.slice().sort(function (a, b) { return S.tal[b.k] - S.tal[a.k]; })[0];
      var s = KL.year(S) + '年春、' + S.pref + 'の' + fam.name + 'に元気な産声が響いた。名前は「' + S.mei + '」。';
      if (S.luck) s += '\n\n✨' + S.luck;
      return s + '\n\nいちばんの素質は「' + best.n + '」のようだ。';
    }, choices: [] });
  E.push({ id: 'first_word', sched: true, pri: 3, cond: function (S) { return age(S) === 1 && B(S); }, title: 'はじめての言葉', icon: '🗣️',
    text: '家族みんなが固唾をのんで見守る中、口を開いた。最初の言葉は…',
    choices: [
      { t: '「ママ」', fx: function (S) { KL.add(S, 'com', 2); return '母は泣いて喜んだ。'; } },
      { t: '「パパ」', fx: function (S) { KL.add(S, 'men', 2); return '父はその日、会社で自慢しまくった。'; } },
      { t: '「ボール」', fx: function (S) { KL.add(S, 'ath', 2); S.flags.soccerExp = (S.flags.soccerExp || 0) + 1; return 'まさかのボール。将来はスポーツ選手か？'; } },
      { t: '「♪」（歌い出した）', fx: function (S) { KL.add(S, 'art', 2); S.flags.idolExp = (S.flags.idolExp || 0) + 1; return '言葉より先にメロディ。家族は大笑いした。'; } }
    ] });
  E.push({ id: 'first_walk', sched: true, pri: 3, cond: function (S) { return age(S) === 1 && !B(S); }, title: 'はじめの一歩', icon: '🚶',
    text: function (S) { return 'テーブルにつかまって立ち上がった' + nm(S) + '。そして…'; },
    choices: [
      { t: '勢いよく歩き出す', fx: function (S) { KL.add(S, 'ath', 2); KL.add(S, 'hp', 1); return 'とてとて歩いて、パパの腕に飛び込んだ。'; } },
      { t: '慎重にしゃがみこむ', fx: function (S) { KL.add(S, 'int', 1); KL.add(S, 'men', 1); return 'まだ早いと判断したらしい。慎重派だ。'; } }
    ] });
  E.push({ id: 'baby_park', w: 3, cond: function (S) { return age(S) <= 2 && S.t > 0; }, title: '公園デビュー', icon: '🌳',
    text: '近所の公園で、同い年くらいの子に出会った。',
    choices: [
      { t: '砂場で一緒に遊ぶ', fx: function (S) { KL.add(S, 'com', 2); var o = KL.newNPC(S, 'osana', U.pick(['m', 'f']), { met: '近所の公園', like: 55, rel: 'friend' }); return o.name + 'と仲良くなった。後の幼なじみである。'; } },
      { t: 'ママの後ろに隠れる', fx: function (S) { KL.add(S, 'men', 1); return '人見知りの一面を見せた。'; } }
    ] });
  E.push({ id: 'baby_night', w: 2, cond: function (S) { return age(S) <= 1 && S.t > 0; }, title: '夜泣き', icon: '🌙', text: '毎晩の夜泣きで両親はヘトヘトだ。',
    choices: [{ t: '…すやすや', fx: function (S) { KL.add(S, 'hp', 1); return 'ある夜から、ぴたりと泣き止んだ。両親は泣いて喜んだ。'; } }] });
  E.push({ id: 'baby_book', w: 2, cond: function (S) { return age(S) === 2; }, title: 'お気に入りの絵本', icon: '📚', text: '何度も同じ絵本を「読んで」とせがむようになった。',
    choices: [
      { t: '動物の図鑑', fx: function (S) { KL.add(S, 'int', 2); return 'ひらがなより先に動物の名前を覚えた。'; } },
      { t: 'お姫さま・王子さまの絵本', fx: function (S) { KL.add(S, 'art', 2); return 'ごっこ遊びが得意になった。'; } }
    ] });

  // ================= 幼稚園 =================
  E.push({ id: 'k_enter', sched: true, pri: 2, cond: function (S) { return age(S) === 3 && B(S); }, title: '入園式', icon: '🎒',
    text: function (S) { var o = osana(S); return S.school + 'に入園した。' + (o ? '幼なじみの' + o.name + 'も同じ組だ！' : '初めての集団生活が始まる。'); },
    choices: [
      { t: '自分から話しかける', fx: function (S) { KL.add(S, 'com', 3); return 'すぐに友達ができた。'; } },
      { t: 'ずっと泣いている', fx: function (S) { KL.add(S, 'men', -1); KL.add(S, 'art', 1); return '最初の一週間は泣いてばかりだった。'; } }
    ] });
  E.push({ id: 'k_undokai', sched: true, pri: 6, repeat: true, cond: function (S) { return S.stage === 'kinder' && !B(S); }, title: '幼稚園の運動会', icon: '🏃',
    text: 'かけっこの番が回ってきた。パパがビデオを構えている。',
    choices: [{ t: '全力で走る！', fx: function (S) { var r = KL.chk(S, 'ath', 25, 6); KL.add(S, 'ath', 1); if (r) { KL.repAdd(S, 'sch', 5); return '1等賞！ メダルをもらってご満悦。'; } return 'ゴール直前で転んだけど、最後まで走りきった。'; } }] });
  E.push({ id: 'k_dream', sched: true, pri: 5, cond: function (S) { return age(S) === 5 && B(S); }, title: 'しょうらいのゆめ', icon: '🌈',
    text: '七夕の短冊に「しょうらいのゆめ」を書くことになった。',
    choices: [
      { t: 'サッカーせんしゅ', fx: function (S) { S.flags.dream = 'soccer'; S.flags.soccerExp = (S.flags.soccerExp || 0) + 2; return 'ボールを抱いて眠るようになった。'; } },
      { t: 'アイドル', fx: function (S) { S.flags.dream = 'idol'; S.flags.idolExp = (S.flags.idolExp || 0) + 2; return '鏡の前で歌って踊るのが日課になった。'; } },
      { t: 'おいしゃさん', fx: function (S) { S.flags.dream = 'doctor'; KL.add(S, 'int', 2); return '図鑑を読みあさるようになった。'; } },
      { t: 'しゃちょう', fx: function (S) { S.flags.dream = 'ceo'; KL.add(S, 'com', 2); return '親戚に名刺（手書き）を配り始めた。'; } }
    ] });
  E.push({ id: 'k_753', sched: true, pri: 6, cond: function (S) { return age(S) === 5 && !B(S); }, title: '七五三', icon: '⛩️', text: '晴れ着を着て神社にお参りした。',
    choices: [{ t: '千歳飴をかじる', fx: function (S) { KL.add(S, 'look', 1); KL.add(S, 'hp', 1); return '写真館で撮った写真は、今でもリビングに飾られている。'; } }] });
  E.push({ id: 'k_first_love', w: 2, cond: function (S) { return S.stage === 'kinder' && age(S) >= 4; }, title: 'はつこい？', icon: '💕',
    text: function (S) { var c = KL.crush(S); return (c ? c.name : '同じ組の子') + 'と手をつないで帰る約束をした。'; },
    choices: [{ t: '「けっこんしようね」', fx: function (S) { var c = KL.crush(S); if (c) KL.likeAdd(c, 10); return '指切りげんまんをした。'; } }, { t: 'てれる', fx: function () { return '顔が真っ赤になった。'; } }] });
  E.push({ id: 'k_fight', w: 2, cond: function (S) { return S.stage === 'kinder'; }, title: 'おもちゃの取り合い', icon: '🧸', text: '友達とおもちゃの取り合いになった。',
    choices: [{ t: 'ゆずってあげる', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'men', 1); return '先生にほめられた。'; } }, { t: 'ゆずらない', fx: function (S) { KL.add(S, 'men', 2); KL.add(S, 'com', -1); return '大泣き合戦になった。'; } }] });

  // ================= 小学校 =================
  E.push({ id: 'e_enter', sched: true, pri: 2, cond: function (S) { return age(S) === 6 && B(S); }, title: '小学校入学', icon: '🎒',
    text: function (S) { return 'ピカピカのランドセルを背負って、' + S.school + 'の門をくぐった。'; },
    choices: [
      { t: '隣の席の子に話しかける', fx: function (S) { KL.add(S, 'com', 2); var f = friendOf(S); if (f) KL.likeAdd(f, 10); return (f ? f.name : '隣の子') + 'と友達になった。'; } },
      { t: '先生の話をちゃんと聞く', fx: function (S) { KL.add(S, 'int', 2); return '「しっかりした子ですね」と連絡帳に書かれた。'; } }
    ] });
  E.push({ id: 'e_undokai', sched: true, pri: 6, repeat: true, cond: function (S) { return S.stage === 'elem' && !B(S); }, title: '運動会', icon: '🏁',
    text: 'クラス対抗リレーの選手決め。足に自信のある人は手を挙げて、と先生。',
    choices: [
      { t: '手を挙げる', fx: function (S) { if (KL.chk(S, 'ath', 20 + (age(S) - 6) * 6, 6)) { KL.repAdd(S, 'sch', 8); KL.add(S, 'men', 1); return 'アンカーで2人抜き！ 一躍クラスのヒーローになった。'; } KL.add(S, 'men', -1); return '抜かれてしまった…。でも応援の声がうれしかった。'; } },
      { t: '応援団で盛り上げる', fx: function (S) { KL.add(S, 'com', 2); KL.repAdd(S, 'sch', 3); return '声がかれるまで応援した。'; } }
    ] });
  E.push({ id: 'e_gakugei', sched: true, pri: 6, repeat: true, cond: function (S) { return S.stage === 'elem' && B(S) && (age(S) === 8 || age(S) === 10); }, title: '学芸会', icon: '🎭', text: '学芸会の劇で役を決めることになった。',
    choices: [
      { t: '主役に立候補', fx: function (S) { if (KL.chk(S, (S.st.art + S.st.look) / 2, 30 + age(S) * 2, 6)) { KL.repAdd(S, 'sch', 10); KL.add(S, 'art', 2); S.flags.idolExp = (S.flags.idolExp || 0) + 1; return '堂々と演じきり、保護者席から拍手喝采！'; } return 'じゃんけんで負けて「木」の役になった。でも立派な木だった。'; } },
      { t: '裏方で小道具づくり', fx: function (S) { KL.add(S, 'art', 2); return '手作りの小道具が先生にほめられた。'; } }
    ] });
  E.push({ id: 'e_jiyuu', w: 2, cond: function (S) { return S.stage === 'elem' && B(S); }, title: '夏休みの自由研究', icon: '🔬', text: '夏休みの宿題、自由研究のテーマを決めなきゃ。',
    choices: [
      { t: 'アリの行列を観察', fx: function (S) { KL.add(S, 'int', 2); if (KL.chk(S, 'int', 45, 8)) { KL.repAdd(S, 'loc', 5); return '市の科学展で入賞した！'; } return 'アリに詳しくなった。'; } },
      { t: '8月31日に急いでやる', fx: function (S) { KL.add(S, 'men', 1); return '家族総出で徹夜した。'; } }
    ] });
  E.push({ id: 'e_test100', w: 1, repeat: true, cond: function (S) { return S.stage === 'elem'; }, title: 'テスト返却', icon: '💯', text: '算数のテストが返ってきた。',
    choices: [{ t: 'ドキドキしながら見る', fx: function (S) { if (KL.chk(S, 'int', 30 + age(S) * 2, 6)) { KL.repAdd(S, 'sch', 2); KL.add(S, 'men', 1); return '100点！ 家で冷蔵庫に貼られた。'; } return '…見なかったことにした。'; } }] });
  E.push({ id: 'e_alone', w: 1, cond: function (S) { return S.stage === 'elem' && age(S) >= 9; }, title: 'ひとりぼっちの子', icon: '🌧️', text: 'クラスで、いつもひとりでいる子がいる。',
    choices: [
      { t: '昼休みに声をかける', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'men', 2); var n = KL.newNPC(S, 'friend', U.pick(['m', 'f']), { met: '小学校', like: 70, rel: 'friend' }); return n.name + 'と仲良くなった。ずっと後になって、「あの時ありがとう」と言われた。'; } },
      { t: '気になるけど何もしない', fx: function (S) { return 'もやもやした気持ちが残った。'; } }
    ] });
  E.push({ id: 'e_rinkan', sched: true, pri: 6, cond: function (S) { return age(S) === 10 && B(S); }, title: '林間学校', icon: '🏕️', text: '山の中での林間学校。夜はキャンプファイヤー！',
    choices: [
      { t: '肝試しで先頭を歩く', fx: function (S) { KL.add(S, 'men', 3); KL.repAdd(S, 'sch', 3); return '堂々と歩く姿に、みんなの株が上がった。'; } },
      { t: 'キャンプファイヤーで歌う', fx: function (S) { KL.add(S, 'art', 2); KL.add(S, 'com', 1); return 'みんなで肩を組んで歌った。'; } },
      { t: '夜、好きな人の話をする', fx: function (S) { var c = KL.crush(S); KL.add(S, 'com', 2); return c ? '「' + c.name + 'のことが気になる」と打ち明けた。翌日には全員に広まっていた。' : '盛り上がって夜更かしした。'; } }
    ] });
  E.push({ id: 'e_shuugaku', sched: true, pri: 6, cond: function (S) { return age(S) === 11 && B(S); }, title: '修学旅行（日光）', icon: '🚌', text: '小学校の修学旅行は日光・鬼怒川。',
    choices: [
      { t: '木刀を買う', fx: function (S) { KL.add(S, 'men', 2); return '一生使わない木刀を手に入れた。'; } },
      { t: '気になる子とお土産を選ぶ', req: function (S) { return !!KL.crush(S); }, fx: function (S) { var c = KL.crush(S); KL.likeAdd(c, 10); return c.name + 'とおそろいのキーホルダーを買った。'; } },
      { t: '班のリーダーをする', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'int', 1); return '班を時間通りに動かし、先生に感謝された。'; } }
    ] });
  E.push({ id: 'e_jukenq', sched: true, pri: 2, cond: function (S) { return age(S) === 11 && !B(S) && (S.st.int >= 50 || S.family === 'rich' || S.family === 'edu'); }, title: '中学受験', icon: '✏️',
    text: function (S) { return '親が「私立中学、受けてみる？」と聞いてきた。（学力 ' + Math.round(S.st.int) + '）'; },
    choices: [
      { t: '難関私立中を受ける', fx: function (S) { if (KL.chk(S, 'int', 62, 5)) { S.nextSchool = '私立' + U.pick(KL.PLACE) + '学院中学校'; KL.add(S, 'men', 2); KL.repAdd(S, 'sch', 10); KL.log(S, '中学受験で難関私立に合格。', 1); return '合格！ 春から' + S.nextSchool + 'に通う。'; } KL.add(S, 'men', -2); return '不合格…。地元の公立中学に行くことになった。'; } },
      { t: '地元の公立中に行く', fx: function () { return '友達と同じ中学に行くことにした。'; } }
    ] });

  // ================= 中学 =================
  E.push({ id: 'j_enter', sched: true, pri: 2, cond: function (S) { return age(S) === 12 && B(S); }, title: '小学校卒業、そして中学へ', icon: '🌸',
    text: function (S) { return '卒業式で少し泣いた。そして春、' + S.school + 'の制服に袖を通した。'; },
    choices: [
      { t: '運動部に入る', req: function (S) { return S.track !== 'soccer'; }, fx: function (S) { S.flags.club = 'sport'; KL.add(S, 'ath', 2); return '運動部に入部した。先輩が怖い。'; } },
      { t: '文化部に入る', fx: function (S) { S.flags.club = 'culture'; KL.add(S, 'art', 2); return '文化部に入部した。居心地がいい。'; } },
      { t: '帰宅部', fx: function (S) { S.flags.club = 'none'; KL.add(S, 'int', 1); return '帰宅部のエースになった。'; } }
    ] });
  E.push({ id: 'j_chuuni', w: 2, cond: function (S) { return age(S) === 13; }, title: '目覚めた右腕', icon: '🌀', text: 'ノートに自作の必殺技と設定をびっしり書いていたら、それを友達に見られた。',
    choices: [
      { t: '開き直って技名を叫ぶ', fx: function (S) { KL.add(S, 'men', 2); KL.add(S, 'art', 2); KL.repAdd(S, 'sch', 3); return 'クラスの伝説になった。'; } },
      { t: '全力で否定する', fx: function (S) { KL.add(S, 'men', -1); return 'その夜、ノートは押し入れの奥に封印された。'; } }
    ] });
  E.push({ id: 'j_taiikusai', sched: true, pri: 6, repeat: true, cond: function (S) { return (S.stage === 'jhs' || S.stage === 'hs') && !B(S) && age(S) % 2 === 1; }, title: '体育祭', icon: '🏃', text: '体育祭のクラス対抗リレー。',
    choices: [
      { t: 'アンカーに立候補', fx: function (S) { if (KL.chk(S, 'ath', 40 + (age(S) - 12) * 4, 6)) { KL.repAdd(S, 'sch', 10); return 'ゴール前でごぼう抜き！ 他のクラスの子にまで名前を知られた。'; } return '健闘したが2位。それでも拍手をもらった。'; } },
      { t: '応援団長になる', fx: function (S) { KL.add(S, 'com', 2); KL.repAdd(S, 'sch', 5); return '学ランで声を張り上げた。'; } }
    ] });
  E.push({ id: 'j_bunkasai', sched: true, pri: 6, repeat: true, cond: function (S) { return (S.stage === 'jhs' || S.stage === 'hs') && !B(S) && age(S) % 2 === 0; }, title: '文化祭', icon: '🎪', text: function (S) { return S.stage === 'hs' ? '高校の文化祭。クラスの出し物は何にする？' : '中学の文化祭。合唱コンクールがある。'; },
    choices: [
      { t: 'ステージでバンド・ダンス', fx: function (S) { if (KL.chk(S, (S.st.art + S.st.look) / 2, 45, 7)) { KL.repAdd(S, 'sch', 15); S.flags.idolExp = (S.flags.idolExp || 0) + 1; var c = KL.crush(S); if (c) KL.likeAdd(c, 8); return '体育館が揺れるほどの盛り上がり！ 翌日から廊下で声をかけられるように。'; } KL.repAdd(S, 'sch', 3); return '緊張でグダグダだったけど、いい思い出になった。'; } },
      { t: '模擬店の店長', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'int', 1); return '売り上げ学年1位を達成した。'; } },
      { t: '気になる人と校内を回る', req: function (S) { return !!KL.crush(S) || !!S.partnerId; }, fx: function (S) { var c = KL.partner(S) || KL.crush(S); KL.likeAdd(c, 10); return c.name + 'と一緒に回った。後夜祭の花火がきれいだった。'; } }
    ] });
  E.push({ id: 'j_shuugaku', sched: true, pri: 6, cond: function (S) { return age(S) === 14 && B(S); }, title: '修学旅行（京都・奈良）', icon: '⛩️', text: '中学の修学旅行は京都・奈良。自由行動の班が決まった。',
    choices: [
      { t: '清水寺で恋みくじ', fx: function (S) { var r = U.pick(['大吉', '吉', '凶']); S.flags.koimikuji = r; return '結果は「' + r + '」。' + (r === '大吉' ? 'なんだか良いことが起きそう。' : ''); } },
      { t: '夜、好きな人を呼び出す', req: function (S) { return !!KL.crush(S); }, fx: function (S) { var c = KL.crush(S); if (KL.chk(S, confessPower(S, c), 62, 7)) { startDating(S, c, '修学旅行の夜'); return '旅館の廊下で告白。「…いいよ」。人生で一番ドキドキした夜。'; } KL.likeAdd(c, -5); KL.add(S, 'men', -3); return '先生に見つかって正座させられた。告白どころではなかった。'; } },
      { t: '鹿せんべいで鹿と戦う', fx: function (S) { KL.add(S, 'hp', 1); KL.add(S, 'men', 2); return '鹿に追い回され、ズボンをかじられた。'; } }
    ] });
  E.push({ id: 'j_teiki', w: 2, repeat: true, cond: function (S) { return S.stage === 'jhs' || S.stage === 'hs'; }, title: '定期テスト', icon: '📝', text: 'テスト一週間前。部屋の掃除がやたらはかどる。',
    choices: [
      { t: '一夜漬けで乗り切る', fx: function (S) { if (KL.chk(S, 'int', 45, 8)) { KL.add(S, 'int', 1); return 'ギリギリ平均点を超えた。'; } KL.add(S, 'men', -2); return '赤点で補習になった…。'; } },
      { t: '計画的に勉強する', fx: function (S) { KL.grow(S, 'int', 2.5); KL.fatAdd(S, 8); if (KL.chk(S, 'int', 60, 8)) { KL.repAdd(S, 'sch', 4); return '学年10位以内に入った！'; } return '前回より順位が上がった。'; } }
    ] });
  E.push({ id: 'j_juken', sched: true, pri: 2, cond: function (S) { return age(S) === 14 && !B(S) && S.track !== 'soccer'; }, title: '高校受験', icon: '🌸',
    text: function (S) { return '志望校を決める時期。（学力 ' + Math.round(S.st.int) + '）'; },
    choices: KL.HS.map(function (h, i) {
      return { t: h.name + 'を受ける' + (i === 0 ? '（難関）' : ''), fx: function (S) {
        var tiers = KL.HS.slice(i), got = null;
        for (var j = 0; j < tiers.length; j++) { if (tiers[j].min === 0 || KL.chk(S, 'int', tiers[j].min - 4, 5)) { got = tiers[j]; break; } }
        S.nextSchool = U.pick(KL.PLACE) + (got.tier >= 4 ? '高校（' + got.name + '）' : '高校');
        S.flags.hsTier = got.tier;
        if (got === h) { KL.add(S, 'men', 2); return '合格！ ' + S.nextSchool + 'に進学する。'; }
        KL.add(S, 'men', -2); return h.name + 'は不合格…。' + S.nextSchool + 'に進学することになった。';
      } };
    }) });

  // ================= 高校 =================
  E.push({ id: 'h_enter', sched: true, pri: 3, cond: function (S) { return age(S) === 15 && B(S); }, title: '高校生活スタート', icon: '🏫',
    text: function (S) { return '中学の卒業式を終え、' + S.school + 'に入学した。新しいクラスには知らない顔ばかり。'; },
    choices: [
      { t: '高校デビューする', fx: function (S) { KL.add(S, 'look', 3); KL.repAdd(S, 'sch', 5); if (U.chance(0.2)) { KL.repAdd(S, 'sch', -3); return '気合いを入れすぎて少し浮いた。'; } return '垢抜けたと評判に。'; } },
      { t: '自然体でいく', fx: function (S) { KL.add(S, 'com', 2); return '気の合う友達ができた。'; } }
    ] });
  E.push({ id: 'h_baito', w: 2, cond: function (S) { return S.stage === 'hs' && age(S) >= 16; }, title: 'はじめてのバイト', icon: '🍔', text: 'ファストフード店でバイトを始めた。',
    choices: [{ t: 'スマイル0円', fx: function (S) { KL.add(S, 'com', 3); KL.moneyAdd(S, 80000); return '初めての給料で家族にケーキを買った。'; } }] });
  E.push({ id: 'h_shuugaku', sched: true, pri: 6, cond: function (S) { return age(S) === 16 && !B(S) && S.stage === 'hs'; }, title: '修学旅行（沖縄）', icon: '🌺', text: '高校の修学旅行は沖縄！ 青い海に全員のテンションが上がる。',
    choices: [
      { t: 'ビーチで告白する', req: function (S) { return !!KL.crush(S) && single(S); }, fx: function (S) { var c = KL.crush(S); if (KL.chk(S, confessPower(S, c), 60, 7)) { startDating(S, c, '沖縄の海'); return '夕日の中で「好きです」。返事は、小さくうなずくことだった。'; } KL.likeAdd(c, -8); KL.add(S, 'men', -4); return '「ごめん、友達でいたい」。海の青さが目にしみた。'; } },
      { t: '恋人と抜け出す', req: function (S) { return !!S.partnerId; }, fx: function (S) { KL.likeAdd(KL.partner(S), 12); return '二人で見た星空は、一生忘れない。'; } },
      { t: '友達と夜通し語る', fx: function (S) { var f = friendOf(S); if (f) { KL.likeAdd(f, 15); if (f.like >= 80) f.rel = 'best'; } KL.add(S, 'com', 2); return (f ? f.name + 'と' : '友達と') + '朝まで将来の話をした。'; } }
    ] });
  E.push({ id: 'h_shinro', sched: true, pri: 2, cond: function (S) { return age(S) === 17 && !B(S) && S.stage === 'hs' && S.track !== 'soccer' && !S.plan; }, title: '進路を決める', icon: '🧭',
    text: function (S) { return '高校3年の秋。進路を決めなければならない。（学力 ' + Math.round(S.st.int) + '）' + (S.track === 'idol' ? '\nアイドル活動は卒業後も続けられる。' : ''); },
    choices: [
      { t: '大学受験：最難関を目指す', fx: function (S) { return univExam(S, 0); } },
      { t: '大学受験：実力相応の大学', fx: function (S) { var i = KL.UNIV.findIndex(function (u) { return S.st.int >= u.min; }); return univExam(S, Math.max(0, i)); } },
      { t: '専門学校に行く', fx: function (S) { S.plan = 'senmon'; return '手に職をつけるため、専門学校へ。'; } },
      { t: '高卒で就職する', fx: function (S) { var o = KL.jobOffers(S, 2); if (!o.length) { S.plan = 'free'; return '就職先が見つからず、ひとまずフリーターに。'; } KL.setJob(S, o[0]); S.plan = 'work'; return o[0].name + 'から内定をもらった。'; } },
      { t: 'アイドル活動に専念', req: function (S) { return S.track === 'idol'; }, fx: function (S) { S.plan = 'idol'; return '卒業後はアイドル一本で勝負する。'; } }
    ] });
  function univExam(S, idx) {
    var list = KL.UNIV.slice(idx), got = list[list.length - 1];
    for (var j = 0; j < list.length; j++) { if (list[j].min === 0 || KL.chk(S, 'int', list[j].min - 3, 5)) { got = list[j]; break; } }
    S.plan = 'univ'; S.nextSchool = got.name; S.flags.univTier = got.tier;
    var target = KL.UNIV[idx];
    KL.log(S, got.name + 'に合格。', 1);
    if (got === target) { KL.add(S, 'men', 3); return '合格！ 春から' + got.name + 'の学生だ。'; }
    KL.add(S, 'men', -2); return target.name + 'は不合格。' + got.name + 'に進学する。';
  }
  E.push({ id: 'h_sotsugyou', sched: true, pri: 2, cond: function (S) { return age(S) === 18 && B(S); }, title: '高校卒業', icon: '🎓',
    text: function (S) { var f = friendOf(S); return '卒業式。' + (f ? f.name + 'と' : '') + '最後のホームルームで、少しだけ泣いた。\n\n新しい生活：' + KL.stageLabel(S); },
    choices: [] });

  // ================= 大学・専門 =================
  E.push({ id: 'u_circle', sched: true, pri: 5, cond: function (S) { return age(S) === 18 && B(S) && S.stage === 'univ'; }, title: 'サークル選び', icon: '🎸', text: '新歓の嵐。どのサークルに入る？',
    choices: [
      { t: 'テニスサークル', req: function (S) { return S.track !== 'soccer'; }, fx: function (S) { KL.add(S, 'com', 3); KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: 'サークル', like: 45 }); return '飲み会が多い。出会いも多い。'; } },
      { t: '軽音サークル', fx: function (S) { KL.add(S, 'art', 3); return 'ギターを買った。'; } },
      { t: '勉強会・ゼミ系', fx: function (S) { KL.add(S, 'int', 3); return '意識の高い仲間ができた。'; } },
      { t: '入らない', fx: function (S) { KL.add(S, 'men', 1); return '自由な時間を手に入れた。'; } }
    ] });
  E.push({ id: 'u_hatachi', sched: true, pri: 6, cond: function (S) { return age(S) === 19 && !B(S); }, title: '二十歳のつどい', icon: '👘', text: function (S) { var o = osana(S); return '地元の成人式（二十歳のつどい）。' + (o ? '幼なじみの' + o.name + 'もいる。' : '懐かしい顔ぶれが集まった。'); },
    choices: [
      { t: '昔の友達と飲みに行く', fx: function (S) { S.npcs.forEach(function (n) { if (n.rel === 'oldfriend' || n.role === 'osana') KL.likeAdd(n, 10); }); KL.add(S, 'com', 2); return '朝まで昔話で盛り上がった。'; } },
      { t: '初恋の人に話しかける', fx: function (S) { var c = S.npcs.filter(function (n) { return n.role === 'crush' && n.rel === 'old' && KL.canLove(S, n); })[0]; if (!c || !single(S)) return '見当たらなかった。'; if (KL.chk(S, confessPower(S, c), 65, 8)) { startDating(S, c, '成人式で再会'); return '「実はずっと気になってた」。まさかの展開に。'; } KL.likeAdd(c, 5); return '連絡先を交換した。'; } }
    ] });
  E.push({ id: 'u_ryugaku', w: 2, cond: function (S) { return S.stage === 'univ'; }, title: '留学のチャンス', icon: '✈️', text: '大学の交換留学プログラムの募集が出た。',
    choices: [
      { t: '応募する（50万円）', req: function (S) { return S.money >= 500000; }, hint: true, fx: function (S) { KL.moneyAdd(S, -500000); KL.add(S, 'int', 4); KL.add(S, 'com', 4); KL.add(S, 'men', 3); S.flags.abroad = true; return '半年間の留学で、世界が一気に広がった。'; } },
      { t: '日本で頑張る', fx: function (S) { KL.add(S, 'int', 1); return '国内でできることをやろう。'; } }
    ] });
  E.push({ id: 'u_shukatsu', sched: true, pri: 3, cond: function (S) { return !(S.soccer && S.soccer.pending) && ((S.stage === 'univ' && age(S) === 21 && B(S)) || (S.stage === 'senmon' && age(S) === 19 && !B(S))); }, title: '就職活動', icon: '💼',
    text: function (S) { var o = KL.jobOffers(S, 5); S._jobs = o; return o.length ? '面接を重ね、内定をもらえた。どこに就職する？' : '全滅だった…。'; },
    choices: [0, 1, 2].map(function (i) {
      return { t: function (S) { var o = S._jobs && S._jobs[i]; return o ? o.name + '（初任年収' + o.base + '万円）' : ''; }, req: function (S) { return S._jobs && S._jobs[i]; },
        fx: function (S) { var o = S._jobs[i]; KL.setJob(S, o); return o.name + 'への就職が決まった。'; } };
    }).concat([{ t: '就職しない（フリーター・夢を追う）', fx: function (S) { S.job = null; return '自分の道を探すことにした。'; } }]) });

  // ================= 社会人 =================
  E.push({ id: 'w_first', sched: true, pri: 3, repeat: true, cond: function (S) { return S.stage === 'work' && S.job && S.job.years === 0 && !S.flags['wf' + S.job.id]; }, title: '社会人スタート', icon: '👔',
    text: function (S) { S.flags['wf' + S.job.id] = true; return S.job.name + 'での仕事が始まった。満員電車にも少しずつ慣れてきた。'; },
    choices: [
      { t: '誰よりも早く出社する', fx: function (S) { S.job.perf += 8; KL.fatAdd(S, 10); return '上司の評価が上がった。'; } },
      { t: '同期と仲良くなる', fx: function (S) { KL.add(S, 'com', 2); KL.newNPC(S, 'friend', S.sex, { met: '会社の同期', like: 55, rel: 'friend' }); KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: '会社の同期', like: 35, rel: 'colleague' }); return '同期の飲み会は毎回盛り上がる。'; } }
    ] });
  E.push({ id: 'w_promote', sched: true, pri: 5, repeat: true, cond: function (S) {
      if (S.stage !== 'work' || !S.job || !B(S)) return false; var j = S.job, max = (KL.jobTitles(S).length - 1);
      return j.title < max && j.years >= 2 + j.title * 2 && j.perf >= 45 + j.title * 6;
    }, title: '昇進の打診', icon: '📈',
    text: function (S) { var t = KL.jobTitles(S)[S.job.title + 1]; return '上司に呼ばれた。「来期から' + t + 'をやってもらえないか」'; },
    choices: [
      { t: '引き受ける', fx: function (S) { var j = S.job; if (j.title >= 3 && !KL.chk(S, (S.st.com + S.st.int) / 2, 50 + j.title * 5, 7)) { j.perf -= 10; return '最終面談で役員の評価が割れ、今回は見送りになった。'; } j.title++; j.perf = 35; var t = KL.jobTitles(S)[j.title]; KL.log(S, t + 'に昇進した。', 1); if (j.title >= 4) KL.title(S, j.name + ' ' + t); return t + 'に昇進した！ 年収は' + U.yen(KL.salary(S)) + 'に。'; } },
      { t: '現場にいたいので断る', fx: function (S) { KL.add(S, 'men', 2); return '自分のペースを大切にすることにした。'; } }
    ] });
  E.push({ id: 'w_project', w: 3, repeat: true, cond: function (S) { return S.stage === 'work' && S.job; }, title: '大型プロジェクト', icon: '📊', text: '社運を賭けたプロジェクトのメンバーに抜擢された。',
    choices: [
      { t: 'リーダーとして引っ張る', fx: function (S) { if (KL.chk(S, (S.st.com + S.st.int) / 2, 55, 7)) { S.job.perf += 18; KL.add(S, 'men', 2); return 'プロジェクトは大成功。社長賞をもらった。'; } S.job.perf -= 5; KL.add(S, 'men', -3); return '炎上した…。夜中まで謝罪行脚。'; } },
      { t: '堅実にサポートする', fx: function (S) { S.job.perf += 6; return '縁の下の力持ちとして評価された。'; } }
    ] });
  E.push({ id: 'w_boss', w: 2, repeat: true, cond: function (S) { return S.stage === 'work' && S.job && S.job.title <= 3; }, title: '理不尽な上司', icon: '😤', text: '上司が会議で、あなたの手柄を自分のものにした。',
    choices: [
      { t: 'その場で事実を伝える', fx: function (S) { if (KL.chk(S, 'com', 55, 8)) { S.job.perf += 8; return '冷静に説明でき、部長が「なるほど」とうなずいた。'; } S.job.perf -= 6; return '空気が凍りついた…。'; } },
      { t: 'ぐっとこらえる', fx: function (S) { KL.add(S, 'men', -3); return 'その夜はやけ酒だった。'; } },
      { t: '後で上司と一対一で話す', fx: function (S) { KL.add(S, 'com', 2); S.job.perf += 3; return '意外にも上司は素直に謝ってきた。'; } }
    ] });
  E.push({ id: 'w_headhunt', w: 2, repeat: true, cond: function (S) { return S.stage === 'work' && S.job && S.job.perf >= 60 && age(S) < 50; }, title: 'ヘッドハンティング', icon: '📞', text: function (S) { var o = KL.jobOffers(S, 5).filter(function (j) { return j.id !== S.job.id; })[0]; S._hh = o; return o ? o.name + 'から「ぜひうちに来てほしい」と連絡があった。' : '転職エージェントから連絡が来たが、ピンとこなかった。'; },
    choices: [
      { t: '転職する', req: function (S) { return !!S._hh; }, fx: function (S) { var o = S._hh, t = Math.max(0, S.job.title - 1); KL.setJob(S, o); S.job.title = t; S.job.perf = 45; KL.log(S, o.name + 'に転職した。', 1); return o.name + 'に転職した。年収は' + U.yen(KL.salary(S)) + '。'; } },
      { t: '今の会社に残る', fx: function (S) { S.job.perf += 4; return '今の会社でやり切ることにした。'; } }
    ] });
  E.push({ id: 'w_goukon', w: function (S) { return single(S) ? 3 : 0; }, repeat: true, cond: function (S) { return ['work', 'free', 'univ', 'pro', 'idol', 'senmon'].indexOf(S.stage) >= 0 && single(S) && age(S) < 45; }, title: '合コンのお誘い', icon: '🍻', text: '友達に「人数合わせで来てよ」と誘われた。',
    choices: [
      { t: '行く', fx: function (S) { var n = KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: '合コン', like: U.ri(25, 50) }); if (KL.chk(S, KL.mote(S), 50, 8)) { KL.likeAdd(n, 15); S.crushId = n.id; return n.name + prof(S, n) + 'と意気投合して連絡先を交換した。'; } return '盛り上げ役に徹して終わった。'; } },
      { t: '断る', fx: function () { return '家でゆっくり過ごした。'; } }
    ] });
  E.push({ id: 'w_kigyo', w: 1, cond: function (S) { return S.stage === 'work' && S.job && S.job.id !== 'kigyo' && age(S) >= 30 && age(S) <= 50 && S.money >= 5000000; }, title: '独立の誘惑', icon: '🚀', text: 'ずっと温めていたビジネスのアイデアがある。独立して起業する？',
    choices: [
      { t: '起業する（500万円）', fx: function (S) { KL.moneyAdd(S, -5000000); var ok = KL.chk(S, (S.st.int + S.st.com + S.st.men) / 3, 62, 8); S.job = { id: 'kigyo', name: '自分の会社', title: ok ? 4 : 2, perf: ok ? 60 : 30, years: 0, titles: ['個人事業主', '代表（従業員3名）', '代表（従業員10名）', '社長（従業員30名）', '社長（従業員100名）', '社長（上場準備中）', '上場企業の社長'] }; KL.log(S, '起業した。', 2); return ok ? '事業は軌道に乗った！ 社員も増えていく。' : 'なんとか食べていけるくらいの売上はある。'; } },
      { t: '会社員を続ける', fx: function () { return '安定も大事だ。'; } }
    ] });
  E.push({ id: 'w_kenshin', w: 2, repeat: true, cond: function (S) { return age(S) >= 40 && age(S) < 70; }, title: '健康診断', icon: '🩺', text: function (S) { return S.st.hp < 40 ? '健康診断で「要再検査」の文字が…。' : '健康診断の結果が届いた。'; },
    choices: [
      { t: '生活を見直す', fx: function (S) { KL.add(S, 'hp', 3); KL.add(S, 'men', 1); return 'ウォーキングと野菜中心の食事を始めた。'; } },
      { t: 'まあ大丈夫でしょ', fx: function (S) { if (S.st.hp < 40 && U.chance(0.3)) { KL.add(S, 'hp', -6); S.flags.sick = true; return '後日、体調を崩して入院した…。'; } return '特に何もしなかった。'; } }
    ] });
  E.push({ id: 'w_midlife', w: 1, cond: function (S) { return age(S) >= 42 && age(S) <= 52; }, title: 'ふと立ち止まる', icon: '🌆', text: 'ふと、「このままでいいのか」と考える夜があった。',
    choices: [
      { t: '新しい趣味を始める', fx: function (S) { KL.add(S, 'art', 3); KL.add(S, 'men', 3); return 'カメラを始めた。休日が楽しみになった。'; } },
      { t: '家族と旅行に行く', req: function (S) { return !!S.spouseId || S.kids.length; }, fx: function (S) { KL.add(S, 'men', 4); var p = KL.partner(S); if (p) KL.likeAdd(p, 8); KL.moneyAdd(S, -300000); return '久しぶりの家族旅行で、大切なものを再確認した。'; } }
    ] });
  E.push({ id: 'w_home', w: 1, cond: function (S) { return age(S) >= 30 && age(S) <= 55 && S.money >= 10000000 && !S.flags.home; }, title: 'マイホーム', icon: '🏠', text: '理想的な物件を見つけた。',
    choices: [
      { t: '買う（1000万円の頭金）', fx: function (S) { KL.moneyAdd(S, -10000000); S.flags.home = true; KL.add(S, 'men', 4); KL.log(S, 'マイホームを買った。', 1); return '一国一城の主になった。'; } },
      { t: '賃貸でいい', fx: function () { return '身軽さを選んだ。'; } }
    ] });
  E.push({ id: 'w_parent', sched: true, pri: 6, cond: function (S) { return age(S) === 55 && B(S); }, title: '親の介護', icon: '🧓', text: '実家の親が体調を崩した。',
    choices: [
      { t: '実家に通って支える', fx: function (S) { KL.add(S, 'men', -2); KL.add(S, 'com', 2); KL.fatAdd(S, 20); if (S.job) S.job.perf -= 5; return '大変だけど、親と話す時間が増えた。'; } },
      { t: '介護サービスを頼る（200万円）', fx: function (S) { KL.moneyAdd(S, -2000000); return 'プロの力を借りた。月に一度は顔を出している。'; } }
    ] });
  E.push({ id: 'w_parent_bye', sched: true, pri: 6, cond: function (S) { return age(S) === 62 && B(S); }, title: '親との別れ', icon: '🕊️', text: '親が静かに息を引き取った。',
    choices: [{ t: '手を握る', fx: function (S) { KL.add(S, 'men', -4); KL.log(S, '親を見送った。'); return '「ありがとう」と、何度も言った。'; } }] });
  E.push({ id: 'w_teinen', sched: true, pri: 2, cond: function (S) { return age(S) === 65 && B(S) && S.stage === 'retired' && S.job; }, title: '定年退職', icon: '💐', text: function (S) { return S.job.name + 'での' + S.job.years + '年間が終わった。送別会で花束をもらった。'; },
    choices: [{ t: '第二の人生へ', fx: function (S) { KL.add(S, 'men', 3); return '肩の荷が下りた気がした。'; } }] });
  E.push({ id: 'f_seishain', w: 3, repeat: true, cond: function (S) { return S.stage === 'free' && !S.talent && age(S) >= 19 && age(S) < 45; }, title: '就職のチャンス', icon: '📄', text: function (S) { var o = KL.jobOffers(S, 3); S._jobs = o; return o.length ? 'バイト先の店長が「正社員にならないか」と声をかけてくれた。ほかにも求人がある。' : '就職活動をしてみたが、うまくいかなかった。'; },
    choices: [0, 1].map(function (i) {
      return { t: function (S) { var o = S._jobs && S._jobs[i]; return o ? o.name + 'に就職する' : ''; }, req: function (S) { return S._jobs && S._jobs[i]; }, fx: function (S) { KL.setJob(S, S._jobs[i]); S.stage = 'work'; KL.newCohort(S, '職場'); KL.log(S, S.job.name + 'に就職した。', 1); return S.job.name + 'で正社員として働くことになった。'; } };
    }).concat([{ t: '今の生活を続ける', fx: function () { return '自由な生き方を続ける。'; } }]) });

  // ================= 恋愛・人間関係 =================
  function yesLine(n) { return n.sex === 'm' ? U.pick(['「…俺も、ずっと好きだった」', '「マジで？ …うれしい。よろしく」', '「先に言われちゃったな。俺も好きだよ」']) : U.pick(['「私も…好きでした」', '「…うん。よろしくお願いします」', '「遅いよ。ずっと待ってたんだから」']); }
  function prof(S, n) { return '（' + KL.profileLine(S, n) + '）'; }
  // モテるほど、見た目のいい人に好かれやすい
  function admirer(S, met, like) {
    var m = KL.mote(S);
    return KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: met, like: like || U.ri(62, 75), look: U.clamp(Math.round(42 + m * 0.4 + U.gauss() * 12), 30, 99) });
  }
  KL.admirer = admirer;
  function confessedCount(S) { S.flags.confessed = (S.flags.confessed || 0) + 1; }

  E.push({ id: 'r_confess', people: function (S) { return [S.crushId]; }, w: function (S) { var c = KL.crush(S); return c && c.like >= 55 ? 4 : 0; }, repeat: true, cond: function (S) { return age(S) >= 11 && age(S) < 60 && single(S) && !!KL.crush(S) && KL.crush(S).like >= 50; }, title: '告白するチャンス', icon: '💌',
    text: function (S) { var c = KL.crush(S); KL.ensureProfile(S, c); return '最近、' + c.name + prof(S, c) + 'とよく目が合う。二人きりになれるタイミングが来た。\n\n' + c.name.split(' ')[1] + 'の好きなタイプは「' + KL.prefName(c.pref) + '」らしい。'; },
    choices: [
      { t: '告白する', fx: function (S) { var c = KL.crush(S); if (!c || !single(S)) return 'タイミングを逃してしまった。'; if (KL.chk(S, confessPower(S, c), 60, 7)) { S.confessOk++; startDating(S, c, '告白'); return yesLine(c) + '\n世界が輝いて見えた。'; } S.confessNg++; KL.likeAdd(c, -10); KL.add(S, 'men', -4); S.crushId = null; return '「ごめんなさい」。その夜は眠れなかった。'; } },
      { t: 'まだ様子を見る', fx: function (S) { if (KL.crush(S)) KL.likeAdd(KL.crush(S), 3); return 'もう少し距離を縮めてからにしよう。'; } }
    ] });
  // 告白される（モテ度に比例して起きやすい）
  E.push({ id: 'r_confessed', people: function (S) { return [S._admirer]; }, w: function (S) { var m = KL.mote(S); return Math.max(0.1, Math.pow(Math.max(0, (m - 35) / 11), 2)); }, repeat: true, cond: function (S) { return age(S) >= 12 && age(S) < 55 && !S.spouseId; }, title: '呼び出し', icon: '💗',
    text: function (S) {
      var cand = S.npcs.filter(function (n) { return n.like >= 62 && ['ex', 'partner', 'spouse', 'old'].indexOf(n.rel) < 0 && n.id !== S.partnerId && (S.loveSex === 'any' || n.sex === S.loveSex); })[0];
      var n = cand || admirer(S, stu(S) ? U.pick(['隣のクラス', '後輩', '先輩', '同じ部活']) : U.pick(['知り合いの紹介', '職場', '行きつけの店', '友達の友達']));
      S._admirer = n.id; confessedCount(S);
      return n.name + prof(S, n) + 'に呼び出された。\n「ずっと前から好きでした。付き合ってください」' + (S.partnerId ? '\n\n…でも今は、' + KL.partner(S).name + 'と付き合っている。' : '') + (S.flags.confessed >= 3 ? '\n（告白されたのは、これで' + S.flags.confessed + '回目だ）' : '');
    },
    choices: [
      { t: function (S) { return S.partnerId ? '恋人と別れて付き合う' : '付き合う'; }, fx: function (S) { var n = KL.npc(S, S._admirer); var old = KL.partner(S); startDating(S, n, '告白された'); if (old) KL.add(S, 'men', -2); return n.name + 'と付き合うことになった。' + (old ? old.name + 'とは別れた。' : ''); } },
      { t: 'ごめんなさい', fx: function (S) { var n = KL.npc(S, S._admirer); KL.likeAdd(n, -20); KL.add(S, 'men', 1); if (KL.partner(S)) KL.likeAdd(KL.partner(S), 4); return S.partnerId ? '「好きな人がいるから」と断った。' : '気持ちはうれしかった。でも、今は応えられない。'; } }
    ] });
  // モテ期：同時に何人もから好かれる
  E.push({ id: 'r_moteki', people: function (S) { return S._mk || []; }, w: function (S) { var m = KL.mote(S); return m >= 62 ? (m - 55) / 10 : 0; }, repeat: true, cond: function (S) { return age(S) >= 13 && age(S) < 45 && single(S) && (S.flags.motekiT || -99) <= S.t - 6; }, title: 'モテ期到来', icon: '💘',
    text: function (S) {
      S.flags.motekiT = S.t;
      var k = KL.mote(S) >= 80 ? 3 : 2, place = stu(S) ? ['同じクラス', '後輩', '他校'] : ['職場', '合コン', 'ジム'];
      S._mk = []; for (var i = 0; i < k; i++) { var n = admirer(S, place[i], U.ri(66, 80)); S._mk.push(n.id); confessedCount(S); }
      return '最近、なぜか急にモテる。この1か月で' + k + '人からアプローチされた。\n\n' + S._mk.map(function (id) { var n = KL.npc(S, id); return '・' + n.name + prof(S, n); }).join('\n');
    },
    choices: [0, 1, 2].map(function (i) {
      return { t: function (S) { var n = S._mk && KL.npc(S, S._mk[i]); return n ? n.name + 'と付き合う' : ''; }, req: function (S) { return S._mk && S._mk[i]; },
        fx: function (S) { var n = KL.npc(S, S._mk[i]); startDating(S, n, 'モテ期'); S._mk.forEach(function (id) { if (id !== n.id) KL.likeAdd(KL.npc(S, id), -15); }); return n.name + 'を選んだ。ほかの人にはきちんと断りを入れた。'; } };
    }).concat([{ t: '今は誰とも付き合わない', fx: function (S) { S._mk.forEach(function (id) { KL.likeAdd(KL.npc(S, id), -10); }); KL.add(S, 'men', 2); return '自分のやりたいことに集中することにした。'; } }]) });
  // 有名になると芸能人からアプローチ
  E.push({ id: 'r_celeb', people: function (S) { return [S._celeb]; }, w: function (S) { return S.rep.nat >= 45 ? 1.5 + S.rep.nat / 40 : 0; }, repeat: true, cond: function (S) { return age(S) >= 19 && age(S) < 42 && single(S) && S.rep.nat >= 45 && (S.stage === 'pro' || S.stage === 'idol' || !!S.talent) && (S.flags.celebT || -99) <= S.t - 4; }, title: '芸能人からのアプローチ', icon: '🌟',
    text: function (S) {
      S.flags.celebT = S.t;
      var sx = KL.loveSexPick(S), job = U.pick(KL.PROF.celeb[sx]);
      var n = KL.newNPC(S, 'crush', sx, { met: '番組の共演・食事会', like: U.ri(60, 75), look: U.ri(78, 97), job: job, ad: U.ri(-3, 3), rel: 'classmate' });
      S._celeb = n.id; confessedCount(S);
      return '知人の食事会で、人気' + job + 'の' + n.name + prof(S, n) + 'と知り合った。後日、向こうから「また会えませんか？」と連絡が来た。';
    },
    choices: [
      { t: '会ってみる', fx: function (S) { var n = KL.npc(S, S._celeb); if (KL.chk(S, confessPower(S, n), 58, 7)) { startDating(S, n, '芸能人と交際'); KL.repAdd(S, 'nat', 3); return '何度か食事を重ねて、交際がスタート。数か月後、スポーツ紙に「熱愛」の見出しが躍った。'; } KL.likeAdd(n, -10); return '楽しかったけど、お互い忙しくて自然消滅した。'; } },
      { t: '断る', fx: function (S) { KL.likeAdd(KL.npc(S, S._celeb), -15); return '今は本業に集中したい。'; } }
    ] });
  E.push({ id: 'r_valentine', sched: true, pri: 7, repeat: true, cond: function (S) { return B(S) && age(S) >= 8 && age(S) <= 22 && stu(S); }, title: 'バレンタインデー', icon: '🍫',
    text: function (S) {
      if (S.sex === 'm' || S.loveSex === 'f') {
        var n = Math.max(0, Math.round((S.st.look - 40) / 8 + (S.st.com - 40) / 12 + S.rep.sch / 15 + U.gauss() * 1.5 + (S.partnerId ? 1 : 0)));
        if (S.track === 'idol' && S.idol && S.idol.status !== 'trainee') n += 30;
        S.choc += n; S._chocN = n;
        return n === 0 ? '今年のチョコは…0個。母からの1個が身にしみる。' : n >= 10 ? 'チョコを' + n + '個もらった！ 机の中にも下駄箱にもぎっしり。' : 'チョコを' + n + '個もらった。';
      }
      return '2月14日。チョコを渡す？';
    },
    choices: [
      { t: '本命チョコを渡す', req: function (S) { return S.sex === 'f' && S.loveSex !== 'f' && (!!KL.crush(S) || !!S.partnerId); }, fx: function (S) { var c = KL.partner(S) || KL.crush(S); if (!c) return '渡す相手がいなかった。'; KL.likeAdd(c, 12); if (single(S) && KL.chk(S, confessPower(S, c), 60, 7)) { startDating(S, c, 'バレンタイン'); return '「ありがとう、俺も好きだった」。付き合うことになった！'; } return c.name + 'に手作りチョコを渡した。'; } },
      { t: '友チョコを配る', req: function (S) { return S.sex === 'f' && S.loveSex !== 'f'; }, fx: function (S) { KL.add(S, 'com', 2); return 'クラスの女子と交換会をした。'; } }
    ] });
  E.push({ id: 'r_fight', w: function (S) { var p = KL.partner(S); return p && !S.spouseId && p.like < 55 ? 3 : 0; }, repeat: true, cond: function (S) { return !!S.partnerId; }, title: '恋人とケンカ', icon: '💢', text: function (S) { return KL.partner(S).name + 'と、ささいなことでケンカになった。'; },
    choices: [
      { t: '素直に謝る', fx: function (S) { if (KL.partner(S)) KL.likeAdd(KL.partner(S), 10); return '仲直りできた。'; } },
      { t: '意地を張る', fx: function (S) { if (KL.partner(S)) KL.likeAdd(KL.partner(S), -10); KL.add(S, 'men', 1); return '冷戦状態が続いている…。'; } }
    ] });
  E.push({ id: 'r_breakup', people: function (S) { return [S.partnerId]; }, sched: true, pri: 5, repeat: true, cond: function (S) { var p = KL.npc(S, S.partnerId); return !!p && p.like < 22; }, title: '別れ', icon: '💔', text: function (S) { return KL.npc(S, S.partnerId).name + 'から「別れよう」と言われた。'; },
    choices: [{ t: '受け入れる', fx: function (S) { var p = KL.npc(S, S.partnerId); p.rel = 'ex'; S.partnerId = null; S.exCount++; KL.add(S, 'men', -5); KL.log(S, p.name + 'と別れた。'); return '泣いた。でも、前に進むしかない。'; } }] });
  E.push({ id: 'r_newcrush', people: function (S) { return [S._nc]; }, w: function (S) { return KL.crush(S) ? 0 : 2; }, repeat: true, cond: function (S) { return age(S) >= 10 && age(S) < 50 && single(S) && !KL.crush(S); }, title: '気になる人', icon: '👀',
    text: function (S) { var cands = S.npcs.filter(function (n) { return KL.canLove(S, n) && (n.rel === 'classmate' || n.rel === 'colleague' || (n.role === 'crush' && n.rel !== 'ex')); }); var n = cands.length ? U.pick(cands) : KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: stu(S) ? '同じクラス' : '友人の紹介' }); S._nc = n.id; return '最近、' + n.name + prof(S, n) + 'のことが気になって仕方ない。'; },
    choices: [{ t: '意識してしまう', fx: function (S) { S.crushId = S._nc; KL.likeAdd(KL.npc(S, S._nc), 5); return '「気になる人」が' + KL.npc(S, S._nc).name + 'になった。'; } }, { t: '気のせいだと思う', fx: function () { return '今は自分のことに集中しよう。'; } }] });
  E.push({ id: 'r_bestfriend', w: 2, cond: function (S) { var f = friendOf(S); return !!f && f.like >= 72 && age(S) >= 8; }, title: '親友', icon: '🤝', text: function (S) { return friendOf(S).name + 'が、誰にも言えない悩みを打ち明けてくれた。'; },
    choices: [{ t: '真剣に聞く', fx: function (S) { var f = friendOf(S); if (!f) return '話を聞いて、少し心が通じた気がした。'; f.rel = 'best'; KL.likeAdd(f, 10); KL.add(S, 'com', 2); KL.log(S, f.name + 'と親友になった。'); return 'その日から、' + f.name + 'は一生ものの親友になった。'; } }] });
  E.push({ id: 'r_propose', people: function (S) { return [S.partnerId]; }, w: function (S) { var p = KL.npc(S, S.partnerId); return p && p.like >= 70 ? 6 : 0; }, repeat: true, cond: function (S) { var p = KL.npc(S, S.partnerId); return !!p && age(S) >= 23 && S.t - p.since >= 4 && !S.spouseId; }, title: 'プロポーズ', icon: '💍',
    text: function (S) { return KL.npc(S, S.partnerId).name + 'と付き合って' + Math.floor((S.t - KL.npc(S, S.partnerId).since) / 2) + '年。そろそろ…？'; },
    choices: [
      { t: 'プロポーズする', fx: function (S) { var p = KL.npc(S, S.partnerId); if (!p) return 'タイミングを逃した。'; if (KL.chk(S, p.like + (p.parentsOk ? 8 : 0), 60, 6)) { marry(S, p); return '「はい」。涙で顔がぐしゃぐしゃになった。結婚が決まった！'; } KL.likeAdd(p, -8); return '「…もう少し待って」と言われた。'; } },
      { t: 'まだ早い', fx: function (S) { KL.likeAdd(KL.npc(S, S.partnerId), -3); return '今のままの関係を続ける。'; } }
    ] });
  function marry(S, p) {
    p.rel = 'spouse'; S.spouseId = p.id; S.partnerId = null; S.crushId = null; S.marriedT = S.t;
    KL.add(S, 'men', 5);
    KL.log(S, p.name + 'と結婚した。', 2);
  }
  KL.marry = marry;
  E.push({ id: 'r_baby', w: function (S) { return S.kids.length >= 3 ? 0 : 4 - S.kids.length; }, repeat: true, cond: function (S) { return !!S.spouseId && age(S) >= 23 && age(S) <= 44 && S.t - (S.lastKidT || -99) >= 4; }, title: 'こうのとり', icon: '👶',
    text: function (S) { return KL.partner(S).name + 'が少し照れながら言った。「赤ちゃんができたみたい」'; },
    choices: [{ t: '抱きしめる', fx: function (S) { var sex = U.pick(['m', 'f']); var k = { name: U.pick(sex === 'm' ? KL.NAMES.m : KL.NAMES.f), sex: sex, born: S.t }; S.kids.push(k); S.lastKidT = S.t; KL.add(S, 'men', 4); KL.log(S, (sex === 'm' ? '長男' : '長女').replace('長', S.kids.length === 1 ? '長' : S.kids.length === 2 ? '次' : '三') + '・' + k.name + 'が生まれた。', 2); return k.name + 'が生まれた。小さな手が、指をぎゅっと握った。'; } }] });
  E.push({ id: 'r_kid_grow', w: 2, repeat: true, cond: function (S) { return S.kids.some(function (k) { var ka = (S.t - k.born) / 2; return ka >= 5 && ka <= 18; }); }, title: '子どもの成長', icon: '🧒',
    text: function (S) { var k = S.kids.filter(function (k) { var ka = (S.t - k.born) / 2; return ka >= 5 && ka <= 18; })[0]; S._kid = k.name; var ka = Math.floor((S.t - k.born) / 2); return k.name + '（' + ka + '歳）の' + (ka < 12 ? '運動会' : ka < 15 ? '三者面談' : '進路相談') + 'がある。'; },
    choices: [
      { t: '仕事を休んで行く', fx: function (S) { KL.add(S, 'men', 3); if (S.job) S.job.perf -= 3; return S._kid + 'がうれしそうに手を振った。'; } },
      { t: '仕事を優先する', fx: function (S) { if (S.job) S.job.perf += 3; KL.add(S, 'men', -2); return 'あとで写真を見せてもらった。'; } }
    ] });
  E.push({ id: 'r_mago', w: 2, repeat: true, cond: function (S) { return age(S) >= 50 && S.kids.some(function (k) { return (S.t - k.born) / 2 >= 26; }) && (S.flags.mago || 0) < 4; }, title: '孫の誕生', icon: '🍼', text: '子どもから「生まれたよ」と写真が届いた。',
    choices: [{ t: 'すぐに会いに行く', fx: function (S) { S.flags.mago = (S.flags.mago || 0) + 1; KL.add(S, 'men', 5); KL.log(S, '孫が生まれた。', 1); return 'おじいちゃん・おばあちゃんになった。孫はとにかくかわいい。'; } }] });
  E.push({ id: 'r_dousoukai', w: 1, repeat: true, cond: function (S) { return age(S) >= 28 && (age(S) % 10 === 0 || age(S) % 10 === 5); }, title: '同窓会', icon: '🍶', text: function (S) { return '高校の同窓会の案内が届いた。'; },
    choices: [
      { t: '参加する', fx: function (S) { KL.add(S, 'com', 1); KL.add(S, 'men', 2); var o = S.npcs.filter(function (n) { return n.rel === 'oldfriend' || n.rel === 'best'; }); o.forEach(function (n) { KL.likeAdd(n, 8); }); var lbl = KL.perception(S).main; return '「今、何してるの？」と聞かれた。昔の同級生からの印象は「' + lbl + '」だった。'; } },
      { t: '今回は欠席', fx: function () { return '近況はSNSで見ることにした。'; } }
    ] });
  E.push({ id: 'r_spouse_bye', w: function (S) { return age(S) >= 72 ? 2 : 0; }, cond: function (S) { return !!S.spouseId && age(S) >= 72; }, title: '最愛の人との別れ', icon: '🕯️', text: function (S) { return KL.partner(S).name + 'が先に旅立った。'; },
    choices: [{ t: 'ありがとう', fx: function (S) { var p = KL.partner(S); p.rel = 'spouse'; p.dead = true; KL.add(S, 'men', -8); KL.add(S, 'hp', -4); KL.log(S, '配偶者の' + p.name + 'を見送った。', 2); S.flags.widow = true; return '長い間、本当にありがとう。'; } }] });
  E.push({ id: 'r_goldwed', sched: true, pri: 6, cond: function (S) { return !!S.spouseId && !S.flags.widow && S.marriedT !== undefined && S.t - S.marriedT >= 100; }, title: '金婚式', icon: '💛', text: function (S) { return KL.partner(S).name + 'と結婚して50年。子どもたちがお祝いの会を開いてくれた。'; },
    choices: [{ t: '照れながら乾杯', fx: function (S) { KL.add(S, 'men', 5); KL.title(S, '金婚式'); return 'これからも、よろしく。'; } }] });

  // ================= その他（全年代） =================
  E.push({ id: 'x_takarakuji', w: 1, repeat: true, cond: function (S) { return age(S) >= 20; }, title: '年末ジャンボ', icon: '🎫', text: '宝くじ売り場の前を通りかかった。',
    choices: [
      { t: '10枚買う（3000円）', fx: function (S) { KL.moneyAdd(S, -3000); if (U.chance(0.002)) { KL.moneyAdd(S, 100000000); KL.log(S, '宝くじで1億円が当たった！', 2); return '…え？ 1億円当たってる！？'; } if (U.chance(0.05)) { KL.moneyAdd(S, 10000); return '1万円が当たった！'; } return '300円だけ当たった。'; } },
      { t: '買わない', fx: function () { return '夢は自分の手でつかむ。'; } }
    ] });
  E.push({ id: 'x_sick', w: function (S) { return S.fat > 70 ? 5 : 0.3; }, repeat: true, cond: function (S) { return S.t > 2; }, title: '体調不良', icon: '🤒', text: '無理がたたって熱を出した。',
    choices: [
      { t: 'しっかり休む', fx: function (S) { KL.fatAdd(S, -30); return '数日で回復した。'; } },
      { t: '気合いで乗り切る', fx: function (S) { if (U.chance(0.4)) { KL.add(S, 'hp', -3); KL.fatAdd(S, 10); return 'こじらせて長引いてしまった…。'; } KL.add(S, 'men', 2); return 'なんとか乗り切った。'; } }
    ] });
  E.push({ id: 'x_cat', w: 1, cond: function (S) { return age(S) >= 7 && age(S) < 70; }, title: '捨て猫', icon: '🐈', text: '雨の中、段ボールの中で子猫が鳴いていた。',
    choices: [
      { t: '連れて帰る', fx: function (S) { S.flags.cat = U.pick(['ミケ', 'タマ', 'こむぎ', 'ルナ', 'モカ']); KL.add(S, 'men', 4); KL.log(S, '猫の「' + S.flags.cat + '」を家族に迎えた。'); return '「' + S.flags.cat + '」と名付けた。今では家族の一員だ。'; } },
      { t: '里親を探す', fx: function (S) { KL.add(S, 'com', 2); return 'SNSで呼びかけて、優しい里親が見つかった。'; } }
    ] });
  E.push({ id: 'x_sns_buzz', w: 1, repeat: true, cond: function (S) { return age(S) >= 14 && age(S) < 60; }, title: 'SNSでバズる', icon: '📱', text: '何気なく投稿した写真が、なぜか拡散され始めた。',
    choices: [
      { t: 'この流れに乗る', fx: function (S) { KL.repAdd(S, 'nat', 4); KL.repAdd(S, 'sch', 6); if (S.idol) S.idol.fans += 8000; return 'フォロワーが一気に1万人増えた。'; } },
      { t: 'そっと鍵をかける', fx: function (S) { KL.add(S, 'men', 1); return '平穏が一番。'; } }
    ] });
  E.push({ id: 'o_hobby', w: 2, repeat: true, cond: function (S) { return S.stage === 'retired'; }, title: '穏やかな日々', icon: '🍵', text: '縁側でお茶を飲みながら、これまでの人生を振り返る。',
    choices: [
      { t: '昔の友達に電話する', fx: function (S) { var o = S.npcs.filter(function (n) { return (n.rel === 'best' || n.rel === 'oldfriend' || n.role === 'osana') && !n.dead; })[0]; KL.add(S, 'men', 3); return o ? o.name + 'と1時間も話し込んだ。声は昔のままだった。' : '懐かしい友人と話せた。'; } },
      { t: '自分史を書き始める', fx: function (S) { KL.add(S, 'art', 2); KL.add(S, 'int', 1); return 'ページをめくるたびに、思い出がよみがえる。'; } }
    ] });
  E.push({ id: 'o_travel', w: 1, repeat: true, cond: function (S) { return S.stage === 'retired' && S.money >= 1000000 && S.st.hp >= 25; }, title: '旅に出る', icon: '🗺️', text: '時間ならたっぷりある。旅行に行こうか。',
    choices: [
      { t: '世界一周（300万円）', req: function (S) { return S.money >= 3000000; }, hint: true, fx: function (S) { KL.moneyAdd(S, -3000000); KL.add(S, 'men', 6); if (!S.flags.worldTrip) { S.flags.worldTrip = true; KL.title(S, '世界一周'); } return '夢だった世界一周を果たした。'; } },
      { t: '温泉旅行（20万円）', fx: function (S) { KL.moneyAdd(S, -200000); KL.add(S, 'hp', 2); KL.add(S, 'men', 3); return '心も体もほぐれた。'; } }
    ] });
  E.push({ id: 'o_illness', w: function (S) { return S.st.hp < 30 ? 3 : 0.5; }, repeat: true, cond: function (S) { return age(S) >= 60; }, title: '入院', icon: '🏥', text: '体調を崩して入院することになった。',
    choices: [{ t: '治療に専念する', fx: function (S) { KL.moneyAdd(S, -300000); if (U.chance(0.7)) { KL.add(S, 'hp', -2); return '無事に退院できた。家族が迎えに来てくれた。'; } KL.add(S, 'hp', -8); S.flags.sick = true; return '思ったより長引いている…。'; } }] });

  // ================= 芸能・解説者の収入など =================
  E.push({ id: 'c_tv', w: 2, repeat: true, cond: function (S) { return S.stage === 'free' && !!S.talent; }, title: 'テレビ出演', icon: '📺', text: function (S) { return S.talent + 'として、ゴールデンタイムの番組に呼ばれた。'; },
    choices: [{ t: '出演する', fx: function (S) { KL.repAdd(S, 'nat', 4); KL.moneyAdd(S, 500000); return '番組は好評で、またお声がかかりそうだ。'; } }] });

  // ======================================================
  //  学生生活（部活・行事・季節イベント）
  // ======================================================
  KL.CLUBS_SPORT = ['バスケ部', '野球部', 'テニス部', '陸上部', 'バレー部', '卓球部', '剣道部', '水泳部', 'バドミントン部', 'ハンドボール部'];
  KL.CLUBS_CULTURE = ['吹奏楽部', '美術部', '軽音部', '演劇部', '科学部', '写真部', '書道部', '放送部', '茶道部', '文芸部'];
  function inSchool(S) { return ['elem', 'jhs', 'hs'].indexOf(S.stage) >= 0; }
  function teen(S) { return S.stage === 'jhs' || S.stage === 'hs'; }
  function clubName(S) { return S.flags.clubName || ''; }
  function clubOn(S) { return teen(S) && !!S.flags.clubName && !S.flags.clubRetired; }
  function clubStat(S) { return S.flags.club === 'sport' ? (S.st.ath * 0.6 + S.st.hp * 0.4) : (S.st.art * 0.7 + S.st.men * 0.3); }
  function pickClub(list, n) { return U.shuffle(list).slice(0, n); }

  // 部活を選ぶ（中学・高校）
  E.push({ id: 's_club_pick', sched: true, pri: 3, repeat: true,
    cond: function (S) { return teen(S) && S.track !== 'soccer' && (S.flags.club === 'sport' || S.flags.club === 'culture') && S.flags.clubStage !== S.stage; },
    title: '部活を決める', icon: '🏫',
    text: function (S) { S._clubs = pickClub(S.flags.club === 'sport' ? KL.CLUBS_SPORT : KL.CLUBS_CULTURE, 4); return '体験入部を回ってみた。どこに入る？'; },
    choices: [0, 1, 2, 3].map(function (i) {
      return { t: function (S) { return S._clubs ? S._clubs[i] : ''; }, req: function (S) { return S._clubs && S._clubs[i]; },
        fx: function (S) { S.flags.clubName = S._clubs[i]; S.flags.clubStage = S.stage; S.flags.clubRetired = false; S.flags.clubRole = ''; KL.log(S, S._clubs[i] + 'に入部した。'); var f = KL.newNPC(S, 'friend', S.sex, { met: S._clubs[i], like: 50, rel: 'friend' }); return S._clubs[i] + 'に入部した。同期の' + f.name + 'とすぐに打ち解けた。'; } };
    }) });
  E.push({ id: 'h_club_cont', sched: true, pri: 3,
    cond: function (S) { return age(S) === 15 && B(S) && S.stage === 'hs' && S.track !== 'soccer'; },
    title: '高校の部活', icon: '🏫', text: function (S) { return '高校でも部活に入る？' + (clubName(S) ? '（中学では' + clubName(S) + '）' : ''); },
    choices: [
      { t: function (S) { return clubName(S) ? clubName(S) + 'を続ける' : '運動部に入る'; }, fx: function (S) { if (clubName(S)) { S.flags.clubStage = 'hs'; S.flags.clubRetired = false; S.flags.clubRole = ''; return '高校でも' + clubName(S) + '。今度こそ全国を目指す。'; } S.flags.club = 'sport'; S.flags.clubStage = ''; return '運動部を見て回ることにした。'; } },
      { t: '別の部活に入る', fx: function (S) { S.flags.club = S.flags.club === 'sport' ? 'culture' : 'sport'; S.flags.clubStage = ''; S.flags.clubName = ''; return '新しいことに挑戦してみよう。'; } },
      { t: '帰宅部（勉強・バイトに集中）', fx: function (S) { S.flags.club = 'none'; S.flags.clubName = ''; KL.add(S, 'int', 1); return '放課後は自分の時間にする。'; } }
    ] });
  // 夏の大会・コンクール（毎年）
  E.push({ id: 's_club_taikai', sched: true, pri: 6, repeat: true,
    cond: function (S) { return clubOn(S) && B(S) && S.flags.taikaiT !== S.t && KL.age(S) !== 12 && KL.age(S) !== 15; },
    title: function (S) { return S.flags.club === 'sport' ? clubName(S) + '・夏の大会' : clubName(S) + '・コンクール'; }, icon: '🏆',
    text: function (S) {
      S.flags.taikaiT = S.t;
      var lv = clubStat(S), a = KL.age(S), last = a === 14 || a === 17;
      var rounds = S.flags.club === 'sport' ? ['地区予選', '県大会', '県大会決勝', '地方大会', '全国大会', '全国優勝'] : ['地区大会', '県大会', '県大会金賞', '支部大会', '全国大会', '全国金賞'];
      var r = 0, need = 32 + (a - 12) * 4;
      while (r < rounds.length - 1 && KL.chk(S, lv + (S.flags.clubRole === '部長' ? 2 : 0), need + r * 7, 5)) r++;
      var res = rounds[r];
      if (r >= 2) KL.repAdd(S, 'sch', 6 + r * 2);
      if (r >= 4) { KL.repAdd(S, 'loc', 10); KL.title(S, clubName(S) + ' ' + (a < 15 ? '中学' : '高校') + '・' + res); }
      var msg = '結果は「' + res + '」。' + (r >= 4 ? '全国の舞台に立った！' : r >= 2 ? '学校で表彰された。' : '悔しい結果に終わった。');
      if (last) { S.flags.clubRetired = true; KL.add(S, 'men', 2); msg += '\n\nこれが最後の大会。' + clubName(S) + 'を引退した。' + (r <= 1 ? '涙が止まらなかった。' : '最高の仲間だった。'); KL.log(S, clubName(S) + 'を引退（最後の大会：' + res + '）。'); }
      return msg;
    }, choices: [] });
  E.push({ id: 's_club_captain', sched: true, pri: 6, repeat: true,
    cond: function (S) { return clubOn(S) && !B(S) && (KL.age(S) === 13 || KL.age(S) === 16) && S.flags.capT !== KL.age(S); },
    title: '新体制', icon: '📣', text: function (S) { S.flags.capT = KL.age(S); return '先輩たちが引退し、' + clubName(S) + 'の新しい部長を決めることになった。顧問の先生がこっちを見ている。'; },
    choices: [
      { t: '部長に立候補する', fx: function (S) { if (KL.chk(S, (S.st.com + S.st.men) / 2, 42, 7)) { S.flags.clubRole = '部長'; KL.add(S, 'com', 2); KL.add(S, 'men', 2); KL.repAdd(S, 'sch', 6); KL.title(S, clubName(S) + ' 部長'); return '部長に選ばれた！ チームをまとめる立場になった。'; } return '投票で別の人に決まった。副部長として支えることになった。'; } },
      { t: '自分のプレーに集中する', fx: function (S) { if (S.flags.club === 'sport') KL.add(S, 'ath', 2); else KL.add(S, 'art', 2); return 'エースとして結果で引っ張ることにした。'; } }
    ] });
  E.push({ id: 's_club_practice', w: 5, repeat: true, cond: function (S) { return clubOn(S); }, title: function (S) { return clubName(S) + 'の日々'; }, icon: '💦',
    text: function (S) { return S.flags.club === 'sport' ? '夏の合宿。顧問のしごきで足が棒のようだ。' : '発表会に向けて、毎日遅くまで練習が続く。'; },
    choices: [
      { t: '誰よりも残って練習する', fx: function (S) { if (S.flags.club === 'sport') { KL.grow(S, 'ath', 3); KL.grow(S, 'hp', 2); } else KL.grow(S, 'art', 3); KL.fatAdd(S, 15); return 'やればやるだけ上手くなるのが楽しい。'; } },
      { t: '仲間とふざけながら楽しむ', fx: function (S) { KL.add(S, 'com', 2); S.npcs.forEach(function (n) { if (n.met === clubName(S)) KL.likeAdd(n, 8); }); return '帰りのコンビニで食べたアイスの味は一生忘れない。'; } }
    ] });

  // 小学校
  E.push({ id: 'e_sankan', w: 2, cond: function (S) { return S.stage === 'elem' && age(S) <= 9; }, title: '授業参観', icon: '🙋', text: '今日は授業参観。後ろに親たちがずらりと並んでいる。',
    choices: [
      { t: '張り切って手を挙げる', fx: function (S) { if (KL.chk(S, 'int', 25, 8)) { KL.add(S, 'men', 2); return '見事正解！ 帰り道、母が上機嫌だった。'; } KL.add(S, 'com', 1); return '答えを間違えて教室が笑いに包まれた。でも親は笑顔だった。'; } },
      { t: '緊張して固まる', fx: function (S) { KL.add(S, 'men', -1); return '一度も後ろを振り返れなかった。'; } }
    ] });
  E.push({ id: 'e_half', sched: true, pri: 7, cond: function (S) { return age(S) === 10 && !B(S) && S.stage === 'elem'; }, title: '二分の一成人式', icon: '📜', text: '10歳を祝う二分の一成人式。親への手紙を読むことになった。',
    choices: [
      { t: '感謝の気持ちを素直に書く', fx: function (S) { KL.add(S, 'men', 2); KL.add(S, 'com', 1); return '読み終わると、母が泣いていた。'; } },
      { t: '将来の夢を堂々と語る', fx: function (S) { var d = { soccer: 'サッカー選手', idol: 'アイドル', doctor: 'お医者さん', ceo: '社長' }[S.flags.dream] || '立派な大人'; KL.add(S, 'men', 2); return '「' + d + 'になります！」と宣言した。'; } }
    ] });
  E.push({ id: 'e_marathon', w: 1, repeat: true, cond: function (S) { return (S.stage === 'elem' || S.stage === 'jhs') && !B(S); }, title: 'マラソン大会', icon: '🏃', text: '寒空の下、校内マラソン大会のスタートラインに立った。',
    choices: [
      { t: '1位を狙う', fx: function (S) { if (KL.chk(S, (S.st.hp + S.st.ath) / 2, 30 + (age(S) - 6) * 4, 6)) { KL.repAdd(S, 'sch', 6); KL.add(S, 'men', 2); return '学年1位でゴール！ 朝礼で表彰された。'; } KL.add(S, 'hp', 1); return '途中で脇腹が痛くなったけど、最後まで走りきった。'; } },
      { t: '友達と一緒に走る約束をする', fx: function (S) { KL.add(S, 'com', 1); return '…約束は、ゴール前で見事に裏切られた。'; } }
    ] });
  E.push({ id: 'e_snow', w: 1, cond: function (S) { return S.stage === 'elem' && !B(S); }, title: '大雪の日', icon: '⛄', text: '朝起きたら一面の銀世界。学校は2時間遅れで始まるらしい。',
    choices: [{ t: '雪合戦する', fx: function (S) { KL.add(S, 'ath', 1); KL.add(S, 'com', 2); return '顔面に雪玉をくらった。最高に楽しかった。'; } }, { t: '雪だるまを作る', fx: function (S) { KL.add(S, 'art', 2); return '学校で一番大きな雪だるまができた。'; } }] });
  E.push({ id: 'e_phone', sched: true, pri: 7, cond: function (S) { return age(S) === 11 && B(S); }, title: 'スマホデビュー', icon: '📱', text: 'ついに自分のスマホを買ってもらえた！',
    choices: [
      { t: 'クラスのグループLINEに入る', fx: function (S) { KL.add(S, 'com', 2); KL.repAdd(S, 'sch', 2); return '通知が鳴りやまない。'; } },
      { t: 'ゲームを入れまくる', fx: function (S) { KL.add(S, 'int', -1); KL.add(S, 'men', 1); return '親に「1日1時間まで」と言われた。'; } },
      { t: '勉強アプリを入れる', fx: function (S) { KL.add(S, 'int', 2); return '親が感動していた。'; } }
    ] });

  // 中学・高校
  E.push({ id: 's_sekigae', w: 2, repeat: true, cond: function (S) { return inSchool(S) && age(S) >= 10; }, title: '席替え', icon: '🪑',
    text: function (S) { var c = KL.crush(S); S._sg = c && U.chance(0.5) ? c.id : null; return 'くじ引きで席替え。' + (S._sg ? 'なんと隣の席は' + c.name + '！' : '窓際の一番後ろ、通称「主人公席」を引いた。'); },
    choices: [
      { t: function (S) { return S._sg ? '話しかけるきっかけにする' : '授業中、窓の外を眺める'; }, fx: function (S) { var c = S._sg && KL.npc(S, S._sg); if (c) { KL.likeAdd(c, 8 + S.st.com / 15); return '消しゴムを貸したのをきっかけに、よく話すようになった。'; } KL.add(S, 'art', 1); return 'ぼーっとしていたら先生に当てられた。'; } },
      { t: 'まじめに授業を受ける', fx: function (S) { KL.add(S, 'int', 1); return 'ノートがきれいだと評判になった。'; } }
    ] });
  E.push({ id: 's_hanabi', w: function (S) { return 2; }, repeat: true, cond: function (S) { return age(S) >= 10 && age(S) <= 22 && B(S) && KL.isStudent(S); }, title: '夏祭り', icon: '🎆', text: '地元の夏祭り。夜には花火も上がる。',
    choices: [
      { t: function (S) { return S.partnerId ? KL.partner(S).name + 'と行く' : '気になる人を誘う'; }, req: function (S) { return !!S.partnerId || !!KL.crush(S); }, hint: true, fx: function (S) { var p = KL.partner(S); if (p) { KL.likeAdd(p, 10); return '浴衣姿にドキッとした。花火の音で、言葉はいらなかった。'; } var c = KL.crush(S); if (!c) return '結局、友達と行くことにした。'; if (KL.chk(S, c.like + S.st.com / 3, 55, 8)) { KL.likeAdd(c, 12); return c.name + 'がOKしてくれた！ りんご飴を半分こした。'; } KL.likeAdd(c, -2); return '「ごめん、友達と行く約束してて」と断られた。'; } },
      { t: '友達と屋台を食べ歩く', fx: function (S) { var f = friendOf(S); if (f) KL.likeAdd(f, 8); KL.add(S, 'com', 1); return '金魚すくいで3匹すくった。'; } }
    ] });
  E.push({ id: 's_xmas', w: 2, repeat: true, cond: function (S) { return age(S) >= 13 && age(S) <= 22 && !B(S) && KL.isStudent(S); }, title: 'クリスマス', icon: '🎄', text: function (S) { return S.partnerId ? 'クリスマスイブ。' + KL.partner(S).name + 'と過ごす予定だ。' : 'クリスマスイブ。街はカップルだらけだ。'; },
    choices: [
      { t: 'イルミネーションを見に行く', req: function (S) { return !!S.partnerId; }, fx: function (S) { var p = KL.partner(S); if (!p) return '一人でイルミネーションを眺めた。'; KL.likeAdd(p, 12); KL.moneyAdd(S, -8000); return 'プレゼントを交換した。' + p.name + 'がくれたのは、手編みのマフラーだった。'; } },
      { t: '友達とクリぼっち会', fx: function (S) { KL.add(S, 'com', 2); S.npcs.forEach(function (n) { if (n.rel === 'friend' || n.rel === 'best') KL.likeAdd(n, 4); }); return 'ケーキをホールで食べた。これはこれで最高。'; } },
      { t: '家で勉強', fx: function (S) { KL.add(S, 'int', 2); return 'サンタは来なかった。'; } }
    ] });
  E.push({ id: 's_hatsumoude', w: 1, repeat: true, cond: function (S) { return age(S) >= 8 && !B(S) && (KL.isStudent(S) || U.chance(0.15)); }, title: '初詣', icon: '⛩️', text: '新年の初詣。おみくじを引いた。',
    choices: [{ t: 'おみくじを開く', fx: function (S) { var r = U.pick(['大吉', '中吉', '小吉', '吉', '末吉', '凶']); if (r === '大吉') KL.add(S, 'men', 3); if (r === '凶') KL.add(S, 'men', -1); return '「' + r + '」。' + (r === '大吉' ? '今年はいい年になりそうだ。' : r === '凶' ? '木に結んで帰った。' : '恋愛運は「焦らず待て」だった。'); } }] });
  E.push({ id: 's_hankouki', sched: true, pri: 7, cond: function (S) { return age(S) === 14 && !B(S); }, title: '反抗期', icon: '🚪', text: '最近、親の言うことが何もかもうるさく感じる。今日も「勉強しなさい」と言われた。',
    choices: [
      { t: '「うるせぇ！」と部屋にこもる', fx: function (S) { KL.add(S, 'men', 2); KL.add(S, 'com', -1); return 'ドアを思いきり閉めた。あとで少しだけ後悔した。'; } },
      { t: '黙って勉強する', fx: function (S) { KL.add(S, 'int', 2); return '内心はムカついていた。'; } },
      { t: '腹を割って話してみる', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'men', 1); return '親も昔は同じだったらしい。少しだけ見え方が変わった。'; } }
    ] });
  E.push({ id: 's_seitokai', w: 4, cond: function (S) { return (S.stage === 'jhs' || S.stage === 'hs') && !B(S) && (age(S) === 13 || age(S) === 16); }, title: '生徒会選挙', icon: '🗳️', text: '生徒会長選挙の立候補者を募集している。',
    choices: [
      { t: '立候補して演説する', fx: function (S) { if (KL.chk(S, S.st.com * 0.6 + S.rep.sch * 0.4, 45, 6)) { KL.repAdd(S, 'sch', 15); KL.add(S, 'com', 3); KL.title(S, (S.stage === 'jhs' ? '中学' : '高校') + 'の生徒会長'); KL.log(S, '生徒会長に当選した。', 1); return '当選！ 全校生徒の前で就任のあいさつをした。'; } KL.add(S, 'men', 1); return '僅差で落選。でも演説は「良かった」と言われた。'; } },
      { t: '友達の応援演説をする', fx: function (S) { KL.add(S, 'com', 2); var f = friendOf(S); if (f) KL.likeAdd(f, 10); return '友達が当選した。一緒に泣いて喜んだ。'; } }
    ] });
  E.push({ id: 's_gassho', sched: true, pri: 7, cond: function (S) { return S.stage === 'jhs' && age(S) === 13 && !B(S); }, title: '合唱コンクール', icon: '🎼', text: 'クラス対抗の合唱コンクール。男子が全然練習に来ない。',
    choices: [
      { t: '指揮者・パートリーダーとしてまとめる', fx: function (S) { if (KL.chk(S, (S.st.com + S.st.art) / 2, 40, 6)) { KL.repAdd(S, 'sch', 8); KL.add(S, 'com', 2); return 'クラスが一つになって、まさかの金賞！ 打ち上げで泣いた。'; } KL.add(S, 'men', 1); return '銀賞。でも練習の日々はいい思い出になった。'; } },
      { t: '口パクでやり過ごす', fx: function (S) { return '女子に怒られた。'; } }
    ] });
  E.push({ id: 's_kyugi', w: 2, repeat: true, cond: function (S) { return S.stage === 'hs' && B(S); }, title: '球技大会', icon: '🏐', text: 'クラス対抗の球技大会。今年の種目はバレーとドッジボール。',
    choices: [{ t: 'エースとして出る', fx: function (S) { if (KL.chk(S, 'ath', 45, 6)) { KL.repAdd(S, 'sch', 6); var c = KL.crush(S); if (c) KL.likeAdd(c, 6); return 'クラスを優勝に導いた！ 応援席が湧いた。'; } return '初戦敗退。応援係に回った。'; } }, { t: '応援に徹する', fx: function (S) { KL.add(S, 'com', 1); return 'クラスTシャツがかわいかった。'; } }] });
  E.push({ id: 's_karaoke', w: 2, repeat: true, cond: function (S) { return teen(S) || S.stage === 'univ'; }, title: '放課後', icon: '🎤', text: '放課後、友達に「カラオケ行こうぜ」と誘われた。',
    choices: [
      { t: '行く', fx: function (S) { KL.add(S, 'com', 2); KL.add(S, 'art', 1); KL.moneyAdd(S, -1500); if (S.st.art >= 60) { KL.repAdd(S, 'sch', 3); return '歌ったら全員が黙った。「…うますぎん？」'; } return '採点で82点。微妙。'; } },
      { t: 'ファミレスで駄弁る', fx: function (S) { var f = friendOf(S); if (f) KL.likeAdd(f, 6); return 'ドリンクバーで3時間粘った。'; } },
      { t: 'まっすぐ帰る', fx: function (S) { KL.add(S, 'int', 1); return '家でゆっくりした。'; } }
    ] });
  E.push({ id: 's_firstdate', people: function (S) { return [S.partnerId]; }, sched: true, pri: 6, cond: function (S) { return !!S.partnerId && !S.flags.firstDate && age(S) >= 12 && age(S) <= 22; }, title: '初デート', icon: '💕', text: function (S) { var p = KL.partner(S); return p.name + 'との初デート。行き先を決めなきゃ。（' + p.name.split(' ')[1] + 'の趣味は' + p.hobby + '）'; },
    choices: [
      { t: '水族館', fx: function (S) { return firstDate(S, 'イルカショーで水をかぶって、二人で大笑いした。'); } },
      { t: function (S) { return (KL.partner(S) ? KL.partner(S).hobby : '相手の趣味') + 'に付き合う'; }, fx: function (S) { var p = KL.partner(S); if (!p) return 'デートの約束は、流れてしまった。'; KL.likeAdd(p, 8); return firstDate(S, '趣味の話になると止まらない' + p.name.split(' ')[1] + 'が、すごく楽しそうだった。'); } },
      { t: '映画とカフェ', fx: function (S) { return firstDate(S, '映画の感想で、意外な一面が見えた。'); } }
    ] });
  function firstDate(S, msg) { S.flags.firstDate = true; var p = KL.partner(S); if (!p) return 'デートの約束は、流れてしまった。'; KL.likeAdd(p, 8); KL.add(S, 'men', 2); KL.moneyAdd(S, -5000); return msg; }
  E.push({ id: 's_button', sched: true, pri: 7, repeat: true, cond: function (S) { return (age(S) === 15 || age(S) === 18) && B(S) && S.flags.btnT !== age(S) && S.t > 20; }, title: '卒業式の日', icon: '🌸',
    text: function (S) {
      S.flags.btnT = age(S); var m = KL.mote(S);
      if (S.sex === 'm') { var k = Math.max(0, Math.round((m - 45) / 7 + U.gauss())); S._btn = k; return k >= 3 ? '卒業式のあと、学ランの第二ボタンをめぐって' + k + '人に囲まれた！' : k >= 1 ? '後輩に呼び止められた。「第二ボタン、ください」' : '第二ボタンは、最後まで誰にも頼まれなかった。'; }
      var c = KL.crush(S) || KL.partner(S); S._btnC = c ? c.id : null; return '卒業式のあと。' + (c ? c.name + 'の第二ボタン、もらいに行く？' : '校門の前で、みんなで写真を撮った。');
    },
    choices: [
      { t: function (S) { return S.sex === 'm' ? (S._btn ? 'ボタンをあげる' : 'さっさと帰る') : (S._btnC ? 'ボタンをもらいに行く' : '写真を撮る'); }, fx: function (S) {
        if (S.sex === 'm') { if (!S._btn) return '制服は、きれいなまま家に帰った。'; var n = admirer(S, '後輩', U.ri(65, 78)); KL.repAdd(S, 'sch', 3); return n.name + prof(S, n) + 'に渡した。「ずっと見てました」と言われた。'; }
        var c = S._btnC && KL.npc(S, S._btnC); if (!c) return '笑顔の写真がたくさん残った。'; if (KL.chk(S, confessPower(S, c), 55, 8)) { KL.likeAdd(c, 15); if (single(S)) startDating(S, c, '第二ボタン'); return '「…ずっと待ってた」。ボタンと一緒に、返事をもらった。'; } return '「ごめん、もう約束してて」。春の風が冷たかった。'; } },
      { t: '友達と最後の寄り道をする', fx: function (S) { var f = friendOf(S); if (f) { KL.likeAdd(f, 10); if (f.like >= 80) f.rel = 'best'; } return '「また集まろうな」。そう言って別れた。'; } }
    ] });
  E.push({ id: 's_kaki', w: 2, cond: function (S) { return (age(S) === 14 || age(S) === 17) && B(S) && S.track !== 'soccer'; }, title: '夏期講習', icon: '📚', text: '受験の天王山、夏休み。塾の夏期講習の案内が来た。',
    choices: [
      { t: '申し込む（10万円）', fx: function (S) { KL.moneyAdd(S, -100000); KL.grow(S, 'int', 5); KL.fatAdd(S, 15); return '毎日10時間勉強した。模試の判定が上がった。'; } },
      { t: '独学で頑張る', fx: function (S) { KL.grow(S, 'int', 3); return '図書館に通い詰めた。'; } },
      { t: '最後の夏を遊ぶ', fx: function (S) { KL.add(S, 'com', 3); KL.add(S, 'men', 2); return '海に行って日焼けした。後悔はない。'; } }
    ] });
  E.push({ id: 'h_bunri', sched: true, pri: 7, cond: function (S) { return age(S) === 16 && !B(S) && S.stage === 'hs'; }, title: '文理選択', icon: '🔀', text: '来年からのコースを選ばなければならない。',
    choices: [
      { t: '理系', fx: function (S) { S.flags.rikei = true; KL.add(S, 'int', 2); return '数学と物理の日々が始まる。'; } },
      { t: '文系', fx: function (S) { S.flags.rikei = false; KL.add(S, 'com', 1); KL.add(S, 'art', 1); return '英語と国語に力を入れる。'; } }
    ] });
  E.push({ id: 'h_moshi', w: 2, repeat: true, cond: function (S) { return S.stage === 'hs' && age(S) >= 16 && S.track !== 'soccer'; }, title: '全国模試', icon: '📝',
    text: function (S) { var dev = Math.round(35 + S.st.int * 0.4 + U.gauss() * 3); S._dev = dev; return '全国模試の結果が返ってきた。偏差値は' + dev + '。' + (dev >= 65 ? '難関大も見えてきた。' : dev >= 55 ? 'まずまずの結果だ。' : '…このままではまずい。'); },
    choices: [{ t: '結果を受け止める', fx: function (S) { if (S._dev < 55) { KL.grow(S, 'int', 2); return '気合いを入れ直した。'; } KL.add(S, 'men', 1); return '自信がついた。'; } }] });
  E.push({ id: 'h_opencampus', w: 2, cond: function (S) { return S.stage === 'hs' && age(S) === 16 && B(S); }, title: 'オープンキャンパス', icon: '🎓', text: '気になる大学のオープンキャンパスに行ってみた。',
    choices: [{ t: '模擬講義を受ける', fx: function (S) { KL.add(S, 'int', 2); return '「ここに行きたい」と初めて本気で思えた。'; } }, { t: '学食を食べて帰る', fx: function (S) { KL.add(S, 'men', 1); return 'カツカレーが安くてうまかった。'; } }] });
  E.push({ id: 'h_sotsuryo', sched: true, pri: 7, cond: function (S) { return (age(S) === 17 && !B(S) && S.stage === 'hs') || (age(S) === 21 && !B(S) && S.stage === 'univ'); }, title: '卒業旅行', icon: '🧳', text: '仲のいいメンバーで卒業旅行に行くことになった。',
    choices: [
      { t: function (S) { return S.stage === 'univ' ? '海外（韓国・台湾）' : 'USJ・テーマパーク'; }, fx: function (S) { KL.moneyAdd(S, S.stage === 'univ' ? -120000 : -30000); KL.add(S, 'com', 2); KL.add(S, 'men', 3); S.npcs.forEach(function (n) { if (n.rel === 'friend' || n.rel === 'best') KL.likeAdd(n, 8); }); return '一生分くらい笑った。帰りの電車で、みんな寝ていた。'; } },
      { t: '近場の温泉', fx: function (S) { KL.moneyAdd(S, -15000); KL.add(S, 'men', 2); return '夜通しこれからの話をした。'; } }
    ] });
  E.push({ id: 's_friendfight', w: 1, repeat: true, cond: function (S) { return KL.isStudent(S) && age(S) >= 8 && !!friendOf(S); }, title: '友達とケンカ', icon: '💢', text: function (S) { return friendOf(S).name + 'と、ささいなことで口ゲンカになった。'; },
    choices: [
      { t: '次の日、自分から謝る', fx: function (S) { var f = friendOf(S); KL.likeAdd(f, 10); KL.add(S, 'men', 1); return '「俺も悪かった」。前よりも仲良くなった。'; } },
      { t: 'しばらく口をきかない', fx: function (S) { var f = friendOf(S); KL.likeAdd(f, -12); return '気まずい日が続いた。'; } }
    ] });
  E.push({ id: 's_koibana', people: function (S) { return [S.crushId]; }, w: 2, repeat: true, cond: function (S) { return teen(S) && !!KL.crush(S) && single(S); }, title: '恋バナ', icon: '🤫', text: function (S) { return '友達に「好きな人いるでしょ」と詰められた。'; },
    choices: [
      { t: function (S) { return KL.crush(S).name + 'だと白状する'; }, fx: function (S) { var c = KL.crush(S); if (U.chance(0.5)) { KL.likeAdd(c, 6); return '次の日、なぜか本人に伝わっていた。目が合うと、向こうも赤くなった。'; } return '「応援する！」と言ってくれた。'; } },
      { t: 'はぐらかす', fx: function (S) { return '「絶対いるじゃん」と言われ続けた。'; } }
    ] });
  E.push({ id: 's_senpai', w: function (S) { return KL.mote(S) >= 55 ? 2 : 0.5; }, repeat: true, cond: function (S) { return teen(S) && single(S); }, title: '先輩からの呼び出し', icon: '📩', text: '部活の先輩から「ちょっと話がある」とLINEが来た。',
    choices: [{ t: '会いに行く', fx: function (S) { var n = KL.newNPC(S, 'crush', KL.loveSexPick(S), { met: '先輩', like: U.ri(58, 75), ad: 1, look: U.clamp(Math.round(45 + KL.mote(S) * 0.35 + U.gauss() * 10), 30, 99) }); if (KL.mote(S) >= 55 && U.chance(0.6)) { S.crushId = n.id; S.flags.confessed = (S.flags.confessed || 0) + 1; return n.name + prof(S, n) + 'に「付き合ってほしい」と言われた。返事は少し待ってもらうことにした。'; } return '部活の連絡事項だった。…なんだ。'; } }] });

  // 大学
  E.push({ id: 'u_gakusai', sched: true, pri: 7, repeat: true, cond: function (S) { return S.stage === 'univ' && !B(S) && age(S) <= 20; }, title: '学園祭', icon: '🎪', text: '大学の学園祭。サークルで模擬店を出す。',
    choices: [
      { t: 'ミスター・ミスコンに出る', fx: function (S) { if (KL.chk(S, (S.st.look * 0.7 + S.st.com * 0.3), 68, 5)) { KL.repAdd(S, 'sch', 20); KL.repAdd(S, 'loc', 6); KL.title(S, S.sex === 'm' ? 'ミスターコン グランプリ' : 'ミスコン グランプリ'); KL.log(S, (S.sex === 'm' ? 'ミスターコン' : 'ミスコン') + 'でグランプリに。', 1); var n = admirer(S, '学園祭', 70); S.flags.confessed = (S.flags.confessed || 0) + 1; return 'グランプリ！ SNSのフォロワーが一晩で3000人増えた。'; } return 'ファイナリストまで残った。'; } },
      { t: '模擬店で売りまくる', fx: function (S) { KL.add(S, 'com', 2); KL.moneyAdd(S, 10000); return '焼きそばが完売した。'; } },
      { t: '客として回る', fx: function (S) { var c = KL.crush(S); if (c) KL.likeAdd(c, 5); return 'ステージのお笑いライブが面白かった。'; } }
    ] });
  E.push({ id: 'u_hitorigurashi', sched: true, pri: 7, cond: function (S) { return S.stage === 'univ' && age(S) === 18 && !B(S); }, title: '一人暮らし', icon: '🏠', text: '大学生になって、初めての一人暮らしを始めることにした。',
    choices: [
      { t: '自炊を頑張る', fx: function (S) { KL.add(S, 'hp', 2); KL.moneyAdd(S, 50000); return '最初の1週間だけは毎日作った。'; } },
      { t: 'コンビニと外食で生きる', fx: function (S) { KL.add(S, 'hp', -1); KL.moneyAdd(S, -50000); return '冷蔵庫には飲み物しか入っていない。'; } }
    ] });
  E.push({ id: 'u_zemi', sched: true, pri: 7, cond: function (S) { return S.stage === 'univ' && age(S) === 20 && B(S); }, title: 'ゼミ選び', icon: '🧑‍🏫', text: '3年生からのゼミを決める時期。',
    choices: [
      { t: '厳しいけど就職に強いゼミ', fx: function (S) { KL.add(S, 'int', 3); KL.fatAdd(S, 10); S.flags.zemiStrong = true; return '毎週の発表で鍛えられた。'; } },
      { t: '楽で有名なゼミ', fx: function (S) { KL.add(S, 'com', 2); return '飲み会の多いゼミだった。'; } }
    ] });

  // ======================================================
  //  大人の日常（仕事・お金・恋愛・家族・老後）
  // ======================================================
  function adult(S) { return age(S) >= 22 && !KL.isStudent(S) && S.stage !== 'retired'; }
  function working(S) { return S.stage === 'work' && !!S.job; }
  function kidAges(S) { return S.kids.map(function (k) { return { k: k, a: Math.floor((S.t - k.born) / 2) }; }); }

  // ---- 暮らし・お金 ----
  E.push({ id: 'a_move', w: 1.5, repeat: true, cond: function (S) { return adult(S) && age(S) <= 60 && (S.flags.moveT || -99) <= S.t - 10; }, title: '引っ越し', icon: '📦', text: '更新の時期。そろそろ引っ越そうか。',
    choices: [
      { t: '都心のおしゃれなマンション', fx: function (S) { S.flags.moveT = S.t; KL.moneyAdd(S, -600000); KL.add(S, 'men', 2); KL.add(S, 'look', 1); return '駅近、夜景つき。家賃は高いけど気分は最高。'; } },
      { t: '郊外の広い部屋', fx: function (S) { S.flags.moveT = S.t; KL.moneyAdd(S, -200000); KL.add(S, 'hp', 1); KL.add(S, 'men', 1); return '休日は近所の公園を散歩するのが日課になった。'; } },
      { t: '今の家で十分', fx: function (S) { S.flags.moveT = S.t; KL.moneyAdd(S, 100000); return '浮いたお金は貯金に回した。'; } }
    ] });
  E.push({ id: 'a_car', w: 1, cond: function (S) { return adult(S) && S.money >= 2000000 && age(S) <= 60; }, title: '車を買う', icon: '🚗', text: 'そろそろ自分の車が欲しい。',
    choices: [
      { t: '軽自動車（150万円）', fx: function (S) { KL.moneyAdd(S, -1500000); S.flags.car = '軽自動車'; return '小回りが利いて便利。休日のドライブが増えた。'; } },
      { t: 'SUV（400万円）', req: function (S) { return S.money >= 4000000; }, hint: true, fx: function (S) { KL.moneyAdd(S, -4000000); S.flags.car = 'SUV'; KL.add(S, 'men', 2); return 'キャンプにも行けるようになった。'; } },
      { t: '高級外車（1500万円）', req: function (S) { return S.money >= 15000000; }, hint: true, fx: function (S) { KL.moneyAdd(S, -15000000); S.flags.car = '高級外車'; KL.add(S, 'look', 2); KL.repAdd(S, 'loc', 4); return '信号待ちで視線を感じる。'; } },
      { t: 'まだいらない', fx: function () { return '電車とシェアカーで十分だ。'; } }
    ] });
  E.push({ id: 'a_nisa', w: 1.2, cond: function (S) { return adult(S) && S.money >= 1000000 && !S.flags.invest; }, title: '資産運用', icon: '📈', text: '同僚に「新NISAやってないの？」と言われた。',
    choices: [
      { t: 'つみたて投資を始める（100万円）', fx: function (S) { KL.moneyAdd(S, -1000000); S.flags.invest = 1000000; KL.add(S, 'int', 1); return 'インデックスファンドをコツコツ積み立てることにした。65歳で受け取る予定。'; } },
      { t: '個別株で一発を狙う（100万円）', fx: function (S) { KL.moneyAdd(S, -1000000); var r = U.pick([0.3, 0.6, 1.2, 2.5, 4]); KL.moneyAdd(S, Math.round(1000000 * r)); return r >= 2 ? '買った株が爆上がり！ ' + U.yen(1000000 * r) + 'になった。' : r >= 1 ? 'ちょっとだけ増えた。' : '暴落した…。' + U.yen(1000000 * r) + 'しか残らなかった。'; } },
      { t: '現金が一番', fx: function () { return 'タンス預金を続ける。'; } }
    ] });
  E.push({ id: 'a_fukugyo', w: 1, cond: function (S) { return working(S) && age(S) >= 24 && age(S) <= 55; }, title: '副業', icon: '💻', text: '週末の空き時間で副業を始めてみようか。',
    choices: [
      { t: 'ブログ・動画配信', fx: function (S) { if (KL.chk(S, (S.st.art + S.st.com) / 2, 58, 7)) { KL.moneyAdd(S, 800000); KL.repAdd(S, 'nat', 3); return 'バズって月10万円の収入に！'; } return '再生回数は2桁のまま…。'; } },
      { t: 'スキルを活かした受託', fx: function (S) { KL.moneyAdd(S, 300000 + S.st.int * 5000); KL.fatAdd(S, 10); return 'コツコツ稼げた。'; } },
      { t: '本業に集中', fx: function (S) { S.job.perf += 4; return '本業の評価が上がった。'; } }
    ] });
  E.push({ id: 'a_bonus', w: function (S) { return working(S) ? 2 : 0; }, repeat: true, cond: function (S) { return working(S) && !B(S); }, title: '冬のボーナス', icon: '💴',
    text: function (S) { var b = Math.round(KL.salary(S) * (0.12 + S.job.perf / 600)); S._bonus = b; KL.moneyAdd(S, b); return 'ボーナスが出た。手取りで' + U.yen(b) + '。'; },
    choices: [
      { t: '自分へのご褒美', fx: function (S) { KL.moneyAdd(S, -Math.round(S._bonus * 0.3)); KL.add(S, 'men', 3); return 'ずっと欲しかった時計を買った。'; } },
      { t: '親に何かプレゼントする', fx: function (S) { KL.moneyAdd(S, -Math.round(S._bonus * 0.15)); KL.add(S, 'men', 2); KL.add(S, 'com', 1); return '温泉旅行をプレゼントした。電話越しの声がうれしそうだった。'; } },
      { t: '全額貯金', fx: function () { return '通帳を見てにやにやした。'; } }
    ] });

  // ---- 仕事 ----
  E.push({ id: 'a_shikaku', w: 1.2, repeat: true, cond: function (S) { return working(S) && age(S) <= 55 && (S.flags.qualN || 0) < 3; }, title: '資格の勉強', icon: '📘', text: '仕事に活かせる資格を取ろうか。',
    choices: [
      { t: function (S) { return ['簿記2級', 'TOEIC 800点', '宅建', '中小企業診断士'][S.flags.qualN || 0] + 'に挑戦'; }, fx: function (S) { var i = S.flags.qualN || 0, q = ['簿記2級', 'TOEIC 800点', '宅建', '中小企業診断士'][i]; if (KL.chk(S, 'int', 45 + i * 8, 6)) { S.flags.qualN = i + 1; S.job.perf += 8; KL.title(S, q + ' 合格'); KL.log(S, q + 'に合格した。', 1); return '合格！ 名刺に書ける肩書きが増えた。'; } KL.add(S, 'men', -1); return '不合格。また来年挑戦しよう。'; } },
      { t: '今はやめておく', fx: function () { return '仕事と遊びで手一杯だ。'; } }
    ] });
  E.push({ id: 'a_tenkin', w: 1, cond: function (S) { return working(S) && age(S) >= 25 && age(S) <= 52; }, title: '転勤の辞令', icon: '🗾', text: function (S) { S._tk = U.pick(['札幌', '仙台', '名古屋', '福岡', '広島', 'シンガポール', 'ニューヨーク']); return '上司に呼ばれた。「来月から' + S._tk + 'に行ってくれないか」'; },
    choices: [
      { t: '引き受ける', fx: function (S) { S.job.perf += 12; KL.add(S, 'com', 2); var p = KL.partner(S); if (p && !S.spouseId) KL.likeAdd(p, -10); S.flags.tenkin = S._tk; return S._tk + 'での生活が始まった。新しい街で、新しい出会いもあった。' + (p && !S.spouseId ? '遠距離恋愛になった。' : ''); } },
      { t: '家庭の事情で断る', fx: function (S) { S.job.perf -= 6; var p = KL.partner(S); if (p) KL.likeAdd(p, 6); return '出世は少し遠のいたかもしれない。でも後悔はない。'; } }
    ] });
  E.push({ id: 'a_overwork', w: function (S) { return working(S) && S.fat >= 55 ? 3 : 0.4; }, repeat: true, cond: function (S) { return working(S); }, title: '残業続き', icon: '🌃', text: '気づけば今月の残業は80時間を超えていた。',
    choices: [
      { t: '有給を取ってリフレッシュ', fx: function (S) { KL.fatAdd(S, -30); KL.add(S, 'men', 2); return '3日間、何もしなかった。生き返った。'; } },
      { t: '今が踏ん張りどころ', fx: function (S) { S.job.perf += 8; KL.fatAdd(S, 15); if (U.chance(0.25)) { KL.add(S, 'hp', -4); return '無理がたたって倒れてしまった…。'; } return 'なんとか乗り切った。評価は上がった。'; } },
      { t: '上司に業務量を相談する', fx: function (S) { if (KL.chk(S, 'com', 50, 8)) { KL.fatAdd(S, -15); return '業務を分担してもらえた。言ってみるものだ。'; } return '「みんな頑張ってるから」と言われた。'; } }
    ] });
  E.push({ id: 'a_kouhai', w: 1.2, repeat: true, cond: function (S) { return working(S) && age(S) >= 27; }, title: '後輩の相談', icon: '🗣️', text: '後輩に「会社、辞めようか迷ってて…」と打ち明けられた。',
    choices: [
      { t: '飲みに連れて行って話を聞く', fx: function (S) { KL.add(S, 'com', 2); S.job.perf += 3; KL.moneyAdd(S, -8000); return '最後には「もう少し頑張ってみます」と言ってくれた。'; } },
      { t: '自分の道を選べと背中を押す', fx: function (S) { KL.add(S, 'men', 1); return '後輩は転職し、数年後お礼の連絡をくれた。'; } }
    ] });
  E.push({ id: 'a_shainryoko', w: 1, repeat: true, cond: function (S) { return working(S); }, title: '社員旅行', icon: '🚌', text: '今年の社員旅行は温泉。宴会では若手の出し物があるらしい。',
    choices: [
      { t: '全力で出し物を盛り上げる', fx: function (S) { if (KL.chk(S, (S.st.com + S.st.art) / 2, 50, 8)) { S.job.perf += 6; KL.add(S, 'com', 2); return '社長が涙を流して笑っていた。'; } return '滑った。翌朝、誰も目を合わせてくれなかった。'; } },
      { t: '温泉でのんびり', fx: function (S) { KL.fatAdd(S, -15); return '露天風呂から見た星空がきれいだった。'; } }
    ] });
  E.push({ id: 'a_drinks', w: 1.5, repeat: true, cond: function (S) { return adult(S) && age(S) <= 60; }, title: '金曜の夜', icon: '🍻', text: '学生時代の友達から「今日飲もうぜ」と連絡が来た。',
    choices: [
      { t: '朝まで飲む', fx: function (S) { KL.add(S, 'men', 2); KL.fatAdd(S, 10); KL.moneyAdd(S, -12000); S.npcs.forEach(function (n) { if (n.rel === 'best' || n.rel === 'oldfriend') KL.likeAdd(n, 5); }); return '終電を逃して始発で帰った。くだらない話が最高だった。'; } },
      { t: '一杯だけ付き合う', fx: function (S) { KL.add(S, 'com', 1); KL.moneyAdd(S, -4000); return '近況報告だけで、ちょうどいい時間だった。'; } },
      { t: '家でゆっくりする', fx: function (S) { KL.fatAdd(S, -8); return '録りためたドラマを一気見した。'; } }
    ] });
  E.push({ id: 'a_hobby', w: 1, repeat: true, cond: function (S) { return adult(S) && (S.flags.hobbyT || -99) <= S.t - 12; }, title: '新しい趣味', icon: '🎣', text: '休日にやることが欲しい。何か始めてみようか。',
    choices: [
      { t: 'ゴルフ', fx: function (S) { S.flags.hobbyT = S.t; S.flags.hobby = 'ゴルフ'; KL.add(S, 'com', 2); KL.moneyAdd(S, -150000); if (working(S)) S.job.perf += 3; return '取引先とのコンペでも話が弾むようになった。'; } },
      { t: 'ジム通い', fx: function (S) { S.flags.hobbyT = S.t; S.flags.hobby = '筋トレ'; KL.add(S, 'hp', 3); KL.add(S, 'look', 2); return '体が見違えるように引き締まった。'; } },
      { t: '料理教室', fx: function (S) { S.flags.hobbyT = S.t; S.flags.hobby = '料理'; KL.add(S, 'art', 2); var p = KL.partner(S); if (p) KL.likeAdd(p, 6); return '週末の手料理が家族に好評だ。'; } },
      { t: '釣り', fx: function (S) { S.flags.hobbyT = S.t; S.flags.hobby = '釣り'; KL.add(S, 'men', 3); return '朝焼けの海で糸を垂らす時間が、一番落ち着く。'; } }
    ] });
  E.push({ id: 'a_trip', w: 1, repeat: true, cond: function (S) { return adult(S) && S.money >= 300000; }, title: '連休の予定', icon: '✈️', text: '大型連休。どこかへ行こうか。',
    choices: [
      { t: '海外へ一人旅（30万円）', fx: function (S) { KL.moneyAdd(S, -300000); KL.add(S, 'men', 3); KL.add(S, 'com', 1); return U.pick(['バリ島', 'ニューヨーク', 'パリ', 'バルセロナ', '台北']) + 'で、知らない自分に出会えた。'; } },
      { t: function (S) { return KL.partner(S) ? KL.partner(S).name.split(' ')[1] + 'と国内旅行' : '友達と国内旅行'; }, fx: function (S) { KL.moneyAdd(S, -100000); var p = KL.partner(S); if (p) KL.likeAdd(p, 10); KL.add(S, 'men', 2); return U.pick(['京都', '沖縄', '北海道', '箱根', '金沢']) + 'を満喫した。'; } },
      { t: '家でダラダラ', fx: function (S) { KL.fatAdd(S, -20); return 'これもまた最高の休日。'; } }
    ] });
  E.push({ id: 'a_kisei', w: 1, repeat: true, cond: function (S) { return adult(S) && age(S) <= 60 && !B(S); }, title: '年末年始の帰省', icon: '🏠', text: '久しぶりに実家に帰った。',
    choices: [
      { t: '親とゆっくり話す', fx: function (S) { KL.add(S, 'men', 3); return '「ちゃんと食べてる？」は何歳になっても言われる。'; } },
      { t: '地元の友達と飲みに行く', fx: function (S) { KL.add(S, 'com', 2); var o = S.npcs.filter(function (n) { return n.role === 'osana' || n.rel === 'oldfriend'; })[0]; if (o) KL.likeAdd(o, 8); return o ? o.name + 'と昔話で盛り上がった。' : '懐かしい顔ぶれと乾杯した。'; } }
    ] });

  // ---- 恋愛・結婚 ----
  E.push({ id: 'a_wedding_guest', w: 1.2, repeat: true, cond: function (S) { return age(S) >= 24 && age(S) <= 40; }, title: '友人の結婚式', icon: '💒', text: function (S) { var f = S.npcs.filter(function (n) { return n.rel === 'best' || n.rel === 'friend' || n.rel === 'oldfriend'; })[0]; S._fw = f ? f.name : '友人'; return S._fw + 'の結婚式に招待された。スピーチを頼まれている。'; },
    choices: [
      { t: '感動のスピーチをする', fx: function (S) { KL.moneyAdd(S, -30000); if (KL.chk(S, 'com', 50, 8)) { KL.add(S, 'com', 2); if (single(S)) { var n = admirer(S, '友人の結婚式', U.ri(55, 70)); S.crushId = n.id; return '会場が涙に包まれた。二次会で' + n.name + prof(S, n) + 'に話しかけられた。'; } return '会場が涙に包まれた。'; } return '緊張で噛みまくった。でも新郎新婦は笑ってくれた。'; } },
      { t: '余興で盛り上げる', fx: function (S) { KL.moneyAdd(S, -30000); KL.add(S, 'com', 1); return '会場は爆笑。いい式だった。'; } }
    ] });
  E.push({ id: 'a_konkatsu', w: function (S) { return single(S) ? 1.5 + (age(S) - 27) / 8 : 0; }, repeat: true, cond: function (S) { return single(S) && !S.spouseId && age(S) >= 26 && age(S) <= 48; }, title: '婚活', icon: '📱', text: 'まわりがどんどん結婚していく。そろそろ本気で相手を探そうか。',
    choices: [
      { t: 'マッチングアプリ', fx: function (S) { var n = admirer(S, 'マッチングアプリ', U.ri(40, 62)); n.ad = U.ri(-5, 4); if (KL.chk(S, KL.mote(S), 45, 8)) { S.crushId = n.id; KL.likeAdd(n, 10); return '何人かとやり取りして、' + n.name + prof(S, n) + 'と食事に行った。いい感じだ。'; } return 'マッチはするけど、なかなか会うまで行かない…。'; } },
      { t: '結婚相談所（30万円）', fx: function (S) { KL.moneyAdd(S, -300000); var n = admirer(S, '結婚相談所', U.ri(55, 68)); n.ad = U.ri(-4, 4); S.crushId = n.id; return 'カウンセラーの紹介で' + n.name + prof(S, n) + 'とお見合いをした。真剣に考えてくれる人だ。'; } },
      { t: '自然な出会いを待つ', fx: function () { return '焦らなくていい。そう言い聞かせた。'; } }
    ] });
  E.push({ id: 'a_dousei', people: function (S) { return [S.partnerId]; }, w: 2, cond: function (S) { var p = KL.npc(S, S.partnerId); return !!p && !S.spouseId && age(S) >= 22 && S.t - p.since >= 2 && !S.flags.dousei; }, title: '同棲の話', icon: '🔑', text: function (S) { return KL.partner(S).name + 'に「一緒に住まない？」と言われた。'; },
    choices: [
      { t: '一緒に住む', fx: function (S) { S.flags.dousei = true; KL.likeAdd(KL.partner(S), 12); KL.moneyAdd(S, 300000); KL.add(S, 'men', 2); return '二人の新生活が始まった。歯ブラシが2本並んでいる。'; } },
      { t: 'まだ早いかな', fx: function (S) { KL.likeAdd(KL.partner(S), -5); return '「そっか」と少し寂しそうだった。'; } }
    ] });
  E.push({ id: 'r_wedding', people: function (S) { return [S.spouseId]; }, sched: true, pri: 3, cond: function (S) { return !!S.spouseId && !S.flags.wedding; }, title: '結婚式', icon: '💒', text: function (S) { return KL.partner(S).name + 'との結婚式をどうする？'; },
    choices: [
      { t: '盛大な披露宴（300万円）', fx: function (S) { S.flags.wedding = 'big'; KL.moneyAdd(S, -3000000 + 1800000); KL.add(S, 'men', 5); KL.likeAdd(KL.partner(S), 10); S.npcs.forEach(function (n) { if (n.rel === 'best' || n.rel === 'friend') KL.likeAdd(n, 6); }); return '100人のゲストに祝福された。ご祝儀で半分以上は戻ってきた。'; } },
      { t: '家族だけの式（100万円）', fx: function (S) { S.flags.wedding = 'family'; KL.moneyAdd(S, -1000000); KL.add(S, 'men', 4); KL.likeAdd(KL.partner(S), 8); return '小さなチャペルで、家族に見守られて誓いを立てた。'; } },
      { t: 'フォトウェディングだけ（30万円）', fx: function (S) { S.flags.wedding = 'photo'; KL.moneyAdd(S, -300000); KL.likeAdd(KL.partner(S), 4); return '二人だけの写真は、一生の宝物になった。'; } }
    ] });
  E.push({ id: 'r_honeymoon', sched: true, pri: 5, cond: function (S) { return !!S.flags.wedding && !S.flags.honeymoon; }, title: '新婚旅行', icon: '🏝️', text: '新婚旅行の行き先を決めよう。',
    choices: [
      { t: 'ハワイ（80万円）', fx: function (S) { S.flags.honeymoon = 'ハワイ'; KL.moneyAdd(S, -800000); KL.likeAdd(KL.partner(S), 10); KL.add(S, 'men', 3); return 'ワイキキの夕日を見ながら、これからの人生を語り合った。'; } },
      { t: 'ヨーロッパ周遊（150万円）', fx: function (S) { S.flags.honeymoon = 'ヨーロッパ'; KL.moneyAdd(S, -1500000); KL.likeAdd(KL.partner(S), 12); KL.add(S, 'art', 2); return 'パリ、ローマ、バルセロナ。夢みたいな2週間だった。'; } },
      { t: '国内の温泉（20万円）', fx: function (S) { S.flags.honeymoon = '温泉'; KL.moneyAdd(S, -200000); KL.likeAdd(KL.partner(S), 6); return '浴衣で卓球をして、二人で笑い転げた。'; } }
    ] });
  E.push({ id: 'a_fuufu', people: function (S) { return [S.spouseId]; }, w: function (S) { var p = KL.npc(S, S.spouseId); return p && !p.dead ? (p.like < 50 ? 3 : 0.8) : 0; }, repeat: true, cond: function (S) { var p = KL.npc(S, S.spouseId); return !!p && !p.dead; }, title: '夫婦げんか', icon: '🗯️', text: function (S) { return U.pick(['洗い物を放置した', '記念日を忘れていた', '休日に寝てばかりいた', '相談せずに大きな買い物をした']) + 'ことで、' + KL.partner(S).name.split(' ')[1] + 'を怒らせてしまった。'; },
    choices: [
      { t: '素直に謝ってケーキを買って帰る', fx: function (S) { KL.likeAdd(KL.partner(S), 10); KL.moneyAdd(S, -3000); return '「…許す」。仲直りのケーキはおいしかった。'; } },
      { t: 'こっちにも言い分がある', fx: function (S) { var p = KL.partner(S); if (KL.chk(S, 'com', 55, 8)) { KL.likeAdd(p, 4); return 'ちゃんと話し合えて、お互いの気持ちが分かった。'; } KL.likeAdd(p, -10); return '3日間、口をきいてもらえなかった。'; } }
    ] });
  E.push({ id: 'a_anniv', people: function (S) { return [S.spouseId]; }, w: 1, repeat: true, cond: function (S) { var p = KL.npc(S, S.spouseId); return !!p && !p.dead && S.t - (S.marriedT || 0) >= 2; }, title: '結婚記念日', icon: '💐', text: function (S) { return KL.partner(S).name.split(' ')[1] + 'との結婚記念日。'; },
    choices: [
      { t: 'レストランを予約する', fx: function (S) { KL.likeAdd(KL.partner(S), 10); KL.moneyAdd(S, -30000); return '「覚えててくれたんだ」と笑ってくれた。'; } },
      { t: '手紙を書く', fx: function (S) { KL.likeAdd(KL.partner(S), 12); return '照れくさかったけど、ちゃんと気持ちを伝えた。'; } }
    ] });

  // ---- 家族 ----
  E.push({ id: 'a_kanreki', sched: true, pri: 7, cond: function (S) { return age(S) === 32 && !B(S); }, title: '親の還暦', icon: '🎉', text: '親が60歳、還暦を迎えた。',
    choices: [
      { t: '家族旅行をプレゼント（30万円）', fx: function (S) { KL.moneyAdd(S, -300000); KL.add(S, 'men', 3); return '赤いちゃんちゃんこを着た親が、照れくさそうに笑っていた。'; } },
      { t: '家族で食事会', fx: function (S) { KL.moneyAdd(S, -50000); KL.add(S, 'men', 2); return '「いい子に育ってくれた」と言われて、ちょっと泣いた。'; } }
    ] });
  E.push({ id: 'a_yakudoshi', sched: true, pri: 7, cond: function (S) { return age(S) === (S.sex === 'm' ? 41 : 32) && B(S); }, title: '本厄', icon: '⛩️', text: '今年は本厄らしい。',
    choices: [{ t: 'お祓いに行く', fx: function (S) { KL.add(S, 'men', 2); return '気持ちがすっと軽くなった。'; } }, { t: '気にしない', fx: function (S) { if (U.chance(0.3)) { KL.add(S, 'hp', -2); return '…その年、ぎっくり腰になった。'; } return '何事もない一年だった。'; } }] });
  E.push({ id: 'a_40', sched: true, pri: 8, cond: function (S) { return age(S) === 40 && B(S); }, title: '40歳の誕生日', icon: '🎂', text: function (S) { return '40歳になった。周りからの印象は「' + KL.perception(S).main + '」。人生の折り返し地点だ。'; },
    choices: [{ t: 'これからも走り続ける', fx: function (S) { KL.add(S, 'men', 2); return '人生、まだまだこれからだ。'; } }, { t: '少しペースを落とす', fx: function (S) { KL.fatAdd(S, -20); KL.add(S, 'hp', 2); return '健康第一でいこう。'; } }] });
  E.push({ id: 'a_kid_hankou', w: function (S) { return kidAges(S).some(function (x) { return x.a >= 13 && x.a <= 15; }) ? 2 : 0; }, cond: function (S) { return kidAges(S).some(function (x) { return x.a >= 13 && x.a <= 15; }); }, title: '子どもの反抗期', icon: '🚪', text: function (S) { var k = kidAges(S).filter(function (x) { return x.a >= 13 && x.a <= 15; })[0].k; return k.name + 'が最近口をきいてくれない。「うるさい」しか言わない。'; },
    choices: [
      { t: '自分も昔そうだったと思って見守る', fx: function (S) { KL.add(S, 'men', 2); return '数年後、「あの時はごめん」と言われた。'; } },
      { t: 'じっくり向き合って話す', fx: function (S) { if (KL.chk(S, 'com', 50, 8)) { KL.add(S, 'men', 3); return '本音を話してくれた。部活の悩みだったらしい。'; } return 'ドアを閉められた。'; } }
    ] });
  E.push({ id: 'a_kid_juken', w: function (S) { return kidAges(S).some(function (x) { return x.a === 17; }) ? 3 : 0; }, repeat: true, cond: function (S) { return kidAges(S).some(function (x) { return x.a === 17; }) && (S.flags.kidJukenT || -99) <= S.t - 2; }, title: '子どもの受験', icon: '🌸', text: function (S) { var k = kidAges(S).filter(function (x) { return x.a === 17; })[0].k; S._kj = k.name; S.flags.kidJukenT = S.t; return k.name + 'の大学受験が近づいてきた。'; },
    choices: [
      { t: '塾代を出す（100万円）', fx: function (S) { KL.moneyAdd(S, -1000000); var ok = U.chance(0.7); KL.add(S, 'men', ok ? 4 : 0); return ok ? S._kj + 'は第一志望に合格した！ 家族で抱き合って喜んだ。' : '第一志望は届かなかったけど、本人は前を向いている。'; } },
      { t: '本人に任せる', fx: function (S) { var ok = U.chance(0.5); return ok ? S._kj + 'は自力で合格を勝ち取った。' : '浪人することになった。来年頑張ろう。'; } }
    ] });
  E.push({ id: 'a_kid_marry', w: function (S) { return kidAges(S).some(function (x) { return x.a >= 26 && x.a <= 33 && !x.k.married; }) ? 2 : 0; }, repeat: true, cond: function (S) { return kidAges(S).some(function (x) { return x.a >= 26 && x.a <= 33 && !x.k.married; }); }, title: '子どもの結婚', icon: '💍', text: function (S) { var k = kidAges(S).filter(function (x) { return x.a >= 26 && !x.k.married; })[0].k; k.married = true; S._km = k.name; return k.name + 'が、結婚相手を連れて挨拶に来た。'; },
    choices: [
      { t: '温かく迎える', fx: function (S) { KL.add(S, 'men', 4); return 'いい人だった。式では' + S._km + 'の花嫁（花婿）姿に号泣した。'; } },
      { t: 'ちょっと厳しく見極める', fx: function (S) { KL.add(S, 'men', 1); return '最後は認めた。「' + S._km + 'をよろしく頼む」。'; } }
    ] });
  E.push({ id: 'a_family_trip', w: function (S) { return S.kids.length && S.spouseId ? 1.5 : 0; }, repeat: true, cond: function (S) { return !!S.spouseId && S.kids.length > 0 && age(S) <= 60; }, title: '家族旅行', icon: '🎡', text: '夏休み、家族でどこかに行こうという話になった。',
    choices: [
      { t: 'テーマパーク（20万円）', fx: function (S) { KL.moneyAdd(S, -200000); KL.add(S, 'men', 3); KL.likeAdd(KL.partner(S), 6); return '子どもたちのはしゃぐ顔が、何よりのお土産になった。'; } },
      { t: 'キャンプ（5万円）', fx: function (S) { KL.moneyAdd(S, -50000); KL.add(S, 'hp', 1); KL.add(S, 'men', 3); return '火起こしに苦戦したけど、カレーは最高にうまかった。'; } }
    ] });

  // ---- 老後 ----
  E.push({ id: 'o_sagi', w: 0.6, repeat: true, cond: function (S) { return age(S) >= 66; }, title: '不審な電話', icon: '☎️', text: '「もしもし、オレだけど…会社のお金をなくしちゃって」',
    choices: [
      { t: '本人に折り返し電話して確かめる', fx: function (S) { KL.add(S, 'men', 1); return '詐欺だった。危ないところだった。'; } },
      { t: '慌てて振り込む', fx: function (S) { if (KL.chk(S, 'int', 55, 8)) return '振り込む直前、銀行員に止められた。'; KL.moneyAdd(S, -2000000); KL.add(S, 'men', -4); return '200万円をだまし取られてしまった…。'; } }
    ] });
  E.push({ id: 'o_chounai', w: 0.6, repeat: true, cond: function (S) { return age(S) >= 60; }, title: '町内会', icon: '🏮', text: '町内会の役員を頼まれた。',
    choices: [{ t: '引き受ける', fx: function (S) { KL.add(S, 'com', 2); KL.repAdd(S, 'loc', 5); return '夏祭りの準備で、近所の人とすっかり顔なじみになった。'; } }, { t: '丁重に断る', fx: function () { return '自分の時間を大切にしたい。'; } }] });
  E.push({ id: 'o_smart', w: 1, cond: function (S) { return age(S) >= 65; }, title: 'スマホ教室', icon: '📱', text: '地域のスマホ教室に誘われた。',
    choices: [{ t: '参加してみる', fx: function (S) { KL.add(S, 'int', 2); return '孫とビデオ通話ができるようになった。'; } }, { t: 'ガラケーで十分', fx: function () { return '電話とメールができれば困らない。'; } }] });
  E.push({ id: 'o_shukatsu', w: 1, cond: function (S) { return age(S) >= 70; }, title: '終活', icon: '📓', text: 'そろそろ、エンディングノートを書いておこうか。',
    choices: [
      { t: '人生を振り返りながら書く', fx: function (S) { KL.add(S, 'men', 3); var hl = S.log.filter(function (l) { return l.imp >= 2; }).slice(-3).map(function (l) { return l.text.replace(/。$/, ''); }); return hl.length ? '「' + hl.join('」「') + '」――いろんなことがあった。' : '書き終えると、心が穏やかになった。'; } },
      { t: 'まだ早い', fx: function () { return '人生、まだまだこれからだ。'; } }
    ] });

  // ---------- 就職のオファー計算 ----------
  KL.jobOffers = function (S, maxTier) {
    var ut = S.flags.univTier || 0, list = [];
    KL.JOBS.forEach(function (j) {
      if (j.hidden || j.tier > maxTier) return;
      var sc = 0, n = 0;
      for (var k in j.need) { sc += S.st[k] - j.need[k]; n++; }
      sc = n ? sc / n : 10;
      sc += ut * 4 - 8 + (S.flags.abroad ? 4 : 0) + U.gauss() * 5;
      if (S.stage !== 'univ' && j.tier >= 4) sc -= 15;
      if (sc >= 0) list.push(j);
    });
    list.sort(function (a, b) { return b.tier - a.tier || b.base - a.base; });
    return list.slice(0, 3);
  };
  KL.jobTitles = function (S) { return S.job && S.job.titles ? S.job.titles : (S.job && S.job.id === 'coach' ? ['ユースコーチ', 'トップチームコーチ', 'J3監督', 'J2監督', 'J1監督', '日本代表コーチ', '日本代表監督'] : KL.TITLES); };
})();
