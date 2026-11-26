/* SKWS Squads – Admin: Umfragen (erstellen, Ergebnisse mit Namen, beenden, löschen) */
var UMF = null, UMF_ERR = false;
var UMF_RES = { live:'nach der eigenen Stimme', end:'erst nach dem Ende', lead:'nur für R4/R5 (und den Ersteller)' };
function umfLoad(){
  return rpc('admin_poll', { p_pw: PW, p_action: 'list' }).then(function(r){ UMF = r.items || []; UMF_ERR = false; umfRender(); })
    .catch(function(){ UMF = []; UMF_ERR = true; umfRender(); });
}
function umfForm(){
  var groups = (MG_CUR && MG_CUR.groups) || [];
  return '<div class="card"><h2>Neue Umfrage</h2>' +
    '<p class="small muted" style="margin-top:0">Spieler stimmen auf der Spielerseite unter „Events“ ab (nach dem Anmelden mit PIN). Mentoren können dort auch selbst Umfragen für ihre Gruppe starten.</p>' +
    '<label for="umfQ">Frage</label><input id="umfQ" type="text" maxlength="300">' +
    '<label for="umfOpts">Antworten – eine pro Zeile</label><textarea id="umfOpts" rows="4" style="width:100%;box-sizing:border-box"></textarea>' +
    '<div class="umf-chk"><label><input type="checkbox" id="umfMulti"> Mehrere Antworten erlaubt</label><label><input type="checkbox" id="umfOther"> Eigene Antwort erlauben</label><label><input type="checkbox" id="umfAnon"> Anonym (niemand sieht Namen, auch R4/R5 nicht)</label></div>' +
    '<div class="formrow"><div><label for="umfRes">Ergebnis sichtbar</label><select id="umfRes">' + Object.keys(UMF_RES).map(function(k){ return '<option value="' + k + '">' + UMF_RES[k] + '</option>'; }).join('') + '</select></div>' +
    '<div><label for="umfEnd">Endet am (optional)</label><input id="umfEnd" type="datetime-local"></div>' +
    '<div><label for="umfGrp">Für wen</label><select id="umfGrp"><option value="">Ganze Allianz</option>' + groups.map(function(g, i){ return '<option value="' + i + '">Mentorengruppe ' + (i + 1) + (g.r4 ? ' (' + esc(g.r4) + ')' : '') + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="small muted" style="margin:6px 0 2px">Nur diese Ränge (nichts angekreuzt = alle)</div><div class="umf-chk">' + ['R1','R2','R3','R4','R5'].map(function(r){ return '<label><input type="checkbox" data-umfrank="' + r + '"> ' + r + '</label>'; }).join('') + '</div>' +
    '<div class="btnrow"><button class="btn" id="umfAdd">Umfrage starten</button></div><div class="note" id="umfMsg"></div></div>';
}
function umfCard(p){
  var tot = Math.max(1, p.n), r = p.res || { counts: [], other: [], voters: null };
  var tags = ['von ' + esc(p.by), fmtDateTime(new Date(p.at))];
  tags.push(p.open ? (p.closes_at ? 'endet ' + fmtDateTime(new Date(p.closes_at)) : 'offen') : '<span class="down">beendet</span>');
  tags.push(p.grp !== null && p.grp !== undefined ? 'Mentorengruppe ' + (p.grp + 1) : 'ganze Allianz');
  if (p.ranks && p.ranks.length) tags.push('nur ' + p.ranks.join(', '));
  if (p.multi) tags.push('Mehrfachauswahl'); if (p.anon) tags.push('anonym');
  tags.push('Ergebnis ' + UMF_RES[p.results]);
  return '<div class="card umf"><h2 data-noi18n>' + esc(p.q) + '</h2><div class="small muted">' + tags.join(' · ') + ' · <b>' + p.n + ' Stimmen</b></div>' +
    p.opts.map(function(o, i){ var k = r.counts[i] || 0, pc = Math.round(k * 100 / tot), who = r.voters ? r.voters.filter(function(v){ return v.c.indexOf(i) >= 0; }).map(function(v){ return esc(v.n); }) : [];
      return '<div class="umf-o"><div class="umf-bar" style="width:' + pc + '%"></div><span>' + esc(o) + '</span><b>' + k + ' · ' + pc + ' %</b>' + (who.length ? '<small data-noi18n>' + who.join(', ') + '</small>' : '') + '</div>'; }).join('') +
    (r.other.length ? '<div class="small" style="margin-top:6px"><b>Eigene Antworten:</b> ' + r.other.map(function(x){ return '„' + esc(x.t) + '“' + (x.n ? ' – ' + esc(x.n) : ''); }).join(' · ') + '</span></div>' : '') +
    '<div class="btnrow" style="justify-content:flex-end">' + (p.open ? '<button class="mini" data-umf="close" data-id="' + p.id + '">Beenden</button>' : '<button class="mini" data-umf="reopen" data-id="' + p.id + '">Wieder öffnen</button>') +
    '<button class="mini danger" data-umf="delete" data-id="' + p.id + '">Löschen</button></div></div>';
}
function umfRender(){
  var s = $('tab-umf'); if (!s) return;
  var keep = $('umfQ') ? { q: $('umfQ').value, o: $('umfOpts').value } : null;
  s.innerHTML = umfForm() + (UMF === null ? '<div class="empty">Lädt …</div>' : UMF_ERR ? '<div class="empty">Konnte nicht geladen werden – ist die Datenbank-Erweiterung „umfragen“ eingespielt?</div>' :
    UMF.length ? UMF.map(umfCard).join('') : '<div class="empty">Noch keine Umfragen.</div>');
  if (keep) { $('umfQ').value = keep.q; $('umfOpts').value = keep.o; }
}
document.addEventListener('click', function(e){
  if (e.target.id === 'umfAdd') {
    var opts = $('umfOpts').value.split('\n').map(function(x){ return x.trim(); }).filter(Boolean), q = $('umfQ').value.trim(), m = $('umfMsg');
    if (!q || !opts.length) { m.textContent = 'Bitte eine Frage und mindestens eine Antwort eingeben.'; m.className = 'note err'; return; }
    var d = { q: q, opts: opts, multi: $('umfMulti').checked, other: $('umfOther').checked, anon: $('umfAnon').checked, results: $('umfRes').value,
      closes_at: $('umfEnd').value ? new Date($('umfEnd').value).toISOString() : '', grp: $('umfGrp').value,
      ranks: Array.prototype.slice.call(document.querySelectorAll('[data-umfrank]')).filter(function(c){ return c.checked; }).map(function(c){ return c.dataset.umfrank; }) };
    e.target.disabled = true;
    rpc('admin_poll', { p_pw: PW, p_action: 'add', p_data: d, p_actor: ACTOR || null }).then(function(){ $('umfQ').value = ''; $('umfOpts').value = ''; toast('Umfrage gestartet.', true); return umfLoad(); })
      .catch(function(){ e.target.disabled = false; m.textContent = 'Fehler – ist die Datenbank-Erweiterung „umfragen“ eingespielt?'; m.className = 'note err'; });
    return;
  }
  var b = e.target.closest('[data-umf]'); if (!b) return;
  var a = b.dataset.umf; if (a === 'delete' && !confirm('Umfrage mit allen Stimmen löschen?')) return;
  b.disabled = true;
  rpc('admin_poll', { p_pw: PW, p_action: a, p_data: { id: +b.dataset.id }, p_actor: ACTOR || null }).then(umfLoad).catch(function(){ b.disabled = false; toast('Fehler beim Speichern.', false); });
});
