/* SKWS Squads – Admin: logbuch (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Logbuch ---------- */
var LOG = null, LOG_PAGE = 1000, logLoading = false;
function loadLog(more){
  if (logLoading) return; logLoading = true;
  if (!more) $('logList').innerHTML = '<div class="empty">Lade…</div>';
  var before = more && LOG && LOG.length ? LOG[LOG.length - 1].id : null;
  rpc('admin_log', { p_pw: PW, p_limit: LOG_PAGE, p_before: before }).then(function(rows){
    rows.forEach(function(r){ r.t = new Date(r.at); r.details = r.details || {}; });
    LOG = more ? LOG.concat(rows) : rows;
    $('logMoreRow').classList.toggle('hide', rows.length < LOG_PAGE);
    renderLog();
  }).catch(function(){ $('logList').innerHTML = '<div class="empty">Logbuch konnte nicht geladen werden.</div>'; })
    .then(function(){ logLoading = false; });
}
function who(n){ return n ? '<a data-name="' + esc(n) + '">' + esc(n) + '</a>' : ''; }
function logText(r){
  var d = r.details, a = r.action;
  if (a === 'save') {
    if (d.first) return { tag:'ok', label:'Neu', text: who(r.target) + ' hat sich eingetragen', sub: 'Gesamt ' + fmt(d.total_new) + ' M' + (d.t1_new ? ' · T1 ' + fmt(d.t1_new) + ' M' : '') + (d.backfill ? ' · nachgetragen' : '') };
    if (d.changed) {
      var diff = Math.round((d.total_new - (d.total_old || 0)) * 100) / 100;
      return { tag:'ok', label:'Update', text: who(r.target) + ' hat aktualisiert',
        sub: 'Gesamt ' + fmt(d.total_old) + ' → ' + fmt(d.total_new) + ' M (' + (diff > 0 ? '+' : '') + fmt(diff) + ')' +
             (d.t1_old !== d.t1_new ? ' · T1 ' + fmt(d.t1_old) + ' → ' + fmt(d.t1_new) : '') + (d.email_changed ? ' · E-Mail geändert' : '') };
    }
    return { tag:'', label:'Gespeichert', text: who(r.target) + ' hat gespeichert – ohne Änderung', sub: (d.email_changed ? 'E-Mail geändert · ' : '') + 'Gesamt ' + fmt(d.total_new) + ' M' };
  }
  if (a === 'self_join') return { tag:'adm', label:'Beitritt', text: who(r.target) + (d.returned ? ' ist zurück und hat sich selbst wieder eingetragen' : ' hat sich selbst neu eingetragen'), sub: 'Rang ' + (d.rank || 'R1') + ' · bei Bedarf im Tab Mitglieder anpassen' };
  if (a === 'unsub') return { tag:'warn', label:'Abgemeldet', text: who(r.target) + ' hat sich von der Mail-Erinnerung abgemeldet', sub: '' };
  if (a === 'avatar_fail') return { tag:'warn', label:'Avatar', text: 'Falsche E-Mail beim Avatar-Ändern für ' + (r.target || ''), sub: 'nach 5 Fehlversuchen pro Stunde gesperrt' };
  if (a === 'avatar') return { tag: d.what === 'admin_remove' ? 'warn' : '', label:'Avatar', text: d.what === 'admin_remove' ? who(r.actor) + ' hat den Avatar von ' + (r.target || '') + ' entfernt' : who(r.actor) + (d.what === 'remove' ? ' hat seinen Avatar entfernt' : ' hat einen neuen Avatar hochgeladen'), sub: '' };
  if (a === 'merit') return { tag: d.what === 'add' && d.kind === 'malus' ? 'warn' : 'adm', label: d.what === 'config' ? 'Bonus/Malus' : (d.kind === 'bonus' ? 'Bonus' : 'Malus'),
    text: d.what === 'config' ? who(r.actor) + ' hat die Gründe-Liste geändert' : d.what === 'revoke' ? who(r.actor) + ' hat ' + (d.kind === 'bonus' ? 'den Bonus' : 'den Malus') + ' „' + (d.reason || '') + '“ von ' + (r.target || '') + ' zurückgenommen'
      : who(r.actor) + ': ' + (d.kind === 'bonus' ? 'Bonus' : 'Malus') + ' für ' + (r.target || '') + ' – ' + (d.reason || ''), sub: d.what === 'add' ? (MER_EFF[d.effect] || '') + ' · ' + (MER_SCOPE[d.scope] || '') + (d.rounds ? ' · ' + d.rounds + ' Runde(n)' : '') + (d.until ? ' · bis ' + fmtDate(new Date(d.until)) : '') : '' };
  if (a === 'ev_signup') return { tag:'', label:'Anmeldung', text: who(r.actor) + ' hat sich für ' + (d.kind === 'cs' ? 'Schluchtsturm' : 'Wüstensturm') + ' ' + (d.round || '') + ' gemeldet: ' + (EV_CH[d.choice] || d.choice), sub: '' };
  if (a === 'ev_round') return { tag:'adm', label:'Anmeldung', text: who(r.actor) + ': ' + (d.kind === 'cs' ? 'Schluchtsturm' : 'Wüstensturm') + ' ' + (d.label || '') + ' – ' + ({create:'neue Anmelderunde', update:'Runde geändert', close:'Anmeldung geschlossen', reopen:'Anmeldung wieder geöffnet', set:'Anmeldung von ' + (r.target || '') + ' gesetzt: ' + (EV_CH[d.choice] || 'gelöscht'), config:'Rotation/gesetzte Spieler geändert'}[d.what] || d.what), sub: '' };
  if (a === 'mg_save') return { tag:'adm', label:'Mentoren', text: who(r.actor) + ' hat die Mentorengruppen geändert', sub: (d.players || 0) + ' Spieler in ' + (d.groups || 0) + ' Gruppen' };
  if (a === 'ds_publish') return { tag:'adm', label:'Wüstensturm', text: who(r.actor) + (d.cleared ? ' hat den Einsatzplan zurückgenommen' : ' hat den Wüstensturm-Einsatzplan veröffentlicht'), sub: d.cleared ? '' : ('Team A: ' + (d.a || 0) + ' · Team B: ' + (d.b || 0) + ' Spieler') };
  if (a === 'admin_login') return { tag:'adm', label:'Admin', text: who(r.actor) + ' hat sich im Admin-Bereich angemeldet', sub: '' };
  if (a === 'admin_add') return { tag:'adm', label:'Verwaltung', text: who(r.actor) + ' hat ' + who(r.target) + (d.returned ? ' wieder aufgenommen' : ' hinzugefügt'), sub: 'Rang ' + (d.rank || '–') };
  if (a === 'admin_leave') return { tag:'warn', label:'Verwaltung', text: who(r.actor) + ' hat ' + who(r.target) + ' als ausgeschieden markiert', sub: d.rank ? 'war ' + d.rank : '' };
  if (a === 'admin_rejoin') return { tag:'adm', label:'Verwaltung', text: who(r.actor) + ' hat ' + who(r.target) + ' wieder aufgenommen', sub: '' };
  if (a === 'admin_rank') return { tag:'adm', label:'Verwaltung', text: who(r.actor) + ' hat den Rang von ' + who(r.target) + ' geändert', sub: (d.from || '–') + ' → ' + (d.to || '–') };
  if (a === 'admin_rename') return { tag:'adm', label:'Verwaltung', text: who(r.actor) + ' hat ' + esc(d.from || '') + ' umbenannt in ' + who(r.target), sub: '' };
  if (a === 'reminder_sent') return { tag:'', label:'System', text: 'Wöchentliche Erinnerungs-Mail verschickt', sub: (d.count !== undefined ? d.count + ' Empfänger' : '') + (d.errors ? ' · ' + d.errors + ' Fehler' : '') };
  return { tag:'', label: a, text: esc(r.actor || '') + ' ' + esc(r.target || ''), sub: '' };
}
function logMatch(r){
  var f = $('logFilter').value, q = $('logSearch').value.trim().toLowerCase(), a = r.action;
  if (f === 'save' && a !== 'save') return false;
  if (f === 'changed' && !(a === 'save' && r.details.changed)) return false;
  if (f === 'admin' && !(a.indexOf('admin_') === 0 && a !== 'admin_login')) return false;
  if (f === 'login' && a !== 'admin_login') return false;
  if (f === 'join' && a !== 'self_join') return false;
  if (f === 'unsub' && a !== 'unsub') return false;
  if (f === 'reminder' && a !== 'reminder_sent') return false;
  if (q && ((r.actor || '') + ' ' + (r.target || '') + ' ' + JSON.stringify(r.details)).toLowerCase().indexOf(q) < 0) return false;
  return true;
}
function dayLabel(t){
  var k = dayKey(t), today = dayKey(new Date()), yest = dayKey(new Date(Date.now() - DAY));
  return k === today ? 'Heute' : k === yest ? 'Gestern' : new Date(t).toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
}
function renderLog(){
  if (!LOG) return;
  var view = $('logView').value, rows = LOG.filter(logMatch), h = '';
  if (view === 'last') {
    var seen = {}, list = [];
    rows.forEach(function(r){
      var person = (r.action === 'save' || r.action === 'unsub') ? r.target : r.actor;
      if (!person || seen[person]) return; seen[person] = 1; list.push(r);
    });
    h = list.map(function(r){
      var x = logText(r);
      return '<div class="log"><time>' + fmtDate(r.t) + '<br>' + r.t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}) + '</time><div><span class="tag ' + x.tag + '">' + x.label + '</span>' + x.text +
        '<small>' + ago(r.t) + (x.sub ? ' · ' + x.sub : '') + '</small></div></div>';
    }).join('');
    var q = $('logSearch').value.trim().toLowerCase(), f = $('logFilter').value;
    if (f === 'all' || f === 'save') {
      var none = D.players.filter(function(p){ return !seen[p.name] && (!q || p.name.toLowerCase().indexOf(q) >= 0); });
      if (none.length) h += '<div class="logday">Noch keine Aktion (' + none.length + ')</div><div class="chips">' + none.map(function(p){ return '<span class="chip" style="cursor:default">' + esc(p.name) + '</span>'; }).join('') + '</div>';
    }
  } else {
    var lastDay = null;
    rows.forEach(function(r){
      var dl = dayLabel(r.t);
      if (dl !== lastDay) { h += '<div class="logday">' + dl + '</div>'; lastDay = dl; }
      var x = logText(r);
      h += '<div class="log"><time>' + r.t.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}) + '</time><div><span class="tag ' + x.tag + '">' + x.label + '</span>' + x.text + (x.sub ? '<small>' + x.sub + '</small>' : '') + '</div></div>';
    });
  }
  $('logList').innerHTML = h || '<div class="empty">Keine Einträge.</div>';
}

/* ---------- Verwaltung ---------- */
function rankSelect(p){
  return '<select class="rk" data-name="' + esc(p.name) + '">' + RANKS.map(function(r){ return '<option' + (r === p.rank ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>';
}
function renderAdmin(){
  var q = $('admSearch').value.trim().toLowerCase();
  var act = D.players.filter(function(p){ return !q || p.name.toLowerCase().indexOf(q) >= 0; })
    .sort(function(a,b){ return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || a.name.localeCompare(b.name, 'de', {sensitivity:'base'}); });
  $('admActiveCount').textContent = D.players.length;
  $('admActive').innerHTML = act.map(function(p){
    return '<tr><td class="sticky">' + av(p.name) + esc(p.name) + mgBadge(p.name) + '</td><td>' + rankSelect(p) + '</td><td style="text-align:right">' +
      (AVA[p.name] ? '<button class="mini" data-act="avdel" data-name="' + esc(p.name) + '">Avatar entfernen</button> ' : '') +
      '<button class="mini" data-act="rename" data-name="' + esc(p.name) + '">Umbenennen</button> ' +
      '<button class="mini danger" data-act="leave" data-name="' + esc(p.name) + '">Ausgeschieden</button></td></tr>';
  }).join('') || '<tr><td class="muted">Keine Treffer.</td></tr>';
  $('admLeftCount').textContent = D.left.length;
  $('admLeft').innerHTML = D.left.slice().sort(function(a,b){ return (b.leftAt || 0) - (a.leftAt || 0); }).map(function(p){
    return '<tr><td class="sticky">' + esc(p.name) + '</td><td class="muted">' + p.rank + '</td><td class="muted">seit ' + (p.leftAt ? fmtDate(p.leftAt) : '–') + '</td><td style="text-align:right">' +
      '<button class="mini okb" data-act="rejoin" data-name="' + esc(p.name) + '">Wieder aufnehmen</button></td></tr>';
  }).join('') || '<tr><td class="muted">Niemand.</td></tr>';
}
function note(txt, ok){ var n = $('admNote'); n.textContent = txt; n.className = 'note ' + (ok ? 'ok' : 'err'); }
function memberAction(action, name, value, okText){
  note('…', true);
  return rpc('admin_member', { p_pw: PW, p_action: action, p_name: name, p_value: value || null, p_actor: ACTOR || null })
    .then(function(){ return load(PW, true).then(function(){ showTab('adm'); note(okText, true); }); })
    .catch(function(err){
      var m = String(err && err.message);
      note(m.indexOf('ERR_EXISTS') >= 0 ? 'Diesen Namen gibt es schon.' : m.indexOf('ERR_AUTH') >= 0 ? 'Nicht angemeldet – bitte neu anmelden.' :
           m.indexOf('ERR_NAME') >= 0 ? 'Ungültiger Name.' : 'Fehler – bitte erneut versuchen.', false);
    });
}
