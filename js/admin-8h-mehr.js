/* SKWS Squads – Admin: Abwesenheit, Aktivität, Kalender, Allianz-Duell (VS) */
var ABSL = null, ACT = null, CAL = null, VSW = null, VS_MON = null, VS_DAY = null, VS_SELF = [], ACT_F = '14';
function ymdL(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dL(s){ var p = String(s).split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
function fmtDayL(s){ return dL(s).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }); }

/* ---------- Abwesenheit ---------- */
function absLoad(){ return rpc('admin_absence', { p_pw: PW, p_action: 'list' }).then(function(r){ ABSL = r.items || []; }).catch(function(){ ABSL = false; }); }
function absOf(n){ return ABSL ? ABSL.filter(function(a){ return a.name === n && a.to >= ymdL(new Date()); }) : []; }
// abwesend heute oder in den nächsten 7 Tagen?
function absSoon(n){ var t = ymdL(new Date()), e = ymdL(new Date(Date.now() + 7 * DAY)); return absOf(n).filter(function(a){ return a.from <= e && a.to >= t; })[0] || null; }
function absBadge(n){ var a = absSoon(n); return a ? ' <span class="abs-b" title="' + esc((a.note ? a.note + ' · ' : '') + fmtDayL(a.from) + ' – ' + fmtDayL(a.to)) + '">🏖️ ' + (a.from <= ymdL(new Date()) ? 'bis ' + fmtDayL(a.to) : 'ab ' + fmtDayL(a.from)) + '</span>' : ''; }
// war der Spieler in der Woche ab dem Rundenstart abgemeldet?
function absCovers(n, since){ if (!ABSL) return false; var a = ymdL(new Date(since || Date.now())), b = ymdL(new Date(new Date(since || Date.now()).getTime() + 7 * DAY));
  return ABSL.some(function(x){ return x.name === n && x.from <= b && x.to >= a; }); }
function absRowHtml(n){
  if (ABSL === false) return '<span class="small muted">Datenbank-Erweiterung „ausbau2“ fehlt noch</span>';
  var l = absOf(n), t = ymdL(new Date());
  return '<div class="abs-row">' + l.map(function(a){ return '<span class="chip">🏖️ ' + fmtDayL(a.from) + ' – ' + fmtDayL(a.to) + (a.note ? ' · ' + esc(a.note) : '') + ' <a href="#" data-absdel="' + a.id + '">✕</a></span>'; }).join('') +
    '<span class="abs-add"><input type="date" id="absFrom" value="' + t + '"><input type="date" id="absTo" value="' + t + '"><input type="text" id="absNote" maxlength="200" placeholder="Grund (optional)"><button class="mini" data-absadd="' + esc(n) + '">Eintragen</button></span></div>';
}
function absCard(){
  var b = $('absBox'); if (!b) return;
  if (!ABSL) { b.innerHTML = ''; return; }
  var t = ymdL(new Date()), now = ABSL.filter(function(a){ return a.from <= t && a.to >= t; }), soon = ABSL.filter(function(a){ return a.from > t; });
  if (!now.length && !soon.length) { b.innerHTML = ''; return; }
  function li(a){ return '<div class="abs-li"><span><a href="#" data-mlopen="' + esc(a.name) + '">' + esc(a.name) + '</a> · ' + fmtDayL(a.from) + ' – ' + fmtDayL(a.to) + (a.note ? ' · <span class="muted">' + esc(a.note) + '</span>' : '') + '</span><a href="#" class="muted" data-absdel="' + a.id + '">✕</a></div>'; }
  b.innerHTML = '<div class="card"><h2>🏖️ Abwesend</h2><p class="small muted" style="margin:0 0 6px">Von den Spielern selbst (Profil → Abwesenheit) oder von euch in der Spielerakte eingetragen. Bei „Wer hat gefehlt?“ gibt es für diese Zeit keinen Malus.</p>' +
    (now.length ? '<div class="evgrp">Gerade abwesend (' + now.length + ')</div>' + now.map(li).join('') : '') + (soon.length ? '<div class="evgrp">Demnächst (' + soon.length + ')</div>' + soon.map(li).join('') : '') + '</div>';
}
document.addEventListener('click', function(e){
  var a = e.target.closest('[data-absadd]'), d = e.target.closest('[data-absdel]'), o = e.target.closest('#absBox [data-mlopen]');
  if (o) { e.preventDefault(); mlOpen(o.dataset.mlopen); return; }
  if (a) {
    var f = $('absFrom').value, t = $('absTo').value;
    if (!f || !t || t < f) { toast('Bitte gültige Daten wählen.', false); return; }
    rpc('admin_absence', { p_pw: PW, p_action: 'add', p_data: { name: a.dataset.absadd, from: f, to: t, note: $('absNote').value }, p_actor: ACTOR || null })
      .then(absLoad).then(function(){ toast('Abwesenheit gespeichert.', true); showTab(store('skws_admin_tab') || 'pl'); }).catch(function(){ toast('Fehler beim Speichern.', false); });
  }
  if (d) { e.preventDefault(); if (!confirm('Abwesenheit löschen?')) return;
    rpc('admin_absence', { p_pw: PW, p_action: 'del', p_data: { id: +d.dataset.absdel }, p_actor: ACTOR || null }).then(absLoad).then(function(){ showTab(store('skws_admin_tab') || 'mlist'); }); }
});

/* ---------- Aktivität ---------- */
function actLoad(){ $('actBox').innerHTML = '<div class="empty">Lädt …</div>'; return rpc('admin_activity', { p_pw: PW }).then(function(r){ ACT = r.items || {}; actRender(); }).catch(function(){ ACT = false; actRender(); }); }
function actRender(){
  var b = $('actBox'); if (!b) return;
  if (ACT === false) { b.innerHTML = '<div class="empty">Konnte nicht geladen werden – ist die Datenbank-Erweiterung „ausbau2“ eingespielt?</div>'; return; }
  if (!ACT) return;
  function age(t){ return t ? Math.floor((Date.now() - new Date(t)) / DAY) : null; }
  function cell(t){ var a = age(t); return a === null ? '<span class="muted">nie</span>' : a === 0 ? 'heute' : a === 1 ? 'gestern' : 'vor ' + a + ' T.'; }
  var rows = D.players.filter(function(p){ return p.active; }).map(function(p){
    var x = ACT[p.name] || {}, last = [x.seen, x.entry, x.signup, x.vote, x.chat].filter(Boolean).sort().pop() || null;
    return { p: p, x: x, last: last, age: age(last) };
  });
  var f = ACT_F === 'all' ? -1 : +ACT_F;
  var list = rows.filter(function(r){ return f < 0 || r.age === null || r.age >= f; }).sort(function(a, c){ return (c.age === null ? 1e9 : c.age) - (a.age === null ? 1e9 : a.age); });
  b.innerHTML = '<div class="formrow" style="grid-template-columns:auto 1fr;align-items:center;margin:0 0 8px"><label for="actF" style="margin:0">Zeigen:</label><select id="actF">' +
    [['7','seit 7 Tagen oder länger nicht aktiv'],['14','seit 14 Tagen oder länger nicht aktiv'],['30','seit 30 Tagen oder länger nicht aktiv'],['all','alle Spieler']].map(function(o){ return '<option value="' + o[0] + '"' + (ACT_F === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
    '<div class="small muted" style="margin-bottom:6px">' + list.length + ' von ' + rows.length + ' Spielern · „Aktiv“ = zuletzt angemeldet, Werte gemeldet, bei einem Event geantwortet, abgestimmt oder im Funk geschrieben.</div>' +
    (list.length ? '<div class="tablewrap"><table class="act-t"><thead><tr><th>Spieler</th><th>Zuletzt aktiv</th><th>Angemeldet</th><th>Werte</th><th>Events (5 Wo.)</th><th>PIN</th></tr></thead><tbody>' +
    list.map(function(r){ var x = r.x;
      return '<tr class="' + (r.age === null || r.age >= 30 ? 'act-red' : r.age >= 14 ? 'act-amb' : '') + '"><td><a href="#" data-mlopen="' + esc(r.p.name) + '">' + esc(r.p.name) + '</a> <span class="muted">' + r.p.rank + '</span>' + absBadge(r.p.name) + '</td>' +
        '<td><b>' + cell(r.last) + '</b></td><td>' + cell(x.seen) + '</td><td>' + cell(x.entry) + '</td><td>' + (x.rounds ? (x.answered || 0) + ' von ' + x.rounds + ' beantwortet' : '–') + '</td><td>' + (x.pin ? '🔑' : '<span class="muted">–</span>') + '</td></tr>'; }).join('') +
    '</tbody></table></div>' : '<div class="empty">Niemand in dieser Auswahl – sehr gut!</div>');
}
document.addEventListener('change', function(e){ if (e.target.id === 'actF') { ACT_F = e.target.value; actRender(); } });
document.addEventListener('click', function(e){ var o = e.target.closest('#actBox [data-mlopen]'); if (o) { e.preventDefault(); mlOpen(o.dataset.mlopen); } });

/* ---------- Kalender ---------- */
var CAL_KIND = { ds: '🏜️ Wüstensturm', cs: '⛰️ Schluchtsturm', zombie: '🧟 Zombie-Belagerung', vs: '⚔️ Allianz-Duell', meet: '🗣️ Treffen', other: '📌 Sonstiges' };
var CAL_WD = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], CAL_EDIT = null;
function calLoad(){ return rpc('get_init', {}).then(function(r){ CAL = r.cal === undefined ? false : (r.cal || []); calRender(); }).catch(function(){ CAL = false; calRender(); }); }
function calRender(){
  var b = $('calAdm'); if (!b) return;
  if (CAL === false) { b.innerHTML = '<div class="empty">Die Datenbank-Erweiterung „ausbau2“ fehlt noch.</div>'; return; }
  if (!CAL) { b.innerHTML = '<div class="empty">Lädt …</div>'; return; }
  var e = CAL_EDIT ? CAL.filter(function(x){ return x.id === CAL_EDIT; })[0] || {} : {};
  b.innerHTML = '<div class="card"><h2>' + (CAL_EDIT ? 'Termin bearbeiten' : 'Neuer Termin') + '</h2><p class="small muted" style="margin-top:0">Spieler sehen die Termine auf der Spielerseite unter „Events“ – in deutscher Zeit und zusätzlich in ihrer Ortszeit. Wüstensturm und Schluchtsturm kommen automatisch aus der Anmeldung und dem veröffentlichten Einsatz dazu.</p>' +
    '<div class="formrow"><div><label for="calT">Titel</label><input id="calT" maxlength="80" value="' + esc(e.title || '') + '"></div><div><label for="calK">Art</label><select id="calK">' + Object.keys(CAL_KIND).map(function(k){ return '<option value="' + k + '"' + (e.kind === k ? ' selected' : '') + '>' + CAL_KIND[k] + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="umf-chk"><label><input type="checkbox" id="calW"' + (e.weekly ? ' checked' : '') + '> Jede Woche wiederholen</label></div>' +
    '<div class="formrow"><div id="calDayW"' + (e.weekly ? '' : ' class="hide"') + '><label for="calWd">Wochentag</label><select id="calWd">' + [1,2,3,4,5,6,0].map(function(i){ return '<option value="' + i + '"' + (e.wd === i ? ' selected' : '') + '>' + CAL_WD[i] + '</option>'; }).join('') + '</select></div>' +
    '<div id="calDayO"' + (e.weekly ? ' class="hide"' : '') + '><label for="calD">Datum</label><input type="date" id="calD" value="' + (e.day || ymdL(new Date())) + '"></div>' +
    '<div><label for="calTm">Uhrzeit (deutsche Zeit)</label><input type="time" id="calTm" value="' + (e.tm || '20:00') + '"></div><div><label for="calDur">Dauer (Min.)</label><input type="number" id="calDur" min="0" max="1440" value="' + (e.dur || 60) + '"></div></div>' +
    '<label for="calN">Hinweis (optional)</label><input id="calN" maxlength="200" value="' + esc(e.note || '') + '">' +
    '<div class="btnrow"><button class="btn" id="calSave">' + (CAL_EDIT ? 'Änderung speichern' : 'Termin speichern') + '</button>' + (CAL_EDIT ? '<button class="btn2" id="calCancel">Abbrechen</button>' : '') + '</div></div>' +
    '<div class="card"><h2>Termine (' + CAL.length + ')</h2>' + (CAL.length ? CAL.map(function(x){ return '<div class="abs-li"><span><b>' + esc(x.title) + '</b> · ' + (CAL_KIND[x.kind] || '').replace(/^\S+ /, '') + ' · ' +
      (x.weekly ? 'jeden ' + CAL_WD[x.wd] : fmtDayL(x.day)) + ', ' + esc(x.tm) + ' Uhr' + (x.dur ? ' · ' + x.dur + ' Min.' : '') + (x.note ? ' · <span class="muted">' + esc(x.note) + '</span>' : '') + '</span><span><button class="mini" data-caledit="' + x.id + '">Bearbeiten</button> <button class="mini danger" data-caldel="' + x.id + '">Löschen</button></span></div>'; }).join('') : '<div class="empty">Noch keine Termine.</div>') + '</div>';
}
document.addEventListener('change', function(e){ if (e.target.id === 'calW') { $('calDayW').classList.toggle('hide', !e.target.checked); $('calDayO').classList.toggle('hide', e.target.checked); } });
document.addEventListener('click', function(e){
  if (e.target.id === 'calCancel') { CAL_EDIT = null; calRender(); return; }
  var ed = e.target.closest('[data-caledit]'); if (ed) { CAL_EDIT = +ed.dataset.caledit; calRender(); window.scrollTo(0, 0); return; }
  var dl = e.target.closest('[data-caldel]'); if (dl) { if (confirm('Termin löschen?')) rpc('admin_cal', { p_pw: PW, p_action: 'del', p_data: { id: +dl.dataset.caldel }, p_actor: ACTOR || null }).then(calLoad); return; }
  if (e.target.id !== 'calSave') return;
  var d = { id: CAL_EDIT, title: $('calT').value.trim(), kind: $('calK').value, weekly: $('calW').checked, wd: $('calW').checked ? $('calWd').value : '', day: $('calW').checked ? '' : $('calD').value, tm: $('calTm').value, dur: $('calDur').value, note: $('calN').value };
  if (!d.title || !d.tm || (!d.weekly && !d.day)) { toast('Bitte Titel, Uhrzeit und Datum bzw. Wochentag angeben.', false); return; }
  rpc('admin_cal', { p_pw: PW, p_action: CAL_EDIT ? 'edit' : 'add', p_data: d, p_actor: ACTOR || null }).then(function(){ CAL_EDIT = null; toast('Termin gespeichert.', true); return calLoad(); })
    .catch(function(){ toast('Fehler – ist die Datenbank-Erweiterung „ausbau2“ eingespielt?', false); });
});

/* ---------- Allianz-Duell (VS) ---------- */
var VS_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
function vsMonday(){ var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymdL(d); }
function vsLoad(){
  if (!VS_MON) VS_MON = vsMonday();
  if (VS_DAY === null) VS_DAY = Math.min(5, Math.max(0, Math.round((Date.now() - dL(VS_MON)) / DAY)));
  $('vsAdm').innerHTML = '<div class="empty">Lädt …</div>';
  return Promise.all([rpc('vs_week', { p_monday: VS_MON }), rpc('admin_vs', { p_pw: PW, p_action: 'week', p_data: { monday: VS_MON } }).catch(function(){ return { self: [] }; })])
    .then(function(r){ VSW = r[0]; VS_SELF = r[1].self || []; vsRender(); }).catch(function(){ VSW = false; vsRender(); });
}
function vsRender(){
  var b = $('vsAdm'); if (!b) return;
  if (VSW === false) { b.innerHTML = '<div class="empty">Die Datenbank-Erweiterung „ausbau2“ fehlt noch.</div>'; return; }
  if (!VSW) return;
  var rows = VSW.rows || {}, mon = dL(VS_MON), weeks = (VSW.weeks || []).slice(); if (weeks.indexOf(vsMonday()) < 0) weeks.unshift(vsMonday()); if (weeks.indexOf(VS_MON) < 0) weeks.push(VS_MON);
  var pl = D.players.filter(function(p){ return p.active; }).map(function(p){ var r = rows[p.name] || {}, t = 0; Object.keys(r).forEach(function(k){ t += +r[k] || 0; }); return { p: p, r: r, t: t }; })
    .sort(function(a, c){ return c.t - a.t || a.p.name.localeCompare(c.p.name, 'de', { sensitivity: 'base' }); });
  var day = ymdL(new Date(mon.getTime() + VS_DAY * DAY)), self = {}; VS_SELF.forEach(function(x){ if (x.d === day) self[x.n] = 1; });
  var withPts = pl.filter(function(x){ return x.t > 0; });
  b.innerHTML = '<div class="card"><h2>Allianz-Duell eintragen</h2><p class="small muted" style="margin-top:0">Tagespunkte je Spieler. Spieler können ihre Punkte auch selbst im Profil eintragen (✍️) – was ihr hier speichert, gilt und kann der Spieler nicht mehr ändern. Leeres Feld = keine Punkte.</p>' +
    '<div class="formrow"><div><label for="vsWk">Woche ab Montag</label><select id="vsWk">' + weeks.sort().reverse().map(function(w){ return '<option value="' + w + '"' + (w === VS_MON ? ' selected' : '') + '>' + fmtDayL(w) + (w === vsMonday() ? ' (diese Woche)' : '') + '</option>'; }).join('') + '</select></div>' +
    '<div><label>Tag</label><div class="vs-days">' + VS_DAYS.map(function(d, i){ return '<button class="mini' + (i === VS_DAY ? ' on' : '') + '" data-vsday="' + i + '">' + d + '</button>'; }).join('') + '</div></div></div>' +
    '<div class="tablewrap"><table class="act-t vs-t"><thead><tr><th>Spieler</th><th>' + VS_DAYS[VS_DAY] + ' ' + fmtDayL(day).replace(/^\S+ /, '') + '</th><th>Woche</th></tr></thead><tbody>' +
    pl.map(function(x){ var v = x.r[String(VS_DAY)]; return '<tr><td>' + esc(x.p.name) + ' <span class="muted">' + x.p.rank + '</span>' + absBadge(x.p.name) + '</td><td><input type="number" min="0" inputmode="numeric" data-vsn="' + esc(x.p.name) + '" data-was="' + (v === undefined ? '' : v) + '" value="' + (v === undefined ? '' : v) + '"> ' + (self[x.p.name] ? '<span title="vom Spieler selbst eingetragen">✍️</span>' : '') + '</td><td>' + (x.t ? fmt(x.t, 0) : '–') + '</td></tr>'; }).join('') +
    '</tbody></table></div><div class="btnrow"><button class="btn" id="vsSave">Tag speichern</button></div>' +
    (withPts.length ? '<p class="small muted">Wochensumme: ' + withPts.length + ' Spieler mit Punkten · Durchschnitt ' + fmt(withPts.reduce(function(a, x){ return a + x.t; }, 0) / withPts.length, 0) + ' · ohne Punkte: ' + (pl.length - withPts.length) + '</p>' : '') + '</div>';
}
document.addEventListener('change', function(e){ if (e.target.id === 'vsWk') { VS_MON = e.target.value; VS_DAY = 0; vsLoad(); } });
document.addEventListener('click', function(e){
  var d = e.target.closest('[data-vsday]'); if (d) { VS_DAY = +d.dataset.vsday; vsRender(); return; }
  if (e.target.id !== 'vsSave') return;
  var day = ymdL(new Date(dL(VS_MON).getTime() + VS_DAY * DAY));
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-vsn]')).filter(function(i){ return i.value !== i.dataset.was; }).map(function(i){ return { name: i.dataset.vsn, pts: i.value === '' ? '' : String(Math.round(+i.value)) }; });
  if (!rows.length) { toast('Keine Änderungen.', true); return; }
  e.target.disabled = true;
  rpc('admin_vs', { p_pw: PW, p_action: 'set', p_data: { day: day, rows: rows }, p_actor: ACTOR || null }).then(function(){ toast(rows.length + ' Werte gespeichert.', true); return vsLoad(); })
    .catch(function(){ e.target.disabled = false; toast('Fehler beim Speichern.', false); });
});
