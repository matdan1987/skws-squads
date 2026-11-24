/* SKWS Squads – Admin: bonusmalus (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Avatare ---------- */
var AVA = {}, AVA_DONE = false;
function avLoad(){
  rpc('get_avatars', { p_names: null }).then(function(r){ AVA = {}; Object.keys(r || {}).forEach(function(n){ AVA[n] = r[n].d; }); AVA_DONE = true;
    var t = store('skws_admin_tab') || 'ov'; if (D) { renderMembers(); showTab(t); } }).catch(function(){});
}
function av(name, size){
  size = size || 32;
  if (AVA[name]) return '<span class="av" style="width:' + size + 'px;height:' + size + 'px"><img src="' + AVA[name] + '" alt=""></span>';
  var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return '<span class="av" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .45) + 'px;background:hsl(' + h + ',60%,62%)">' + esc((name.match(/[A-Za-z0-9À-ž]/) || [name[0] || '?'])[0].toUpperCase()) + '</span>';
}

/* ---------- Bonus/Malus ---------- */
var MER = [], MERCFG = null;
var MER_EFF = { block:'gesperrt', sub:'nur Ersatz', prio:'Vorrang', none:'nur vermerkt' };
var MER_SCOPE = { both:'Wüstensturm + Schluchtsturm', ds:'Wüstensturm', cs:'Schluchtsturm' };
var MER_VIS = { public:'👁 öffentlich', player:'👤 nur der Spieler', hidden:'🔒 nur R4/R5' };
function merVisBadge(m){ var v = m.vis || 'public'; return '<span class="visb vis-' + v + '">' + MER_VIS[v] + '</span>'; }
var MER_DEF = { reasons: [
  { r:'Angemeldet, aber nicht erschienen', k:'malus', e:'sub', s:'both', n:2 },
  { r:'Anweisungen im Event ignoriert / Gebäude verlassen', k:'malus', e:'sub', s:'both', n:1 },
  { r:'Zu viele Punkte in der VS-Sparwoche', k:'malus', e:'sub', s:'both', n:2 },
  { r:'Keine Zug-Tickets gespendet', k:'malus', e:'sub', s:'both', n:1 },
  { r:'Allianz-Aufgabe nicht erledigt', k:'malus', e:'sub', s:'both', n:1 },
  { r:'Unsoziales Verhalten', k:'malus', e:'block', s:'both', n:2 },
  { r:'Verwarnung (ohne Folgen)', k:'malus', e:'none', s:'both', n:'' },
  { r:'Kurzfristig als Ersatz eingesprungen', k:'bonus', e:'prio', s:'both', n:1 },
  { r:'Besonders gut gespielt (MVP)', k:'bonus', e:'prio', s:'both', n:2 },
  { r:'Besonders hilfsbereit / sozial', k:'bonus', e:'prio', s:'both', n:1 },
  { r:'Lob (ohne Folgen)', k:'bonus', e:'none', s:'both', n:'' }
] };
function merCat(){ return (MERCFG && MERCFG.reasons) ? MERCFG : JSON.parse(JSON.stringify(MER_DEF)); }
function merActive(name){ return MER.filter(function(m){ return m.active && (!name || m.name === name); }); }
function merLeft(m, kind){ return kind === 'ds' ? m.left_ds : kind === 'cs' ? m.left_cs : null; }
// Wirkung für ein Event: gilt der Eintrag dort (Rest-Runden > 0 bzw. ohne Rundenlimit)?
function merApplies(m, kind){
  if (!m.active || m.effect === 'none') return false;
  if (m.scope !== 'both' && m.scope !== kind) return false;
  var l = merLeft(m, kind); return l === null || l === undefined || l > 0;
}
function merEff(name, kind){ var o = { block:false, sub:false, prio:false, list:[] }; merActive(name).forEach(function(m){ if (merApplies(m, kind)) { o[m.effect] = true; o.list.push(m); } }); if (o.block) o.prio = false; return o; }
function merDur(m){
  var p = [];
  if (m.rounds !== null && m.rounds !== undefined) {
    if (m.scope === 'both') p.push('WS noch ' + (m.left_ds || 0) + ', SS noch ' + (m.left_cs || 0) + ' von ' + m.rounds + ' Runde(n)');
    else p.push('noch ' + (merLeft(m, m.scope) || 0) + ' von ' + m.rounds + ' Runde(n)');
  }
  if (m.until) p.push('bis ' + fmtDate(new Date(m.until)));
  if (!p.length) p.push(m.effect === 'none' ? '–' : 'bis zur Rücknahme');
  return p.join(' · ');
}
function merBadge(name, kind){
  var list = merActive(name).filter(function(m){ return m.effect !== 'none' && (!kind || merApplies(m, kind)); });
  return list.map(function(m){ var bad = m.kind === 'malus';
    return '<span class="mgb' + (bad ? '' : ' r') + '" style="' + (bad ? 'border-color:rgba(255,107,107,.5);color:var(--err)' : 'border-color:rgba(61,220,151,.5);color:var(--ok)') + '" title="' + esc(m.reason + ' · ' + merDur(m)) + '">' + (bad ? '▼ ' : '▲ ') + MER_EFF[m.effect] + '</span>'; }).join('');
}
function merFillForm(){
  var cat = merCat(), sel = $('merReason'), cur = sel.value;
  sel.innerHTML = '<optgroup label="Malus">' + cat.reasons.map(function(x, i){ return x.k === 'malus' ? '<option value="' + i + '">' + esc(x.r) + '</option>' : ''; }).join('') + '</optgroup>' +
    '<optgroup label="Bonus">' + cat.reasons.map(function(x, i){ return x.k === 'bonus' ? '<option value="' + i + '">' + esc(x.r) + '</option>' : ''; }).join('') + '</optgroup>' +
    '<option value="own">Eigener Grund …</option>';
  if (cur && sel.querySelector('option[value="' + cur + '"]')) sel.value = cur;
  var ns = $('merName'), nc = ns.value;
  ns.innerHTML = '<option value="">– Spieler –</option>' + D.players.filter(function(p){ return p.active; }).sort(function(a, b){ return a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); }).map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('');
  if (nc) ns.value = nc;
}
function merApplyReason(){
  var v = $('merReason').value; $('merOwnBox').classList.toggle('hide', v !== 'own');
  if (v === 'own' || v === '') { merHint(); return; }
  var x = merCat().reasons[+v]; if (!x) return;
  $('merKind').value = x.k; $('merEffect').value = x.e; $('merScope').value = x.s; $('merVis').value = x.v || 'public'; $('merRounds').value = x.n === '' || x.n === null || x.n === undefined ? '' : x.n; $('merUntil').value = '';
  merHint(true);
}
// Wiederholung: gleicher Malus-Grund innerhalb von 28 Tagen -> doppelte Dauer vorschlagen
function merHint(setDouble){
  var nm = $('merName').value, v = $('merReason').value, reason = v === 'own' ? $('merOwn').value.trim() : (merCat().reasons[+v] || {}).r, h = $('merHint');
  h.textContent = ''; h.className = 'note';
  if (!nm || !reason) return;
  var prev = MER.filter(function(m){ return m.name === nm && m.kind === 'malus' && m.reason === reason && !m.revoked_at && (Date.now() - new Date(m.created_at)) < 28 * DAY; });
  if (prev.length && $('merKind').value === 'malus') {
    h.textContent = nm + ' hat diesen Malus schon am ' + fmtDate(new Date(prev[0].created_at)) + ' bekommen – Wiederholung, doppelte Dauer vorgeschlagen.'; h.className = 'note err';
    if (setDouble && $('merRounds').value) $('merRounds').value = Math.min(50, (+$('merRounds').value || 1) * 2);
  }
  var act = merActive(nm).filter(function(m){ return m.effect !== 'none'; });
  if (act.length) { h.textContent += (h.textContent ? ' ' : '') + 'Aktiv: ' + act.map(function(m){ return (m.kind === 'malus' ? 'Malus ' : 'Bonus ') + MER_EFF[m.effect] + ' (' + m.reason + ')'; }).join('; '); if (!prev.length) h.className = 'note ok'; }
}
function merRow(m, old){
  var bad = m.kind === 'malus';
  return '<tr><td class="sticky">' + av(m.name) + '<b>' + esc(m.name) + '</b><div class="tl">' + fmtDate(new Date(m.created_at)) + (m.by ? ' · ' + esc(m.by) : '') + '</div></td>' +
    '<td><span class="' + (bad ? 'down' : 'up') + '">' + (bad ? '▼ Malus' : '▲ Bonus') + '</span><div class="tl">' + MER_EFF[m.effect] + ' · ' + MER_SCOPE[m.scope] + '</div>' +
      '<select class="visel" data-mervis="' + m.id + '">' + Object.keys(MER_VIS).map(function(k){ return '<option value="' + k + '"' + ((m.vis || 'public') === k ? ' selected' : '') + '>' + MER_VIS[k] + '</option>'; }).join('') + '</select></td>' +
    '<td style="white-space:normal">' + esc(m.reason) + (m.note ? '<div class="tl" style="white-space:normal">' + esc(m.note) + '</div>' : '') + '</td>' +
    '<td style="white-space:normal">' + (m.revoked_at ? '<span class="muted">zurückgenommen ' + fmtDate(new Date(m.revoked_at)) + (m.revoked_by ? ' von ' + esc(m.revoked_by) : '') + '</span>' : esc(old ? 'abgelaufen' : merDur(m))) + '</td>' +
    '<td style="text-align:right">' + (!old && !m.revoked_at ? '<button class="mini danger" data-merrev="' + m.id + '">Zurücknehmen</button>' : '') + '</td></tr>';
}
function merRender(){
  if (!D) return;
  merFillForm(); if (!$('merReason').value) $('merReason').selectedIndex = 0;
  var q = $('merSearch').value.trim().toLowerCase(), f = function(m){ return !q || m.name.toLowerCase().indexOf(q) >= 0; };
  var act = MER.filter(function(m){ return m.active; }), old = MER.filter(function(m){ return !m.active; });
  var head = '<tr><th class="sticky">Spieler</th><th>Art</th><th>Grund</th><th>Dauer</th><th></th></tr>';
  $('merActiveCount').textContent = act.length; $('merOldCount').textContent = old.length;
  $('merActive').innerHTML = act.filter(f).length ? head + act.filter(f).map(function(m){ return merRow(m, false); }).join('') : '<tr><td class="muted">Keine aktiven Einträge.</td></tr>';
  $('merOld').innerHTML = old.filter(f).length ? head + old.filter(f).map(function(m){ return merRow(m, true); }).join('') : '<tr><td class="muted">Noch nichts.</td></tr>';
  var c = function(k, e){ return act.filter(function(m){ return m.kind === k && (!e || m.effect === e); }).length; };
  $('merTiles').innerHTML = tile('Aktive Malus', String(c('malus')), c('malus', 'block') + ' gesperrt · ' + c('malus', 'sub') + ' nur Ersatz') + tile('Aktive Bonus', String(c('bonus')), c('bonus', 'prio') + ' mit Vorrang') +
    tile('Einträge gesamt', String(MER.length), 'seit Start');
  merRenderCat(); merHint(false); merBilanz();
}
// Bilanz: alle Spieler (auch ausgeschiedene) mit Bonus/Malus – auch geheime Einträge, zurückgenommene zählen nicht
function merBilanz(){
  var by = {}, q = ($('merBilQ').value || '').trim().toLowerCase(), sort = $('merBilSort').value;
  MER.forEach(function(m){ if (m.revoked_at) return; var o = by[m.name] = by[m.name] || { b:0, d:0, h:0, last:null };
    if (m.kind === 'bonus') o.b++; else o.d++; if ((m.vis || 'public') !== 'public') o.h++; if (!o.last || new Date(m.created_at) > new Date(o.last)) o.last = m.created_at; });
  var act = {}; D.all.forEach(function(p){ act[p.name] = p; });
  var rows = Object.keys(by).filter(function(n){ return !q || n.toLowerCase().indexOf(q) >= 0; }).map(function(n){ return { n: n, o: by[n], p: act[n] }; });
  rows.sort(function(a, b){ return sort === 'b' ? b.o.b - a.o.b || a.o.d - b.o.d : sort === 'n' ? a.n.localeCompare(b.n, 'de', {sensitivity:'base'}) : sort === 's' ? (b.o.b - b.o.d) - (a.o.b - a.o.d) : b.o.d - a.o.d || a.o.b - b.o.b; });
  $('merBil').innerHTML = rows.length ? '<tr><th class="sticky">Spieler</th><th class="n">▲ Bonus</th><th class="n">▼ Malus</th><th class="n">Bilanz</th><th>davon nicht öffentlich</th><th>letzter Eintrag</th></tr>' + rows.map(function(r){
    var s = r.o.b - r.o.d;
    return '<tr class="click" data-bilname="' + esc(r.n) + '"><td class="sticky">' + av(r.n) + '<b>' + esc(r.n) + '</b>' + (r.p && !r.p.active ? ' <span class="muted small">(ausgeschieden)</span>' : '') + '</td>' +
      '<td class="n up">' + r.o.b + '</td><td class="n down">' + r.o.d + '</td><td class="n ' + (s > 0 ? 'up' : s < 0 ? 'down' : 'muted') + '">' + (s > 0 ? '+' : '') + s + '</td>' +
      '<td>' + (r.o.h ? '🔒 ' + r.o.h : '<span class="muted">–</span>') + '</td><td>' + fmtDate(new Date(r.o.last)) + '</td></tr>';
  }).join('') : '<tr><td class="muted">Keine Einträge.</td></tr>';
}
function merRenderCat(){
  var cat = merCat();
  $('merCat').innerHTML = cat.reasons.map(function(x, i){
    function sel(field, opts, v){ return '<select data-mc="' + field + '" data-i="' + i + '">' + Object.keys(opts).map(function(k){ return '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + opts[k] + '</option>'; }).join('') + '</select>'; }
    return '<div class="mcrow ' + x.k + '"><div class="top"><input data-mc="r" data-i="' + i + '" type="text" maxlength="80" value="' + esc(x.r) + '" aria-label="Grund">' +
      '<button class="mini danger" data-mcdel="' + i + '" title="Grund löschen">✕</button></div><div class="grid">' +
      '<div><label>Art</label>' + sel('k', { malus:'Malus', bonus:'Bonus' }, x.k) + '</div>' +
      '<div><label>Wirkung</label>' + sel('e', MER_EFF, x.e) + '</div>' +
      '<div><label>Gilt für</label>' + sel('s', { both:'beide Events', ds:'Wüstensturm', cs:'Schluchtsturm' }, x.s) + '</div>' +
      '<div><label>Sichtbar</label>' + sel('v', MER_VIS, x.v || 'public') + '</div>' +
      '<div><label>Runden</label><input data-mc="n" data-i="' + i + '" type="number" min="0" max="50" placeholder="–" value="' + (x.n === '' || x.n === null || x.n === undefined ? '' : x.n) + '"></div>' +
      '</div></div>';
  }).join('');
}
var MER_EDIT = null;
function merCatEdit(){ if (!MER_EDIT) MER_EDIT = merCat(); return MER_EDIT; }
(function(){
  $('merReason').addEventListener('change', merApplyReason);
  $('merName').addEventListener('change', function(){ merHint(false); });
  $('merKind').addEventListener('change', function(){ merHint(false); });
  $('merOwn').addEventListener('input', function(){ merHint(false); });
  $('merSearch').addEventListener('input', merRender);
  $('merAdd').addEventListener('click', function(){
    var nm = $('merName').value, v = $('merReason').value, reason = v === 'own' ? $('merOwn').value.trim() : (merCat().reasons[+v] || {}).r, n = $('merMsg'), hint = $('merHint');
    if (!nm || !reason) { hint.textContent = 'Bitte Spieler und Grund wählen.'; hint.className = 'note err'; return; }
    var data = { name: nm, kind: $('merKind').value, effect: $('merEffect').value, scope: $('merScope').value, vis: $('merVis').value, reason: reason, note: $('merNote').value.trim(),
      rounds: $('merRounds').value === '' ? '' : String(Math.max(0, Math.min(50, parseInt($('merRounds').value, 10) || 0))), until: $('merUntil').value ? new Date($('merUntil').value + 'T23:59:00').toISOString() : '' };
    if (data.effect !== 'none' && data.rounds === '' && !data.until && !confirm('Ohne Runden und ohne Datum gilt der Eintrag, bis du ihn zurücknimmst. Trotzdem speichern?')) return;
    hint.textContent = '…'; hint.className = 'note ok';
    rpc('admin_merit', { p_pw: PW, p_action: 'add', p_data: data, p_actor: ACTOR || null }).then(function(){
      return load(PW, true).then(function(){ showTab('mer'); $('merNote').value = ''; $('merOwn').value = ''; $('merHint').textContent = 'Gespeichert: ' + (data.kind === 'bonus' ? 'Bonus' : 'Malus') + ' für ' + nm + '.'; $('merHint').className = 'note ok'; });
    }).catch(function(err){ var m = String(err && err.message); hint.textContent = m.indexOf('ERR_AUTH') >= 0 ? 'Nicht angemeldet – bitte neu anmelden.' : 'Fehler – ist die Datenbank-Erweiterung „bonus-malus“ schon eingespielt?'; hint.className = 'note err'; });
  });
  $('tab-mer').addEventListener('click', function(e){
    var b = e.target.closest('[data-merrev]'); if (b) {
      var m = MER.filter(function(x){ return x.id === +b.dataset.merrev; })[0]; if (!m || !confirm((m.kind === 'bonus' ? 'Bonus' : 'Malus') + ' „' + m.reason + '“ von ' + m.name + ' zurücknehmen?')) return;
      rpc('admin_merit', { p_pw: PW, p_action: 'revoke', p_data: { id: m.id }, p_actor: ACTOR || null }).then(function(){ return load(PW, true).then(function(){ showTab('mer'); $('merMsg').textContent = 'Zurückgenommen.'; $('merMsg').className = 'note ok'; }); })
        .catch(function(){ $('merMsg').textContent = 'Fehler beim Zurücknehmen.'; $('merMsg').className = 'note err'; });
      return;
    }
    var d = e.target.closest('[data-mcdel]'); if (d) { var c = merCatEdit(); c.reasons.splice(+d.dataset.mcdel, 1); MERCFG = c; merRenderCat(); merFillForm(); $('merCatMsg').textContent = 'Noch nicht gespeichert.'; $('merCatMsg').className = 'note err'; }
  });
  $('tab-mer').addEventListener('change', function(e){
    var s = e.target.closest('[data-mervis]'); if (!s) return;
    rpc('admin_merit', { p_pw: PW, p_action: 'vis', p_data: { id: +s.dataset.mervis, vis: s.value }, p_actor: ACTOR || null })
      .then(function(){ var m = MER.filter(function(x){ return x.id === +s.dataset.mervis; })[0]; if (m) m.vis = s.value; $('merMsg').textContent = 'Sichtbarkeit geändert.'; $('merMsg').className = 'note ok'; merBilanz(); })
      .catch(function(){ $('merMsg').textContent = 'Fehler – ist die Datenbank-Erweiterung „geschenke“ eingespielt?'; $('merMsg').className = 'note err'; });
  });
  $('merBilQ').addEventListener('input', merBilanz);
  $('merBilSort').addEventListener('change', merBilanz);
  $('merBil').addEventListener('click', function(e){ var tr = e.target.closest('[data-bilname]'); if (!tr) return; curPlayer = tr.dataset.bilname; $('plSelect').value = curPlayer; showTab('pl'); window.scrollTo(0, 0); });
  $('merCat').addEventListener('change', function(e){
    var el = e.target.closest('[data-mc]'); if (!el) return; var c = merCatEdit(), x = c.reasons[+el.dataset.i], f = el.dataset.mc;
    x[f] = f === 'n' ? (el.value === '' ? '' : Math.max(0, Math.min(50, parseInt(el.value, 10) || 0))) : el.value; MERCFG = c; merFillForm();
    if (f === 'k') { var rw = el.closest('.mcrow'); rw.classList.remove('malus', 'bonus'); rw.classList.add(x.k); }
    $('merCatMsg').textContent = 'Noch nicht gespeichert.'; $('merCatMsg').className = 'note err';
  });
  $('merCatAdd').addEventListener('click', function(){ var c = merCatEdit(); c.reasons.push({ r:'Neuer Grund', k:'malus', e:'sub', s:'both', n:1 }); MERCFG = c; merRenderCat(); merFillForm(); });
  $('merCatSave').addEventListener('click', function(){
    var c = merCatEdit(); c.reasons = c.reasons.filter(function(x){ return x.r && x.r.trim(); });
    rpc('admin_merit', { p_pw: PW, p_action: 'config', p_data: { cfg: c }, p_actor: ACTOR || null }).then(function(){ MER_EDIT = null; return load(PW, true).then(function(){ showTab('mer'); $('merCatMsg').textContent = 'Gründe-Liste gespeichert.'; $('merCatMsg').className = 'note ok'; }); })
      .catch(function(){ $('merCatMsg').textContent = 'Fehler beim Speichern.'; $('merCatMsg').className = 'note err'; });
  });
})();
