/* SKWS Squads – Admin: ansichten (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Übersicht ---------- */
function renderOverview(){
  var P = D.players, done = P.filter(function(p){ return p.entry; });
  var total = done.reduce(function(a,p){ return a + p.total; }, 0);
  var t1sum = done.reduce(function(a,p){ return a + p.t1; }, 0);
  var stale = done.filter(function(p){ return p.stale; }).length;
  var top = done.slice().sort(function(a,b){ return b.t1 - a.t1; })[0];
  // Veränderung ggü. dem Stand vor 7 Tagen
  var days = D.days, last = days[days.length - 1], ref = null;
  if (last) for (var i = days.length - 1; i >= 0; i--) if (+last.x - +days[i].x >= 7 * DAY) { ref = days[i]; break; }
  var pct = Math.round(done.length / D.members * 100);
  $('tiles').innerHTML =
    tile('Eingetragen', done.length + ' / ' + D.members, '<div class="bar"><i style="width:' + pct + '%"></i></div>') +
    tile('Allianz gesamt', fmtM(total), ref ? fmtDelta(last.total - ref.total) + ' M seit 7 Tagen' : 'alle Trupps aller Eingetragenen') +
    tile('Ø T1', done.length ? fmtM(t1sum / done.length) : '–', top ? 'stärkster T1: ' + esc(top.name) + ' (' + fmt(top.t1) + ')' : '') +
    tile('Überfällig', String(stale), stale ? '<span class="stale">⚠ über ' + STALE_DAYS + ' Tage nicht aktualisiert</span>' : 'alle aktuell');

  var counts = {}; TROOP_ORDER.forEach(function(k){ counts[k] = 0; });
  done.forEach(function(p){ var t = sq(p.entry, 0).type; if (counts[t] !== undefined) counts[t]++; });
  var mx = Math.max.apply(null, TROOP_ORDER.map(function(k){ return counts[k]; })) || 1;
  $('troopBars').innerHTML = TROOP_ORDER.map(function(k){
    return '<div class="hb" title="' + TROOPS[k] + ': ' + counts[k] + '"><span>' + TROOPS[k] + '</span><div class="track"><div class="fill" style="width:' +
      (counts[k] / mx * 100) + '%;background:var(--' + k + ')"></div></div><span class="n">' + counts[k] + '</span></div>';
  }).join('') + (done.length ? '' : '<div class="small muted">Noch keine Meldungen.</div>');

  var rows = '<tr><th>Rang</th><th class="n">Eingetr.</th><th class="n">Ø T1</th><th class="n">Gesamt</th></tr>';
  RANKS.forEach(function(r){
    var all = P.filter(function(p){ return p.rank === r; }); if (!all.length) return;
    var d = all.filter(function(p){ return p.entry; });
    var t1 = d.reduce(function(a,p){ return a + p.t1; }, 0), tt = d.reduce(function(a,p){ return a + p.total; }, 0);
    rows += '<tr><td>' + r + '</td><td class="n">' + d.length + ' / ' + all.length + '</td><td class="n">' + (d.length ? fmt(t1 / d.length) : '–') + '</td><td class="n">' + (tt ? fmt(tt) : '–') + '</td></tr>';
  });
  $('rankTable').innerHTML = rows;
  var od = done.filter(function(p){ return p.stale; }).sort(function(a,b){ return a.updated - b.updated; });
  var never = P.filter(function(p){ return !p.entry; });
  $('odCount').textContent = od.length; $('neverCount').textContent = never.length;
  $('odList').innerHTML = od.map(function(p){
    return '<div class="dev" data-name="' + esc(p.name) + '"><span class="pos">' + p.rank + '</span><div class="who"><b>' + esc(p.name) + '</b><span>zuletzt am ' + fmtDate(p.updated) + '</span></div>' +
      '<div class="val stale">⚠ seit ' + daysSince(p.updated) + ' Tagen<small>T1 ' + fmt(p.t1) + ' · Gesamt ' + fmt(p.total) + '</small></div></div>';
  }).join('') || '<div class="empty" style="padding:12px 0">Alle Eingetragenen sind aktuell.</div>';
  $('neverList').innerHTML = never.map(function(p){ return '<span class="chip" style="cursor:default">' + esc(p.name) + '</span>'; }).join('') || '<span class="small muted">Alle haben sich eingetragen.</span>';
  lineChart($('chartOvTotal'), [{ name:'Allianz gesamt', color:'var(--accent)', points: D.days.map(function(d){ return { x:d.x, y:Math.round(d.total*10)/10 }; }) }], { title:'Allianz-Kampfkraft' });
}
function tile(k, v, d){ return '<div class="tile"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="d">' + (d || '') + '</div></div>'; }

/* ---------- Mitglieder ---------- */
function renderMembers(){
  var q = $('memSearch').value.trim().toLowerCase(), sort = $('memSort').value, f = $('memFilter').value;
  var cmp = {
    total: function(a,b){ return b.total - a.total || a.name.localeCompare(b.name); },
    t1: function(a,b){ return b.t1 - a.t1 || a.name.localeCompare(b.name); },
    name: function(a,b){ return a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); },
    updated: function(a,b){ return (b.updated || 0) - (a.updated || 0); }
  }[sort];
  var h = '<tr><th class="sticky">Spieler</th><th class="n">T1</th><th class="n">T2</th><th class="n">T3</th><th class="n">T4</th><th class="n">Gesamt</th><th class="n">Δ</th><th class="n">Held</th><th class="n">Gorilla</th></tr>';
  RANKS.forEach(function(r){
    var list = D.players.filter(function(p){
      if (p.rank !== r) return false;
      if (q && p.name.toLowerCase().indexOf(q) < 0) return false;
      if (f === 'done' && !p.entry) return false;
      if (f === 'missing' && p.entry) return false;
      if (f === 'stale' && !p.stale) return false;
      if (TROOPS[f] && sq(p.entry, 0).type !== f) return false;
      return true;
    }).sort(cmp);
    if (!list.length) return;
    var n = D.players.filter(function(p){ return p.rank === r; });
    h += '<tr class="rankhead"><td class="sticky">' + r + '</td><td colspan="8">' + n.filter(function(p){ return p.entry; }).length + ' / ' + n.length + ' eingetragen</td></tr>';
    list.forEach(function(p){
      if (!p.entry) { h += '<tr class="missing"><td class="sticky">' + av(p.name) + esc(p.name) + mgBadge(p.name) + merBadge(p.name) + '</td><td colspan="8">— noch nie eingetragen</td></tr>'; return; }
      h += '<tr class="click" data-name="' + esc(p.name) + '"><td class="sticky">' + av(p.name) + esc(p.name) + mgBadge(p.name) + merBadge(p.name) + '<div class="tl' + (p.stale ? ' stale' : '') + '">' + (p.stale ? '⚠ ' : '') + fmtDate(p.updated) + ' · ' + ago(p.updated) + '</div></td>';
      for (var i = 0; i < 4; i++) {
        var s = sq(p.entry, i);
        h += '<td class="n">' + squadCell(s) + '</td>';
      }
      h += '<td class="n">' + fmt(p.total) + '</td><td class="n">' + (p.delta === null ? '<span class="muted">neu</span>' : fmtDelta(p.delta)) + '</td><td class="n">' + (p.entry.hero ? fmt(p.entry.hero) : '–') + '</td><td class="n">' + gorillaCell(p.entry) + '</td></tr>';
    });
  });
  $('memTable').innerHTML = h;
}

/* ---------- Verlauf ---------- */
function renderHistory(){
  var days = D.days;
  lineChart($('chartTotal'), [{ name:'Allianz gesamt', color:'var(--accent)', points: days.map(function(d){ return { x:d.x, y:Math.round(d.total*10)/10 }; }) }], { title:'Allianz gesamt' });
  lineChart($('chartSlots'), [0,1,2,3].map(function(i){
    return { name:'T' + (i+1), color:SLOT_COLORS[i], points: days.map(function(d){ return { x:d.x, y:Math.round(d.slots[i]*10)/10 }; }) };
  }), { title:'Summe je Trupp' });
  lineChart($('chartCount'), [{ name:'Eingetragen', color:'var(--accent)', points: days.map(function(d){ return { x:d.x, y:d.count }; }) }], { title:'Eingetragene Spieler', unit:'', zero:true });
  var t = '<tr><th>Tag</th><th class="n">Spieler</th><th class="n">T1</th><th class="n">T2</th><th class="n">T3</th><th class="n">T4</th><th class="n">Gesamt</th></tr>';
  days.slice().reverse().forEach(function(d){
    t += '<tr><td>' + fmtDate(d.x) + '</td><td class="n">' + d.count + '</td>' + d.slots.map(function(v){ return '<td class="n">' + fmt(v) + '</td>'; }).join('') + '<td class="n"><b>' + fmt(d.total) + '</b></td></tr>';
  });
  $('histTable').innerHTML = days.length ? t : '<tr><td class="muted">Noch keine Daten.</td></tr>';
}

/* ---------- Spieler ---------- */
function fillPlayerSelect(){
  var sel = $('plSelect');
  var list = D.all.slice().sort(function(a,b){ return (b.active - a.active) || a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); });
  sel.innerHTML = '<option value="">– Spieler wählen –</option>' + list.map(function(p){
    return '<option value="' + esc(p.name) + '">' + esc(p.name) + ' (' + p.rank + ')' + (!p.active ? ' – ausgeschieden' : p.entry ? '' : ' – fehlt') + '</option>';
  }).join('');
  if (curPlayer) sel.value = curPlayer;
}
// Spieler-Akte: alles zu einem Spieler auf einen Blick
var PSTATS = null;
function psLoad(){ rpc('profile_stats').then(function(r){ PSTATS = r || {}; if ((store('skws_admin_tab') || 'ov') === 'pl') renderAkte(); }).catch(function(){ PSTATS = {}; }); }
function renderAkte(){
  var box = $('plAkte'), p = D.all.filter(function(x){ return x.name === curPlayer; })[0];
  if (!p) { box.innerHTML = ''; return; }
  var s = (PSTATS && PSTATS[p.name]) || {}, mg = mgOf(p.name), CH = { A:'Stamm A', B:'Stamm B', AB:'Stamm, beide', subA:'Ersatz A', subB:'Ersatz B', sub:'Ersatz, beide', no:'diesmal nicht' };
  var h = '<div class="card"><div class="akte-h"><span class="akte-av" data-avbig="' + esc(p.name) + '">' + av(p.name, 160) + '</span><div><b>' + esc(p.name) + '</b><div class="small muted">' + p.rank + (p.active ? '' : ' · ausgeschieden') +
    (mg ? ' · Mentorengruppe ' + mg.g + (mg.role === 'mentor' ? ' (Mentor)' : mg.role === 'r4' ? ' (Leitung)' : '') : ' · keine Mentorengruppe') +
    (p.entry ? ' · ' + (p.entry.hasEmail ? 'E-Mail hinterlegt' : 'keine E-Mail') : '') + '</div><div>' + mgBadge(p.name) + merBadge(p.name) + (typeof fkAkte === 'function' ? fkAkte(p.name) : '') + '</div></div></div>';
  h += '<div class="akte-k"><div>Bienchen<b>🐝 ' + (s.b || 0) + '</b></div><div>Teufelchen<b>😈 ' + (s.d || 0) + '</b>' + (s.d90 ? s.d90 + ' in 90 Tagen' : '') + '</div>' +
    '<div>Wüstensturm gespielt<b>' + (s.pds || 0) + '</b></div><div>Schluchtsturm gespielt<b>' + (s.pcs || 0) + '</b></div><div>Als Ersatz eingeplant<b>' + (s.sub || 0) + '</b></div>' +
    '<div>Gefehlt<b' + (s.abs ? ' class="down"' : '') + '>' + (s.abs || 0) + '</b></div><div>Anmeldungen<b>' + (s.su || 0) + '</b></div><div>Meldetage<b>' + (s.hn || 0) + '</b></div></div>';
  h += '<div class="btnrow"><button class="btn2" data-akte="merit">Bonus/Malus vergeben</button>' + (p.active ? '<button class="btn2" data-akte="pm">✉️ Nachricht senden</button>' : '') +
    (typeof fkHasPin === 'function' && (fkHasPin(p.name) || fkLocked(p.name)) ? '<button class="btn2" data-akte="pin">🔑 PIN zurücksetzen</button>' : '') + (p.active ? '<button class="btn2" data-akte="init">🛡️ Start-PIN / Anmeldungen</button>' : '') + '</div></div>';
  // Bonus/Malus
  var ml = MER.filter(function(m){ return m.name === p.name; });
  h += '<div class="card"><h2>Bonus/Malus (' + ml.length + ')</h2>' + (ml.length ? ml.map(function(m){ var bad = m.kind === 'malus';
    return '<div class="akte-ev"' + (m.active ? '' : ' style="opacity:.55"') + '><b class="' + (bad ? 'down' : 'up') + '">' + (bad ? '▼ Malus' : '▲ Bonus') + '</b><span>' + esc(m.reason) + '</span><span class="muted">' + MER_EFF[m.effect] + ' · ' + (m.revoked_at ? 'zurückgenommen' : m.active ? merDur(m) : 'abgelaufen') + ' · ' + fmtDate(new Date(m.created_at)) + (m.by ? ' · ' + esc(m.by) : '') + '</span>' +
      (m.note ? '<span class="muted"><i>' + esc(m.note) + '</i></span>' : '') + (m.active && !m.revoked_at ? '<button class="mini danger" data-merrev="' + m.id + '">Zurücknehmen</button>' : '') + '</div>'; }).join('') : '<div class="small muted">Keine Einträge.</div>') + '</div>';
  // Events
  var evl = EV.filter(function(r){ return (r.signups || []).some(function(x){ return x.name === p.name; }) || (r.lineup && r.lineup[p.name]); });
  h += '<div class="card"><h2>Events (letzte Runden)</h2>' + (evl.length ? evl.map(function(r){
    var su = (r.signups || []).filter(function(x){ return x.name === p.name; })[0], l = r.lineup && r.lineup[p.name], gone = (r.absent || []).indexOf(p.name) >= 0;
    return '<div class="akte-ev"><b>' + (r.kind === 'cs' ? 'Schluchtsturm' : 'Wüstensturm') + ' ' + esc(r.label) + '</b><span class="muted">Anmeldung: ' + (su ? CH[su.choice] || su.choice : '–') + '</span>' +
      '<span>' + (l ? 'eingeteilt: Team ' + l[0] + (l[1] === 'S' ? ' Stamm' : ' Ersatz') : '<span class="muted">nicht eingeteilt</span>') + '</span>' + (gone ? '<span class="down">gefehlt</span>' : '') + '</div>';
  }).join('') : '<div class="small muted">Noch keine Anmeldungen.</div>') + '</div>';
  box.innerHTML = h;
}
function renderPlayer(){
  renderAkte();
  var p = D.all.filter(function(x){ return x.name === curPlayer; })[0];
  if (!p) { $('plTiles').innerHTML = ''; $('chartPlayer').innerHTML = '<div class="empty">Spieler oben auswählen.</div>'; $('plTable').innerHTML = ''; return; }
  if (!p.entry) { $('plTiles').innerHTML = tile('Rang', p.rank, 'noch keine Meldung'); $('chartPlayer').innerHTML = '<div class="empty">Keine Daten.</div>'; $('plTable').innerHTML = ''; return; }
  $('plTiles').innerHTML =
    tile('Gesamt', fmtM(p.total), p.delta === null ? 'erste Meldung' : fmtDelta(p.delta) + ' M seit letzter Meldung') +
    tile('T1', fmtM(p.t1), TROOPS[sq(p.entry,0).type] || '') +
    tile('Wachstum', p.growth === null ? '–' : (p.growth > 0 ? '+' : '') + fmt(p.growth) + ' M', (p.history.length ? 'seit erster Meldung (' + fmtDate(p.history[0].t) + ')' : '')) +
    tile('Meldungen', String(p.history.length), (p.stale ? '<span class="stale">⚠ ' : '') + 'zuletzt ' + ago(p.updated) + (p.stale ? '</span>' : '') + ' · Rang ' + p.rank + (mgOf(p.name) ? ' · ' + mgBadge(p.name) : ''));
  lineChart($('chartPlayer'), [0,1,2,3].map(function(i){
    return { name:'T' + (i+1), color:SLOT_COLORS[i], points: p.history.filter(function(h){ return (h.squads[i] || {}).power; }).map(function(h){ return { x:h.t, y:Number(h.squads[i].power) }; }) };
  }).filter(function(s){ return s.points.length; }), { title:'Kampfkraft je Trupp', time:true });
  var t = '<tr><th>Datum</th><th class="n">T1</th><th class="n">T2</th><th class="n">T3</th><th class="n">T4</th><th class="n">Gesamt</th></tr>';
  p.history.slice().reverse().forEach(function(h){
    t += '<tr><td>' + fmtDateTime(h.t) + '</td>' + [0,1,2,3].map(function(i){
      return '<td class="n">' + squadCell(h.squads[i]) + '</td>';
    }).join('') + '<td class="n"><b>' + fmt(h.total) + '</b></td></tr>';
  });
  $('plTable').innerHTML = t;
}

/* ---------- Entwicklung ---------- */
function devStats(){
  var days = +$('devPeriod').value, m = $('devMetric').value, cutoff = days ? Date.now() - days * DAY : null;
  var val = function(sqs){ return m === 't1' ? Number(((sqs || [])[0] || {}).power || 0) : sumSquads(sqs); };
  var rows = [], fresh = [], idleUpd = [];
  D.players.forEach(function(p){
    if (!p.entry || !p.history.length) return;
    var updatedIn = cutoff ? +p.updated >= cutoff : !p.stale;
    if (!updatedIn) { idleUpd.push(p); return; }
    var hs = p.history, cur = val(p.entry.squads), base = null, baseT = null;
    if (cutoff) { for (var i = hs.length - 1; i >= 0; i--) if (+hs[i].t <= cutoff) { base = val(hs[i].squads); baseT = hs[i].t; break; } }
    else if (hs.length > 1 || (Date.now() - hs[0].t) > 7 * DAY) { base = val(hs[0].squads); baseT = hs[0].t; }
    // letzter Zeitpunkt, an dem sich der Wert geändert hat
    var lastChange = hs[0].t;
    for (var k = 1; k < hs.length; k++) if (val(hs[k].squads) !== val(hs[k-1].squads)) lastChange = hs[k].t;
    if (base === null) { fresh.push(p); return; }
    var abs = Math.round((cur - base) * 100) / 100, pct = base ? abs / base * 100 : 0;
    rows.push({ p: p, cur: cur, base: base, baseT: baseT, abs: abs, pct: pct, lastChange: lastChange, idle: Math.floor((Date.now() - lastChange) / DAY) });
  });
  return { rows: rows, fresh: fresh, idleUpd: idleUpd, days: days };
}
function devRow(r, i, max, by){
  var v = by === 'pct' ? r.pct : r.abs, w = max ? Math.min(100, Math.abs(v) / max * 100) : 0;
  var col = v > 0 ? 'var(--ok)' : v < 0 ? 'var(--err)' : 'var(--faint)';
  var main = by === 'pct' ? (v > 0 ? '+' : '') + fmt(r.pct) + ' %' : (v > 0 ? '+' : '') + fmt(r.abs) + ' M';
  var sub = by === 'pct' ? (r.abs > 0 ? '+' : '') + fmt(r.abs) + ' M' : (r.pct > 0 ? '+' : '') + fmt(r.pct) + ' %';
  return '<div class="dev" data-name="' + esc(r.p.name) + '"><span class="pos">' + (i + 1) + '</span>' +
    '<div class="who"><b>' + esc(r.p.name) + '</b><span>' + r.p.rank + ' · ' + fmt(r.base) + ' → ' + fmt(r.cur) + ' M · aktualisiert ' + ago(r.p.updated) + '</span></div>' +
    '<div class="val ' + (v > 0 ? 'up' : v < 0 ? 'down' : 'muted') + '">' + (v > 0 ? '▲ ' : v < 0 ? '▼ ' : '') + main + '<small>' + sub + '</small></div>' +
    '<div class="track"><i style="width:' + w + '%;background:' + col + '"></i></div></div>';
}
function renderDev(){
  var S = devStats(), by = $('devBy').value, key = by === 'pct' ? 'pct' : 'abs';
  var moving = S.rows.filter(function(r){ return r.abs !== 0; }), still = S.rows.filter(function(r){ return r.abs === 0; });
  var up = moving.filter(function(r){ return r.abs > 0; }), down = moving.filter(function(r){ return r.abs < 0; });
  var top = up.slice().sort(function(a,b){ return b[key] - a[key]; }).slice(0, 10);
  var topNames = {}; top.forEach(function(r){ topNames[r.p.name] = 1; });
  var low = moving.filter(function(r){ return !topNames[r.p.name]; }).sort(function(a,b){ return a[key] - b[key]; }).slice(0, 10);
  var maxAll = Math.max.apply(null, moving.map(function(r){ return Math.abs(r[key]); }).concat([0]));
  var avgPct = S.rows.length ? S.rows.reduce(function(a,r){ return a + r.pct; }, 0) / S.rows.length : 0;
  var period = S.days ? 'in den letzten ' + S.days + ' Tagen' : 'seit der ersten Meldung';
  $('devTiles').innerHTML =
    tile('Ø Entwicklung', S.rows.length ? (avgPct > 0 ? '+' : '') + fmt(avgPct) + ' %' : '–', period) +
    tile('Zuwachs', String(up.length), '<span class="up">▲</span> Spieler gewachsen') +
    tile('Rückgang', String(down.length), down.length ? '<span class="down">▼</span> Werte gesunken' : 'niemand gesunken') +
    tile('Stillstand', String(still.length), still.length ? '<span class="stale">⏸ aktualisiert, aber unverändert</span>' : 'keiner') +
    tile('Nicht aktualisiert', String(S.idleUpd.length), S.idleUpd.length ? '<span class="stale">⚠ keine Meldung ' + period + '</span>' : 'alle haben gemeldet');
  $('devTop').innerHTML = top.map(function(r, i){ return devRow(r, i, maxAll, by); }).join('') || '<div class="empty">Noch kein Zuwachs ' + period + '.</div>';
  $('devTopNote').textContent = top.length ? 'Top ' + top.length : '';
  $('devLow').innerHTML = low.map(function(r, i){ return devRow(r, i, maxAll, by); }).join('') || '<div class="empty">Keine Daten ' + period + '.</div>';
  $('devLowNote').textContent = low.length ? 'schwächste ' + low.length : '';
  $('devStill').innerHTML = still.sort(function(a,b){ return b.idle - a.idle || b.cur - a.cur; }).map(function(r, i){
    return '<div class="dev" data-name="' + esc(r.p.name) + '"><span class="pos">' + (i + 1) + '</span>' +
      '<div class="who"><b>' + esc(r.p.name) + '</b><span>' + r.p.rank + ' · ' + fmt(r.cur) + ' M · aktualisiert ' + ago(r.p.updated) + '</span></div>' +
      '<div class="val stale">⏸ ' + (r.idle > 0 ? 'seit ' + r.idle + ' Tagen' : 'heute') + '<small>gleicher Wert gemeldet</small></div></div>';
  }).join('') || '<div class="empty">Niemand ohne Veränderung ' + period + '.</div>';
  $('devStillNote').textContent = still.length ? 'längster Stillstand zuerst' : '';
  $('devIdle').innerHTML = S.idleUpd.sort(function(a,b){ return a.updated - b.updated; }).map(function(p, i){
    return '<div class="dev" data-name="' + esc(p.name) + '"><span class="pos">' + (i + 1) + '</span>' +
      '<div class="who"><b>' + esc(p.name) + '</b><span>' + p.rank + ' · zuletzt am ' + fmtDate(p.updated) + '</span></div>' +
      '<div class="val stale">⚠ seit ' + daysSince(p.updated) + ' Tagen<small>Wert unbekannt</small></div></div>';
  }).join('') || '<div class="empty">Alle haben ' + period + ' aktualisiert.</div>';
  $('devFoot').textContent = (S.fresh.length ? S.fresh.length + ' Spieler sind für diesen Zeitraum zu neu (erste Meldung innerhalb des Zeitraums) und fehlen in der Wertung. ' : '') +
    'Spieler antippen für den Einzelverlauf.';
}

/* ---------- Export ---------- */
var SEL = null;
function initSel(){ if (SEL) { var keep = {}; D.players.forEach(function(p){ if (SEL[p.name]) keep[p.name] = 1; }); SEL = keep; return; }
  SEL = {}; D.players.forEach(function(p){ if (p.entry) SEL[p.name] = 1; }); }
function selected(){ return D.players.filter(function(p){ return SEL[p.name]; }); }
function metric(p, m){ return m === 'total' ? p.total : p.t1; }
function sortList(list, how){
  var c = {
    t1: function(a,b){ return b.t1 - a.t1 || b.total - a.total; },
    total: function(a,b){ return b.total - a.total || b.t1 - a.t1; },
    rank: function(a,b){ return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || b.t1 - a.t1; },
    name: function(a,b){ return a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }
  }[how];
  return list.slice().sort(function(a,b){ return (!!b.entry - !!a.entry) || c(a,b); });
}
function typeShort(t){ return TROOPS_SHORT[t] || ''; }
function squadText(s){ return s && s.type ? fmt(s.power) + ' ' + typeShort(s.type) : '-'; }
function playerLine(p, cols){
  if (!p.entry) return p.name + ' (' + p.rank + ') - keine Meldung';
  var t = p.name + ' (' + p.rank + ') - T1 ' + squadText(sq(p.entry,0));
  if (cols === 'all') { for (var i = 1; i < 4; i++) if (sq(p.entry,i).type) t += ' | T' + (i+1) + ' ' + squadText(sq(p.entry,i)); t += ' | Gesamt ' + fmt(p.total); }
  return t;
}
function exportText(){
  var list = sortList(selected(), $('expSort').value), cols = $('expCols').value;
  var head = 'SKWS Squads - Stand ' + fmtDate(Date.now()) + ' - ' + list.length + ' Spieler';
  return head + '\n\n' + list.map(function(p, i){ return (i + 1) + '. ' + playerLine(p, cols); }).join('\n');
}
function csvCell(v){ v = v === null || v === undefined ? '' : String(v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csvNum(v){ return v ? String(Math.round(v * 100) / 100).replace('.', ',') : ''; }
function csv(rows){ return rows.map(function(r){ return r.map(csvCell).join(';'); }).join('\r\n'); }
function playerRow(p){
  var r = [p.rank, p.name];
  for (var i = 0; i < 4; i++) { var s = sq(p.entry, i); r.push(s.type ? TROOPS[s.type] : '', s.type ? csvNum(s.power) : ''); }
  r.push(p.entry ? csvNum(p.total) : '', p.entry && p.entry.hero ? csvNum(p.entry.hero) : '', p.entry && p.entry.gstage ? String(p.entry.gstage) : '', p.entry && p.entry.gorilla ? String(p.entry.gorilla) : '', p.entry && p.entry.gpower ? String(Math.round(p.entry.gpower)) : '', p.entry ? fmtDateTime(p.updated) : 'keine Meldung');
  return r;
}
var CSV_HEAD = ['Rang','Name','T1 Typ','T1 Kampfkraft (Mio.)','T2 Typ','T2 Kampfkraft (Mio.)','T3 Typ','T3 Kampfkraft (Mio.)','T4 Typ','T4 Kampfkraft (Mio.)','Gesamt (Mio.)','Heldenkraft (Mio.)','Gorilla-Stufe','Gorilla-Level','Gorilla-Kraft','Stand'];
function download(name, text){
  if (window.SKWSAndroid && window.SKWSAndroid.saveFile) { window.SKWSAndroid.saveFile(name, '\ufeff' + text, 'text/csv'); return; }
  var blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function copyText(text, noteId){
  function ok(){ var n = $(noteId); n.textContent = 'In die Zwischenablage kopiert.'; n.className = 'note ok'; }
  function fallback(){ var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch(e) { var n = $(noteId); n.textContent = 'Kopieren nicht möglich – bitte Text markieren und kopieren.'; n.className = 'note err'; } ta.remove(); }
  if (window.SKWSAndroid && window.SKWSAndroid.copy) { window.SKWSAndroid.copy(text); ok(); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
}
function fileDate(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

function renderExport(){
  initSel();
  var q = $('selSearch').value.trim().toLowerCase();
  var list = D.players.slice().sort(function(a,b){ return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || b.t1 - a.t1 || a.name.localeCompare(b.name); })
    .filter(function(p){ return !q || p.name.toLowerCase().indexOf(q) >= 0; });
  $('pickList').innerHTML = list.map(function(p){
    return '<label class="' + (p.entry ? '' : 'nodata') + '"><input type="checkbox" data-name="' + esc(p.name) + '"' + (SEL[p.name] ? ' checked' : '') + '>' +
      '<span class="nm">' + esc(p.name) + '</span><span class="meta' + (p.stale ? ' stale' : '') + '">' + p.rank + ' · ' + (p.entry ? 'T1 ' + fmt(p.t1) + ' ' + typeShort(sq(p.entry,0).type) + ' · ' + fmtDate(p.updated) : 'keine Meldung') + '</span></label>';
  }).join('') || '<div class="empty">Keine Treffer.</div>';
  updateSelCount();
}
function updateSelCount(){ $('selCount').textContent = selected().length; $('expPreview').value = exportText(); $('expNote').textContent = ''; }
