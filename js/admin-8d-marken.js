/* SKWS Squads – Admin: Teilnehmermarken (automatisch aus Events, dazu eigene Marken) */
var BDG = null, BDG_NAMES = [], BDG_ICON = '🎖️';
var BDG_ICONS = ['🎖️','🏅','🧟','🏰','⚔️','🛡️','🚂','🎯','🌟','🔥','🐉','🎉'];
function bdgLoad(){
  return rpc('admin_badge', { p_pw: PW, p_action: 'list' }).then(function(r){ BDG = r.items || []; if (!$('tab-bdg').classList.contains('hide')) bdgRender(); })
    .catch(function(){ BDG = null; if (!$('tab-bdg').classList.contains('hide')) bdgRender(); });
}
function bdgRender(){
  // 1) automatisch aus den Anmelderunden
  var rounds = (EV || []).slice().sort(function(a, b){ return b.id - a.id; });
  $('bdgAuto').innerHTML = rounds.length ? rounds.map(function(r){
    var lu = r.lineup || {}, abs = r.absent || [], st = Object.keys(lu).filter(function(n){ return lu[n] === 'AS' || lu[n] === 'BS'; }), got = st.filter(function(n){ return abs.indexOf(n) < 0; });
    var state = !Object.keys(lu).length ? '<span class="muted">keine Aufstellung gespeichert – keine Marken</span>' : r.open ? '<span class="warn">wird vergeben, sobald die Runde geschlossen ist</span>' : '<span class="up">vergeben</span>';
    return '<div class="bdg-row"><div class="bdg-ic ' + r.kind + '">' + (r.kind === 'cs' ? '🧪' : '🏜️') + '</div><div class="bdg-tx"><b>' + (r.kind === 'cs' ? 'Schluchtsturm' : 'Wüstensturm') + ' ' + esc(r.label) + '</b><div class="small">' + state + '</div>' +
      (got.length ? '<details><summary class="small">' + got.length + ' Marken' + (abs.length ? ' · ' + abs.length + ' gefehlt (ohne Marke)' : '') + '</summary><div class="small" style="margin-top:4px">' + got.map(esc).join(', ') + '</div></details>' : '') + '</div></div>';
  }).join('') : '<div class="empty">Noch keine Anmelderunden.</div>';
  // 2) Formular
  $('bdgIcons').innerHTML = BDG_ICONS.map(function(i){ return '<button class="bdg-pick' + (i === BDG_ICON ? ' on' : '') + '" data-bdgicon="' + i + '">' + i + '</button>'; }).join('');
  var sel = $('bdgAdd'); sel.innerHTML = '<option value="">+ Spieler hinzufügen</option>' + D.players.map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('');
  $('bdgChips').innerHTML = BDG_NAMES.map(function(n){ return '<span class="chip">' + esc(n) + ' <a data-bdgrm="' + esc(n) + '">✕</a></span>'; }).join('');
  $('bdgCount').textContent = BDG_NAMES.length ? BDG_NAMES.length + ' Spieler ausgewählt' : 'Noch niemand ausgewählt.';
  // 3) eigene Marken, gruppiert
  if (!BDG) { $('bdgList').innerHTML = '<div class="empty">Lädt … (oder die Datenbank-Erweiterung „marken“ fehlt noch)</div>'; $('bdgTable').innerHTML = ''; return; }
  var groups = {}; BDG.forEach(function(b){ (groups[b.key] = groups[b.key] || []).push(b); });
  var keys = Object.keys(groups);
  $('bdgList').innerHTML = keys.length ? keys.map(function(k){ var g = groups[k], b = g[0];
    return '<div class="bdg-row"><div class="bdg-ic x">' + esc(b.icon || '🎖️') + '</div><div class="bdg-tx"><b>' + esc(b.label) + '</b><div class="small muted">' + fmtDate(new Date(b.t)) + (b.by ? ' · ' + esc(b.by) : '') + '</div>' +
      '<details><summary class="small">' + g.length + ' Spieler</summary><div class="small" style="margin-top:4px">' + g.map(function(x){ return esc(x.name) + ' <a class="muted" data-bdgdel1="' + x.id + '" title="Marke bei diesem Spieler löschen">✕</a>'; }).join(' · ') + '</div></details></div>' +
      '<button class="mini" data-bdgmore="' + esc(k) + '">+ Spieler</button><button class="mini danger" data-bdgdel="' + esc(k) + '">Löschen</button></div>';
  }).join('') : '<div class="empty">Noch keine eigenen Marken vergeben.</div>';
  // 4) Übersicht je Spieler
  var own = {}; BDG.forEach(function(b){ own[b.name] = (own[b.name] || 0) + 1; });
  var rows = D.players.map(function(p){ var s = (PSTATS && PSTATS[p.name]) || {}; return { n: p.name, ds: s.pds || 0, cs: s.pcs || 0, x: own[p.name] || 0 }; });
  rows.forEach(function(r){ r.t = r.ds + r.cs + r.x; });
  rows.sort(function(a, b){ return b.t - a.t || a.n.localeCompare(b.n, 'de', {sensitivity:'base'}); });
  var q = ($('bdgQ').value || '').trim().toLowerCase(); if (q) rows = rows.filter(function(r){ return r.n.toLowerCase().indexOf(q) >= 0; });
  $('bdgTable').innerHTML = '<tr><th class="sticky">Spieler</th><th class="n">🏜️ WS</th><th class="n">🧪 SS</th><th class="n">🎖️ Eigene</th><th class="n">Gesamt</th></tr>' +
    rows.map(function(r){ return '<tr class="click" data-bdgname="' + esc(r.n) + '"><td class="sticky">' + av(r.n) + esc(r.n) + '</td><td class="n">' + r.ds + '</td><td class="n">' + r.cs + '</td><td class="n">' + r.x + '</td><td class="n"><b>' + r.t + '</b></td></tr>'; }).join('');
}
function bdgGive(key){
  var label = $('bdgLabel').value.trim(), m = $('bdgMsg');
  if (!label && !key) { m.textContent = 'Bitte eine Bezeichnung eingeben.'; m.className = 'msg err'; return; }
  if (!BDG_NAMES.length) { m.textContent = 'Bitte Spieler auswählen.'; m.className = 'msg err'; return; }
  var data = { names: BDG_NAMES.slice(), label: label, icon: BDG_ICON };
  if (key) { var g = BDG.filter(function(b){ return b.key === key; })[0]; data.key = key; data.label = g.label; data.icon = g.icon; }
  rpc('admin_badge', { p_pw: PW, p_action: 'add', p_data: data, p_actor: ACTOR || null }).then(function(r){
    m.textContent = 'Marke „' + data.label + '“ an ' + r.count + ' Spieler vergeben.'; m.className = 'msg ok'; BDG_NAMES = []; $('bdgLabel').value = ''; BDG_KEY = null; $('bdgGive').textContent = '🎖️ Marke vergeben'; return bdgLoad();
  }).catch(function(e){ m.textContent = 'Fehler: ' + e.message; m.className = 'msg err'; });
}
var BDG_KEY = null;
$('bdgAdd').addEventListener('change', function(){ if (this.value && BDG_NAMES.indexOf(this.value) < 0) BDG_NAMES.push(this.value); this.value = ''; bdgRender(); });
$('bdgAll').addEventListener('click', function(){ BDG_NAMES = D.players.map(function(p){ return p.name; }); bdgRender(); });
$('bdgNone').addEventListener('click', function(){ BDG_NAMES = []; bdgRender(); });
$('bdgGive').addEventListener('click', function(){ bdgGive(BDG_KEY); });
$('bdgQ').addEventListener('input', bdgRender);
$('tab-bdg').addEventListener('click', function(e){
  var t;
  if ((t = e.target.closest('[data-bdgicon]'))) { BDG_ICON = t.dataset.bdgicon; bdgRender(); return; }
  if ((t = e.target.closest('[data-bdgrm]'))) { BDG_NAMES = BDG_NAMES.filter(function(n){ return n !== t.dataset.bdgrm; }); bdgRender(); return; }
  if ((t = e.target.closest('[data-bdgmore]'))) { BDG_KEY = t.dataset.bdgmore; var g = BDG.filter(function(b){ return b.key === BDG_KEY; })[0]; $('bdgLabel').value = g.label; BDG_ICON = g.icon || '🎖️'; BDG_NAMES = [];
    $('bdgGive').textContent = '🎖️ „' + g.label + '“ weiteren Spielern geben'; bdgRender(); $('bdgLabel').scrollIntoView({ block:'center' }); return; }
  if ((t = e.target.closest('[data-bdgdel]'))) { if (!confirm('Diese Marke bei allen Spielern löschen?')) return;
    rpc('admin_badge', { p_pw: PW, p_action: 'delete', p_data: { key: t.dataset.bdgdel }, p_actor: ACTOR || null }).then(bdgLoad); return; }
  if ((t = e.target.closest('[data-bdgdel1]'))) { if (!confirm('Marke bei diesem Spieler löschen?')) return;
    rpc('admin_badge', { p_pw: PW, p_action: 'delete', p_data: { id: +t.dataset.bdgdel1 }, p_actor: ACTOR || null }).then(bdgLoad); return; }
  if ((t = e.target.closest('[data-bdgname]'))) { curPlayer = t.dataset.bdgname; $('plSelect').value = curPlayer; showTab('pl'); window.scrollTo(0, 0); }
});
