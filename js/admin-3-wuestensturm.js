/* SKWS Squads – Admin: wuestensturm (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Wüstensturm ---------- */
var DS_TIPS = [
  'Gebäude bringen auch ohne Besatzung Punkte – nach dem Erobern nicht wild abziehen.',
  'Nach 60 Sekunden werden 40 % der Punkte plünderbar: Gebäude halten, bei einem Wechsel die Punkte-Kisten mit dem Aufklärer einsammeln.',
  'Geheilte Truppen regelmäßig im Lazarett abholen (Symbol unten links).',
  'Teleport für Notfälle aufheben (Verteidigung, Silo).',
  'Wer früher gehen muss: über die Punktetafel „Schlachtfeld verlassen“, damit ein Ersatzspieler nachrücken kann.'
];
var DS_KEY = 'skws_ds', DS_ONLYSEL = false, DS_LAST = null, DS_PUB = null;
function dsState(){
  var st = kvGet('ds_state'); st = st ? JSON.parse(JSON.stringify(st)) : {}; st.assign = st.assign || {}; st.time = st.time || {A:'',B:''}; st.opp = st.opp || {A:'',B:''};
  st.note = st.note || {A:'',B:''}; st.tac = st.tac || {A:'std',B:'std'}; st.metric = st.metric || 't1';
  return st;
}
function dsSave(st){ kvSet('ds_state', st); }
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
    return '<label class="' + (v ? (v[0] === 'A' ? 'as' : 'bs') : '') + (p.entry ? '' : ' nodata') + '"><span class="nm">' + av(p.name, 30) + esc(p.name) + mgBadge(p.name) + merBadge(p.name, 'ds') + (typeof absBadge === 'function' ? absBadge(p.name) : '') + '</span><span class="meta">' + p.rank + ' · ' + dsMetricTxt(p, m) + '</span>' +
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
function dsExampleState(){
  var st = JSON.parse(JSON.stringify(dsState())), m = st.metric;
  var list = D.players.filter(function(p){ return p.active && p.entry; }).sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); });
  st.assign = {};
  // Beispiel: gemischt wie bei echten Anmeldungen (abwechselnd A/B), nicht die Stärksten nur in A
  list.forEach(function(p, i){ var v = i < 40 ? (i % 2 ? 'BS' : 'AS') : i < 60 ? (i % 2 ? 'BE' : 'AE') : ''; if (v) st.assign[p.name] = v; });
  st.time = { A: st.time.A || 'Fr 21:00', B: st.time.B || 'Fr 12:00' };
  return st;
}
function dsRun(example){
  // Team im Stamm nicht voll? Dann rücken Ersatzspieler nach, bevor der Plan entsteht
  var moved = [];
  if (example !== true) { var st0 = dsState(); moved = evFill('ds', st0.assign, st0.metric); if (moved.length) { dsSave(st0); dsRenderList(); } }
  var r = dsBuild(example === true ? dsExampleState() : null);
  if (moved.length) r.warn.unshift('Ersatz rückt in den Stamm nach, weil das Team sonst nicht voll ist: ' + moved.join(', ') + '.'); r.example = example === true; DS_LAST = r;
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
function dsmMap(){ return kvGet('ds_map') || {}; }
function dsmPut(o){ var m = dsmMap(), n = { bg: 'bg' in o ? o.bg : m.bg || null, pos: 'pos' in o ? o.pos : m.pos || null }; kvSet('ds_map', n.bg || n.pos ? n : null, true); }
function dsmPos(){ var p = dsmMap().pos || null; var o = {}; Object.keys(DSM_DEF).forEach(function(k){ o[k] = (p && p[k]) || DSM_DEF[k].slice(); }); return o; }
function dsmLoadBg(cb){
  var src = dsmMap().bg; if (!src) { DSM_BG = null; cb && cb(); return; }
  var im = new Image(); im.onload = function(){ DSM_BG = im; cb && cb(); }; im.onerror = function(){ DSM_BG = null; cb && cb(); }; im.src = src;
}
function dsmEditor(){
  var box = $('dsmEdit'), pos = dsmPos(), src = dsmMap().bg;
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
    dsmPut({ pos: pos }); drag = null;
  });
  $('dsmFile').addEventListener('change', function(){
    var f = this.files && this.files[0]; if (!f) return;
    var fr = new FileReader(); fr.onload = function(){
      var im = new Image(); im.onload = function(){
        var sc = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        dsmPut({ bg: c.toDataURL('image/jpeg', .8) });
        dsmLoadBg(dsmEditor); $('dsmNote').textContent = 'Kartenbild gespeichert. Zieh jetzt die Schilder auf die passenden Gebäude.'; $('dsmNote').className = 'note ok';
      }; im.src = fr.result;
    }; fr.readAsDataURL(f);
  });
  $('dsmClearBg').addEventListener('click', function(){ dsmPut({ bg: null }); dsmLoadBg(dsmEditor); });
  $('dsmReset').addEventListener('click', function(){ dsmPut({ pos: null }); dsmEditor(); });
  $('dsmToggle').addEventListener('click', function(){ var w = $('dsmWrap'); w.classList.toggle('hide'); if (!w.classList.contains('hide')) dsmLoadBg(dsmEditor); });
  ['A','B'].forEach(function(t){ ['', 'de'].forEach(function(sfx){ $('dsPic' + t + sfx).addEventListener('click', function(){ var lang = this.dataset.lang; if (!DS_LAST || !DS_LAST.plan.teams[t]) return; if (dsmMap().bg) dsmLoadBg(function(){ dsmRender(t); }); else dstLoad(t, function(){ if (DST_IMG) dstRender(t, lang); else dsmLoadBg(function(){ dsmRender(t); }); }); }); }); });
})();
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

function dstRender(t, lang){ var url = dstDraw(DS_LAST.plan.teams[t], lang); DSM_LASTURL = url; dsmShow(url, t, lang); }
function dsmShow(url, t, lang){
  var name = 'SKWS-Wuestensturm-Team-' + t + (lang ? '-' + lang.toUpperCase() : '') + '-' + fileDate() + '.png', A = window.SKWSAndroid, h = '<img src="' + url + '" alt="Plan Team ' + t + '">';
  if (A && A.saveImage) h += '<button class="btn" id="dsmSave" style="width:100%;margin-top:8px">Bild in der Galerie speichern</button>';
  else if (A) h += '<p class="small" style="color:var(--warn)">Zum Speichern in der App bitte die neue App-Version 1.2 installieren (im Handy-Browser öffnen: matdan1987.github.io/skws-squads/SKWS-Squads.apk) – oder die Admin-Seite im Browser öffnen.</p>';
  else h += '<a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:8px" download="' + name + '" href="' + url + '">Bild herunterladen</a>';
  $('dsmOut').innerHTML = h;
  if ($('dsmSave')) $('dsmSave').addEventListener('click', function(){ A.saveImage(name, url); });
}
