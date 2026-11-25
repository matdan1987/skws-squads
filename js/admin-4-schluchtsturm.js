/* SKWS Squads – Admin: schluchtsturm (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Schluchtsturm (Canyon Storm, 2 gegen 1) ---------- */
// Namen und Öffnungszeiten laut deutschem Spiel-Screenshot; Lage: Sicherheitszone der Ordnungshüter oben, darunter Energieturm, Viruslabor in der Mitte,
// Morgenbringer-Start unten links/rechts. Gebäude 1–8 ordnet der Admin im Tab zu (keine überprüfbare Quelle).
var CS_B = {
  de: { lab:'Viruslabor', tower:'Energieturm', safe:'Sicherheitszone Ordnungshüter', spl:'Morgenbringer-Start', spr:'Morgenbringer-Start',
        dc1:'Rechenzentrum I', dc2:'Rechenzentrum II', sf1:'Serumfabrik I', sf2:'Serumfabrik II', ds1:'Abwehrsystem I', ds2:'Abwehrsystem II',
        sw1:'Probenlager I', sw2:'Probenlager II', sw3:'Probenlager III', sw4:'Probenlager IV', base:'Basis' },
  en: { lab:'Virus Lab', tower:'Power Tower', safe:'Rulebringer Safe Zone', spl:'Dawnbreaker Spawn', spr:'Dawnbreaker Spawn',
        dc1:'Data Center I', dc2:'Data Center II', sf1:'Serum Factory I', sf2:'Serum Factory II', ds1:'Defense System I', ds2:'Defense System II',
        sw1:'Sample Warehouse I', sw2:'Sample Warehouse II', sw3:'Sample Warehouse III', sw4:'Sample Warehouse IV', base:'Base' }
};
var CS_TYPES = ['dc1','dc2','sf1','sf2','ds1','ds2','sw1','sw2','sw3','sw4'];
var CS_A = {
  de: { take:'{b} erobern und halten', hold:'{b} halten', move:'zu {b} wechseln, erobern und halten', rally:'ab 13:30 sammeln, um 14:00 gemeinsam {b} angreifen und bis zum Ende halten',
        defend:'Basis verteidigen, Punkte-Kisten und Energie sammeln', reinforce:'Kisten einsammeln, angegriffene Gebäude verstärken', unlock:'{b} erobern, sobald es öffnet (ab {t} Min.)' },
  en: { take:'capture and hold {b}', hold:'hold {b}', move:'move to {b}, capture and hold it', rally:'gather at 13:30, attack {b} together at 14:00 and hold it to the end',
        defend:'defend the base, collect point boxes and energy', reinforce:'collect boxes, reinforce buildings under attack', unlock:'capture {b} as soon as it opens (from min {t})' }
};
var CS_PHL = { de: { p0:'Start (0–7 Min.)', p7:'Ab 7 Min.', p14:'Ab 14 Min.' }, en: { p0:'Start (min 0–7)', p7:'From min 7', p14:'From min 14' } };
// Öffnungszeiten laut Spiel (Schutz-Countdown zu Beginn): Abwehrsysteme 7, Serumfabriken 10, Viruslabor 14 Minuten
var CS_OPEN = { ds1:7, ds2:7, sf1:10, sf2:10, lab:14 };
var CS_TACTICS = {
  lab: {
    name: 'Morgenbringer – wir greifen das Viruslabor an',
    desc: 'Absprache mit der Partner-Allianz: Wir nehmen das Viruslabor, die Partner halten die Gebäude dazwischen. Die 5 Stärksten sichern ab 0:30 den Energieturm und greifen um 14:00 gemeinsam das Viruslabor an. Der Rest hält Rechenzentren und Probenlager und holt sich Abwehrsysteme (ab 7 Min.) und Serumfabriken (ab 10 Min.), sobald sie öffnen.',
    en: 'Agreed with our partner alliance: we take the Virus Lab, they hold the buildings in between. The 5 strongest secure the Power Tower from 0:30 and attack the Virus Lab together at 14:00. The rest hold the Data Centers and Sample Warehouses and take the Defense Systems (from min 7) and Serum Factories (from min 10) as soon as they open.',
    when: 'Wenn eure Allianz die stärkere der beiden Morgenbringer ist.',
    pro: 'Das Viruslabor bringt mit 120 Punkten/Sek. am meisten.',
    con: 'Klappt nur mit Absprache – sonst greifen beide Allianzen dasselbe an und die Außengebäude bleiben leer.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Sturm-Trupp',      steps:[['take','tower'],['hold','tower'],['rally','lab']] },
      { k:'dc1',   n:2, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:2, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sw1',   n:1, label:'Probenlager I',    steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
      { k:'sw2',   n:1, label:'Probenlager II',   steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
      { k:'sw3',   n:1, label:'Probenlager III',  steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
      { k:'sw4',   n:1, label:'Probenlager IV',   steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'ds1',   n:1, label:'Abwehrsystem I',  steps:[['reinforce','base'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:1, label:'Abwehrsystem II', steps:[['reinforce','base'],['unlock','ds2'],['hold','ds2']] },
      { k:'supp',  n:1, label:'Unterstützung',    steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  },
  mid: {
    name: 'Morgenbringer – Partner greift an, wir halten die Mitte',
    desc: 'Absprache mit der Partner-Allianz: Die Partner nehmen das Viruslabor, wir halten Energieturm, Rechenzentren und Probenlager und besetzen ab 7 Minuten beide Abwehrsysteme, die die Wege zur Mitte bewachen.',
    en: 'Agreed with our partner alliance: they take the Virus Lab, we hold the Power Tower, Data Centers and Sample Warehouses and occupy both Defense Systems from minute 7, which guard the paths to the center.',
    when: 'Wenn die Partner-Allianz stärker ist oder das Labor angreifen will.',
    pro: 'Sichere Punkte von vielen Gebäuden, die Wege zur Mitte sind geschützt.',
    con: 'Kein Labor-Punktestrom für euch selbst; hängt vom Partner ab.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Energieturm-Trupp', steps:[['take','tower'],['hold','tower'],['hold','tower']] },
      { k:'ds1',   n:2, label:'Abwehrsystem I',  steps:[['take','dc1'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:2, label:'Abwehrsystem II', steps:[['take','dc2'],['unlock','ds2'],['hold','ds2']] },
      { k:'dc1',   n:1, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:1, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sw1',   n:1, label:'Probenlager I',    steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
      { k:'sw2',   n:1, label:'Probenlager II',   steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
      { k:'sw3',   n:1, label:'Probenlager III',  steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
      { k:'sw4',   n:1, label:'Probenlager IV',   steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'supp',  n:1, label:'Unterstützung',    steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  },
  rule: {
    name: 'Ordnungshüter (wir allein) – konzentrieren', top: true,
    desc: 'Als einzelne Allianz nicht alles verteidigen: Die 5 Stärksten nehmen den Energieturm (Schild über die Schutzzone) und halten ab 14 Minuten das Viruslabor bis zum Schluss. Judicator für das Labor-Fenster aufheben. Der Rest hält Rechenzentren, Serumfabriken und Abwehrsysteme.',
    en: 'As a single alliance, do not defend everything: the 5 strongest take the Power Tower (shield over the safe zone) and hold the Virus Lab from minute 14 to the end. Save the Judicator for the Virus Lab window. The rest hold the Data Centers, Serum Factories and Defense Systems.',
    when: 'Wenn eure Allianz in dieser Runde die Ordnungshüter-Seite spielt.',
    pro: 'Kräfte gebündelt, Labor und Schild in eurer Hand.',
    con: 'Probenlager bleiben dem Gegner – das Labor muss bis zum Ende gehalten werden.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Sturm-Trupp',      steps:[['take','tower'],['hold','tower'],['rally','lab']] },
      { k:'dc1',   n:2, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:2, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'ds1',   n:2, label:'Abwehrsystem I',  steps:[['reinforce','base'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:2, label:'Abwehrsystem II', steps:[['reinforce','base'],['unlock','ds2'],['hold','ds2']] },
      { k:'supp',  n:3, label:'Energie & Kisten', steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  }
};
// Einfache Taktik von Moon (Allianzmitglied): Starke Energieturm -> Labor, Schwächere erst Probenlager, dann auf öffnende Gebäude.
CS_TACTICS.moon = {
  name: 'Einfach – Taktik von Moon',
  desc: 'Taktik von Moon: Die 5 Stärksten gehen zuerst auf den Energieturm und um 14:00 gemeinsam aufs Viruslabor. Die Schwächeren nehmen zuerst Probenlager und Rechenzentren und verteilen sich dann auf die Gebäude, sobald sie öffnen: Abwehrsysteme ab 7, Serumfabriken ab 10 Minuten. Je ein Spieler bleibt auf jedem Probenlager.',
  en: 'Moon\'s plan: the 5 strongest take the Power Tower first and attack the Virus Lab together at 14:00. The weaker players start on the Sample Warehouses and Data Centers and then spread to the buildings as they open: Defense Systems from minute 7, Serum Factories from minute 10. One player stays on each Sample Warehouse.',
  when: 'Wenn nur wenige mitspielen oder keine Absprache mit der Partner-Allianz möglich ist.',
  pro: 'Leicht zu verstehen, jeder hat ab Start ein Ziel; die Starken sind gebündelt.',
  con: 'Ab 7–10 Minuten sind Probenlager nur noch mit je 1 Spieler besetzt; ohne Absprache greift evtl. auch die Partner-Allianz das Labor an.',
  ph: ['p0','p7','p14'],
  groups: [
    { k:'sturm', n:5, label:'Sturm-Trupp',        steps:[['take','tower'],['hold','tower'],['rally','lab']] },
    { k:'a1',    n:2, label:'Lager → Abwehrsystem I',  steps:[['take','sw1'],['unlock','ds1'],['hold','ds1']] },
    { k:'a2',    n:2, label:'Lager → Abwehrsystem II', steps:[['take','sw4'],['unlock','ds2'],['hold','ds2']] },
    { k:'s1',    n:2, label:'Lager → Serumfabrik I',   steps:[['take','sw2'],['unlock','sf1'],['hold','sf1']] },
    { k:'s2',    n:2, label:'Lager → Serumfabrik II',  steps:[['take','sw3'],['unlock','sf2'],['hold','sf2']] },
    { k:'dc1',   n:1, label:'Rechenzentrum I',    steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
    { k:'dc2',   n:1, label:'Rechenzentrum II',   steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
    { k:'sw1',   n:1, label:'Probenlager I',      steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
    { k:'sw2',   n:1, label:'Probenlager II',     steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
    { k:'sw3',   n:1, label:'Probenlager III',    steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
    { k:'sw4',   n:1, label:'Probenlager IV',     steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
    { k:'supp',  n:1, label:'Unterstützung',      steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
  ]
};
// Vorlagen (1672×941): Gebäude-Mitte und Namensschild in Vorlagen-Pixeln; B liegt 11 px weiter rechts.
// [Mitte x, y, Schild x, y, (optional) Namen x, y]
var CST_BASE = { safe:[1095,115,1095,115], tower:[1089,373,1089,296,1089,318], lab:[1092,486,1092,537], spl:[848,815,800,861], spr:[1347,815,1395,861],
  base:[1092,820,1092,820], baseTop:[1095,150,1095,150],
  dc1:[872,201,872,252], dc2:[1310,199,1310,252], sf1:[837,420,837,475], ds2:[1345,416,1345,475], ds1:[829,549,829,604], sf2:[1353,549,1353,611],
  sw1:[758,697,758,748], sw2:[980,729,980,690,980,652], sw3:[1202,729,1202,690,1202,652], sw4:[1427,697,1427,748] };
var CST_T = { A: { dx: 0, box:[62,368,636,790], map:[690,1510], time:[1462,47], low:700 }, B: { dx: 11, box:[62,372,646,790], map:[700,1522], time:[1430,45], low:700 } };
var CS_KEY = 'skws_cs', CS_ONLYSEL = false, CS_LAST = null, CS_IMGS = {};
function csState(){
  var st = null; try { st = JSON.parse(ls(CS_KEY) || 'null'); } catch(e){}
  st = st || {}; st.assign = st.assign || {}; st.time = st.time || {A:'',B:''}; st.opp = st.opp || {A:'',B:''};
  st.note = st.note || {A:'',B:''}; st.tac = st.tac || {A:'lab',B:'mid'}; st.metric = st.metric || 't1';
  return st;
}
function csSave(st){ try { ls(CS_KEY, JSON.stringify(st)); } catch(e){} }
function csAct(step, lang){ var t = CS_A[lang || 'de'][step[0]] || step[0]; return t.split('{b}').join(CS_B[lang || 'de'][step[1]] || '').split('{t}').join(CS_OPEN[step[1]] || ''); }
function csTacInfo(t){
  var T = CS_TACTICS[$('csTac' + t).value] || CS_TACTICS.lab;
  $('csTacInfo' + t).innerHTML = '<b>' + esc(T.name) + '</b><br>' + esc(T.desc) + '<br><span class="muted">Wann: </span>' + esc(T.when) + '<br><span class="up">+ </span>' + esc(T.pro) + '<br><span class="down">− </span>' + esc(T.con);
}
function csRender(){
  if (!D) return;
  var st = csState();
  ['A','B'].forEach(function(t){
    $('csTime' + t).value = st.time[t]; $('csOpp' + t).value = st.opp[t]; $('csNote' + t).value = st.note[t];
    $('csTac' + t).value = CS_TACTICS[st.tac[t]] ? st.tac[t] : 'lab'; csTacInfo(t);
  });
  $('csMetric').value = st.metric;
  evRender('cs'); csPubInfo();
  csRenderList();
  if (typeof ablRender === 'function') ablRender('cs');
}
function csRenderList(){
  var st = csState(), m = st.metric, q = $('csSearch').value.trim().toLowerCase();
  var list = D.players.filter(function(p){ return p.active; }).slice().sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); });
  var c = { AS:0, AE:0, BS:0, BE:0 };
  list.forEach(function(p){ var v = st.assign[p.name]; if (c[v] !== undefined) c[v]++; });
  function box(t){ var s = c[t+'S'], e = c[t+'E']; return '<div>Team ' + t + (st.time[t] ? ' · ' + esc(st.time[t]) : '') + '<b><span class="' + (s > 20 ? 'over' : '') + '">' + s + '/20 Stamm</span> · <span>' + e + ' Ersatz</span></b></div>'; }
  $('csCount').innerHTML = box('A') + box('B');
  $('csOnlySel').textContent = CS_ONLYSEL ? 'alle Spieler zeigen' : 'nur Zugeordnete zeigen';
  var opts = [['','–'],['AS','A Stamm'],['AE','A Ersatz'],['BS','B Stamm'],['BE','B Ersatz']];
  $('csList').innerHTML = list.filter(function(p){ if (CS_ONLYSEL && !st.assign[p.name]) return false; return !q || p.name.toLowerCase().indexOf(q) >= 0; }).map(function(p){
    var v = st.assign[p.name] || '';
    return '<label class="' + (v ? (v[0] === 'A' ? 'as' : 'bs') : '') + (p.entry ? '' : ' nodata') + '"><span class="nm">' + av(p.name, 30) + esc(p.name) + mgBadge(p.name) + merBadge(p.name, 'cs') + '</span><span class="meta">' + p.rank + ' · ' + dsMetricTxt(p, m) + '</span>' +
      '<select data-cs="' + esc(p.name) + '">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
  }).join('') || '<div class="empty">Keine Treffer.</div>';
}
function csBuild(st){
  st = st || csState(); var m = st.metric, by = {}; D.players.forEach(function(p){ by[p.name] = p; });
  var plan = { teams: {} }, warn = [];
  ['A','B'].forEach(function(t){
    function pick(r){ return Object.keys(st.assign).filter(function(n){ return st.assign[n] === t + r && by[n] && by[n].active; }).map(function(n){ return by[n]; })
      .sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); }); }
    var stamm = pick('S'), subs = pick('E');
    if (!stamm.length && !subs.length) return;
    var tk = CS_TACTICS[st.tac[t]] ? st.tac[t] : 'lab', TC = CS_TACTICS[tk], members = [], i = 0, last = TC.groups[TC.groups.length - 1].k;
    TC.groups.forEach(function(g){ for (var k = 0; k < g.n && i < stamm.length; k++, i++) members.push([stamm[i].name, g.k]); });
    for (; i < stamm.length; i++) members.push([stamm[i].name, last]);
    if (stamm.length > 20) warn.push('Team ' + t + ': ' + stamm.length + ' Stammspieler – im Spiel sind nur 20 möglich.');
    var used = {}; TC.groups.forEach(function(g){ if (members.some(function(x){ return x[1] === g.k; })) used[g.k] = g.steps; });
    plan.teams[t] = { time: st.time[t] || '', opp: st.opp[t] || '', note: st.note[t] || '', tac: tk, ph: TC.ph, g: used, open: CS_OPEN, top: !!TC.top, m: members, s: subs.map(function(p){ return p.name; }) };
  });
  return { plan: plan, warn: warn, by: by };
}
function csGroupsOf(T){
  var TC = CS_TACTICS[T.tac], out = [];
  TC.groups.forEach(function(g){ var names = T.m.filter(function(x){ return x[1] === g.k; }).map(function(x){ return x[0]; }); if (names.length) out.push({ g: g, names: names }); });
  return out;
}
var CS_PUB = null;
function csPubInfo(){
  var p = CS_PUB;
  $('csPubInfo').textContent = p && p.at ? 'Aktuell veröffentlicht: ' + fmtDateTime(new Date(p.at)) + ' (' + Object.keys(p.teams || {}).map(function(t){ return 'Team ' + t; }).join(' + ') + ')' : 'Aktuell ist kein Schluchtsturm-Einsatz veröffentlicht.';
}
function csPublish(plan){
  $('csMsg').textContent = 'Speichere…'; $('csMsg').className = 'note';
  rpc('admin_cs_publish', { p_pw: PW, p_plan: plan, p_actor: ACTOR || null }).then(function(){
    CS_PUB = plan; csPubInfo(); if (typeof ablRender === 'function') ablRender('cs');
    $('csMsg').textContent = plan ? 'Veröffentlicht – die Spieler sehen ihren Schluchtsturm-Einsatz jetzt auf der Seite.' : 'Veröffentlichung zurückgenommen.'; $('csMsg').className = 'note ok';
  }).catch(function(e){ $('csMsg').textContent = 'Fehler beim Speichern – ist die Datenbank-Erweiterung „ausbau“ eingespielt? ' + (e && e.message || ''); $('csMsg').className = 'note err'; });
}
function csRun(example){
  var st = null;
  if (example === true) {
    st = JSON.parse(JSON.stringify(csState())); var mm = st.metric;
    var list = D.players.filter(function(p){ return p.active && p.entry; }).sort(function(a,b){ return dsMetricVal(b,mm) - dsMetricVal(a,mm); });
    st.assign = {}; list.forEach(function(p, i){ var v = i < 40 ? (i % 2 ? 'BS' : 'AS') : i < 50 ? (i % 2 ? 'BE' : 'AE') : ''; if (v) st.assign[p.name] = v; });
    st.time = { A: st.time.A || 'Do 15:00', B: st.time.B || 'Do 21:00' };
  }
  var moved = [];
  if (example !== true) { var st0 = csState(); moved = evFill('cs', st0.assign, st0.metric); if (moved.length) { csSave(st0); csRenderList(); } }
  var r = csBuild(st); if (moved.length) r.warn.unshift('Ersatz rückt in den Stamm nach, weil das Team sonst nicht voll ist: ' + moved.join(', ') + '.');
  r.example = example === true; CS_LAST = r;
  $('csPublish').disabled = !!r.example; $('csPublish').style.opacity = r.example ? .4 : '';
  if (example !== true) evSaveLineup('cs', csState().assign);
  var P = r.plan, h = '';
  ['A','B'].forEach(function(t){
    var T = P.teams[t]; if (!T) return; var TC = CS_TACTICS[T.tac];
    h += '<div class="team"><h3>Team ' + t + (T.time ? ' · ' + esc(T.time) : '') + (T.opp ? ' · gegen ' + esc(T.opp) : '') + '<span>' + esc(TC.name) + ' · ' + T.m.length + ' Stamm · ' + T.s.length + ' Ersatz</span></h3>';
    if (T.note) h += '<p class="small" style="margin:0 0 6px">Hinweis: ' + esc(T.note) + '</p>';
    h += '<div class="tw"><table class="grp"><tr><th>Gruppe</th><th>Spieler</th>' + T.ph.map(function(k){ return '<th>' + CS_PHL.de[k] + '</th>'; }).join('') + '</tr>';
    csGroupsOf(T).forEach(function(x){
      h += '<tr><td><b>' + esc(x.g.label) + '</b></td><td>' + x.names.map(function(n){ return esc(n) + '<div class="phase">' + dsMetricTxt(r.by[n], CS_LAST && csState().metric) + '</div>'; }).join('') + '</td>' +
        x.g.steps.map(function(s){ return '<td>' + esc(csAct(s)) + '</td>'; }).join('') + '</tr>';
    });
    if (T.s.length) h += '<tr class="rankhead"><td colspan="5">Ersatz (Reihenfolge = wer zuerst nachrückt)</td></tr><tr><td colspan="5" style="white-space:normal">' + T.s.map(function(n, i){ return 'E' + (i+1) + ' ' + esc(n); }).join(' · ') + '</td></tr>';
    h += '</table></div></div>';
  });
  if (!Object.keys(P.teams).length) h = '<div class="empty">Bitte zuerst oben Spieler Team A oder B zuordnen.</div>';
  if (r.example && Object.keys(P.teams).length) h = '<div class="note ok">BEISPIEL – gemischt verteilt, nur zum Ausprobieren.</div>' + h;
  if (r.warn.length) h = '<div class="note err">' + r.warn.map(esc).join('<br>') + '</div>' + h;
  $('csResult').innerHTML = h; $('csOut').innerHTML = '';
  $('csActions').classList.toggle('hide', !Object.keys(P.teams).length);
  ['A','B'].forEach(function(t){ ['csCopy','csPic'].forEach(function(id){ $(id + t).classList.toggle('hide', !P.teams[t]); }); $('csPic' + t + 'de').classList.toggle('hide', !P.teams[t]); });
}
function csChat(t){
  var T = CS_LAST.plan.teams[t], out = ['SKWS Schluchtsturm Team ' + t + (T.time ? ' - ' + T.time : '') + ' - Plan siehe Bild'];
  csGroupsOf(T).forEach(function(x){ x.g.steps.forEach(function(s){ if (s[0] === 'rally') out.push('- ' + x.names.join(', ') + ': ab 13:30 sammeln, um 14:00 zusammen aufs Viruslabor und bis zum Ende halten.'); }); });
  if (T.s.length) out.push('- Ersatz in dieser Reihenfolge: ' + T.s.join(', ') + '. Ersatz übernimmt die Aufgabe dessen, der ausfällt.');
  out.push('- Öffnungszeiten: Abwehrsysteme ab 7, Serumfabriken ab 10, Viruslabor ab 14 Minuten.');
  out.push('- Basen nicht direkt nebeneinander stellen (Judicator trifft benachbarte Basen).');
  out.push('- Höchstens 5 Spieler pro Gebäude. Gebäude halten, Punkte-Kisten einsammeln.');
  out.push('- Das Viruslabor in den letzten Minuten nicht verlassen.');
  out.push('Deinen Einsatz siehst du auch im Bild.');
  return out.join('\n');
}
function csLoadTpl(t, lang, cb){
  var key = t + lang; if (CS_IMGS[key]) return cb(CS_IMGS[key]);
  var im = new Image(); im.onload = function(){ CS_IMGS[key] = im; cb(im); }; im.onerror = function(){ cb(null); }; im.src = 'cs-vorlage-' + t.toLowerCase() + '-' + lang + '.jpg?v=2';
}
function csRender_img(t, lang, IMG){
  var DE = lang === 'de', L = DE ? 'de' : 'en', CT = CST_T[t], T = CS_LAST.plan.teams[t], TC = CS_TACTICS[T.tac], groups = csGroupsOf(T);
  var S = 1920 / 1672, W = 1920, H = Math.round(941 * S), c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.lineJoin = 'round'; g.miterLimit = 2; g.drawImage(IMG, 0, 0, W, H);
  function B(k){ var p = CST_BASE[k === 'base' && TC.top ? 'baseTop' : k]; if (!p) return null; return { x: (p[0] + CT.dx) * S, y: p[1] * S, lx: (p[2] + CT.dx) * S, ly: p[3] * S, nx: ((p[4] || p[2]) + CT.dx) * S, ny: (p[5] || p[3] + 21) * S }; }
  // Gebäude-Beschriftungen (belegte + zugeordnete)
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic 600 19px system-ui, sans-serif';
  function tag(text, x, y){ var w = g.measureText(text).width + 18; g.fillStyle = 'rgba(10,16,28,.92)'; g.beginPath(); if (g.roundRect) g.roundRect(x - w/2, y - 14, w, 28, 7); else g.rect(x - w/2, y - 14, w, 28); g.fill(); g.fillStyle = '#fff'; g.fillText(text, x, y); }
  ['safe','tower','lab','spl','spr'].concat(CS_TYPES).forEach(function(k){ var p = B(k); if (p) tag(CS_B[L][k], p.lx, p.ly); });
  var startAt = {}, moves = [], unplaced = [];
  groups.forEach(function(x){
    var b0 = x.g.steps[0][1], prev = b0, mover = false;
    x.g.steps.forEach(function(s, i){ if (!i) return; var b = s[1]; if (!b || b === prev) return;
      if (!B(b)) { unplaced.push(x.names.join(', ') + ' → ' + CS_B[L][b] + ' (' + CS_PHL[L][T.ph[i]].toLowerCase() + ')'); prev = b; return; }
      moves.push({ from: prev, to: b, ph: i, names: x.names, first: !mover }); mover = true; prev = b; });
    if (!B(b0)) { unplaced.push(x.names.join(', ') + ': ' + CS_B[L][b0]); return; }
    (startAt[b0] = startAt[b0] || []).push({ names: x.names, mover: mover });
  });
  if (startAt.base) startAt.base = [{ names: startAt.base.reduce(function(a, b){ return a.concat(b.names); }, []), mover: false }];
  var FS = 22, LH = 25, textOps = [], anchor = {};
  g.font = '800 ' + FS + 'px system-ui, sans-serif';
  Object.keys(startAt).forEach(function(k){
    var p = B(k), blocks = startAt[k];
    var maxW = k === 'base' ? 520 : 220;
    blocks.forEach(function(blk){ var Ls = [], cur = ''; blk.names.forEach(function(nm){ var tst = cur ? cur + ', ' + nm : nm; if (cur && g.measureText(tst).width > maxW) { Ls.push(cur); cur = nm; } else cur = tst; }); if (cur) Ls.push(cur); blk.lines = Ls; });
    var tot = blocks.reduce(function(a, b){ return a + b.lines.length * LH + 14; }, 0);
    var bp = CST_BASE[k], up = bp && bp[5] && bp[5] < bp[3];
    var y = k === 'base' ? (TC.top ? p.y : p.y - tot + 14) : up ? p.ny + LH + 14 - tot : p.ny;
    if (k === 'base' && !TC.top) textOps.push({ s: CS_B[L].base, x: p.x, y: y - 26, small: true });
    blocks.forEach(function(blk){
      var w = Math.max.apply(null, blk.lines.map(function(s){ return g.measureText(s).width; }));
      var cx = Math.min(Math.max(k === 'base' ? p.x : p.nx, CT.map[0] * S + w / 2 + 26), CT.map[1] * S - w / 2 - 26);
      blk.lines.forEach(function(s, i){ textOps.push({ s: s, x: cx, y: y + i * LH }); });
      if (blk.mover) {
        var cy = y + blk.lines.length * LH / 2 - 2, rx = w / 2 + 22, ry = blk.lines.length * LH / 2 + 10;
        g.strokeStyle = '#22c55e'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        blk.names.forEach(function(s){ anchor[s] = [cx, cy, rx]; });
      }
      y += blk.lines.length * LH + 14;
    });
  });
  var tgtUsed = {};
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
    if (!a && !f) return;
    var sx = a ? a[0] : f.x, sy = a ? a[1] : f.y; if (a) sx += (to.x >= sx ? 1 : -1) * a[2];
    arrow(sx, sy, to.x, to.y, COL[m.ph] || COL[1]);
    // Wer hinkommt, steht unter dem Ziel-Schild (z. B. Gruppen, die von der Basis aus losgehen)
    if (!a || !m.first) { var ty = (tgtUsed[m.to] || to.ny); textOps.push({ s: m.names.join(', ') + ' (' + (CS_OPEN[m.to] ? (DE ? 'ab ' + CS_OPEN[m.to] + ' Min.' : 'from min ' + CS_OPEN[m.to]) : CS_PHL[L][T.ph[m.ph]].toLowerCase()) + ')', x: to.nx, y: ty, small: true, col: m.ph === 2 ? '#7a4a00' : '#0b5d1e' }); tgtUsed[m.to] = ty + 22; }
  });
  g.textAlign = 'center'; g.textBaseline = 'top';
  textOps.forEach(function(o){
    g.font = (o.small ? '700 17px' : '800 ' + FS + 'px') + ' system-ui, sans-serif';
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(o.s, o.x, o.y);
    g.fillStyle = o.col || '#0b0f19'; g.fillText(o.s, o.x, o.y);
  });
  if (T.time) { g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '800 34px system-ui, sans-serif'; g.shadowColor = '#3d8bff'; g.shadowBlur = 12; g.fillText(T.time, CT.time[0] * S, CT.time[1] * S); g.shadowBlur = 0; }
  var bx = CT.box[0] * S, by = CT.box[1] * S, bw = (CT.box[2] - CT.box[0]) * S, bh = (CT.box[3] - CT.box[1]) * S;
  var head = 'BRIEFING' + (T.opp ? (DE ? ' · gegen ' : ' · vs ') + T.opp : '');
  var parts = [DE ? TC.desc : TC.en];
  if (T.note) parts.push(T.note);
  if (unplaced.length) parts.push((DE ? 'Ohne Kartenposition: ' : 'Not on the map yet: ') + unplaced.join('; '));
  if (T.s.length) parts.push((DE ? 'Ersatz: ' : 'Substitutes: ') + T.s.join(', '));
  parts.push((DE ? 'Grüne Pfeile: ab 7–10 Min. (sobald das Ziel öffnet) · Orange: ab 14 Min.' : 'Green arrows: from min 7–10 (as soon as the target opens) · Orange: from min 14'));
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var fs = 24, lines;
  do { g.font = '500 ' + fs + 'px system-ui, sans-serif'; lines = []; parts.forEach(function(p, i){ if (i) lines.push(''); dsmWrap(g, p, bw - 36).forEach(function(l){ lines.push(l); }); }); fs -= 1; }
  while ((lines.length + 2) * fs * 1.32 > bh - 24 && fs > 12);
  fs += 1;
  g.fillStyle = '#7dd3fc'; g.font = '800 ' + (fs + 4) + 'px system-ui, sans-serif'; g.fillText(head, bx + 18, by + 18 + fs + 4);
  g.fillStyle = '#e6f1ff'; g.font = '500 ' + fs + 'px system-ui, sans-serif';
  lines.forEach(function(l, i){ g.fillText(l, bx + 18, by + 18 + (fs + 4) * 1.6 + (i + 1) * fs * 1.32); });
  var url = c.toDataURL('image/png'), name = 'SKWS-Schluchtsturm-Team-' + t + '-' + L.toUpperCase() + '-' + fileDate() + '.png', A = window.SKWSAndroid;
  var hh = '<img src="' + url + '" alt="Plan Team ' + t + '">';
  if (A && A.saveImage) hh += '<button class="btn" id="csSave" style="width:100%;margin-top:8px">Bild in der Galerie speichern</button>';
  else if (A) hh += '<p class="small" style="color:var(--warn)">Zum Speichern in der App bitte App-Version 1.2 installieren – oder die Admin-Seite im Browser öffnen.</p>';
  else hh += '<a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:8px" download="' + name + '" href="' + url + '">Bild herunterladen</a>';
  $('csOut').innerHTML = hh;
  if ($('csSave')) $('csSave').addEventListener('click', function(){ A.saveImage(name, url); });
}
(function(){
  function upd(fn){ var st = csState(); fn(st); csSave(st); }
  var tacOpts = Object.keys(CS_TACTICS).map(function(k){ return '<option value="' + k + '">' + esc(CS_TACTICS[k].name) + '</option>'; }).join('');
  ['A','B'].forEach(function(t){
    $('csTac' + t).innerHTML = tacOpts;
    $('csTac' + t).addEventListener('change', function(){ var v = this.value; upd(function(st){ st.tac[t] = v; }); csTacInfo(t); });
    $('csTime' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.time[t] = v; }); csRenderList(); });
    $('csOpp' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.opp[t] = v; }); });
    $('csNote' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.note[t] = v; }); });
    $('csCopy' + t).addEventListener('click', function(){ if (CS_LAST && CS_LAST.plan.teams[t]) copyText(csChat(t), 'csMsg'); });
    ['', 'de'].forEach(function(sfx){ $('csPic' + t + sfx).addEventListener('click', function(){
      var lang = this.dataset.lang; if (!CS_LAST || !CS_LAST.plan.teams[t]) return;
      csLoadTpl(t, lang, function(im){ if (im) csRender_img(t, lang, im); else { $('csMsg').textContent = 'Vorlage konnte nicht geladen werden.'; $('csMsg').className = 'note err'; } });
    }); });
  });
  $('csMetric').addEventListener('change', function(){ var v = this.value; upd(function(st){ st.metric = v; }); csRenderList(); });
  $('csSearch').addEventListener('input', csRenderList);
  $('csOnlySel').addEventListener('click', function(){ CS_ONLYSEL = !CS_ONLYSEL; csRenderList(); });
  $('csClear').addEventListener('click', function(){ if (!confirm('Alle Schluchtsturm-Zuordnungen löschen?')) return; upd(function(st){ st.assign = {}; }); csRenderList(); });
  $('csList').addEventListener('change', function(e){ var s = e.target.closest('select[data-cs]'); if (!s) return; var n = s.dataset.cs, v = s.value; upd(function(st){ if (v) st.assign[n] = v; else delete st.assign[n]; }); csRenderList(); });
  $('csRun').addEventListener('click', function(){ csRun(false); });
  $('csPublish').addEventListener('click', function(){ if (!CS_LAST || CS_LAST.example) return; csRun(false); if (!Object.keys(CS_LAST.plan.teams).length || !confirm('Schluchtsturm-Einsatz für die Spieler veröffentlichen?')) return; var pl = JSON.parse(JSON.stringify(CS_LAST.plan)); pl.at = new Date().toISOString(); csPublish(pl); });
  $('csUnpublish').addEventListener('click', function(){ if (confirm('Veröffentlichten Schluchtsturm-Einsatz zurücknehmen?')) csPublish(null); });
  $('csExample').addEventListener('click', function(){ csRun(true); });
})();
