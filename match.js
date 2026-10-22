/* Kani Life - 大一番の実況（CL決勝・W杯・選手権決勝・優勝決定戦・ダービー） */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U, SO = KL.Soccer;
  var M = KL.Match = {};

  function grp(pos) { return pos === 'GK' ? 'gk' : (pos === 'CB' || pos === 'SB') ? 'df' : (pos === 'DM' || pos === 'CM') ? 'mf' : 'fw'; }
  function sk(so, ks) { return ks.reduce(function (t, k) { return t + (so.sk[k] || 0); }, 0) / ks.length; }
  function mate(S) {
    var t = SO.teammates(S).filter(function (p) { return p.pos === 'ST' || p.pos === 'WG' || p.pos === 'OM' || p.pos === 'CM'; });
    return t.length ? U.pick(t).name : U.pick(['10番', '右サイドの味方', 'キャプテン', 'ボランチの味方']);
  }

  // 決定的な場面の選択肢（ポジション別）
  M.options = function (S) {
    var so = S.soccer, g = grp(so.pos), b = SO.hasBadge, L = [];
    if (g === 'fw') {
      L.push({ t: '自分で打つ', ks: ['sht', 'iq'], ok: 'ゴール右隅に突き刺した！', ng: 'シュートはわずかに枠の外。', goal: true });
      L.push({ t: 'ドリブルで仕掛ける', ks: ['dri', 'spd'], ok: '2人をかわして、そのまま流し込んだ！', ng: '囲まれてボールを失った。', goal: true });
      L.push({ t: 'フリーの味方にラストパス', ks: ['pas', 'iq'], ok: '完璧なラストパス。味方が押し込んだ！', ng: 'パスは相手DFにカットされた。', ast: true });
    } else if (g === 'mf') {
      L.push({ t: 'ミドルシュートを狙う', ks: ['sht', 'phy'], ok: '25mの弾丸ミドルがネットを揺らした！', ng: '惜しくもクロスバーに嫌われた。', goal: true });
      L.push({ t: 'スルーパスで裏を突く', ks: ['pas', 'iq'], ok: '針の穴を通すスルーパス。味方が決めた！', ng: 'わずかに合わなかった。', ast: true });
      L.push({ t: '前線から奪い返す', ks: ['def', 'phy'], ok: '高い位置で奪って、そのままショートカウンター成功！', ng: 'かわされて、逆にピンチを招いた。' });
    } else if (g === 'df') {
      L.push({ t: 'スライディングで止める', ks: ['def', 'spd'], ok: '完璧なタックル！ 決定的なピンチを防いだ。', ng: 'かわされて、失点を許してしまった。' });
      L.push({ t: '体を寄せて時間を作る', ks: ['phy', 'iq'], ok: '冷静に相手を外へ追いやり、味方の戻りを待った。', ng: '体勢を崩され、シュートを打たれた。' });
      L.push({ t: 'セットプレーでゴールを狙う', ks: ['phy', 'sht'], ok: 'CKにドンピシャで頭を合わせた！ ゴール！', ng: 'ヘディングは枠の上へ。', goal: true });
    } else {
      L.push({ t: '前に飛び出す', ks: ['gk', 'spd'], ok: '果敢な飛び出しでボールを弾き出した！', ng: '一瞬遅れて、ループシュートを決められた。' });
      L.push({ t: 'ゴールの前で構える', ks: ['gk', 'iq'], ok: '至近距離のシュートを片手でストップ！ スーパーセーブ！', ng: '逆を突かれた。' });
    }
    if (b(S, 'fk') && g !== 'gk') L.push({ t: '直接FKを蹴る（FK職人）', ks: ['sht', 'pas'], bonus: 6, ok: '壁の上を越えて、ゴール左上へ吸い込まれた！', ng: 'FKは壁に当たった。', goal: true });
    if (b(S, 'pk') && g === 'fw' && U.chance(0.4)) L.push({ t: '倒れてPKをもらいにいく', ks: ['dri', 'men'], bonus: 3, ok: 'PK獲得！ 自分で蹴って、冷静にゴール！', ng: 'シミュレーションでイエローカード…。', goal: true });
    return L;
  };

  // ctx: { id, title, icon, venue, myTeam, opp, oppLv, pWin, stakes, starter, onWin(S), onLose(S) }
  M.push = function (S, ctx) {
    var so = S.soccer;
    var state = U.chance(ctx.pWin) ? (U.chance(0.5) ? 'draw' : 'ahead') : (U.chance(0.6) ? 'behind' : 'draw');
    var m1 = U.ri(8, 40), m2 = U.ri(76, 88), who = so.club ? mate(S) : '味方';
    var lines = ['🏟️ ' + ctx.venue + '。' + ctx.myTeam + ' vs ' + ctx.opp + '。' + (ctx.stakes || '')];
    if (!ctx.starter) lines.push('ベンチスタート。後半' + U.ri(55, 70) + '分、ついに出番が来た。');
    if (state === 'behind') lines.push('前半' + m1 + '分、' + ctx.opp + 'に先制を許す。0-1。');
    if (state === 'draw') lines.push(U.chance(0.5) ? '前半' + m1 + '分に先制されるも、後半' + U.ri(50, 70) + '分に' + who + 'が同点ゴール。1-1。' : 'お互い譲らず、0-0のまま時計が進む。');
    if (state === 'ahead') lines.push('前半' + m1 + '分、' + who + 'のゴールで先制！ 1-0。でも相手の猛攻が続いている。');
    var g = grp(so.pos);
    lines.push('\n後半' + m2 + '分──' + (g === 'df' || g === 'gk' ? '相手のエースがゴールに迫る。' : 'ゴール前でボールが転がってきた。') + ' スタジアムが息をのむ。');
    var opts = M.options(S);
    var inst = {
      id: 'm_' + ctx.id, title: ctx.title, icon: ctx.icon || '🏟️', text: lines.join('\n'), choices: opts.map(function (o) {
        return { t: o.t, ok: true, fx: function (S) { return M.resolve(S, ctx, state, o); } };
      })
    };
    KL.push(S, inst);
  };

  M.resolve = function (S, ctx, state, o) {
    var so = S.soccer;
    var val = sk(so, o.ks) + (o.bonus || 0) + (SO.hasBadge(S, 'bigmatch') ? 5 : 0) + (S.st.men - 50) * 0.08;
    var diff = (ctx.oppLv || 80) + (ctx.starter ? 0 : 3);
    var ok = U.chance(U.sig((val - diff) / 5));
    var p = U.clamp(ctx.pWin + (ok ? 0.38 : -0.28) + (state === 'ahead' ? 0.15 : state === 'behind' ? -0.15 : 0), 0.04, 0.96);
    var win = U.chance(p);
    var out = [(ok ? '✅ ' + o.ok : '❌ ' + o.ng)];
    if (ok && o.goal && so.cur) { so.cur.goals++; so.totalGoals++; }
    if (ok && o.ast && so.cur) { so.cur.ast++; so.totalAst++; }
    if (ok) { so.bigOk = (so.bigOk || 0) + 1; KL.repAdd(S, 'nat', 3); KL.add(S, 'men', 1); } else KL.add(S, 'men', -1);
    if (win) {
      out.push(state === 'behind' && ok ? '土壇場で追いつき、延長の末に逆転！' : ok ? 'このプレーが決勝点になった。' : '味方が踏ん張り、なんとかリードを守り切った。');
      out.push('🎉 試合終了のホイッスル。' + ctx.myTeam + 'の勝利！');
      out.push(ctx.onWin(S) || '');
    } else {
      out.push(ok ? 'それでも最後に失点し、あと一歩及ばなかった。' : '流れは戻らなかった。');
      out.push('試合終了。' + ctx.myTeam + 'は敗れた。');
      out.push(ctx.onLose(S) || '');
    }
    return out.filter(Boolean).join('\n');
  };

  // バロンドールの集計後に決まったタイトルを、その年の評価に反映する
  M.ballonBonus = function (S, v) { var so = S.soccer; if (so.ballonPending && so.ballonPending.season === KL.seasonLabel(S)) so.ballonPending.score += v; };
})();
