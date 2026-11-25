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
/* ---------- Selbstmeldung „Ich war dabei“ und Saison-Plaketten ---------- */
var CLM = null, CLM_ICON = '🧟';
function clmLoad(){
  return rpc('admin_claim', { p_pw: PW, p_action: 'list' }).then(function(r){ CLM = r; clmRender(); }).catch(function(){ CLM = null; clmRender(); });
}
function clmRender(){
  $('clmIcons').innerHTML = BDG_ICONS.map(function(i){ return '<button class="bdg-pick' + (i === CLM_ICON ? ' on' : '') + '" data-clmicon="' + i + '">' + i + '</button>'; }).join('');
  if (!CLM) { $('clmList').innerHTML = '<div class="empty">Lädt … (oder die Datenbank-Erweiterung „plaketten“ fehlt noch)</div>'; $('seaList').innerHTML = ''; return; }
  $('clmList').innerHTML = CLM.events.length ? CLM.events.map(function(e){
    var pend = e.claims.filter(function(c){ return c.status === 'pending'; }), ok = e.claims.filter(function(c){ return c.status === 'ok'; }), no = e.claims.filter(function(c){ return c.status === 'no'; });
    return '<div class="clm-ev"><div class="bdg-row" style="border:0"><div class="bdg-ic x">' + esc(e.icon || '🎖️') + '</div><div class="bdg-tx"><b>' + esc(e.label) + '</b><div class="small muted">' + fmtDate(new Date(e.t)) + ' · ' + (e.open ? '<span class="up">Meldung offen</span>' : 'geschlossen') +
      ' · ' + ok.length + ' bestätigt' + (pend.length ? ' · <span class="warn">' + pend.length + ' offen</span>' : '') + (no.length ? ' · ' + no.length + ' abgelehnt' : '') + '</div></div>' +
      '<button class="mini" data-clmtoggle="' + e.id + '" data-open="' + (e.open ? 1 : 0) + '">' + (e.open ? 'Schließen' : 'Öffnen') + '</button><button class="mini danger" data-clmdel="' + e.id + '">Löschen</button></div>' +
      (pend.length ? '<div class="clm-pend">' + pend.map(function(c){ return '<label class="chip" style="display:inline-flex;align-items:center;gap:6px;margin:2px"><input type="checkbox" data-clmn="' + esc(c.name) + '" data-ev="' + e.id + '" checked style="width:16px;height:16px">' + av(c.name, 22) + esc(c.name) + '</label>'; }).join('') +
        '<div class="btnrow" style="margin-top:6px"><button class="btn2" data-clmok="' + e.id + '">✅ Angehakte bestätigen</button><button class="btn2" data-clmno="' + e.id + '">✖ Angehakte ablehnen</button></div></div>' : '') +
      (ok.length || no.length ? '<details><summary class="small">Entschiedene anzeigen</summary><div class="small" style="margin-top:4px">' + ok.map(function(c){ return '✅ ' + esc(c.name) + ' <a class="muted" data-clmre="' + esc(c.name) + '" data-ev="' + e.id + '" data-st="no" title="doch ablehnen">✕</a>'; }).concat(no.map(function(c){ return '✖ ' + esc(c.name) + ' <a class="muted" data-clmre="' + esc(c.name) + '" data-ev="' + e.id + '" data-st="ok" title="doch bestätigen">✓</a>'; })).join(' · ') + '</div></details>' : '') + '</div>';
  }).join('') : '<div class="empty">Noch keine Selbstmelde-Events.</div>';
  $('seaList').innerHTML = CLM.seasons.length ? CLM.seasons.map(function(s){ return '<div class="bdg-row"><div class="bdg-ic x">' + esc(s.icon || '🎄') + '</div><div class="bdg-tx"><b>' + esc(s.label) + '</b><div class="small muted">' + fmtDate(new Date(s.from)) + ' – ' + fmtDate(new Date(s.to)) + '</div></div><button class="mini danger" data-seadel="' + s.id + '">Löschen</button></div>'; }).join('')
    : '<div class="empty">Noch keine Saison-Plaketten. Beispiel: „Weihnachten 2026“ vom 20.12. bis 31.12.</div>';
}
function clmAct(action, data, msg){
  return rpc('admin_claim', { p_pw: PW, p_action: action, p_data: data, p_actor: ACTOR || null }).then(function(){ if (msg) { $('clmMsg').textContent = msg; $('clmMsg').className = 'msg ok'; } return clmLoad(); })
    .catch(function(e){ $('clmMsg').textContent = 'Fehler: ' + e.message; $('clmMsg').className = 'msg err'; });
}
$('clmCreate').addEventListener('click', function(){ var l = $('clmLabel').value.trim(); if (!l) { $('clmMsg').textContent = 'Bitte eine Bezeichnung eingeben.'; $('clmMsg').className = 'msg err'; return; }
  clmAct('create', { label: l, icon: CLM_ICON }, 'Angelegt – die Spieler sehen „Warst du dabei?“ auf der Eintragen-Seite, sobald sie mit PIN angemeldet sind.').then(function(){ $('clmLabel').value = ''; }); });
$('seaAdd').addEventListener('click', function(){ var l = $('seaLabel').value.trim(), f = $('seaFrom').value, t = $('seaTo').value;
  if (!l || !f || !t || t < f) { $('seaMsg').textContent = 'Bitte Bezeichnung und gültigen Zeitraum angeben.'; $('seaMsg').className = 'msg err'; return; }
  rpc('admin_claim', { p_pw: PW, p_action: 'season_add', p_data: { label: l, icon: $('seaIcon').value || '🎄', from: f, to: t }, p_actor: ACTOR || null }).then(function(){ $('seaLabel').value = ''; $('seaMsg').textContent = 'Gespeichert. Alle, die im Zeitraum Mitglied waren, bekommen die Plakette, sobald er begonnen hat.'; $('seaMsg').className = 'msg ok'; return clmLoad(); })
    .catch(function(e){ $('seaMsg').textContent = 'Fehler: ' + e.message; $('seaMsg').className = 'msg err'; }); });
$('tab-bdg').addEventListener('click', function(e){
  var t;
  if ((t = e.target.closest('[data-clmicon]'))) { CLM_ICON = t.dataset.clmicon; clmRender(); return; }
  if ((t = e.target.closest('[data-clmok], [data-clmno]'))) { var id = +(t.dataset.clmok || t.dataset.clmno), names = Array.prototype.map.call(document.querySelectorAll('input[data-clmn][data-ev="' + id + '"]:checked'), function(x){ return x.dataset.clmn; });
    if (!names.length) return; clmAct('decide', { id: id, names: names, status: t.dataset.clmok ? 'ok' : 'no' }, names.length + ' Spieler ' + (t.dataset.clmok ? 'bestätigt – die Marke steht jetzt in ihrem Profil.' : 'abgelehnt.')); return; }
  if ((t = e.target.closest('[data-clmre]'))) { clmAct('decide', { id: +t.dataset.ev, names: [t.dataset.clmre], status: t.dataset.st }); return; }
  if ((t = e.target.closest('[data-clmtoggle]'))) { clmAct(t.dataset.open === '1' ? 'close' : 'reopen', { id: +t.dataset.clmtoggle }); return; }
  if ((t = e.target.closest('[data-clmdel]'))) { if (confirm('Selbstmelde-Event löschen? Die bestätigten Marken verschwinden auch.')) clmAct('delete', { id: +t.dataset.clmdel }); return; }
  if ((t = e.target.closest('[data-seadel]'))) { if (confirm('Saison-Plakette löschen?')) clmAct('season_del', { id: +t.dataset.seadel }); }
});
