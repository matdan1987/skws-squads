/* SKWS Squads – Admin: wuestensturm (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Wüstensturm ---------- */
// Taktiken: Gruppen in Prioritätsreihenfolge (die Stärksten zuerst), je Gruppe ein Schritt pro Phase.
// Die Schritte werden mit veröffentlicht; index.html übersetzt Aktionen, Gebäude und Phasen.
var DS_TACTICS = {
  std: {
    name: 'Ausgewogen – Silo-Sturm um 10:00',
    desc: 'Die 5 Stärksten nehmen zuerst Ölraffinerie I und stürmen um 10:00 gemeinsam das Atomsilo. Der Rest hält Raffinerien, Infozentrum/Waffenlager, drei Lazarette und das Tech-Zentrum.',
    when: 'Gegner ungefähr gleich stark. Guter Standard, wenn ihr den Gegner nicht kennt.',
    pro: 'Holt das Silo (meiste Punkte) früh, ohne die Außengebäude aufzugeben.',
    con: 'Wenn der Gegner das Silo härter verteidigt, binden sich eure Stärksten dort.',
    en: 'Balanced: the 5 strongest take Oil Refinery I, then move into the Nuclear Silo together at 10:00; the rest hold refineries, Info Center/Arsenal, three hospitals and the Science Hub.',
    ph: ['p0','p10','p13'],
    groups: [
      { k:'silo',  n:5, label:'Silo-Trupp',              steps:[['take','ref1'],['rally','silo'],['hold','silo']] },
      { k:'ref2',  n:2, label:'Raffinerie-II-Trupp',     steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'ref1',  n:2, label:'Raffinerie-I-Trupp',      steps:[['help','ref2'],['move','ref1'],['hold','ref1']] },
      { k:'info',  n:2, label:'Info-/Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'hosp1', n:2, label:'Lazarett I',              steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',             steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'sci',   n:1, label:'Tech-Zentrum',            steps:[['take','sci'],['iffree','merc'],['wells','wells']] },
      { k:'hosp3', n:2, label:'Lazarett III',            steps:[['take','hosp3'],['holdh','hosp3'],['reinforce','']] },
      { k:'supp',  n:2, label:'Unterstützung',           steps:[['defend',''],['reinforce',''],['wells','wells']] }
    ]
  },
  wide: {
    name: 'Breit verteilt + Eingreiftruppe',
    desc: 'Alle 8 Außengebäude werden ab Start mit 1–3 Spielern besetzt. Die 3 Stärksten sind eine Eingreiftruppe: Sie beobachten, wo wir unter Druck sind, und verstärken dort. Ab 10 Min. übernehmen Info- und Tech-Trupp Waffenlager und Söldnerfabrik, ab 20 Min. geht die Eingreiftruppe aufs Atomsilo.',
    when: 'Wenn ihr viele Gebäude sicher halten wollt und der Gegner unberechenbar ist. Entspricht eurem letzten Plan.',
    pro: 'Viele Gebäude produzieren gleichzeitig Punkte; die Eingreiftruppe stopft Lücken.',
    con: 'Wenig Leute pro Gebäude – ein konzentrierter Angriff kann einzelne Gebäude kippen.',
    en: 'Spread out: all 8 outer buildings are held from the start by 1–3 players each. The 3 strongest form a reaction team that watches where we are under pressure and reinforces there; from minute 20 they take the Nuclear Silo.',
    ph: ['p0','p10','p20'],
    groups: [
      { k:'flex',  n:3, label:'Eingreiftruppe',          steps:[['watch',''],['watch',''],['takeend','silo']] },
      { k:'ref1',  n:3, label:'Raffinerie I',            steps:[['take','ref1'],['hold','ref1'],['hold','ref1']] },
      { k:'ref2',  n:3, label:'Raffinerie II',           steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'info',  n:2, label:'Info-/Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'sci',   n:2, label:'Tech/Söldner',    steps:[['take','sci'],['move','merc'],['hold','merc']] },
      { k:'hosp1', n:2, label:'Lazarett I',              steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',             steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'hosp3', n:2, label:'Lazarett III',            steps:[['take','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
      { k:'hosp4', n:1, label:'Lazarett IV',             steps:[['take','hosp4'],['holdh','hosp4'],['reinforce','']] }
    ]
  },
  center: {
    name: 'Zentrum & Buffs – gegen schwächere Gegner',
    desc: '6 Starke nehmen Ölraffinerie I und stürmen um 10:00 das Atomsilo. Je 3 Spieler holen sich parallel Waffenlager (+15 % eigene Werte) und Söldnerfabrik (−15 % Gegner). Zusammen mit dem Silo ergibt das das „Buff-Dreieck“.',
    when: 'Wenn ihr klar stärker seid oder unbedingt das Silo dominieren wollt.',
    pro: 'Bis zu 30 % Werte-Vorteil in der Mitte; das Silo bringt die meisten Punkte.',
    con: 'Lazarette und Tech-Zentrum werden kaum besetzt – gegen starke Gegner riskant.',
    en: 'Center & buffs: 6 strong players take Oil Refinery I and move into the Nuclear Silo at 10:00; at the same time 3 players each take the Arsenal and the Mercenary Factory (buff triangle).',
    ph: ['p0','p10','p13'],
    groups: [
      { k:'silo',  n:6, label:'Silo-Trupp',         steps:[['take','ref1'],['rally','silo'],['hold','silo']] },
      { k:'arsenal', n:3, label:'Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'merc',  n:3, label:'Söldner-Trupp',      steps:[['take','sci'],['move','merc'],['hold','merc']] },
      { k:'ref2',  n:3, label:'Raffinerie II',      steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'ref1',  n:2, label:'Raffinerie I halten', steps:[['help','ref1'],['hold','ref1'],['hold','ref1']] },
      { k:'hosp1', n:2, label:'Lazarett I',         steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'supp',  n:1, label:'Unterstützung',      steps:[['defend',''],['reinforce',''],['wells','wells']] }
    ]
  },
  turtle: {
    name: 'Bollwerk + Schlussangriff – gegen stärkere Gegner',
    desc: 'Alle 4 Lazarette (Heilung!) und beide Raffinerien werden gehalten, ins Zentrum geht zunächst niemand, die Truppen werden geschont. Ab 28:00 sammeln sich die 5 Stärksten und greifen um 28:30 gemeinsam das Atomsilo an, danach werden die Punkte-Kisten eingesammelt.',
    when: 'Wenn der Gegner deutlich stärker ist. Riskant: Der Schlussangriff muss gut abgestimmt sein.',
    pro: 'Wenig Verluste, viel Heilung, sichere Punkte; der späte Angriff erwischt den Gegner oft unvorbereitet.',
    con: 'Lange kein Silo-Punktestrom; scheitert der Schlussangriff, fehlen die Punkte.',
    en: 'Bulwark & final strike: hold all 4 field hospitals and both refineries, stay out of the center; from 28:00 the 5 strongest gather and move into the Nuclear Silo together at 28:30, then collect the point boxes.',
    ph: ['p0','p10','p28'],
    groups: [
      { k:'strike', n:5, label:'Schlussangriff',  steps:[['take','ref1'],['holdq','ref1'],['final','silo']] },
      { k:'ref2',  n:3, label:'Raffinerie II',    steps:[['take','ref2'],['holdq','ref2'],['hold','ref2']] },
      { k:'hosp1', n:2, label:'Lazarett I',       steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',      steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'hosp3', n:2, label:'Lazarett III',     steps:[['take','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
      { k:'hosp4', n:2, label:'Lazarett IV',      steps:[['take','hosp4'],['holdh','hosp4'],['holdh','hosp4']] },
      { k:'info',  n:2, label:'Infozentrum',      steps:[['take','info'],['holdq','info'],['hold','info']] },
      { k:'supp',  n:2, label:'Unterstützung',    steps:[['defend',''],['reinforce',''],['reinforce','']] }
    ]
  }
};
// Taktik von Moon (Allianzmitglied): vier Farbbereiche + geschlossenes gelbes Team.
// Bereiche nach Lage auf unserer Karte: Schwarz links, Rot rechts, Grün oben, Blau unten.
DS_TACTICS.moon = {
  name: 'Farbbereiche + Gelb – Taktik von Moon',
  desc: 'Taktik von Moon: Vier Farbbereiche mit je 2 Gebäudehaltern (schwächere Spieler: Gebäude halten, Angriffe melden, keine unnötigen Kämpfe) und 2 Unterstützern (Bereich verteidigen, verlorene Gebäude zurückerobern). Die 4 Stärksten sind das gelbe Team: immer geschlossen, nur auf Ruf des Einsatzleiters, ab 10:00 gemeinsam aufs Atomsilo. Höchstens 2 abgestimmte Silo-Versuche, sonst geschlossen auf eine gegnerische Raffinerie. Waffenlager und Söldnerfabrik erst, wenn das Silo sicher ist.',
  when: 'Wenn eine Person im Kampfchat die Einsatzleitung übernimmt und die Bereiche selbstständig verteidigen sollen. Gut bei gemischt starken Teams.',
  pro: 'Alle 8 Außengebäude sofort besetzt, klare Zuständigkeiten, die Stärksten bleiben zusammen und sparen Truppen fürs Silo.',
  con: 'Nur 4 am Silo – gegen sehr starke Gegner knapp. Schwache Halter auf den Raffinerien brauchen schnelle Hilfe von Unterstützern bzw. Gelb.',
  en: 'Moon\'s plan: four color areas, each with 2 building holders (weaker players: hold the building, report attacks, no needless fights) and 2 supporters (defend the area, retake lost buildings). The 4 strongest are the yellow team: always together, only on the leader\'s call, Nuclear Silo together at 10:00. At most 2 coordinated silo attempts, otherwise move as a group to an enemy refinery. Arsenal and Mercenary Factory only once the silo is secure.',
  ph: ['p0','p10','p13'],
  // Füllreihenfolge: Gelb = die Stärksten, Halter = die Schwächsten, Unterstützer = die Mitte (im Zickzack auf die Bereiche verteilt)
  tiers: [['gelb'], ['uL','uR','uN','uS'], ['hRef1','hRef2','hH1','hH4','hH3','hH2','hInfo','hSci']],
  sectors: { secL:['ref1','hosp1'], secR:['ref2','hosp4'], secN:['info','hosp3'], secS:['sci','hosp2'] },
  groups: [
    { k:'gelb',  n:4, label:'Gelbes Team',                 steps:[['yellow',''],['rally','silo'],['silob','silo']] },
    { k:'uL',    n:2, label:'Unterstützer Schwarz (links)', steps:[['sup','secL'],['sup','secL'],['sup','secL']] },
    { k:'uR',    n:2, label:'Unterstützer Rot (rechts)',    steps:[['sup','secR'],['sup','secR'],['sup','secR']] },
    { k:'uN',    n:2, label:'Unterstützer Grün (oben)',     steps:[['sup','secN'],['sup','secN'],['sup','secN']] },
    { k:'uS',    n:2, label:'Unterstützer Blau (unten)',    steps:[['sup','secS'],['sup','secS'],['sup','secS']] },
    { k:'hRef1', n:1, label:'Halter Schwarz',  steps:[['keep','ref1'],['hold','ref1'],['hold','ref1']] },
    { k:'hRef2', n:1, label:'Halter Rot',      steps:[['keep','ref2'],['hold','ref2'],['hold','ref2']] },
    { k:'hH1',   n:1, label:'Halter Schwarz',  steps:[['keep','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
    { k:'hH4',   n:1, label:'Halter Rot',      steps:[['keep','hosp4'],['holdh','hosp4'],['holdh','hosp4']] },
    { k:'hH3',   n:1, label:'Halter Grün',     steps:[['keep','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
    { k:'hH2',   n:1, label:'Halter Blau',     steps:[['keep','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
    { k:'hInfo', n:1, label:'Halter Grün',     steps:[['keep','info'],['hold','info'],['hold','info']] },
    { k:'hSci',  n:1, label:'Halter Blau',     steps:[['keep','sci'],['hold','sci'],['hold','sci']] }
  ]
};
var DS_SEC = { secL:{ de:'Schwarz', en:'Black', col:'#111827' }, secR:{ de:'Rot', en:'Red', col:'#b91c1c' }, secN:{ de:'Grün', en:'Green', col:'#15803d' }, secS:{ de:'Blau', en:'Blue', col:'#1d4ed8' } };
var DS_B = { secL:'Bereich Schwarz (links)', secR:'Bereich Rot (rechts)', secN:'Bereich Grün (oben)', secS:'Bereich Blau (unten)', ref1:'Ölraffinerie I', ref2:'Ölraffinerie II', hosp1:'Feldlazarett I', hosp2:'Feldlazarett II', hosp3:'Feldlazarett III', hosp4:'Feldlazarett IV', sci:'Tech-Zentrum', info:'Infozentrum', arsenal:'Waffenlager', merc:'Söldnerfabrik', silo:'Atomsilo', wells:'Ölquellen' };
var DS_B_EN = { secL:'Black area (left)', secR:'Red area (right)', secN:'Green area (top)', secS:'Blue area (bottom)', ref1:'Oil Refinery I', ref2:'Oil Refinery II', hosp1:'Field Hospital I', hosp2:'Field Hospital II', hosp3:'Field Hospital III', hosp4:'Field Hospital IV', sci:'Science Hub', info:'Info Center', arsenal:'Arsenal', merc:'Mercenary Factory', silo:'Nuclear Silo', wells:'Oil Wells' };
var DS_A = { take:'{b} erobern und halten', help:'bei {b} mit erobern', move:'zu {b} wechseln, erobern und halten', hold:'{b} halten', holdh:'{b} halten, geheilte Truppen abholen', rally:'ab 9:30 sammeln, um 10:00 gemeinsam {b} erobern und halten', iffree:'{b} erobern, wenn frei – sonst verstärken, wo nötig', defend:'Basis verteidigen, Punkte-Kisten einsammeln', reinforce:'Kisten einsammeln, angegriffene Gebäude verstärken', wells:'{b} sammeln',
  watch:'Eingreiftruppe: beobachten, wo wir unter Druck sind, und dort verstärken', takeend:'{b} erobern und bis zum Ende halten', final:'ab 28:00 sammeln, um 28:30 gemeinsam {b} angreifen, danach Punkte-Kisten einsammeln', holdq:'{b} halten und Truppen schonen – nicht ins Zentrum',
  yellow:'Gelbes Team: immer geschlossen bleiben, nur auf Ruf des Einsatzleiters eingreifen (Raffinerien retten, starke Gegner stoppen)', keep:'{b} sofort erobern, in der Nähe bleiben und Angriffe sofort melden – keine unnötigen Kämpfe', sup:'{b} absichern: Halter schützen, verlorene Gebäude gemeinsam zurückerobern, Kisten sammeln', silob:'{b} gemeinsam halten – nach 2 gescheiterten Versuchen geschlossen auf eine gegnerische Raffinerie' };
var DS_A_EN = { take:'capture & hold', help:'help capture', move:'move to & hold', hold:'hold', holdh:'hold', rally:'rally 9:30, attack 10:00', iffree:'take if free', defend:'defend base', reinforce:'reinforce', wells:'gather', watch:'reaction team', takeend:'capture & hold to the end', final:'final strike 28:30', holdq:'hold, save troops', yellow:'yellow team', keep:'capture & report', sup:'secure area', silob:'hold, plan B: enemy refinery' };
var DS_PHL = { p0:'Start (0–10 Min.)', p10:'Ab 10 Min.', p13:'Ab 13 Min.', p20:'Ab 20 Min.', p28:'Ab 28 Min.' };
var DS_PHL_EN = { p0:'phase 1, minute 0–10', p10:'phase 2, from minute 10', p13:'phase 3, from minute 13', p20:'phase 3, from minute 20', p28:'phase 3, from minute 28' };
var DS_TIPS = [
  'Gebäude bringen auch ohne Besatzung Punkte – nach dem Erobern nicht wild abziehen.',
  'Nach 60 Sekunden werden 40 % der Punkte plünderbar: Gebäude halten, bei einem Wechsel die Punkte-Kisten mit dem Aufklärer einsammeln.',
  'Geheilte Truppen regelmäßig im Lazarett abholen (Symbol unten links).',
  'Teleport für Notfälle aufheben (Verteidigung, Silo).',
  'Wer früher gehen muss: über die Punktetafel „Schlachtfeld verlassen“, damit ein Ersatzspieler nachrücken kann.'
];
var DS_KEY = 'skws_ds', DS_ONLYSEL = false, DS_LAST = null, DS_PUB = null;
function dsState(){
  var st = null; try { st = JSON.parse(ls(DS_KEY) || 'null'); } catch(e){}
  st = st || {}; st.assign = st.assign || {}; st.time = st.time || {A:'',B:''}; st.opp = st.opp || {A:'',B:''};
  st.note = st.note || {A:'',B:''}; st.tac = st.tac || {A:'std',B:'std'}; st.metric = st.metric || 't1';
  return st;
}
function dsSave(st){ try { ls(DS_KEY, JSON.stringify(st)); } catch(e){} }
function dsMetricVal(p, m){
  if (!p.entry) return 0;
  if (m === 'hero') return Number(p.entry.hero || 0);
  return m === 'total' ? p.total : p.t1;
}
function dsMetricTxt(p, m){
  if (!p || !p.entry) return 'keine Meldung';
  var v = dsMetricVal(p, m);
  return (m === 'hero' ? 'Held ' : m === 'total' ? 'Ges. ' : 'T1 ') + (v ? fmt(v) + ' M' : '–');
}
function dsAct(step){ var t = DS_A[step[0]] || step[0]; return t.split('{b}').join(DS_B[step[1]] || ''); }
function dsTacInfo(t){
  var T = DS_TACTICS[$('dsTac' + t).value] || DS_TACTICS.std;
  $('dsTacInfo' + t).innerHTML = '<b>' + esc(T.name) + '</b><br>' + esc(T.desc) + '<br><span class="muted">Wann: </span>' + esc(T.when) + '<br><span class="up">+ </span>' + esc(T.pro) + '<br><span class="down">− </span>' + esc(T.con);
}
function dsRender(){
  if (!D) return;
  var st = dsState();
  ['A','B'].forEach(function(t){
    $('dsTime' + t).value = st.time[t]; $('dsOpp' + t).value = st.opp[t]; $('dsNote' + t).value = st.note[t];
    $('dsTac' + t).value = DS_TACTICS[st.tac[t]] ? st.tac[t] : 'std'; dsTacInfo(t);
  });
  $('dsMetric').value = st.metric;
  evRender('ds');
  dsRenderList();
  dsPubInfo();
  if (typeof ablRender === 'function') ablRender('ds');
}
function dsRenderList(){
  var st = dsState(), m = st.metric, q = $('dsSearch').value.trim().toLowerCase();
  var list = D.players.filter(function(p){ return p.active; }).slice().sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); });
  var c = { AS:0, AE:0, BS:0, BE:0 };
  list.forEach(function(p){ var v = st.assign[p.name]; if (c[v] !== undefined) c[v]++; });
  function box(t){ var s = c[t+'S'], e = c[t+'E']; return '<div>Team ' + t + (st.time[t] ? ' · ' + esc(st.time[t]) : '') + '<b><span class="' + (s > 20 ? 'over' : '') + '">' + s + '/20 Stamm</span> · <span class="' + (e > 10 ? 'over' : '') + '">' + e + '/10 Ersatz</span></b></div>'; }
  $('dsCount').innerHTML = box('A') + box('B');
  $('dsOnlySel').textContent = DS_ONLYSEL ? 'alle Spieler zeigen' : 'nur Zugeordnete zeigen';
  var opts = [['','–'],['AS','A Stamm'],['AE','A Ersatz'],['BS','B Stamm'],['BE','B Ersatz']];
  $('dsList').innerHTML = list.filter(function(p){
    if (DS_ONLYSEL && !st.assign[p.name]) return false;
    return !q || p.name.toLowerCase().indexOf(q) >= 0;
  }).map(function(p){
    var v = st.assign[p.name] || '';
    return '<label class="' + (v ? (v[0] === 'A' ? 'as' : 'bs') : '') + (p.entry ? '' : ' nodata') + '"><span class="nm">' + av(p.name, 30) + esc(p.name) + mgBadge(p.name) + merBadge(p.name, 'ds') + '</span><span class="meta">' + p.rank + ' · ' + dsMetricTxt(p, m) + '</span>' +
      '<select data-ds="' + esc(p.name) + '">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
  }).join('') || '<div class="empty">Keine Treffer.</div>';
}
function dsBuild(stIn){
  var st = stIn || dsState(), m = st.metric, by = {}; D.players.forEach(function(p){ by[p.name] = p; });
  var plan = { at: new Date().toISOString(), metric: m, teams: {} }, warn = [];
  ['A','B'].forEach(function(t){
    function pick(r){ return Object.keys(st.assign).filter(function(n){ return st.assign[n] === t + r && by[n] && by[n].active; }).map(function(n){ return by[n]; })
      .sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); }); }
    var stamm = pick('S'), subs = pick('E');
    if (!stamm.length && !subs.length) return;
    var tacKey = DS_TACTICS[st.tac[t]] ? st.tac[t] : 'std', TC = DS_TACTICS[tacKey];
    var members = [], used = {}, i = 0, last = TC.groups[TC.groups.length - 1].k;
    if (TC.tiers) dsDealTiers(TC, stamm, members, used);
    else {
      TC.groups.forEach(function(g){ for (var k = 0; k < g.n && i < stamm.length; k++, i++) { members.push([stamm[i].name, g.k]); used[g.k] = g.steps; } });
      for (; i < stamm.length; i++) { members.push([stamm[i].name, last]); used[last] = TC.groups[TC.groups.length - 1].steps; }
    }
    if (stamm.length > 20) warn.push('Team ' + t + ': ' + stamm.length + ' Stammspieler – im Spiel sind nur 20 gleichzeitig möglich.');
    if (subs.length > 10) warn.push('Team ' + t + ': ' + subs.length + ' Ersatzspieler – im Spiel sind nur 10 möglich.');
    var nod = stamm.concat(subs).filter(function(p){ return !p.entry; }).map(function(p){ return p.name; });
    if (nod.length) warn.push('Team ' + t + ' ohne Meldung (als Schwächste eingeplant): ' + nod.join(', '));
    plan.teams[t] = { time: st.time[t] || '', opp: st.opp[t] || '', note: st.note[t] || '', tac: tacKey, ph: TC.ph, g: used, m: members, s: subs.map(function(p){ return p.name; }) };
    // Bereichs-Taktik: jeder Ersatz bekommt einen festen Bereich (reihum)
    if (TC.sectors) { var sk = Object.keys(TC.sectors); plan.teams[t].ss = subs.map(function(p, j){ return sk[j % sk.length]; }); }
  });
  return { plan: plan, warn: warn, by: by };
}
// Verteilung in Stufen: erste Stufe = die Stärksten, letzte = die Schwächsten (bei weniger Spielern zuerst gefüllt),
// mittlere Stufe bekommt den Rest im Zickzack, damit kein Bereich nur die Stärkeren oder nur die Schwächeren hat.
function dsDealTiers(TC, stamm, members, used){
  var gm = {}; TC.groups.forEach(function(g){ gm[g.k] = g; });
  var sz = TC.tiers.map(function(t){ return t.reduce(function(a, k){ return a + gm[k].n; }, 0); }), N = stamm.length;
  var c0 = Math.min(sz[0], N), c2 = Math.min(sz[2], N - c0), c1 = N - c0 - c2;
  var parts = [stamm.slice(0, c0), stamm.slice(c0, c0 + c1), stamm.slice(c0 + c1)];
  TC.tiers.forEach(function(keys, ti){
    var cnt = {}; keys.forEach(function(k){ cnt[k] = 0; });
    var seq = []; if (ti === 1) { for (var r = 0; r < 8; r++) { var row = keys.slice(); if (r % 2) row.reverse(); seq = seq.concat(row); } }
    parts[ti].forEach(function(p, j){
      var k = null;
      if (ti === 1) { for (var q = 0; q < seq.length && !k; q++) { var c = seq[(j + q) % seq.length]; if (cnt[c] < gm[c].n) k = c; } if (!k) k = seq[j % seq.length]; }
      else { keys.forEach(function(c){ if (!k && cnt[c] < gm[c].n) k = c; }); if (!k) k = keys[keys.length - 1]; }
      cnt[k]++; members.push([p.name, k]); used[k] = gm[k].steps;
    });
  });
}
function dsGroupsOf(team){
  var TC = DS_TACTICS[team.tac] || DS_TACTICS.std, out = [];
  TC.groups.forEach(function(g){ var names = team.m.filter(function(x){ return x[1] === g.k; }).map(function(x){ return x[0]; }); if (names.length) out.push({ g: g, names: names }); });
  return out;
}
function dsExampleState(){
  var st = JSON.parse(JSON.stringify(dsState())), m = st.metric;
  var list = D.players.filter(function(p){ return p.active && p.entry; }).sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); });
  st.assign = {};
  // Beispiel: gemischt wie bei echten Anmeldungen (abwechselnd A/B), nicht die Stärksten nur in A
  list.forEach(function(p, i){ var v = i < 40 ? (i % 2 ? 'BS' : 'AS') : i < 60 ? (i % 2 ? 'BE' : 'AE') : ''; if (v) st.assign[p.name] = v; });
  st.time = { A: st.time.A || 'Fr 14:00', B: st.time.B || 'Fr 21:00' };
  return st;
}
function dsRun(example){
  var r = dsBuild(example === true ? dsExampleState() : null); r.example = example === true; DS_LAST = r;
  var P = r.plan, m = P.metric, h = '';
  ['A','B'].forEach(function(t){
    var T = P.teams[t]; if (!T) return;
    var TC = DS_TACTICS[T.tac];
    h += '<div class="team"><h3>Team ' + t + (T.time ? ' · ' + esc(T.time) : '') + (T.opp ? ' · gegen ' + esc(T.opp) : '') + '<span>' + esc(TC.name) + ' · ' + T.m.length + ' Stamm · ' + T.s.length + ' Ersatz</span></h3>';
    if (T.note) h += '<p class="small" style="margin:0 0 6px">Hinweis: ' + esc(T.note) + '</p>';
    h += '<div class="tw"><table class="grp"><tr><th>Gruppe</th><th>Spieler</th>' + T.ph.map(function(k){ return '<th>' + DS_PHL[k] + '</th>'; }).join('') + '</tr>';
    dsGroupsOf(T).forEach(function(x){
      h += '<tr><td><b>' + esc(x.g.label) + '</b></td><td>' + x.names.map(function(n){ return esc(n) + '<div class="phase">' + dsMetricTxt(r.by[n], m) + '</div>'; }).join('') + '</td>' +
        x.g.steps.map(function(s){ return '<td>' + esc(dsAct(s)) + '</td>'; }).join('') + '</tr>';
    });
    if (T.s.length) h += '<tr class="rankhead"><td colspan="5">Ersatz (Reihenfolge = wer zuerst nachrückt)</td></tr><tr><td colspan="5" style="white-space:normal">' + T.s.map(function(n, i){ return 'E' + (i+1) + ' ' + esc(n); }).join(' · ') + '</td></tr>';
    h += '</table></div></div>';
  });
  if (!Object.keys(P.teams).length) h = '<div class="empty">Bitte zuerst oben Spieler Team A oder B zuordnen.</div>';
  else h += '<details style="margin-top:10px"><summary>Grundregeln, die im Chat-Text mitgeschickt werden</summary><ul class="small">' + DS_TIPS.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
  if (r.warn.length) h = '<div class="note err">' + r.warn.map(esc).join('<br>') + '</div>' + h;
  if (r.example && Object.keys(P.teams).length) h = '<div class="note ok">BEISPIEL – zeigt, wie der Plan mit euren stärksten Spielern aussehen würde. Chat-Text und Bild-Prompt kannst du zum Ausprobieren kopieren; veröffentlichen geht nur mit echter Zuordnung.</div>' + h;
  $('dsResult').innerHTML = h;
  $('dsActions').classList.toggle('hide', !Object.keys(P.teams).length);
  $('dsPublish').disabled = !!r.example; $('dsPublish').style.opacity = r.example ? .4 : '';
  ['A','B'].forEach(function(t){ ['dsCopy','dsImg','dsPic'].forEach(function(id){ $(id + t).classList.toggle('hide', !P.teams[t]); }); $('dsPic' + t + 'de').classList.toggle('hide', !P.teams[t]); });
  $('dsmOut').innerHTML = '';
  $('dsMsg').textContent = ''; $('dsMsg').className = 'note';
  if (example !== true) evSaveLineup('ds', dsState().assign);
}
function dsChat(t){
  // Kurz und ohne Emojis und Symbole (Spiel-Chat): nur, was nicht schon im Bild steht.
  var T = DS_LAST.plan.teams[t], out = ['SKWS Wüstensturm Team ' + t + (T.time ? ' - ' + T.time : '') + ' - Plan siehe Bild'];
  dsGroupsOf(T).forEach(function(x){
    x.g.steps.forEach(function(s){
      if (s[0] === 'rally') out.push('- ' + x.names.join(', ') + ': ab 9:30 sammeln, um 10:00 zusammen aufs Atomsilo.');
      if (s[0] === 'final') out.push('- ' + x.names.join(', ') + ': ab 28:00 sammeln, um 28:30 zusammen aufs Atomsilo, danach Kisten einsammeln.');
    });
    if (x.g.steps[0][0] === 'watch') out.push('- ' + x.names.join(', ') + ': Eingreiftruppe, helft dort, wo wir unter Druck sind.');
  });
  if (T.tac === 'moon') {
    out.push('- Bereiche: Schwarz = Raffinerie I + Lazarett I, Rot = Raffinerie II + Lazarett IV, Grün = Infozentrum + Lazarett III, Blau = Tech-Zentrum + Lazarett II.');
    out.push('- Gelb bleibt immer zusammen und kommt nur auf Ruf des Einsatzleiters. Am Silo höchstens 2 gemeinsame Versuche, sonst geschlossen auf eine gegnerische Raffinerie.');
    out.push('- Halter: Gebäude halten, Angriffe sofort melden, keine unnötigen Kämpfe. Unterstützer: eigenen Bereich verteidigen und zurückerobern, andere Bereiche nur auf Anweisung.');
    out.push('- Meldung im Kampfchat: Farbe - Gebäude - Gegnerzahl - Stärke, bei Bedarf "Gelb benötigt".');
    out.push('- Waffenlager und Söldnerfabrik erst, wenn das Silo sicher ist und der Einsatzleiter freigibt.');
    if (T.s.length) out.push('- Ersatz in dieser Reihenfolge, mit festem Bereich: ' + T.s.map(function(n, i){ return n + ' (' + DS_SEC[T.ss[i]].de + ')'; }).join(', ') + '.');
  } else if (T.s.length) out.push('- Ersatz in dieser Reihenfolge: ' + T.s.join(', ') + '. Ersatz übernimmt die Aufgabe dessen, der ausfällt.');
  out.push('- Wer nicht kann oder früher gehen muss: bitte Bescheid geben und über die Punktetafel "Schlachtfeld verlassen", damit Ersatz nachrücken kann.');
  out.push('- Eroberte Gebäude halten (nach 60 Sek. wird ein Teil der Punkte plünderbar), Punkte-Kisten einsammeln.');
  out.push('- Geheilte Truppen im Lazarett abholen, Teleport für Notfälle aufheben.');
  out.push('Deinen Einsatz siehst du auch auf der Squad-Seite.');
  return out.join('\n');
}

function dsImgPrompt(t){
  var T = DS_LAST.plan.teams[t], TC = DS_TACTICS[T.tac], groups = dsGroupsOf(T);
  // Startposition je Gebäude (Phase 1) und wer später wohin wechselt (Pfeile)
  var start = {}, order = [], moves = [];
  groups.forEach(function(x){
    var b0 = x.g.steps[0][1] || (x.g.steps[0][0] === 'watch' || x.g.steps[0][0] === 'yellow' ? 'react' : 'base');
    if (!start[b0]) { start[b0] = []; order.push(b0); }
    start[b0] = start[b0].concat(x.names);
    var prev = b0;
    x.g.steps.forEach(function(s, i){
      if (!i) return; var b = s[1] || (s[0] === 'watch' || s[0] === 'reinforce' || s[0] === 'defend' ? 'flex' : prev);
      if (b !== prev && b !== 'flex') moves.push(x.names.join(', ') + ': ' + (prev === 'base' ? 'own base' : prev === 'react' ? 'reaction team' : DS_B_EN[prev]) + ' → ' + DS_B_EN[b] + ' (' + DS_PHL_EN[T.ph[i]] + (s[0] === 'rally' ? ', meet at 9:30, move in at 10:00' : s[0] === 'final' ? ', meet at 28:00, move in at 28:30' : '') + ')');
      if (b !== 'flex') prev = b;
    });
  });
  function bn(b){ return b === 'base' ? 'Own base / support' : b === 'react' ? 'Reaction team (write these names near the center of the map)' : DS_B_EN[b]; }
  var title = 'DESERT STORM – TEAM ' + t;
  var notes = [];
  groups.forEach(function(x){ if (x.g.steps.some(function(s){ return s[0] === 'watch'; })) notes.push(x.names.join(', ') + ' are the helper team: they watch where teammates need help and go there' + (x.g.steps[2][1] === 'silo' ? '; from minute 20 they take the Nuclear Silo.' : '.')); });
  if (T.note) notes.push(T.note);
  return [
    'Please create a friendly team coordination board (like a sports team line-up sheet) for our group in the mobile strategy game "Last War: Survival", for the weekly team event called "Desert Storm". Landscape format 16:9.',
    'All names below are in-game nicknames of our own team members who asked to be listed – this is just a who-goes-where overview for our team chat.',
    '',
    'LAYOUT (like a classic alliance briefing slide):',
    '- Right two thirds: the attached Desert Storm map image (use it as the background exactly as it is – do not move, add or remove buildings). If no image is attached, draw a sandy desert top-down map with 11 buildings: our side is on the LEFT, the opponent on the RIGHT. Center column from top to bottom: Arsenal, Nuclear Silo (exact center), Mercenary Factory. Left side from top to bottom: Info Center (top-left corner), Oil Refinery I, Field Hospital I, Field Hospital II. Right side from top to bottom: Field Hospital III, Field Hospital IV, Oil Refinery II, Science Hub (bottom-right corner).',
    '- Left third: dark background with the neon-blue title "' + title + '" and below it a blue text box with the plan and special instructions (text below).',
    '- Top right corner: the time "' + (T.time || '') + '".',
    '',
    'ON THE MAP:',
    '- Write the player names in bold dark text right next to the building where they START (phase 1):',
    order.map(function(b){ return '  • ' + bn(b) + ': ' + start[b].join(', '); }).join('\n'),
    '- Players who MOVE later: draw a green oval around their names and a green curved arrow to the building they move to:',
    (moves.length ? moves.map(function(x){ return '  • ' + x; }).join('\n') : '  • (none)'),
    '',
    'TEXT BOX (left side, white text on blue):',
    'Plan: ' + TC.en,
    notes.map(function(x){ return x; }).join('\n'),
    'Substitutes (in this order): ' + (T.s.join(', ') || '–'),
    '',
    'Spell every player name exactly as written, including capital letters, spaces and digits. Keep all text large and readable on a phone. No other decorations.'
  ].filter(function(x){ return x !== ''; }).join('\n').replace(/\n(LAYOUT|ON THE MAP|TEXT BOX)/g, '\n\n$1');
}
function dsPubInfo(){
  var p = DS_PUB;
  $('dsPubInfo').textContent = p && p.at ? 'Aktuell veröffentlicht: ' + fmtDateTime(new Date(p.at)) + ' (' + Object.keys(p.teams || {}).map(function(t){ return 'Team ' + t; }).join(' + ') + ')' : 'Aktuell ist kein Einsatzplan veröffentlicht.';
}
function dsPublish(plan){
  $('dsMsg').textContent = 'Speichere…'; $('dsMsg').className = 'note';
  rpc('admin_ds_publish', { p_pw: PW, p_plan: plan, p_actor: ACTOR || null }).then(function(){
    DS_PUB = plan; dsPubInfo(); if (typeof ablRender === 'function') ablRender('ds');
    $('dsMsg').textContent = plan ? 'Veröffentlicht – die Spieler sehen ihren Einsatz jetzt auf der Seite.' : 'Veröffentlichung zurückgenommen.'; $('dsMsg').className = 'note ok';
  }).catch(function(e){ $('dsMsg').textContent = 'Fehler beim Speichern: ' + (e && e.message || ''); $('dsMsg').className = 'note err'; });
}
(function(){
  function upd(fn){ var st = dsState(); fn(st); dsSave(st); }
  var tacOpts = Object.keys(DS_TACTICS).map(function(k){ return '<option value="' + k + '">' + esc(DS_TACTICS[k].name) + '</option>'; }).join('');
  ['A','B'].forEach(function(t){
    $('dsTac' + t).innerHTML = tacOpts;
    $('dsTac' + t).addEventListener('change', function(){ var v = this.value; upd(function(st){ st.tac[t] = v; }); dsTacInfo(t); });
    $('dsTime' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.time[t] = v; }); dsRenderList(); });
    $('dsOpp' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.opp[t] = v; }); });
    $('dsNote' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.note[t] = v; }); });
    $('dsCopy' + t).addEventListener('click', function(){ if (DS_LAST && DS_LAST.plan.teams[t]) copyText(dsChat(t), 'dsMsg'); });
    $('dsImg' + t).addEventListener('click', function(){ if (DS_LAST && DS_LAST.plan.teams[t]) copyText(dsImgPrompt(t), 'dsMsg'); });
  });
  $('dsMetric').addEventListener('change', function(){ var v = this.value; upd(function(st){ st.metric = v; }); dsRenderList(); });
  $('dsSearch').addEventListener('input', dsRenderList);
  $('dsOnlySel').addEventListener('click', function(){ DS_ONLYSEL = !DS_ONLYSEL; dsRenderList(); });
  $('dsClear').addEventListener('click', function(){ if (!confirm('Alle Zuordnungen für Team A und B löschen?')) return; upd(function(st){ st.assign = {}; }); dsRenderList(); });
  $('dsList').addEventListener('change', function(e){
    var s = e.target.closest('select[data-ds]'); if (!s) return; var n = s.dataset.ds, v = s.value;
    upd(function(st){ if (v) st.assign[n] = v; else delete st.assign[n]; });
    dsRenderList();
  });
  $('dsRun').addEventListener('click', function(){ dsRun(false); });
  $('dsExample').addEventListener('click', function(){ dsRun(true); });
  $('dsPublish').addEventListener('click', function(){ if (!DS_LAST || DS_LAST.example) return; dsRun(false); if (!confirm('Einsatzplan für die Spieler veröffentlichen?')) return; dsPublish(DS_LAST.plan); });
  $('dsUnpublish').addEventListener('click', function(){ if (confirm('Veröffentlichten Einsatzplan zurücknehmen?')) dsPublish(null); });
})();

/* ---------- Wüstensturm: Plan-Bild selbst zeichnen ---------- */
// Positionen in Prozent der Kartenfläche; Standard angelehnt an eure bisherige Karte, per Ziehen anpassbar.
// Aufbau laut Guides (lastwargame.online L1–L4/R1–R4/C1–C3, lastwartutorial.com): unsere Seite links, Gegner rechts,
// Mitte von oben: Waffenlager, Atomsilo, Söldnerfabrik. Links von oben: Infozentrum (Ecke oben links), Raffinerie, 2 Lazarette;
// rechts von oben: 2 Lazarette, Raffinerie, Tech-Zentrum (Ecke unten rechts).
var DSM_DEF = { info:[32,7], ref1:[13,30], hosp1:[13,57], hosp2:[32,86], arsenal:[51,18], silo:[51,45], merc:[50,72], hosp3:[72,6], hosp4:[89,34], ref2:[89,60], sci:[72,86], wells:[24,44], base:[4,48], react:[36,60] };
var DSM_LBL = { ref1:'Raff. I', ref2:'Raff. II', hosp1:'Laz. I', hosp2:'Laz. II', hosp3:'Laz. III', hosp4:'Laz. IV', sci:'Wiss.', info:'Info', arsenal:'Waffenl.', merc:'Söldner', silo:'Atomsilo', wells:'Ölquellen', base:'Basis', react:'Eingreif.' };
var DSM_KEY = 'skws_ds_map', DSM_POS_KEY = 'skws_ds_pos2', DSM_BG = null, DSM_LASTURL = null;
function dsmPos(){ var p = null; try { p = JSON.parse(ls(DSM_POS_KEY) || 'null'); } catch(e){} var o = {}; Object.keys(DSM_DEF).forEach(function(k){ o[k] = (p && p[k]) || DSM_DEF[k].slice(); }); return o; }
function dsmLoadBg(cb){
  var src = ls(DSM_KEY); if (!src) { DSM_BG = null; cb && cb(); return; }
  var im = new Image(); im.onload = function(){ DSM_BG = im; cb && cb(); }; im.onerror = function(){ DSM_BG = null; cb && cb(); }; im.src = src;
}
function dsmEditor(){
  var box = $('dsmEdit'), pos = dsmPos(), src = ls(DSM_KEY);
  box.style.backgroundImage = src ? 'url(' + src + ')' : '';
  box.classList.toggle('schem', !src);
  if (DSM_BG) box.style.aspectRatio = DSM_BG.naturalWidth + ' / ' + DSM_BG.naturalHeight; else box.style.aspectRatio = '1 / 1';
  box.innerHTML = Object.keys(pos).map(function(k){ return '<span class="dsm-pin' + (k === 'base' || k === 'react' || k === 'wells' ? ' aux' : '') + '" data-k="' + k + '" style="left:' + pos[k][0] + '%;top:' + pos[k][1] + '%">' + DSM_LBL[k] + '</span>'; }).join('');
}
(function(){
  var drag = null;
  $('dsmEdit').addEventListener('pointerdown', function(e){ var p = e.target.closest('.dsm-pin'); if (!p) return; drag = p; p.setPointerCapture(e.pointerId); e.preventDefault(); });
  $('dsmEdit').addEventListener('pointermove', function(e){
    if (!drag) return; var r = this.getBoundingClientRect();
    var x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), y = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
    drag.style.left = x + '%'; drag.style.top = y + '%';
  });
  $('dsmEdit').addEventListener('pointerup', function(){
    if (!drag) return; var pos = dsmPos(); pos[drag.dataset.k] = [parseFloat(drag.style.left), parseFloat(drag.style.top)];
    ls(DSM_POS_KEY, JSON.stringify(pos)); drag = null;
  });
  $('dsmFile').addEventListener('change', function(){
    var f = this.files && this.files[0]; if (!f) return;
    var fr = new FileReader(); fr.onload = function(){
      var im = new Image(); im.onload = function(){
        var sc = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        try { ls(DSM_KEY, c.toDataURL('image/jpeg', .85)); } catch(e){ $('dsmNote').textContent = 'Bild zu groß zum Speichern.'; return; }
        dsmLoadBg(dsmEditor); $('dsmNote').textContent = 'Kartenbild gespeichert. Zieh jetzt die Schilder auf die passenden Gebäude.'; $('dsmNote').className = 'note ok';
      }; im.src = fr.result;
    }; fr.readAsDataURL(f);
  });
  $('dsmClearBg').addEventListener('click', function(){ ls(DSM_KEY, null); dsmLoadBg(dsmEditor); });
  $('dsmReset').addEventListener('click', function(){ ls(DSM_POS_KEY, null); dsmEditor(); });
  $('dsmToggle').addEventListener('click', function(){ var w = $('dsmWrap'); w.classList.toggle('hide'); if (!w.classList.contains('hide')) dsmLoadBg(dsmEditor); });
  ['A','B'].forEach(function(t){ ['', 'de'].forEach(function(sfx){ $('dsPic' + t + sfx).addEventListener('click', function(){ var lang = this.dataset.lang; if (!DS_LAST || !DS_LAST.plan.teams[t]) return; if (ls(DSM_KEY)) dsmLoadBg(function(){ dsmRender(t); }); else dstLoad(t, function(){ if (DST_IMG) dstRender(t, lang); else dsmLoadBg(function(){ dsmRender(t); }); }); }); }); });
})();
function dsmWrap(ctx, text, maxW){
  var out = []; String(text).split('\n').forEach(function(par){
    var words = par.split(' '), line = '';
    words.forEach(function(w){ var tst = line ? line + ' ' + w : w; if (ctx.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; });
    out.push(line);
  }); return out;
}
function dsmRender(t){
  var T = DS_LAST.plan.teams[t], TC = DS_TACTICS[T.tac], groups = dsGroupsOf(T), pos = dsmPos();
  var W = 1920, H = 1080, c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.lineJoin = 'round'; g.miterLimit = 2;
  g.fillStyle = '#05070d'; g.fillRect(0, 0, W, H);
  // Kartenfläche
  var MX = 660, MY = 40, MW = 1220, MH = 1000, ar = DSM_BG ? DSM_BG.naturalWidth / DSM_BG.naturalHeight : 1;
  var mw = MW, mh = mw / ar; if (mh > MH) { mh = MH; mw = mh * ar; }
  var mx = MX + (MW - mw) / 2, my = MY + (MH - mh) / 2;
  if (DSM_BG) g.drawImage(DSM_BG, mx, my, mw, mh);
  else { var gr = g.createRadialGradient(mx + mw/2, my + mh/2, 50, mx + mw/2, my + mh/2, mw * .7); gr.addColorStop(0, '#e2a868'); gr.addColorStop(1, '#b87a3e'); g.fillStyle = gr; g.fillRect(mx, my, mw, mh); }
  if (!DSM_BG) { g.font = '700 22px system-ui, sans-serif'; g.fillStyle = 'rgba(40,20,0,.55)'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('◀ UNSERE SEITE', mx + 14, my + mh - 34); g.textAlign = 'right'; g.fillText('GEGNER ▶', mx + mw - 14, my + mh - 34); }
  function P(k){ var p = pos[k] || [50,50]; return [mx + p[0] / 100 * mw, my + p[1] / 100 * mh]; }
  if (!DSM_BG) Object.keys(DSM_DEF).forEach(function(k){
    if (k === 'base' || k === 'react') return; var p = P(k), big = k === 'silo' || k === 'arsenal' || k === 'merc';
    g.font = '600 18px system-ui, sans-serif';
    var s = Math.max(big ? 46 : 34, g.measureText(DS_B[k] || '').width / 2 + 12), hh = big ? 30 : 22;
    g.fillStyle = big ? '#5d616b' : '#7d8089'; g.strokeStyle = '#3a3d44'; g.lineWidth = 3;
    g.beginPath(); g.roundRect ? g.roundRect(p[0]-s, p[1]-hh, s*2, hh*2, 10) : g.rect(p[0]-s, p[1]-hh, s*2, hh*2); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(DS_B[k] || '', p[0], p[1]);
  });
  // Start-Gebäude und Wechsel je Gruppe
  var startAt = {}, moves = [];
  groups.forEach(function(x){
    var s0 = x.g.steps[0], b0 = s0[1] || (s0[0] === 'watch' || s0[0] === 'yellow' ? 'react' : 'base'), prev = b0, mover = false;
    x.g.steps.forEach(function(s, i){
      if (!i) return; var b = s[1] || null; if (!b || b === prev) return;
      moves.push({ from: prev, to: b, ph: i, names: x.names, first: !mover }); mover = true; prev = b;
    });
    (startAt[b0] = startAt[b0] || []).push({ names: x.names, mover: mover });
  });
  g.textAlign = 'center'; g.textBaseline = 'top';
  var labelBox = {}, textOps = [];
  Object.keys(startAt).forEach(function(b){
    var p = P(b), y = p[1] + 34;
    startAt[b].forEach(function(blk){
      g.font = '700 26px system-ui, sans-serif';
      var lines = blk.names.map(function(n){ return n; }), lh = 30, w = Math.max.apply(null, lines.map(function(l){ return g.measureText(l).width; }));
      lines.forEach(function(l, i){ textOps.push([l, p[0], y + i * lh]); });
      if (blk.mover) {
        g.strokeStyle = '#1f9d3a'; g.lineWidth = 5; g.beginPath();
        g.ellipse(p[0], y + lines.length * lh / 2 - 2, w / 2 + 26, lines.length * lh / 2 + 12, 0, 0, Math.PI * 2); g.stroke();
        blk.names.forEach(function(n){ labelBox[n] = [p[0], y + lines.length * lh / 2, w / 2 + 26]; });
      }
      y += lines.length * lh + 14;
    });
  });
  // Pfeile
  var COL = ['#1f9d3a', '#1f9d3a', '#e07b12'];
  function arrow(x1, y1, x2, y2, col){
    var mxp = (x1 + x2) / 2 + (y2 - y1) * .18, myp = (y1 + y2) / 2 - (x2 - x1) * .18;
    var ang = Math.atan2(y2 - myp, x2 - mxp), ex = x2 - Math.cos(ang) * 46, ey = y2 - Math.sin(ang) * 46;
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mxp, myp, ex, ey); g.stroke();
    var a2 = Math.atan2(ey - myp, ex - mxp); g.beginPath(); g.moveTo(ex + Math.cos(a2) * 18, ey + Math.sin(a2) * 18);
    g.lineTo(ex + Math.cos(a2 + 2.5) * 22, ey + Math.sin(a2 + 2.5) * 22); g.lineTo(ex + Math.cos(a2 - 2.5) * 22, ey + Math.sin(a2 - 2.5) * 22); g.closePath(); g.fill();
  }
  moves.forEach(function(m){
    var a = m.first && labelBox[m.names[0]] ? labelBox[m.names[0]] : null, f = P(m.from), to = P(m.to);
    var sx = a ? a[0] : f[0], sy = a ? a[1] : f[1];
    if (a) { var dir = to[0] >= sx ? 1 : -1; sx += dir * a[2]; }
    arrow(sx, sy, to[0], to[1], COL[m.ph] || COL[1]);
    if (!m.first || !a) { g.font = '700 22px system-ui, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.85)'; var tx = to[0], ty = to[1] - 70; var lbl = m.names.join(', ') + ' ' + DS_PHL[T.ph[m.ph]].toLowerCase(); g.strokeText(lbl, tx, ty); g.fillStyle = COL[m.ph] === '#e07b12' ? '#a34f00' : '#126b26'; g.fillText(lbl, tx, ty); }
  });
  g.font = '700 26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  textOps.forEach(function(o){ g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeText(o[0], o[1], o[2]); g.fillStyle = '#111'; g.fillText(o[0], o[1], o[2]); });
  // linke Spalte
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.shadowColor = '#3d8bff'; g.shadowBlur = 24; g.fillStyle = '#7fb8ff'; g.font = '800 64px system-ui, sans-serif';
  g.fillText('DESERT STORM', 320, 120); g.font = '800 56px system-ui, sans-serif'; g.fillText('TEAM ' + t, 320, 190); g.shadowBlur = 0;
  g.fillStyle = '#cfe3ff'; g.font = '700 40px system-ui, sans-serif'; g.fillText([T.time, T.opp ? 'vs ' + T.opp : ''].filter(Boolean).join(' · '), 320, 250);
  g.textAlign = 'left';
  var bx = 40, by = 290, bw = 560, bh = H - by - 40; g.fillStyle = '#1d5b86'; g.fillRect(bx, by, bw, bh);
  var txt = TC.name + '\n' + TC.desc + (T.note ? '\n\n' + T.note : '') + (T.s.length ? '\n\nErsatz: ' + T.s.join(', ') : '');
  g.fillStyle = '#fff'; var fs = 28, lines;
  do { g.font = '500 ' + fs + 'px system-ui, sans-serif'; lines = dsmWrap(g, txt, bw - 48); fs -= 1; } while (lines.length * fs * 1.35 > bh - 48 && fs > 14);
  lines.forEach(function(l, i){ if (!i) g.font = '700 ' + (fs + 1) + 'px system-ui, sans-serif'; else g.font = '500 ' + (fs + 1) + 'px system-ui, sans-serif'; g.fillText(l, bx + 24, by + 24 + (fs + 1) + i * (fs + 1) * 1.35); });
  // Legende
  g.font = '600 20px system-ui, sans-serif'; g.textAlign = 'left';
  g.fillStyle = '#1f9d3a'; g.fillRect(MX, H - 30, 26, 8); g.fillStyle = '#cfd6e4'; g.fillText(DS_PHL[T.ph[1]], MX + 34, H - 20);
  g.fillStyle = '#e07b12'; g.fillRect(MX + 260, H - 30, 26, 8); g.fillStyle = '#cfd6e4'; g.fillText(DS_PHL[T.ph[2]], MX + 294, H - 20);
  var url = c.toDataURL('image/png'); DSM_LASTURL = url;
  dsmShow(url, t);
}

/* ---------- Wüstensturm: Plan-Bild auf der Allianz-Vorlage (ds-vorlage-a/b.jpg, 1672×941) ---------- */
// Gebäude-Mitte [x,y] und Mitte des Namensschilds [x,y] in Pixeln der Vorlage.
var DST_T = {
  A: { src: 'ds-vorlage-a.jpg', w: 1672, h: 941, box: [62, 368, 636, 790], map: [690, 1510], low: 700, time: [1462, 47],
       b: { info:[930,103,931,154], arsenal:[1105,205,1107,281], hosp3:[1273,105,1270,151], ref1:[790,300,787,358], hosp4:[1420,330,1429,382],
            silo:[1103,420,1105,501], hosp1:[788,515,788,583], ref2:[1425,543,1431,595], merc:[1106,645,1107,710], hosp2:[930,745,936,810], sci:[1275,755,1270,810],
            wells:[930,430,930,430], react:[955,455,955,455], base:[760,840,760,840],
            secL:[790,452,790,452], secR:[1300,492,1300,492], secN:[1100,128,1100,128], secS:[1090,840,1090,840] } },
  B: { src: 'ds-vorlage-b.jpg', w: 1672, h: 941, box: [62, 372, 646, 790], map: [700, 1522], low: 700, time: [1430, 45],
       b: { info:[942,103,943,153], arsenal:[1120,205,1119,282], hosp3:[1288,105,1283,151], ref1:[800,300,798,358], hosp4:[1432,330,1440,382],
            silo:[1117,420,1117,500], hosp1:[800,515,799,583], ref2:[1440,543,1442,595], merc:[1120,645,1120,711], hosp2:[943,745,948,811], sci:[1288,755,1282,811],
            wells:[942,430,942,430], react:[967,455,967,455], base:[772,840,772,840],
            secL:[802,452,802,452], secR:[1312,492,1312,492], secN:[1112,128,1112,128], secS:[1102,840,1102,840] } }
};
var DST = DST_T.A, DST_IMGS = {}, DST_IMG = null;
function dstLoad(t, cb){
  if (typeof t === 'function') { cb = t; t = 'A'; }
  DST = DST_T[t] || DST_T.A;
  if (DST_IMGS[t]) { DST_IMG = DST_IMGS[t]; return cb(); }
  var im = new Image(); im.onload = function(){ DST_IMGS[t] = DST_IMG = im; cb(); }; im.onerror = function(){ DST_IMG = null; cb(); }; im.src = DST.src + '?v=3';
}
function dsmShow(url, t, lang){
  var name = 'SKWS-Wuestensturm-Team-' + t + (lang ? '-' + lang.toUpperCase() : '') + '-' + fileDate() + '.png', A = window.SKWSAndroid, h = '<img src="' + url + '" alt="Plan Team ' + t + '">';
  if (A && A.saveImage) h += '<button class="btn" id="dsmSave" style="width:100%;margin-top:8px">Bild in der Galerie speichern</button>';
  else if (A) h += '<p class="small" style="color:var(--warn)">Zum Speichern in der App bitte die neue App-Version 1.2 installieren (im Handy-Browser öffnen: matdan1987.github.io/skws-squads/SKWS-Squads.apk) – oder die Admin-Seite im Browser öffnen.</p>';
  else h += '<a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:8px" download="' + name + '" href="' + url + '">Bild herunterladen</a>';
  $('dsmOut').innerHTML = h;
  if ($('dsmSave')) $('dsmSave').addEventListener('click', function(){ A.saveImage(name, url); });
}
function dstRender(t, lang){
  var DE = lang === 'de';
  function phTxt(k){ return DE ? DS_PHL[k].replace(/^Ab/, 'ab') : DS_PHL_EN[k].replace(/^phase \d, /, ''); }
  var T = DS_LAST.plan.teams[t], TC = DS_TACTICS[T.tac], groups = dsGroupsOf(T);
  var S = 1920 / DST.w, W = DST.w * S, H = DST.h * S, c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.lineJoin = 'round'; g.miterLimit = 2;
  g.drawImage(DST_IMG, 0, 0, W, H);
  function B(k){ var p = DST.b[k] || DST.b.react; return { x: p[0] * S, y: p[1] * S, lx: p[2] * S, ly: p[3] * S }; }
  // Start und Wechsel je Gruppe
  var startAt = {}, moves = [], late = [];
  groups.forEach(function(x){
    var s0 = x.g.steps[0], b0 = s0[1] || (s0[0] === 'watch' || s0[0] === 'yellow' ? 'react' : 'base'), prev = b0, mover = false;
    x.g.steps.forEach(function(s, i){ if (!i) return; var b = s[1] || null; if (!b || b === prev) return; if (b === 'wells') { late.push(x.names.join(', ') + (DE ? ' → Ölquellen (' : ' → Oil Wells (') + phTxt(T.ph[i]) + ')'); return; } moves.push({ from: prev, to: b, ph: i, names: x.names, first: !mover }); mover = true; prev = b; });
    (startAt[b0] = startAt[b0] || []).push({ names: x.names, mover: mover });
  });
  var FS = 22, LH = 25, textOps = [], anchor = {};
  g.font = '800 ' + FS + 'px system-ui, sans-serif';
  Object.keys(startAt).forEach(function(k){
    var p = B(k), blocks = startAt[k];
    var sec = DS_SEC[k];
    var maxW = sec || (k !== 'react' && k !== 'base' && k !== 'wells' && p.ly >= DST.low * S) ? 160 : 230;
    blocks.forEach(function(blk){ var L = [], cur = ''; blk.names.forEach(function(nm){ var tst = cur ? cur + ', ' + nm : nm; if (cur && g.measureText(tst).width > maxW) { L.push(cur); cur = nm; } else cur = tst; }); if (cur) L.push(cur); blk.lines = L; });
    var n = blocks.reduce(function(a, b){ return a + b.lines.length; }, 0);
    var real = k !== 'react' && k !== 'base' && k !== 'wells' && !sec;
    var below = !real || p.ly < DST.low * S;
    var y = real ? (below ? p.ly + 28 : p.y - 40 - n * LH - (blocks.length - 1) * 14) : p.y - n * LH / 2;
    if (!real) { textOps.push({ s: sec ? (DE ? 'Unterstützer ' + sec.de : sec.en + ' supporters') : k === 'react' ? (T.tac === 'moon' ? (DE ? 'Gelbes Team' : 'Yellow team') : (DE ? 'Eingreiftruppe' : 'Reaction team')) : (DE ? 'Unterstützung' : 'Support'), x: p.x, y: y - 26, small: true, col: sec ? sec.col : (k === 'react' && T.tac === 'moon' ? '#8a6a00' : null) }); }
    blocks.forEach(function(blk){
      var w = Math.max.apply(null, blk.lines.map(function(s){ return g.measureText(s).width; }));
      var cx = Math.min(Math.max(p.x, DST.map[0] * S + w / 2 + 26), DST.map[1] * S - w / 2 - 26);
      blk.lines.forEach(function(s, i){ textOps.push({ s: s, x: cx, y: y + i * LH }); });
      if (blk.mover) {
        var cy = y + blk.lines.length * LH / 2 - 2, rx = w / 2 + 22, ry = blk.lines.length * LH / 2 + 10;
        g.strokeStyle = '#22c55e'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        blk.names.forEach(function(s){ anchor[s] = [cx, cy, rx]; });
      }
      y += blk.lines.length * LH + 14;
    });
  });
  var COL = ['#22c55e', '#22c55e', '#f59e0b'];
  function arrow(x1, y1, x2, y2, col){
    var mxp = (x1 + x2) / 2 + (y2 - y1) * .18, myp = (y1 + y2) / 2 - (x2 - x1) * .18;
    var ang = Math.atan2(y2 - myp, x2 - mxp), ex = x2 - Math.cos(ang) * 42, ey = y2 - Math.sin(ang) * 42;
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mxp, myp, ex, ey); g.stroke();
    var a2 = Math.atan2(ey - myp, ex - mxp); g.beginPath(); g.moveTo(ex + Math.cos(a2) * 16, ey + Math.sin(a2) * 16);
    g.lineTo(ex + Math.cos(a2 + 2.5) * 20, ey + Math.sin(a2 + 2.5) * 20); g.lineTo(ex + Math.cos(a2 - 2.5) * 20, ey + Math.sin(a2 - 2.5) * 20); g.closePath(); g.fill();
  }
  moves.forEach(function(m){
    var a = m.first ? anchor[m.names[0]] : null, f = B(m.from), to = B(m.to);
    var sx = a ? a[0] : f.x, sy = a ? a[1] : f.y; if (a) sx += (to.x >= sx ? 1 : -1) * a[2];
    arrow(sx, sy, to.x, to.y, COL[m.ph] || COL[1]);
    if (!m.first) textOps.push({ s: m.names.join(', ') + ' (' + phTxt(T.ph[m.ph]) + ')', x: to.x, y: to.y - 62, small: true, col: '#7a4a00' });
  });
  g.textAlign = 'center'; g.textBaseline = 'top';
  textOps.forEach(function(o){
    g.font = (o.small ? '700 17px' : '800 ' + FS + 'px') + ' system-ui, sans-serif';
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(o.s, o.x, o.y);
    g.fillStyle = o.col || '#0b0f19'; g.fillText(o.s, o.x, o.y);
  });
  // Briefing-Text (Englisch)
  var bx = DST.box[0] * S, by = DST.box[1] * S, bw = (DST.box[2] - DST.box[0]) * S, bh = (DST.box[3] - DST.box[1]) * S;
  var head = 'BRIEFING' + (T.opp ? (DE ? ' · gegen ' : ' · vs ') + T.opp : '');
  if (T.time) { g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.font = '800 34px system-ui, sans-serif'; g.shadowColor = '#3d8bff'; g.shadowBlur = 12; g.fillText(T.time, DST.time[0] * S, DST.time[1] * S); g.shadowBlur = 0; }
  var parts = [DE ? TC.desc : TC.en];
  var flex = groups.filter(function(x){ return x.g.steps.some(function(s){ return s[0] === 'watch'; }); });
  flex.forEach(function(x){ var silo = x.g.steps[2] && x.g.steps[2][1] === 'silo'; parts.push(x.names.join(', ') + (DE ? ': beobachten, wo wir unter Druck sind, und dort verstärken' + (silo ? '; ab Minute 20 das Atomsilo erobern.' : '.') : ': watch where we are under pressure and reinforce there' + (silo ? '; from minute 20 take the Nuclear Silo.' : '.'))); });
  if (T.note) parts.push(T.note);
  if (late.length) parts.push((DE ? 'Später: ' : 'Later: ') + late.join('; '));
  if (T.s.length) parts.push((DE ? 'Ersatz: ' : 'Substitutes: ') + T.s.map(function(n, i){ return n + (T.ss && DS_SEC[T.ss[i]] ? ' (' + DS_SEC[T.ss[i]][DE ? 'de' : 'en'] + ')' : ''); }).join(', '));
  parts.push((DE ? 'Grüne Pfeile: ' : 'Green arrows: ') + phTxt(T.ph[1]) + (DE ? ' · Orange: ' : ' · Orange: ') + phTxt(T.ph[2]));
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var fs = 24, lines;
  do {
    g.font = '500 ' + fs + 'px system-ui, sans-serif';
    lines = []; parts.forEach(function(p, i){ if (i) lines.push(''); dsmWrap(g, p, bw - 36).forEach(function(l){ lines.push(l); }); });
    fs -= 1;
  } while ((lines.length + 2) * fs * 1.32 > bh - 24 && fs > 12);
  fs += 1;
  g.fillStyle = '#7dd3fc'; g.font = '800 ' + (fs + 4) + 'px system-ui, sans-serif'; g.fillText(head, bx + 18, by + 18 + fs + 4);
  g.fillStyle = '#e6f1ff'; g.font = '500 ' + fs + 'px system-ui, sans-serif';
  lines.forEach(function(l, i){ g.fillText(l, bx + 18, by + 18 + (fs + 4) * 1.6 + (i + 1) * fs * 1.32); });
  var url = c.toDataURL('image/png'); DSM_LASTURL = url;
  dsmShow(url, t, lang);
}
