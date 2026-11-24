/* SKWS Squads – Admin: Funk (Rundnachrichten mit Lesestatus, PINs der Spieler) */
var FK = null, FK_NAMES = [];
function fkLoad(){
  return rpc('admin_funk', { p_pw: PW }).then(function(r){ FK = r && r.pins ? r : null; if (!$('tab-msg').classList.contains('hide')) fkRender(); if (!$('tab-pl').classList.contains('hide')) renderAkte(); })
    .catch(function(){ FK = null; });
}
function fkHasPin(n){ return !!(FK && FK.pins.indexOf(n) >= 0); }
function fkLocked(n){ return !!(FK && (FK.locked || []).indexOf(n) >= 0); }
// Empfänger wie auf dem Server berechnen (für die Vorschau)
function fkTargets(){
  var all = $('fkAll').checked, ranks = [], ment = $('fkMent').checked;
  Array.prototype.forEach.call(document.querySelectorAll('#fkRanks input:checked'), function(c){ ranks.push(c.value); });
  return { all: all, ranks: ranks, mentors: ment, names: FK_NAMES.slice(),
    list: D.players.filter(function(p){ var g = mgOf(p.name); return all || ranks.indexOf(p.rank) >= 0 || FK_NAMES.indexOf(p.name) >= 0 || (ment && g && g.role === 'mentor'); }).map(function(p){ return p.name; }) };
}
function fkPreview(){
  var t = fkTargets(), n = t.list.length;
  $('fkCount').innerHTML = n ? '<b>' + n + '</b> Empfänger' + (n <= 12 ? ': ' + t.list.map(esc).join(', ') : '') : '<span class="muted">Noch keine Empfänger gewählt.</span>';
  $('fkChips').innerHTML = FK_NAMES.map(function(n){ return '<span class="chip">' + esc(n) + ' <a data-fkrm="' + esc(n) + '">✕</a></span>'; }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('#fkRanks input'), function(c){ c.disabled = $('fkAll').checked; });
  $('fkMent').disabled = $('fkAll').checked;
}
function fkPick(names){
  FK_NAMES = names.slice(); $('fkAll').checked = false; $('fkMent').checked = false;
  Array.prototype.forEach.call(document.querySelectorAll('#fkRanks input'), function(c){ c.checked = false; });
  fkPreview();
}
function fkRender(){
  var sel = $('fkAdd'), cur = sel.value;
  sel.innerHTML = '<option value="">+ einzelnen Spieler hinzufügen</option>' + D.players.map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('');
  sel.value = cur;
  fkPreview();
  if (!FK) { $('fkList').innerHTML = '<div class="empty">Lädt … (oder die Datenbank-Erweiterung „funk“ fehlt noch)</div>'; $('fkPins').innerHTML = ''; return; }
  // Rundnachrichten mit Lesestatus
  $('fkList').innerHTML = FK.bcs.length ? FK.bcs.map(function(m){
    var r = m.rcpt || [], ok = r.filter(function(x){ return x.ack; }), open = r.filter(function(x){ return !x.ack; }), pct = r.length ? Math.round(ok.length / r.length * 100) : 0;
    var au = m.audience || {}, who = au.all ? 'Alle' : [].concat(au.ranks || [], au.mentors ? ['Mentoren'] : [], au.names || []).join(', ');
    return '<div class="fk-bc"><div class="fk-bch"><b>' + esc(m.subject || '(ohne Betreff)') + '</b><span class="muted small">' + fmtDateTime(m.t) + ' · ' + esc(m.from) + '</span></div>' +
      '<div class="small muted">An: ' + esc(who) + '</div><div class="fk-bcb">' + esc(m.body) + '</div>' +
      '<div class="fk-stat"><span class="small"><b>' + ok.length + '</b> von ' + r.length + ' bestätigt</span><div class="fk-bar"><i style="width:' + pct + '%"></i></div></div>' +
      '<details><summary class="small">Lesestatus anzeigen</summary>' +
        (open.length ? '<div class="small" style="margin-top:6px"><b class="down">Noch offen (' + open.length + '):</b> ' + open.map(function(x){ return esc(x.name) + (fkHasPin(x.name) ? '' : ' <span class="muted">(ohne PIN)</span>'); }).join(', ') + '</div>' : '') +
        (ok.length ? '<div class="small" style="margin-top:6px"><b class="up">Bestätigt (' + ok.length + '):</b> ' + ok.map(function(x){ return esc(x.name) + ' <span class="muted">' + fmtDateTime(x.ack) + '</span>'; }).join(', ') + '</div>' : '') +
      '</details><div class="btnrow" style="margin-top:6px"><button class="mini danger" data-fkdel="' + m.id + '">Löschen</button></div></div>';
  }).join('') : '<div class="empty">Noch keine Rundnachrichten.</div>';
  // PINs
  var act = D.players, has = act.filter(function(p){ return fkHasPin(p.name); }), no = act.filter(function(p){ return !fkHasPin(p.name); });
  $('fkPins').innerHTML = '<div class="fk-stat"><span class="small"><b>' + has.length + '</b> von ' + act.length + ' Spielern haben eine PIN</span><div class="fk-bar"><i style="width:' + (act.length ? Math.round(has.length / act.length * 100) : 0) + '%"></i></div></div>' +
    ((FK.locked || []).length ? '<div class="small" style="margin-top:8px"><b class="down">Gesperrt nach Fehlversuchen:</b> ' + FK.locked.map(function(n){ return esc(n) + ' <button class="mini" data-fkpin="' + esc(n) + '">Zurücksetzen</button>'; }).join(' ') + '</div>' : '') +
    (no.length ? '<details style="margin-top:8px"><summary class="small">Noch ohne PIN (' + no.length + ')</summary><div class="small" style="margin-top:6px">' + no.map(function(p){ return esc(p.name); }).join(', ') + '</div></details>' : '');
}
function fkSend(){
  var t = fkTargets(), body = $('fkBody').value.trim();
  if (!t.list.length) { $('fkMsg').textContent = 'Bitte Empfänger wählen.'; $('fkMsg').className = 'msg err'; return; }
  if (!body) { $('fkMsg').textContent = 'Bitte eine Nachricht schreiben.'; $('fkMsg').className = 'msg err'; return; }
  if (!confirm('Nachricht an ' + t.list.length + ' Spieler senden?')) return;
  $('fkSend').disabled = true;
  rpc('admin_msg', { p_pw: PW, p_data: { all: t.all, ranks: t.ranks, mentors: t.mentors, names: t.names, subject: $('fkSubj').value, body: body }, p_actor: ACTOR || null })
    .then(function(r){ $('fkMsg').textContent = 'Gesendet an ' + r.count + ' Spieler. Sie sehen die Nachricht, sobald sie sich unter „Funk“ anmelden, und müssen sie bestätigen.'; $('fkMsg').className = 'msg ok';
      $('fkSubj').value = ''; $('fkBody').value = ''; fkPick([]); return fkLoad(); })
    .catch(function(e){ $('fkMsg').textContent = e.message === 'ERR_NOBODY' ? 'Keine aktiven Empfänger gefunden.' : 'Fehler: ' + e.message; $('fkMsg').className = 'msg err'; })
    .then(function(){ $('fkSend').disabled = false; });
}
function fkPinReset(n){
  if (!confirm('PIN von ' + n + ' zurücksetzen? ' + n + ' wird abgemeldet und legt beim nächsten Anmelden eine neue PIN fest.')) return;
  rpc('admin_funk', { p_pw: PW, p_action: 'pin_reset', p_data: { name: n }, p_actor: ACTOR || null }).then(fkLoad).catch(function(e){ alert('Fehler: ' + e.message); });
}
// Spieler-Akte: PIN-Status
function fkAkte(name){
  if (!FK) return '';
  return '<span class="mgb">' + (fkHasPin(name) ? '🔑 PIN eingerichtet' : '🔑 keine PIN') + (fkLocked(name) ? ' · gesperrt' : '') + '</span>';
}
$('fkAll').addEventListener('change', fkPreview);
$('fkMent').addEventListener('change', fkPreview);
$('fkRanks').addEventListener('change', fkPreview);
$('fkAdd').addEventListener('change', function(){ if (this.value && FK_NAMES.indexOf(this.value) < 0) FK_NAMES.push(this.value); this.value = ''; fkPreview(); });
$('fkChips').addEventListener('click', function(e){ var a = e.target.closest('[data-fkrm]'); if (!a) return; FK_NAMES = FK_NAMES.filter(function(n){ return n !== a.dataset.fkrm; }); fkPreview(); });
$('fkSend').addEventListener('click', fkSend);
$('tab-msg').addEventListener('click', function(e){
  var d = e.target.closest('[data-fkdel]'); if (d) { if (!confirm('Rundnachricht löschen? Sie verschwindet auch bei den Spielern.')) return;
    rpc('admin_funk', { p_pw: PW, p_action: 'bc_delete', p_data: { id: +d.dataset.fkdel }, p_actor: ACTOR || null }).then(fkLoad); return; }
  var p = e.target.closest('[data-fkpin]'); if (p) fkPinReset(p.dataset.fkpin);
});
