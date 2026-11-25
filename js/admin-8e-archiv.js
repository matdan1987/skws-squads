/* SKWS Squads – Admin: Allianzbeitritt, interne Notizen, Event-Archiv */
var EX = null, ARC = [], ARC_MORE = true;
function exLoad(){
  return rpc('admin_extra', { p_pw: PW, p_action: 'data' }).then(function(r){ EX = r; if (!$('tab-pl').classList.contains('hide')) renderAkte(); if (!$('tab-adm').classList.contains('hide')) ajRender(); })
    .catch(function(){ EX = null; });
}
function ajOf(n){ return EX && EX.ajoin && EX.ajoin[n] || ''; }
// ---------- Allianzbeitritt ----------
function ajSave(n, date, cb){
  rpc('admin_extra', { p_pw: PW, p_action: 'ajoin', p_data: { name: n, date: date || '' }, p_actor: ACTOR || null })
    .then(function(){ if (EX) { if (date) EX.ajoin[n] = date; else delete EX.ajoin[n]; } if (cb) cb(true); })
    .catch(function(){ if (cb) cb(false); });
}
function ajRender(){
  var b = $('ajList'); if (!b) return;
  if (!EX) { b.innerHTML = '<div class="empty">Lädt … (oder die Datenbank-Erweiterung „archiv_notizen“ fehlt noch)</div>'; return; }
  var q = ($('ajQ').value || '').trim().toLowerCase(), only = $('ajOnly').checked;
  var list = D.players.filter(function(p){ return (!q || p.name.toLowerCase().indexOf(q) >= 0) && (!only || !ajOf(p.name)); });
  $('ajCount').textContent = D.players.filter(function(p){ return ajOf(p.name); }).length + ' von ' + D.players.length + ' nachgetragen';
  b.innerHTML = list.map(function(p){ return '<div class="mgrow"><span class="nm">' + av(p.name, 28) + esc(p.name) + ' <span class="v">' + p.rank + (p.joinedAt ? ' · hier seit ' + fmtDate(p.joinedAt) : '') + '</span></span>' +
    '<input type="date" class="ajd" data-aj="' + esc(p.name) + '" value="' + ajOf(p.name) + '"></div>'; }).join('') || '<div class="empty">Keine Treffer.</div>';
}
// ---------- Notizen in der Spieler-Akte ----------
function notesHtml(n){
  if (!EX) return '<div class="card"><h2>🔒 Interne Notizen</h2><div class="small muted">Lädt … (oder die Datenbank-Erweiterung „archiv_notizen“ fehlt noch)</div></div>';
  var l = (EX.notes || []).filter(function(x){ return x.name === n; });
  return '<div class="card"><h2>🔒 Interne Notizen (' + l.length + ')</h2><p class="small muted" style="margin:0 0 8px">Sehen nur R4/R5 – oder zusätzlich Mentoren und R4 der Mentorengruppe des Spielers, wenn du das freigibst (auf der Spielerseite im Profil, nach dem Anmelden mit PIN).</p>' +
    l.map(function(x){ return '<div class="akte-ev"><span style="white-space:pre-wrap">' + esc(x.body) + '</span><span class="muted">' + fmtDateTime(new Date(x.t)) + (x.by ? ' · ' + esc(x.by) : '') + '</span>' +
      '<select class="visel" data-notevis="' + x.id + '"><option value="lead"' + (x.vis === 'lead' ? ' selected' : '') + '>🔒 nur R4/R5</option><option value="mentor"' + (x.vis === 'mentor' ? ' selected' : '') + '>🎓 auch Mentoren der Gruppe</option></select>' +
      '<button class="mini danger" data-notedel="' + x.id + '">Löschen</button></div>'; }).join('') +
    '<textarea id="noteBody" rows="3" maxlength="2000" placeholder="Neue Notiz …" style="width:100%;box-sizing:border-box;margin-top:8px"></textarea>' +
    '<div class="btnrow" style="margin-top:6px"><select id="noteVis"><option value="lead">🔒 nur R4/R5</option><option value="mentor">🎓 auch Mentoren der Gruppe</option></select><button class="btn2" data-noteadd="' + esc(n) + '">Notiz speichern</button></div></div>';
}
function ajAkteHtml(p){
  return '<div class="aj-akte"><label>Allianzbeitritt <input type="date" class="ajd" data-aj="' + esc(p.name) + '" value="' + ajOf(p.name) + '"' + (EX ? '' : ' disabled') + '></label>' +
    '<span class="small muted">auf dieser Seite seit ' + (p.joinedAt ? fmtDate(p.joinedAt) : '–') + '</span></div>';
}
// ---------- Event-Archiv ----------
function arcLoad(more){
  var kind = $('arcKind').value, before = more && ARC.length ? ARC[ARC.length - 1].id : null;
  if (!more) { ARC = []; $('arcList').innerHTML = '<div class="empty">Lädt …</div>'; }
  return rpc('admin_extra', { p_pw: PW, p_action: 'rounds', p_data: { kind: kind, before: before } }).then(function(r){
    var it = r.items || []; ARC = ARC.concat(it); ARC_MORE = it.length === 30; arcRender();
  }).catch(function(){ $('arcList').innerHTML = '<div class="empty">Konnte nicht geladen werden (fehlt die Datenbank-Erweiterung „archiv_notizen“?).</div>'; });
}
function arcRender(){
  var q = ($('arcQ').value || '').trim().toLowerCase();
  var list = ARC.filter(function(r){ return !q || Object.keys(r.lineup || {}).some(function(n){ return n.toLowerCase().indexOf(q) >= 0; }) || (r.label || '').toLowerCase().indexOf(q) >= 0; });
  $('arcList').innerHTML = list.length ? list.map(function(r){
    var lu = r.lineup || {}, abs = r.absent || [], plan = (r.meta && r.meta.plan) || {}, ds = r.kind === 'ds';
    function team(t){
      var st = Object.keys(lu).filter(function(n){ return lu[n] === t + 'S'; }), su = Object.keys(lu).filter(function(n){ return lu[n] === t + 'E'; }), P = plan[t] || {};
      if (!st.length && !su.length) return '';
      return '<div class="arc-team"><b>Team ' + t + '</b>' + (P.time || r['time_' + t.toLowerCase()] ? ' · ' + esc(P.time || r['time_' + t.toLowerCase()]) : '') + (P.opp ? ' · gegen ' + esc(P.opp) : '') +
        (P.tac ? '<div class="small">Taktik: <b>' + esc(P.tac) + '</b></div>' : '<div class="small muted">Taktik nicht gespeichert</div>') + (P.note ? '<div class="small">Hinweis: ' + esc(P.note) + '</div>' : '') +
        '<div class="small" style="margin-top:4px">Stamm (' + st.length + '): ' + st.map(function(n){ return abs.indexOf(n) >= 0 ? '<s class="down" title="gefehlt">' + esc(n) + '</s>' : esc(n); }).join(', ') + '</div>' +
        (su.length ? '<div class="small muted">Ersatz (' + su.length + '): ' + su.map(esc).join(', ') + '</div>' : '') + '</div>';
    }
    var teams = team('A') + team('B');
    return '<div class="arc-card"><div class="arc-h"><span class="bdg-ic ' + r.kind + '">' + (ds ? '🏜️' : '🧪') + '</span><div><b>' + (ds ? 'Wüstensturm' : 'Schluchtsturm') + ' ' + esc(r.label) + '</b><div class="small muted">' + fmtDate(new Date(r.created_at)) +
      ' · ' + (r.open ? '<span class="warn">Anmeldung offen</span>' : 'abgeschlossen') + ' · ' + r.signups + ' Anmeldungen' + (abs.length ? ' · <span class="down">' + abs.length + ' gefehlt</span>' : '') + '</div></div></div>' +
      (teams || '<div class="small muted">Keine Aufstellung gespeichert.</div>') +
      '<label class="small muted" style="display:block;margin-top:8px">Besonderheiten / Ergebnis</label><textarea class="arc-rem" data-arcrem="' + r.id + '" rows="2" maxlength="1000" placeholder="z. B. Sieg 1,2 Mio. zu 900 Tsd., Gegner sehr stark auf dem Silo …">' + esc((r.meta && r.meta.remark) || '') + '</textarea>' +
      '<div class="btnrow"><button class="mini" data-arcsave="' + r.id + '">Speichern</button><span class="small" data-arcmsg="' + r.id + '"></span></div></div>';
  }).join('') : '<div class="empty">Keine Runden gefunden.</div>';
  $('arcMore').classList.toggle('hide', !ARC_MORE || !!q);
}
// Taktik-Schnappschuss beim Erstellen des Plans (für das Archiv)
function arcPlanMeta(kind){
  var L = kind === 'ds' ? (typeof DS_LAST !== 'undefined' ? DS_LAST : null) : (typeof CS_LAST !== 'undefined' ? CS_LAST : null), T = kind === 'ds' ? DS_TACTICS : CS_TACTICS, out = {};
  if (!L || L.example || !L.plan || !L.plan.teams) return null;
  Object.keys(L.plan.teams).forEach(function(t){ var x = L.plan.teams[t]; out[t] = { tac: (T[x.tac] || {}).name || x.tac, time: x.time || '', opp: x.opp || '', note: x.note || '' }; });
  return out;
}
// ---------- Ereignisse ----------
document.addEventListener('change', function(e){
  var d = e.target.closest('input[data-aj]'); if (!d) return;
  var n = d.dataset.aj; d.disabled = true;
  ajSave(n, d.value, function(ok){ d.disabled = false; d.style.borderColor = ok ? 'var(--ok)' : 'var(--err)'; setTimeout(function(){ d.style.borderColor = ''; }, 1500); });
});
$('plAkte').addEventListener('change', function(e){
  var s = e.target.closest('[data-notevis]'); if (!s) return;
  rpc('admin_extra', { p_pw: PW, p_action: 'note_vis', p_data: { id: +s.dataset.notevis, vis: s.value }, p_actor: ACTOR || null }).then(exLoad);
});
$('plAkte').addEventListener('click', function(e){
  var a = e.target.closest('[data-noteadd]');
  if (a) { var body = $('noteBody').value.trim(); if (!body) return; a.disabled = true;
    rpc('admin_extra', { p_pw: PW, p_action: 'note_add', p_data: { name: a.dataset.noteadd, body: body, vis: $('noteVis').value }, p_actor: ACTOR || null }).then(exLoad).catch(function(err){ a.disabled = false; alert('Fehler: ' + err.message); }); return; }
  var d = e.target.closest('[data-notedel]');
  if (d && confirm('Notiz löschen?')) rpc('admin_extra', { p_pw: PW, p_action: 'note_del', p_data: { id: +d.dataset.notedel }, p_actor: ACTOR || null }).then(exLoad);
});
$('ajQ').addEventListener('input', ajRender);
$('ajOnly').addEventListener('change', ajRender);
$('arcKind').addEventListener('change', function(){ arcLoad(false); });
$('arcQ').addEventListener('input', arcRender);
$('arcMore').addEventListener('click', function(){ arcLoad(true); });
$('arcList').addEventListener('click', function(e){
  var b = e.target.closest('[data-arcsave]'); if (!b) return;
  var id = +b.dataset.arcsave, ta = document.querySelector('[data-arcrem="' + id + '"]'), m = document.querySelector('[data-arcmsg="' + id + '"]');
  rpc('admin_extra', { p_pw: PW, p_action: 'round_meta', p_data: { id: id, meta: { remark: ta.value.trim() } }, p_actor: ACTOR || null })
    .then(function(){ ARC.forEach(function(r){ if (r.id === id) { r.meta = r.meta || {}; r.meta.remark = ta.value.trim(); } }); m.textContent = '✔ gespeichert'; m.className = 'small up'; })
    .catch(function(){ m.textContent = 'Fehler'; m.className = 'small down'; });
});
