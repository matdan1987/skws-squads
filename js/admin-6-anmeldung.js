/* SKWS Squads – Admin: anmeldung (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Anmeldung der Spieler (Wüstensturm / Schluchtsturm) ---------- */
var EVCFG = {}, EV = [], EV_CH = { A:'Stamm nur Team A', B:'Stamm nur Team B', AB:'Stamm, beide Zeiten', subA:'Ersatz nur Team A', subB:'Ersatz nur Team B', sub:'Ersatz, beide Zeiten', no:'diesmal nicht' };
var EV_NAME = { ds:'Wüstensturm', cs:'Schluchtsturm' };
function evCur(kind){ return EV.filter(function(r){ return r.kind === kind; })[0] || null; }
function evDl(r){ return r && r.deadline ? new Date(r.deadline) : null; }
function evIsOpen(r){ var d = evDl(r); return !!(r && r.open && (!d || Date.now() <= +d)); }
function evKW(){ var d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7); }
function evLocalInput(d){ var p = function(n){ return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }
// übliche Startzeiten laut Spiel (Lokale Zeit), solange noch nichts gespeichert ist
var EV_TIME_DEF = { ds: { A: 'Fr 21:00', B: 'Fr 12:00' }, cs: { A: 'Do 15:00', B: 'Do 15:00' } };
// zuletzt verwendete Uhrzeit je Team: neueste aus Anmelderunden und veröffentlichtem Plan (zentral gespeichert), sonst die vom Gerät
function evLastTime(kind, t){
  var best = '', at = 0, k = 'time_' + t.toLowerCase(), pub = kind === 'ds' ? (typeof DS_PUB !== 'undefined' && DS_PUB) : (typeof CS_PUB !== 'undefined' && CS_PUB);
  EV.forEach(function(r){ var d = +new Date(r.created_at || 0); if (r.kind === kind && r[k] && d > at) { at = d; best = r[k]; } });
  if (pub && pub.at && pub.teams && pub.teams[t] && pub.teams[t].time && +new Date(pub.at) > at) { at = +new Date(pub.at); best = pub.teams[t].time; }
  if (!best) { var st = kind === 'ds' ? dsState() : csState(); best = (st.time && st.time[t]) || ''; }
  return best || (EV_TIME_DEF[kind] || {})[t] || '';
}
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
    // Kopf: Runde, Status, Fristen und wie viele schon geantwortet haben
    var answered = act.length - none.length, pct = act.length ? Math.round(answered / act.length * 100) : 0;
    h += '<div class="ev-head"><b>' + esc(r.label) + '</b><span class="ev-pill ' + (open ? 'on' : 'off') + '">' + (open ? 'Anmeldung offen' : 'Anmeldung geschlossen') + '</span>' +
      '<span class="small muted">' + [dl ? 'Anmeldeschluss ' + fmtDateTime(dl) : '', r.time_a ? 'A: ' + esc(r.time_a) : '', r.time_b ? 'B: ' + esc(r.time_b) : ''].filter(Boolean).join(' · ') + '</span></div>';
    h += '<div class="ev-prog"><span><b>' + answered + '</b> von ' + act.length + ' haben geantwortet</span><div class="fk-bar"><i style="width:' + pct + '%"></i></div></div>';
    // Überblick je Team statt acht Einzelzahlen
    function tile(t){ var s = cnt[t], e = cnt['sub' + t];
      return '<div class="ev-tile"><small>Team ' + t + (r['time_' + t.toLowerCase()] ? ' · ' + esc(r['time_' + t.toLowerCase()]) : '') + '</small><b>' + s + ' Stamm · ' + e + ' Ersatz</b><span>nur für dieses Team</span></div>'; }
    h += '<div class="ev-tiles">' + tile('A') + tile('B') +
      '<div class="ev-tile"><small>Flexibel (beide Zeiten)</small><b>' + cnt.AB + ' Stamm · ' + cnt.sub + ' Ersatz</b><span>werden auf A und B verteilt</span></div>' +
      '<div class="ev-tile"><small>Nicht dabei</small><b>' + cnt.no + ' diesmal nicht</b><span>' + none.length + ' ohne Antwort</span></div></div>';
    // Was jetzt zu tun ist – in der Reihenfolge
    h += '<div class="ev-todo">' +
      (open ? '<button class="btn2" data-ev="call" data-kind="' + K + '">📣 Aufruf für den Chat kopieren</button>' : '') +
      (open && none.length ? '<button class="btn2" data-ev="nudge" data-kind="' + K + '">🔔 Erinnerung an ' + none.length + ' ohne Antwort kopieren</button>' : '') +
      '<button class="btn" data-ev="take" data-kind="' + K + '">➡ In Schritt 2 übernehmen (Teams einteilen)</button>' +
      '<button class="mini ghostbtn" data-ev="' + (r.open ? 'close' : 'reopen') + '" data-kind="' + K + '">' + (r.open ? '🔒 Anmeldung schließen (keine Antworten mehr)' : '🔓 Anmeldung wieder öffnen') + '</button></div>';
    // Details nur bei Bedarf
    var who = '';
    ['A','B','AB','subA','subB','sub','no'].forEach(function(c){
      var list = act.filter(function(p){ return by[p.name] && by[p.name].choice === c; }).sort(function(a, b){ return dsMetricVal(b, st.metric) - dsMetricVal(a, st.metric); });
      if (!list.length) return;
      who += '<div class="evgrp">' + EV_CH[c] + ' (' + list.length + ')</div><div class="small">' + list.map(function(p){ var x = by[p.name], sx = ES.by[p.name];
        var rt = cfg.fixed.indexOf(p.name) >= 0 ? ' <span class="mgb r">gesetzt</span>' : (ES.n && sx ? (sx.benched ? ' <span class="mgb m">' + sx.benched + '× pausiert</span>' : '') + ' <span class="muted">· ' + sx.played + '/' + ES.n + ' gespielt</span>' : (ES.n ? ' <span class="muted">· 0/' + ES.n + ' gespielt</span>' : ''));
        return '<span class="chip" style="cursor:default;display:inline-block;margin:2px">' + av(p.name, 26) + esc(p.name) + ' <span class="muted">' + dsMetricTxt(p, st.metric) + '</span>' + merBadge(p.name, kind) + rt + (x.admin ? ' <span class="muted">(R4)</span>' : '') + (x.note ? ' · <i>' + esc(x.note) + '</i>' : '') + '</span>'; }).join('') + '</div>';
    });
    if (none.length) who += '<div class="evgrp">Keine Antwort (' + none.length + ')</div><div class="small">' + none.map(function(p){ return esc(p.name); }).join(', ') + '</div>';
    h += '<details class="ev-more"><summary>👥 Wer hat wie geantwortet? (' + answered + ')</summary>' + (who || '<div class="small muted">Noch keine Antworten.</div>') + '</details>';
    h += '<details class="ev-more"><summary>✏️ Antwort für einen Spieler eintragen oder ändern</summary><p class="small muted" style="margin:6px 0">Zum Beispiel, wenn jemand im Chat statt auf der Seite geantwortet hat.</p><div class="formrow"><div><label>Spieler</label><select id="evSetName_' + K + '"><option value="">– Spieler –</option>' +
      act.slice().sort(function(a, b){ return a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }).map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Antwort</label><select id="evSetCh_' + K + '">' + Object.keys(EV_CH).map(function(c){ return '<option value="' + c + '">' + EV_CH[c] + '</option>'; }).join('') + '<option value="">Anmeldung löschen</option></select></div></div>' +
      '<div class="btnrow"><button class="btn2" data-ev="set" data-kind="' + K + '">Eintragen</button></div></details>';
    h += '<details class="ev-more"><summary>⚙️ Rotation &amp; gesetzte Spieler (' + cfg.fixed.length + ' gesetzt, Rotation ' + (cfg.rot ? 'an' : 'aus') + ')</summary>' +
      '<p class="small muted" style="margin:6px 0">Melden sich für ein Team mehr als 20 an, kommen zuerst die Gesetzten in den Stamm, danach Spieler mit Bonus „Vorrang“. Mit Rotation folgen dann die, die in den letzten 4 Runden am häufigsten pausieren mussten bzw. am seltensten gespielt haben – erst danach entscheidet die Stärke. Ohne Rotation entscheidet nur die Stärke. Ausgewertet wird die Aufstellung, mit der du den Plan erstellt hast.</p>' +
      '<label class="small" style="display:flex;align-items:center;gap:8px;margin:0 0 8px"><input type="checkbox" data-evcfg="rot" data-kind="' + K + '"' + (cfg.rot ? ' checked' : '') + ' style="width:18px;height:18px;padding:0;accent-color:var(--accent)"> Rotation verwenden</label>' +
      '<div class="small">' + (cfg.fixed.map(function(n){ return '<span class="chip" style="display:inline-block;margin:2px">' + esc(n) + ' <a href="#" data-evunfix="' + esc(n) + '" data-kind="' + K + '" style="color:var(--err);text-decoration:none">✕</a></span>'; }).join('') || '<span class="muted">Noch niemand gesetzt.</span>') + '</div>' +
      '<div class="formrow" style="margin-top:6px;grid-template-columns:1fr auto"><select id="evFix_' + K + '"><option value="">– Spieler setzen –</option>' +
      act.filter(function(p){ return cfg.fixed.indexOf(p.name) < 0; }).sort(function(a, b){ return (a.rank === b.rank ? 0 : a.rank > b.rank ? -1 : 1) || a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }).map(function(p){ return '<option value="' + esc(p.name) + '">' + esc(p.name) + ' (' + p.rank + ')</option>'; }).join('') +
      '</select><button class="btn2" data-ev="fix" data-kind="' + K + '">Setzen</button></div></details>';
  } else h += '<p class="small" style="margin:0 0 8px">Noch keine Anmelderunde. Trag unten die Daten ein und starte sie – danach sehen alle Spieler auf der Spielerseite unter „Events“ eine Karte, auf der sie Team A, Team B, beide Zeiten (als Stamm oder nur als Ersatz) oder „diesmal nicht“ wählen.</p>';
  var nd = new Date(); nd.setDate(nd.getDate() + ((4 - nd.getDay() + 7) % 7 || 7)); nd.setHours(20, 0, 0, 0);
  var form = '<div class="formrow" style="margin-top:8px"><div><label>Bezeichnung</label><input id="evLabel_' + K + '" type="text" maxlength="40" value="KW ' + evKW() + '"></div>' +
    '<div><label>Anmeldeschluss</label><input id="evDl_' + K + '" type="datetime-local" value="' + evLocalInput(nd) + '"></div>' +
    '<div><label>Team A – Uhrzeit</label><input id="evTa_' + K + '" type="text" maxlength="30" value="' + esc(evLastTime(kind, 'A')) + '" placeholder="z. B. Fr 21:00"></div>' +
    '<div><label>Team B – Uhrzeit</label><input id="evTb_' + K + '" type="text" maxlength="30" value="' + esc(evLastTime(kind, 'B')) + '" placeholder="z. B. Fr 12:00"></div></div>' +
    '<p class="small muted" style="margin:0 0 6px">Vorgeschlagen ist die zuletzt verwendete Uhrzeit je Team – nur ändern, wenn es diesmal anders ist. Die Uhrzeiten sehen die Spieler bei der Auswahl.' + (r ? ' Eine neue Runde schließt die bisherige (' + esc(r.label) + ').' : '') + '</p>' +
    '<div class="btnrow"><button class="btn" data-ev="create" data-kind="' + K + '">Anmelderunde starten</button></div>';
  var stale = r && !evIsOpen(r) && Date.now() - new Date(r.created_at || 0) > 5 * 86400000;   // letzte Runde vorbei → Start-Formular gleich offen
  h += r ? '<details class="ev-more"' + (stale ? ' open' : '') + '><summary>➕ Neue Runde für das nächste Event starten</summary>' + form + '</details>' : '<div class="ev-start">' + form + '</div>';
  // Nach dem Event: nur die Fehlenden markieren (letzte Runde mit gemerkter Aufstellung)
  var lr = EV.filter(function(x){ return x.kind === kind && x.lineup && Object.keys(x.lineup).length; })[0];
  if (lr) {
    var abs = lr.absent || [], planned = Object.keys(lr.lineup).filter(function(nm){ return /S$/.test(lr.lineup[nm]); }).sort(function(a, b){ return a.localeCompare(b, 'de', {sensitivity:'base'}); });
    var subs = Object.keys(lr.lineup).filter(function(nm){ return /E$/.test(lr.lineup[nm]); }).sort(function(a, b){ return a.localeCompare(b, 'de', {sensitivity:'base'}); });
    function chk(nm){ return '<label class="chip" style="display:inline-flex;align-items:center;gap:6px;margin:2px;cursor:pointer"><input type="checkbox" data-evabs="' + esc(nm) + '"' + (abs.indexOf(nm) >= 0 ? ' checked' : '') + ' style="width:16px;height:16px;padding:0;accent-color:var(--err)">' + av(nm, 26) + esc(nm) + ' <span class="muted">' + lr.lineup[nm][0] + '</span></label>'; }
    h += '<details class="ev-more"><summary>✅ Nach dem Event: Wer hat gefehlt? – ' + esc(lr.label) + (abs.length ? ' (' + abs.length + ' markiert)' : '') + '</summary>' +
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
// Ist ein Team im Stamm nicht voll (unter 20), rücken Ersatzspieler dieses Teams nach – die Stärksten zuerst.
// Ausgenommen: Spieler mit Malus „nur Ersatz“. Gibt die Namen der Nachgerückten zurück (ändert assign direkt).
function evFill(kind, assign, metric){
  var by = {}, out = []; D.players.forEach(function(p){ by[p.name] = p; });
  ['A','B'].forEach(function(t){
    var s = Object.keys(assign).filter(function(n){ return assign[n] === t + 'S' && by[n] && by[n].active; }).length;
    Object.keys(assign).filter(function(n){ return assign[n] === t + 'E' && by[n] && by[n].active && !merEff(n, kind).sub; })
      .sort(function(a, b){ return dsMetricVal(by[b], metric) - dsMetricVal(by[a], metric) || a.localeCompare(b); })
      .forEach(function(n){ if (s < 20) { assign[n] = t + 'S'; s++; out.push(n); } });
  });
  return out;
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
  // flexible Ersatzspieler dorthin, wo insgesamt weniger sind – dort rücken sie eher in den Stamm nach
  act.filter(function(p){ return by[p.name] === 'sub'; }).forEach(function(p){ put(p, (n.AS + n.AE) <= (n.BS + n.BE) ? 'A' : 'B', 'E'); });
  var moved = evFill(kind, asg, m); moved.forEach(function(nm){ var t = asg[nm][0]; n[t + 'E']--; n[t + 'S']++; });
  var msg = 'Zuordnung aus den Anmeldungen übernehmen?\n\nTeam A: ' + n.AS + ' Stamm, ' + n.AE + ' Ersatz\nTeam B: ' + n.BS + ' Stamm, ' + n.BE + ' Ersatz' +
    (moved.length ? '\n\nErsatz rückt in den Stamm nach (Team sonst nicht voll): ' + moved.join(', ') : '') + (blocked.length ? '\n\nGesperrt (nicht eingeteilt): ' + blocked.join(', ') : '') + (forced.length ? '\nMalus „nur Ersatz“: ' + forced.join(', ') : '') + '\n\nDie bisherige Zuordnung wird ersetzt.';
  if (!confirm(msg)) return;
  st.assign = asg; st.time.A = r.time_a || evLastTime(kind, 'A'); st.time.B = r.time_b || evLastTime(kind, 'B');
  if (kind === 'ds') { dsSave(st); dsRender(); } else { csSave(st); csRender(); }
  evNote(kind, 'Übernommen: A ' + n.AS + ' + ' + n.AE + ' Ersatz, B ' + n.BS + ' + ' + n.BE + ' Ersatz.' + (blocked.length ? ' Gesperrt: ' + blocked.join(', ') + '.' : '') + (forced.length ? ' Nur Ersatz (Malus): ' + forced.join(', ') + '.' : '') + (moved.length ? ' Nachgerückt in den Stamm: ' + moved.join(', ') + '.' : '') + ' Jetzt im Spiel eintragen und unten den Plan erstellen.', true);
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
    'Please sign up on the squad page: as starter or substitute, for Team A, Team B or both times – or not this time. Times are German time; the squad page also shows them in your local time.\nhttps://matdan1987.github.io/skws-squads/';
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
