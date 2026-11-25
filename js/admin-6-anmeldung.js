/* SKWS Squads – Admin: anmeldung (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Anmeldung der Spieler (Wüstensturm / Schluchtsturm) ---------- */
var EVCFG = {}, EV = [], EV_CH = { A:'Stamm nur Team A', B:'Stamm nur Team B', AB:'Stamm, beide Zeiten', subA:'Ersatz nur Team A', subB:'Ersatz nur Team B', sub:'Ersatz, beide Zeiten', no:'diesmal nicht' };
var EV_NAME = { ds:'Wüstensturm', cs:'Schluchtsturm' };
function evCur(kind){ return EV.filter(function(r){ return r.kind === kind; })[0] || null; }
function evDl(r){ return r && r.deadline ? new Date(r.deadline) : null; }
function evIsOpen(r){ var d = evDl(r); return !!(r && r.open && (!d || Date.now() <= +d)); }
function evKW(){ var d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7); }
function evLocalInput(d){ var p = function(n){ return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function evCfg(kind){ var c = EVCFG[kind] || {}; return { fixed: (c.fixed || []).slice(), rot: c.rot !== false }; }
// Letzte 4 abgeschlossene Runden: wie oft Stamm gespielt, wie oft angemeldet aber nicht Stamm (pausiert)
function evStats(kind){
  var cur = evCur(kind), past = EV.filter(function(r){ return r.kind === kind && r.lineup && (!cur || r.id !== cur.id); }).slice(0, 4), out = {};
  past.forEach(function(r){
    var su = {}; (r.signups || []).forEach(function(x){ su[x.name] = x.choice; });
    Object.keys(su).concat(Object.keys(r.lineup)).forEach(function(n){ out[n] = out[n] || { played: 0, benched: 0 }; });
    Object.keys(out).forEach(function(n){
      var l = r.lineup[n], c = su[n];
      if ((r.absent || []).indexOf(n) >= 0) return;   // gefehlt: zählt weder als gespielt noch als pausiert
      if (l === 'AS' || l === 'BS') out[n].played++;
      else if (c && c !== 'no') out[n].benched++;
    });
  });
  return { n: past.length, by: out };
}
function evSaveLineup(kind, assign){
  var r = evCur(kind); if (!r || !PW) return;
  var l = {}; Object.keys(assign || {}).forEach(function(n){ if (/^[AB][SE]$/.test(assign[n])) l[n] = assign[n]; });
  // Taktik-Schnappschuss fürs Archiv
  var pm = typeof arcPlanMeta === 'function' ? arcPlanMeta(kind) : null;
  if (pm && JSON.stringify(pm) !== JSON.stringify((r.meta || {}).plan || {})) rpc('admin_extra', { p_pw: PW, p_action: 'round_meta', p_data: { id: r.id, meta: { plan: pm } }, p_actor: ACTOR || null }).then(function(){ r.meta = r.meta || {}; r.meta.plan = pm; }).catch(function(){});
  if (JSON.stringify(l) === JSON.stringify(r.lineup || {})) return;
  rpc('admin_event', { p_pw: PW, p_action: 'lineup', p_data: { id: r.id, lineup: l }, p_actor: ACTOR || null }).then(function(){ r.lineup = l; }).catch(function(){});
}
function evRender(kind){
  var box = $('ev_' + kind); if (!box || !D) return;
  var r = evCur(kind), K = kind, st = kind === 'ds' ? dsState() : csState();
  var h = '<h2>1 · Anmeldung der Spieler – ' + EV_NAME[kind] + '</h2>';
  if (typeof ablHelpBox === 'function') h += ablHelpBox('ev');
  if (r) {
    var cfg = evCfg(kind), ES = evStats(kind);
    var open = evIsOpen(r), dl = evDl(r), by = {}; (r.signups || []).forEach(function(x){ by[x.name] = x; });
    var act = D.players.filter(function(p){ return p.active; });
    var cnt = { A:0, B:0, AB:0, subA:0, subB:0, sub:0, no:0 }; act.forEach(function(p){ var x = by[p.name]; if (x && cnt[x.choice] !== undefined) cnt[x.choice]++; });
    var none = act.filter(function(p){ return !by[p.name]; });
    h += '<p class="small" style="margin:0 0 6px"><b>' + esc(r.label) + '</b> · ' + (open ? '<span class="up">offen</span>' : '<span class="down">geschlossen</span>') +
      (dl ? ' · Anmeldeschluss ' + fmtDateTime(dl) : '') + (r.time_a ? ' · A: ' + esc(r.time_a) : '') + (r.time_b ? ' · B: ' + esc(r.time_b) : '') + '</p>';
    h += '<div class="evcnt"><div>Stamm nur A<b>' + cnt.A + '</b></div><div>Stamm nur B<b>' + cnt.B + '</b></div><div>Stamm, beide Zeiten<b>' + cnt.AB + '</b></div>' +
      '<div>Ersatz nur A<b>' + cnt.subA + '</b></div><div>Ersatz nur B<b>' + cnt.subB + '</b></div><div>Ersatz, beide Zeiten<b>' + cnt.sub + '</b></div>' +
      '<div>diesmal nicht<b>' + cnt.no + '</b></div><div>keine Antwort<b>' + none.length + '</b></div></div>';
    ['A','B','AB','subA','subB','sub','no'].forEach(function(c){
      var list = act.filter(function(p){ return by[p.name] && by[p.name].choice === c; }).sort(function(a, b){ return dsMetricVal(b, st.metric) - dsMetricVal(a, st.metric); });
      if (!list.length) return;
      h += '<div class="evgrp">' + EV_CH[c] + ' (' + list.length + ')</div><div class="small">' + list.map(function(p){ var x = by[p.name], sx = ES.by[p.name];
        var rt = cfg.fixed.indexOf(p.name) >= 0 ? ' <span class="mgb r">gesetzt</span>' : (ES.n && sx ? (sx.benched ? ' <span class="mgb m">' + sx.benched + '× pausiert</span>' : '') + ' <span class="muted">· ' + sx.played + '/' + ES.n + ' gespielt</span>' : (ES.n ? ' <span class="muted">· 0/' + ES.n + ' gespielt</span>' : ''));
        return '<span class="chip" style="cursor:default;display:inline-block;margin:2px">' + av(p.name, 26) + esc(p.name) + ' <span class="muted">' + dsMetricTxt(p, st.metric) + '</span>' + merBadge(p.name, kind) + rt + (x.admin ? ' <span class="muted">(R4)</span>' : '') + (x.note ? ' · <i>' + esc(x.note) + '</i>' : '') + '</span>'; }).join('') + '</div>';
    });
    if (none.length) h += '<details style="margin-top:6px"><summary class="small">Keine Antwort (' + none.length + ')</summary><div class="small" style="margin-top:4px">' + none.map(function(p){ return esc(p.name); }).join(', ') + '</div></details>';
    h += '<details style="margin-top:10px"><summary class="small">Rotation &amp; gesetzte Spieler (' + cfg.fixed.length + ' gesetzt, Rotation ' + (cfg.rot ? 'an' : 'aus') + ')</summary>' +
      '<p class="small muted" style="margin:6px 0">Melden sich für ein Team mehr als 20 an, kommen zuerst die Gesetzten in den Stamm, danach Spieler mit Bonus „Vorrang“. Mit Rotation folgen dann die, die in den letzten 4 Runden am häufigsten pausieren mussten bzw. am seltensten gespielt haben – erst danach entscheidet die Stärke. Ohne Rotation entscheidet nur die Stärke. Ausgewertet wird die Aufstellung, mit der du den Plan erstellt hast.</p>' +
      '<label class="small" style="display:flex;align-items:center;gap:8px;margin:0 0 8px"><input type="checkbox" data-evcfg="rot" data-kind="' + K + '"' + (cfg.rot ? ' checked' : '') + ' style="width:18px;height:18px;padding:0;accent-color:var(--accent)"> Rotation verwenden</label>' +
      '<div class="small">' + (cfg.fixed.map(function(n){ return '<span class="chip" style="display:inline-block;margin:2px">' + esc(n) + ' <a href="#" data-evunfix="' + esc(n) + '" data-kind="' + K + '" style="color:var(--err);text-decoration:none">✕</a></span>'; }).join('') || '<span class="muted">Noch niemand gesetzt.</span>') + '</div>' +
      '<div class="formrow" style="margin-top:6px;grid-template-columns:1fr auto"><select id="evFix_' + K + '"><option value="">– Spieler setzen –</option>' +
      act.filter(function(p){ return cfg.fixed.indexOf(p.name) < 0; }).sort(function(a, b){ return (a.rank === b.rank ? 0 : a.rank > b.rank ? -1 : 1) || a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }).map(function(p){ return '<option value="' + esc(p.name) + '">' + esc(p.name) + ' (' + p.rank + ')</option>'; }).join('') +
      '</select><button class="btn2" data-ev="fix" data-kind="' + K + '">Setzen</button></div></details>';
    h += '<details style="margin-top:10px"><summary class="small">Antwort für einen Spieler eintragen oder ändern (z. B. wenn jemand im Chat geantwortet hat)</summary><div class="formrow" style="margin-top:8px"><div><label>Spieler</label><select id="evSetName_' + K + '"><option value="">– Spieler –</option>' +
      act.slice().sort(function(a, b){ return a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }).map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Antwort</label><select id="evSetCh_' + K + '">' + Object.keys(EV_CH).map(function(c){ return '<option value="' + c + '">' + EV_CH[c] + '</option>'; }).join('') + '<option value="">Anmeldung löschen</option></select></div></div>';
    h += '<div class="btnrow"><button class="btn2" data-ev="set" data-kind="' + K + '">Eintragen</button></div></details>';
    h += '<div class="btnrow"><button class="btn" data-ev="take" data-kind="' + K + '">➡ In Schritt 2 übernehmen (Teams einteilen)</button>' +
      '<button class="btn2" data-ev="' + (r.open ? 'close' : 'reopen') + '" data-kind="' + K + '">' + (r.open ? 'Anmeldung schließen' : 'Wieder öffnen') + '</button>' +
      '<button class="btn2" data-ev="call" data-kind="' + K + '">Aufruf für den Chat kopieren</button>' +
      (none.length ? '<button class="btn2" data-ev="nudge" data-kind="' + K + '">Erinnerung an Fehlende kopieren</button>' : '') + '</div>';
  } else h += '<p class="small muted" style="margin:0 0 6px">Noch keine Anmelderunde. Lege unten eine an – danach sehen alle Spieler auf der Squad-Seite eine Karte, auf der sie als Stammspieler oder nur als Ersatz jeweils Team A, Team B oder beide Zeiten wählen – oder „diesmal nicht“.</p>';
  var nd = new Date(); nd.setDate(nd.getDate() + ((4 - nd.getDay() + 7) % 7 || 7)); nd.setHours(20, 0, 0, 0);
  h += '<details style="margin-top:10px"' + (r ? '' : ' open') + '><summary class="small">Neue Anmelderunde starten</summary>' +
    '<div class="formrow" style="margin-top:8px"><div><label>Bezeichnung</label><input id="evLabel_' + K + '" type="text" maxlength="40" value="KW ' + evKW() + '"></div>' +
    '<div><label>Anmeldeschluss</label><input id="evDl_' + K + '" type="datetime-local" value="' + evLocalInput(nd) + '"></div>' +
    '<div><label>Team A – Uhrzeit</label><input id="evTa_' + K + '" type="text" maxlength="30" value="' + esc(st.time.A || '') + '" placeholder="z. B. Fr 14:00"></div>' +
    '<div><label>Team B – Uhrzeit</label><input id="evTb_' + K + '" type="text" maxlength="30" value="' + esc(st.time.B || '') + '" placeholder="z. B. Fr 21:00"></div></div>' +
    '<p class="small muted" style="margin:0 0 6px">Eine neue Runde schließt die bisherige. Die Uhrzeiten sehen die Spieler bei der Auswahl.</p>' +
    '<div class="btnrow"><button class="btn" data-ev="create" data-kind="' + K + '">Anmelderunde starten</button></div></details>';
  // Nach dem Event: nur die Fehlenden markieren (letzte Runde mit gemerkter Aufstellung)
  var lr = EV.filter(function(x){ return x.kind === kind && x.lineup && Object.keys(x.lineup).length; })[0];
  if (lr) {
    var abs = lr.absent || [], planned = Object.keys(lr.lineup).filter(function(nm){ return /S$/.test(lr.lineup[nm]); }).sort(function(a, b){ return a.localeCompare(b, 'de', {sensitivity:'base'}); });
    var subs = Object.keys(lr.lineup).filter(function(nm){ return /E$/.test(lr.lineup[nm]); }).sort(function(a, b){ return a.localeCompare(b, 'de', {sensitivity:'base'}); });
    function chk(nm){ return '<label class="chip" style="display:inline-flex;align-items:center;gap:6px;margin:2px;cursor:pointer"><input type="checkbox" data-evabs="' + esc(nm) + '"' + (abs.indexOf(nm) >= 0 ? ' checked' : '') + ' style="width:16px;height:16px;padding:0;accent-color:var(--err)">' + av(nm, 26) + esc(nm) + ' <span class="muted">' + lr.lineup[nm][0] + '</span></label>'; }
    h += '<details style="margin-top:10px"' + (abs.length ? '' : '') + '><summary class="small">Nach dem Event: Wer hat gefehlt? – ' + esc(lr.label) + (abs.length ? ' (' + abs.length + ' markiert)' : '') + '</summary>' +
      '<p class="small muted" style="margin:6px 0">Nur ankreuzen, wer eingeteilt war, aber nicht da war. Alle anderen gelten als dabei. Das zählt für Rotation, Profil-Erfolge und auf Wunsch als Malus.</p>' +
      '<div class="evgrp">Stamm (' + planned.length + ')</div><div>' + planned.map(chk).join('') + '</div>' +
      (subs.length ? '<div class="evgrp">Ersatz (' + subs.length + ')</div><div>' + subs.map(chk).join('') + '</div>' : '') +
      '<div class="btnrow"><button class="btn2" data-ev="absent" data-kind="' + K + '" data-round="' + lr.id + '">Fehlende speichern</button></div></details>';
  }
  h += '<div class="note" id="evMsg_' + K + '"></div>';
  box.innerHTML = h;
}
function evNote(kind, t, ok){ var n = $('evMsg_' + kind); if (n) { n.textContent = t; n.className = 'note ' + (ok ? 'ok' : 'err'); } }
function evDo(kind, action, data, okText){
  evNote(kind, '…', true);
  return rpc('admin_event', { p_pw: PW, p_action: action, p_data: data, p_actor: ACTOR || null })
    .then(function(){ return load(PW, true).then(function(){ showTab(kind); evNote(kind, okText, true); }); })
    .catch(function(err){ var m = String(err && err.message); evNote(kind, m.indexOf('ERR_AUTH') >= 0 ? 'Nicht angemeldet – bitte neu anmelden.' : 'Fehler – ist die Datenbank-Erweiterung „event-anmeldung“ schon eingespielt?', false); });
}
// Anmeldungen -> Stamm/Ersatz je Team. Feste Wünsche (nur A / nur B) zuerst, dann die Flexiblen dorthin, wo weniger sind.
function evTake(kind){
  var r = evCur(kind); if (!r) return;
  var st = kind === 'ds' ? dsState() : csState(), m = st.metric, by = {}; (r.signups || []).forEach(function(x){ by[x.name] = x.choice; });
  var cfg = evCfg(kind), ES = evStats(kind);
  function prio(p){ var f = cfg.fixed.indexOf(p.name) >= 0 ? 1 : 0, sx = ES.by[p.name] || { played: 0, benched: 0 }, pr = merEff(p.name, kind).prio ? 1 : 0; return cfg.rot ? [f, pr, sx.benched, -sx.played] : [f, pr]; }
  var blocked = [], forced = [];
  var act = D.players.filter(function(p){
    if (!p.active || !by[p.name] || by[p.name] === 'no') return false;
    var me = merEff(p.name, kind); if (me.block) { blocked.push(p.name); return false; }
    if (me.sub && by[p.name].indexOf('sub') !== 0) { forced.push(p.name); by[p.name] = by[p.name] === 'A' ? 'subA' : by[p.name] === 'B' ? 'subB' : 'sub'; }
    return true; }).sort(function(a, b){
    var pa = prio(a), pb = prio(b); for (var i = 0; i < pa.length; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
    return dsMetricVal(b, m) - dsMetricVal(a, m) || a.name.localeCompare(b.name); });
  var asg = {}, n = { AS:0, BS:0, AE:0, BE:0 }, pw = { A:0, B:0 };
  function put(p, t, role){ if (role === 'S' && n[t + 'S'] >= 20) role = 'E'; asg[p.name] = t + role; n[t + role]++; if (role === 'S') pw[t] += dsMetricVal(p, m); }
  act.filter(function(p){ return by[p.name] === 'A'; }).forEach(function(p){ put(p, 'A', 'S'); });
  act.filter(function(p){ return by[p.name] === 'B'; }).forEach(function(p){ put(p, 'B', 'S'); });
  act.filter(function(p){ return by[p.name] === 'AB'; }).forEach(function(p){
    var t = n.AS < 20 || n.BS < 20 ? (n.AS < 20 && (n.BS >= 20 || n.AS < n.BS || (n.AS === n.BS && pw.A <= pw.B)) ? 'A' : 'B') : (n.AE <= n.BE ? 'A' : 'B');
    put(p, t, 'S');
  });
  act.filter(function(p){ return by[p.name] === 'subA'; }).forEach(function(p){ put(p, 'A', 'E'); });
  act.filter(function(p){ return by[p.name] === 'subB'; }).forEach(function(p){ put(p, 'B', 'E'); });
  act.filter(function(p){ return by[p.name] === 'sub'; }).forEach(function(p){ put(p, n.AE <= n.BE ? 'A' : 'B', 'E'); });
  var msg = 'Zuordnung aus den Anmeldungen übernehmen?\n\nTeam A: ' + n.AS + ' Stamm, ' + n.AE + ' Ersatz\nTeam B: ' + n.BS + ' Stamm, ' + n.BE + ' Ersatz' +
    (blocked.length ? '\n\nGesperrt (nicht eingeteilt): ' + blocked.join(', ') : '') + (forced.length ? '\nMalus „nur Ersatz“: ' + forced.join(', ') : '') + '\n\nDie bisherige Zuordnung wird ersetzt.';
  if (!confirm(msg)) return;
  st.assign = asg; if (r.time_a) st.time.A = r.time_a; if (r.time_b) st.time.B = r.time_b;
  if (kind === 'ds') { dsSave(st); dsRender(); } else { csSave(st); csRender(); }
  evNote(kind, 'Übernommen: A ' + n.AS + ' + ' + n.AE + ' Ersatz, B ' + n.BS + ' + ' + n.BE + ' Ersatz.' + (blocked.length ? ' Gesperrt: ' + blocked.join(', ') + '.' : '') + (forced.length ? ' Nur Ersatz (Malus): ' + forced.join(', ') + '.' : '') + ' Jetzt im Spiel eintragen und unten den Plan erstellen.', true);
}
// Fehlende speichern und für neu Markierte auf Wunsch den Malus „nicht erschienen“ vergeben
function evAbsent(kind, id){
  var r = EV.filter(function(x){ return x.id === id; })[0]; if (!r) return;
  var names = Array.prototype.slice.call($('ev_' + kind).querySelectorAll('[data-evabs]')).filter(function(c){ return c.checked; }).map(function(c){ return c.dataset.evabs; });
  var neu = names.filter(function(n){ return (r.absent || []).indexOf(n) < 0; });
  var reason = (merCat().reasons.filter(function(x){ return x.k === 'malus' && /nicht erschienen/i.test(x.r); })[0]) || { r:'Angemeldet, aber nicht erschienen', k:'malus', e:'sub', s:'both', n:2 };
  var giveMalus = neu.length && confirm('Fehlende gespeichert: ' + (names.join(', ') || 'niemand') + '.\n\nFür die neu Markierten (' + neu.join(', ') + ') den Malus „' + reason.r + '“ vergeben (' + MER_EFF[reason.e] + ', ' + (reason.n || 'ohne') + ' Runde(n))?\nAbbrechen = nur als fehlend speichern.');
  evNote(kind, '…', true);
  rpc('admin_event', { p_pw: PW, p_action: 'absent', p_data: { id: id, names: names }, p_actor: ACTOR || null }).then(function(){
    if (!giveMalus) return;
    return neu.reduce(function(pr, n){ return pr.then(function(){ return rpc('admin_merit', { p_pw: PW, p_action: 'add', p_data: { name: n, kind: 'malus', effect: reason.e, scope: reason.s, reason: reason.r, note: (kind === 'cs' ? 'Schluchtsturm ' : 'Wüstensturm ') + r.label, rounds: reason.n === '' || reason.n === undefined ? '' : String(reason.n), until: '' }, p_actor: ACTOR || null }); }); }, Promise.resolve());
  }).then(function(){ return load(PW, true).then(function(){ showTab(kind); evNote(kind, 'Gespeichert: ' + (names.length ? names.length + ' fehlend' : 'alle waren da') + (giveMalus ? ', Malus vergeben.' : '.'), true); }); })
    .catch(function(){ evNote(kind, 'Fehler – ist die Datenbank-Erweiterung „ausbau“ eingespielt?', false); });
}
function evCall(kind){
  var r = evCur(kind), dl = evDl(r);
  var t = 'SKWS ' + EV_NAME[kind] + ' ' + r.label + ': Bitte bis ' + (dl ? fmtDateTime(dl) : 'bald') + ' auf der Squad-Seite anmelden – als Stamm oder nur als Ersatz, jeweils für Team A' + (r.time_a ? ' (' + r.time_a + ')' : '') + ', Team B' + (r.time_b ? ' (' + r.time_b + ')' : '') + ' oder beide Zeiten – oder diesmal nicht. Wir tragen euch dann im Spiel ein.\n' +
    'Please sign up on the squad page: as starter or substitute, for Team A, Team B or both times – or not this time.\nhttps://matdan1987.github.io/skws-squads/';
  copyText(t, 'evMsg_' + kind);
}
function evNudge(kind){
  var r = evCur(kind), by = {}; (r.signups || []).forEach(function(x){ by[x.name] = 1; });
  var none = D.players.filter(function(p){ return p.active && !by[p.name]; }).map(function(p){ return p.name; });
  copyText('SKWS ' + EV_NAME[kind] + ' ' + r.label + ' – noch keine Antwort von: ' + none.join(', ') + '\nBitte kurz auf der Squad-Seite anmelden oder "diesmal nicht" wählen. / Please answer on the squad page.\nhttps://matdan1987.github.io/skws-squads/', 'evMsg_' + kind);
}
['ds','cs'].forEach(function(kind){
  $('ev_' + kind).addEventListener('change', function(e){
    var c = e.target.closest('[data-evcfg="rot"]'); if (!c) return; var cf = evCfg(kind); cf.rot = c.checked;
    evDo(kind, 'config', { kind: kind, cfg: cf }, 'Rotation ' + (cf.rot ? 'eingeschaltet.' : 'ausgeschaltet.'));
  });
  $('ev_' + kind).addEventListener('click', function(e){
    var uf = e.target.closest('[data-evunfix]');
    if (uf) { e.preventDefault(); var c0 = evCfg(kind); c0.fixed = c0.fixed.filter(function(n){ return n !== uf.dataset.evunfix; }); evDo(kind, 'config', { kind: kind, cfg: c0 }, uf.dataset.evunfix + ' ist nicht mehr gesetzt.'); return; }
    var b = e.target.closest('[data-ev]'); if (!b) return; var a = b.dataset.ev, r = evCur(kind);
    if (a === 'create') {
      var dl = $('evDl_' + kind).value;
      if (r && r.open && !confirm('Die laufende Runde „' + r.label + '“ wird geschlossen. Neue Runde starten?')) return;
      evDo(kind, 'create', { kind: kind, label: $('evLabel_' + kind).value, time_a: $('evTa_' + kind).value, time_b: $('evTb_' + kind).value, deadline: dl ? new Date(dl).toISOString() : '' }, 'Anmelderunde gestartet – jetzt den Aufruf in den Chat kopieren.');
    }
    else if (a === 'close') evDo(kind, 'close', { id: r.id }, 'Anmeldung geschlossen.');
    else if (a === 'reopen') evDo(kind, 'reopen', { id: r.id }, 'Anmeldung wieder geöffnet.');
    else if (a === 'set') { var nm = $('evSetName_' + kind).value; if (!nm) { evNote(kind, 'Bitte einen Spieler wählen.', false); return; } evDo(kind, 'set', { id: r.id, name: nm, choice: $('evSetCh_' + kind).value }, nm + ' eingetragen.'); }
    else if (a === 'take') evTake(kind);
    else if (a === 'fix') { var fn = $('evFix_' + kind).value; if (!fn) return; var c = evCfg(kind); c.fixed.push(fn); evDo(kind, 'config', { kind: kind, cfg: c }, fn + ' ist gesetzt.'); }
    else if (a === 'call') evCall(kind);
    else if (a === 'nudge') evNudge(kind);
    else if (a === 'absent') evAbsent(kind, +b.dataset.round);
  });
});
