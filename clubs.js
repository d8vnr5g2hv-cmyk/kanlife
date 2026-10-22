/* Kani Life - リーグとクラブ（2026-27シーズン基準）
   s = クラブの強さ（0〜100）。数値はゲームバランス用の目安です。 */
window.KL = window.KL || {};

KL.LEAGUES = {
  PL: { name: 'プレミアリーグ', country: 'イングランド', flag: '🏴', base: 78, games: 38, cl: 4, el: 2, tier: 1, europe: true },
  LL: { name: 'ラ・リーガ', country: 'スペイン', flag: '🇪🇸', base: 77, games: 38, cl: 4, el: 2, tier: 1, europe: true },
  SA: { name: 'セリエA', country: 'イタリア', flag: '🇮🇹', base: 76, games: 38, cl: 4, el: 2, tier: 1, europe: true },
  BL: { name: 'ブンデスリーガ', country: 'ドイツ', flag: '🇩🇪', base: 76, games: 34, cl: 4, el: 2, tier: 1, europe: true },
  L1: { name: 'リーグ・アン', country: 'フランス', flag: '🇫🇷', base: 74, games: 34, cl: 3, el: 2, tier: 1, europe: true },
  J1: { name: 'J1リーグ', country: '日本', flag: '🇯🇵', base: 66, games: 38, acl: 3, tier: 2, japan: true },
  J2: { name: 'J2リーグ', country: '日本', flag: '🇯🇵', base: 58, games: 38, tier: 3, japan: true },
  J3: { name: 'J3リーグ', country: '日本', flag: '🇯🇵', base: 51, games: 38, tier: 4, japan: true }
};

KL.CLUBS = [
  // ---- プレミアリーグ ----
  { id: 'ars', l: 'PL', n: 'アーセナル', s: 88 },
  { id: 'mci', l: 'PL', n: 'マンチェスター・シティ', s: 88 },
  { id: 'liv', l: 'PL', n: 'リヴァプール', s: 87 },
  { id: 'che', l: 'PL', n: 'チェルシー', s: 86 },
  { id: 'tot', l: 'PL', n: 'トッテナム', s: 82 },
  { id: 'new', l: 'PL', n: 'ニューカッスル', s: 82 },
  { id: 'avl', l: 'PL', n: 'アストン・ヴィラ', s: 81 },
  { id: 'mun', l: 'PL', n: 'マンチェスター・ユナイテッド', s: 82 },
  { id: 'bha', l: 'PL', n: 'ブライトン', s: 79 },
  { id: 'cry', l: 'PL', n: 'クリスタル・パレス', s: 78 },
  { id: 'nfo', l: 'PL', n: 'ノッティンガム・フォレスト', s: 78 },
  { id: 'bou', l: 'PL', n: 'ボーンマス', s: 78 },
  { id: 'bre', l: 'PL', n: 'ブレントフォード', s: 77 },
  { id: 'ful', l: 'PL', n: 'フラム', s: 77 },
  { id: 'eve', l: 'PL', n: 'エヴァートン', s: 77 },
  { id: 'lee', l: 'PL', n: 'リーズ', s: 75 },
  { id: 'sun', l: 'PL', n: 'サンダーランド', s: 75 },
  { id: 'cov', l: 'PL', n: 'コヴェントリー', s: 73 },
  { id: 'ips', l: 'PL', n: 'イプスウィッチ', s: 73 },
  { id: 'hul', l: 'PL', n: 'ハル・シティ', s: 72 },
  // ---- ラ・リーガ ----
  { id: 'rma', l: 'LL', n: 'レアル・マドリード', s: 89 },
  { id: 'fcb', l: 'LL', n: 'バルセロナ', s: 89 },
  { id: 'atm', l: 'LL', n: 'アトレティコ・マドリード', s: 84 },
  { id: 'ath', l: 'LL', n: 'アスレティック・ビルバオ', s: 80 },
  { id: 'vil', l: 'LL', n: 'ビジャレアル', s: 80 },
  { id: 'bet', l: 'LL', n: 'レアル・ベティス', s: 79 },
  { id: 'rso', l: 'LL', n: 'レアル・ソシエダ', s: 78 },
  { id: 'cel', l: 'LL', n: 'セルタ', s: 76 },
  { id: 'sev', l: 'LL', n: 'セビージャ', s: 76 },
  { id: 'val', l: 'LL', n: 'バレンシア', s: 75 },
  { id: 'osa', l: 'LL', n: 'オサスナ', s: 75 },
  { id: 'ray', l: 'LL', n: 'ラージョ・バジェカーノ', s: 75 },
  { id: 'get', l: 'LL', n: 'ヘタフェ', s: 74 },
  { id: 'esp', l: 'LL', n: 'エスパニョール', s: 74 },
  { id: 'ala', l: 'LL', n: 'アラベス', s: 73 },
  { id: 'elc', l: 'LL', n: 'エルチェ', s: 72 },
  { id: 'lev', l: 'LL', n: 'レバンテ', s: 72 },
  { id: 'rac', l: 'LL', n: 'ラシン・サンタンデール', s: 71 },
  { id: 'dep', l: 'LL', n: 'デポルティーボ', s: 71 },
  { id: 'mal', l: 'LL', n: 'マラガ', s: 71 },
  // ---- セリエA ----
  { id: 'int', l: 'SA', n: 'インテル', s: 86 },
  { id: 'nap', l: 'SA', n: 'ナポリ', s: 84 },
  { id: 'juv', l: 'SA', n: 'ユヴェントス', s: 83 },
  { id: 'mil', l: 'SA', n: 'ミラン', s: 82 },
  { id: 'rom', l: 'SA', n: 'ローマ', s: 81 },
  { id: 'ata', l: 'SA', n: 'アタランタ', s: 81 },
  { id: 'com', l: 'SA', n: 'コモ', s: 80 },
  { id: 'laz', l: 'SA', n: 'ラツィオ', s: 78 },
  { id: 'bol', l: 'SA', n: 'ボローニャ', s: 78 },
  { id: 'fio', l: 'SA', n: 'フィオレンティーナ', s: 76 },
  { id: 'tor', l: 'SA', n: 'トリノ', s: 75 },
  { id: 'udi', l: 'SA', n: 'ウディネーゼ', s: 74 },
  { id: 'gen', l: 'SA', n: 'ジェノア', s: 74 },
  { id: 'sas', l: 'SA', n: 'サッスオーロ', s: 74 },
  { id: 'par', l: 'SA', n: 'パルマ', s: 73 },
  { id: 'cag', l: 'SA', n: 'カリアリ', s: 73 },
  { id: 'lec', l: 'SA', n: 'レッチェ', s: 72 },
  { id: 'mon', l: 'SA', n: 'モンツァ', s: 72 },
  { id: 'fro', l: 'SA', n: 'フロジノーネ', s: 71 },
  { id: 'ven', l: 'SA', n: 'ヴェネツィア', s: 71 },
  // ---- ブンデスリーガ ----
  { id: 'bay', l: 'BL', n: 'バイエルン', s: 89 },
  { id: 'bvb', l: 'BL', n: 'ドルトムント', s: 83 },
  { id: 'b04', l: 'BL', n: 'レヴァークーゼン', s: 82 },
  { id: 'rbl', l: 'BL', n: 'RBライプツィヒ', s: 81 },
  { id: 'vfb', l: 'BL', n: 'シュトゥットガルト', s: 80 },
  { id: 'sge', l: 'BL', n: 'フランクフルト', s: 79 },
  { id: 'scf', l: 'BL', n: 'フライブルク', s: 77 },
  { id: 'tsg', l: 'BL', n: 'ホッフェンハイム', s: 77 },
  { id: 'bmg', l: 'BL', n: 'ボルシアMG', s: 75 },
  { id: 'm05', l: 'BL', n: 'マインツ', s: 75 },
  { id: 'svw', l: 'BL', n: 'ヴェルダー・ブレーメン', s: 75 },
  { id: 'fcu', l: 'BL', n: 'ウニオン・ベルリン', s: 74 },
  { id: 'fca', l: 'BL', n: 'アウクスブルク', s: 74 },
  { id: 'koe', l: 'BL', n: 'ケルン', s: 74 },
  { id: 'hsv', l: 'BL', n: 'ハンブルガーSV', s: 73 },
  { id: 's04', l: 'BL', n: 'シャルケ', s: 72 },
  { id: 'scp', l: 'BL', n: 'パーダーボルン', s: 70 },
  { id: 'sve', l: 'BL', n: 'エルフェアスベルク', s: 70 },
  // ---- リーグ・アン ----
  { id: 'psg', l: 'L1', n: 'パリ・サンジェルマン', s: 88 },
  { id: 'om', l: 'L1', n: 'マルセイユ', s: 81 },
  { id: 'asm', l: 'L1', n: 'モナコ', s: 80 },
  { id: 'ol', l: 'L1', n: 'リヨン', s: 80 },
  { id: 'losc', l: 'L1', n: 'リール', s: 79 },
  { id: 'rcl', l: 'L1', n: 'ランス', s: 78 },
  { id: 'rcs', l: 'L1', n: 'ストラスブール', s: 77 },
  { id: 'ogcn', l: 'L1', n: 'ニース', s: 76 },
  { id: 'srfc', l: 'L1', n: 'レンヌ', s: 76 },
  { id: 'sb29', l: 'L1', n: 'ブレスト', s: 74 },
  { id: 'tfc', l: 'L1', n: 'トゥールーズ', s: 74 },
  { id: 'pfc', l: 'L1', n: 'パリFC', s: 73 },
  { id: 'aja', l: 'L1', n: 'オセール', s: 72 },
  { id: 'fcl', l: 'L1', n: 'ロリアン', s: 71 },
  { id: 'sco', l: 'L1', n: 'アンジェ', s: 71 },
  { id: 'hac', l: 'L1', n: 'ル・アーヴル', s: 71 },
  { id: 'estac', l: 'L1', n: 'トロワ', s: 70 },
  { id: 'lmfc', l: 'L1', n: 'ル・マン', s: 69 },
  // ---- J1 ----
  { id: 'kashima', l: 'J1', n: '鹿島アントラーズ', s: 71 },
  { id: 'kobe', l: 'J1', n: 'ヴィッセル神戸', s: 71 },
  { id: 'kashiwa', l: 'J1', n: '柏レイソル', s: 70 },
  { id: 'hiroshima', l: 'J1', n: 'サンフレッチェ広島', s: 70 },
  { id: 'kyoto', l: 'J1', n: '京都サンガF.C.', s: 69 },
  { id: 'machida', l: 'J1', n: 'FC町田ゼルビア', s: 69 },
  { id: 'urawa', l: 'J1', n: '浦和レッズ', s: 68 },
  { id: 'kawasaki', l: 'J1', n: '川崎フロンターレ', s: 68 },
  { id: 'gosaka', l: 'J1', n: 'ガンバ大阪', s: 67 },
  { id: 'cosaka', l: 'J1', n: 'セレッソ大阪', s: 66 },
  { id: 'ftokyo', l: 'J1', n: 'FC東京', s: 66 },
  { id: 'yokohamafm', l: 'J1', n: '横浜F・マリノス', s: 66 },
  { id: 'nagoya', l: 'J1', n: '名古屋グランパス', s: 65 },
  { id: 'shimizu', l: 'J1', n: '清水エスパルス', s: 65 },
  { id: 'okayama', l: 'J1', n: 'ファジアーノ岡山', s: 64 },
  { id: 'fukuoka', l: 'J1', n: 'アビスパ福岡', s: 64 },
  { id: 'tokyov', l: 'J1', n: '東京ヴェルディ', s: 64 },
  { id: 'nagasaki', l: 'J1', n: 'V・ファーレン長崎', s: 63 },
  { id: 'chiba', l: 'J1', n: 'ジェフユナイテッド千葉', s: 63 },
  { id: 'mito', l: 'J1', n: '水戸ホーリーホック', s: 62 }
];

(function () {
  var j2 = ['北海道コンサドーレ札幌', 'ヴァンラーレ八戸', 'ベガルタ仙台', 'ブラウブリッツ秋田', 'モンテディオ山形', 'いわきFC', '栃木シティ', 'RB大宮アルディージャ', '横浜FC', '湘南ベルマーレ', 'ヴァンフォーレ甲府', 'アルビレックス新潟', 'カターレ富山', 'ジュビロ磐田', '藤枝MYFC', '徳島ヴォルティス', 'FC今治', 'サガン鳥栖', '大分トリニータ', 'テゲバジャーロ宮崎'];
  var j3 = ['福島ユナイテッドFC', '栃木SC', 'ザスパ群馬', 'SC相模原', '松本山雅FC', 'AC長野パルセイロ', 'ツエーゲン金沢', 'FC岐阜', 'レイラック滋賀FC', 'FC大阪', '奈良クラブ', 'ガイナーレ鳥取', 'レノファ山口FC', 'カマタマーレ讃岐', '愛媛FC', '高知ユナイテッドSC', 'ギラヴァンツ北九州', 'ロアッソ熊本', '鹿児島ユナイテッドFC', 'FC琉球'];
  var j2s = [60, 55, 60, 56, 58, 59, 56, 61, 61, 60, 57, 60, 56, 60, 57, 58, 56, 58, 57, 55];
  var j3s = [52, 52, 51, 52, 53, 51, 52, 51, 50, 51, 52, 50, 52, 50, 52, 50, 52, 52, 53, 51];
  j2.forEach(function (n, i) { KL.CLUBS.push({ id: 'j2_' + i, l: 'J2', n: n, s: j2s[i] }); });
  j3.forEach(function (n, i) { KL.CLUBS.push({ id: 'j3_' + i, l: 'J3', n: n, s: j3s[i] }); });
})();

KL.clubById = function (id) {
  if (!KL._clubMap) { KL._clubMap = {}; KL.CLUBS.forEach(function (c) { KL._clubMap[c.id] = c; }); }
  return KL._clubMap[id];
};
