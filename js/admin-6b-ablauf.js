/* SKWS Squads – Admin: Wüstensturm/Schluchtsturm als geführter Ablauf
   Oben eine Übersicht „So läuft eine Runde ab“ mit Status je Schritt und „Jetzt dran“,
   dazu kurze Hilfetexte in jeder Karte (lassen sich ausblenden). */
var ABL_HELP = (function(){ try { return localStorage.getItem('skws_admin_help') !== '0'; } catch(e){ return true; } })();
var ABL_TXT = {
  ev: 'So geht’s: „Neue Anmelderunde starten“ aufklappen, Bezeichnung (z. B. KW 48), Anmeldeschluss und Uhrzeiten eintragen und starten. Dann „Aufruf für den Chat kopieren“ und im Allianz-Chat einfügen. Die Spieler antworten auf der Spielerseite unter „Events“ – hier siehst du live, wer wie geantwortet hat. Kurz vor dem Event: „In Schritt 2 übernehmen“.',
  pick: 'Hier steht, wer in welchem Team spielt (Stamm oder Ersatz). Nach „In Schritt 2 übernehmen“ ist schon alles vorausgefüllt – die Stärksten zuerst, Wünsche der Spieler berücksichtigt. Prüfe die Zahlen oben und ändere bei Bedarf einzelne Spieler über ihr Auswahlfeld. Wichtig: genauso trägst du die Spieler anschließend im Spiel ein.',
  tac: 'Uhrzeit und (wenn bekannt) den Gegner je Team eintragen. Dann die Taktik wählen – unter der Auswahl steht, wann sie passt und was dafür und dagegen spricht. Im Zweifel die vorgeschlagene Taktik lassen. Die Sonderanweisung erscheint im Plan des Teams.',
  plan: '„Taktik erstellen“ verteilt die eingeteilten Spieler auf die Gebäude – die Stärksten auf die wichtigsten. Plan prüfen, dann Chat-Text oder Plan-Bild kopieren und im Chat teilen. Zum Schluss „Für Spieler veröffentlichen“: Dann sieht jeder seinen eigenen Einsatz auf der Spielerseite unter „Events“. „Beispiel zeigen“ ist nur zum Ausprobieren und wird nie veröffentlicht.'
};
function ablCards(k){
  var c = function(el){ return el && el.closest('.card'); };
  return { ev: $('ev_' + k), pick: c($(k + 'List')), tac: c($(k + 'TimeA')), plan: c($(k + 'Run')) };
}
function ablHelpBox(key){ return '<div class="abl-help' + (ABL_HELP ? '' : ' hide') + '"><b>ⓘ</b><span>' + esc(ABL_TXT[key]) + '</span></div>'; }
// Hilfetexte in die festen Karten einsetzen (einmal) – die Anmelde-Karte bekommt ihren beim Zeichnen
function ablInit(k){
  var C = ablCards(k);
  ['pick','tac','plan'].forEach(function(key){
    var card = C[key]; if (!card || card.querySelector('.abl-help')) return;
    var h = card.querySelector('h2'); if (h) h.insertAdjacentHTML('afterend', ablHelpBox(key));
  });
  // seltene Einstellungen unter „Erweitert“
  var met = $(k + 'Metric'), row = met && met.closest('.formrow');
  if (row && !row.closest('details')) { var d = document.createElement('details'); d.className = 'abl-more'; d.innerHTML = '<summary class="small">Erweitert: wonach die Stärke bewertet wird</summary>'; row.parentNode.insertBefore(d, row); d.appendChild(row); }
}
function ablState(k){
  var r = evCur(k), st = k === 'ds' ? dsState() : csState(), last = k === 'ds' ? DS_LAST : CS_LAST, pub = k === 'ds' ? DS_PUB : CS_PUB;
  var asg = Object.keys(st.assign || {}).filter(function(n){ return st.assign[n]; }).length;
  var since = r ? new Date(r.created_at || 0) : null, pubNew = pub && pub.at && (!since || new Date(pub.at) >= since);
  // „Fehlende eintragen“ gilt für die aktuelle Runde (sobald ein Plan dazu existiert)
  var lr = r && r.lineup && Object.keys(r.lineup).length ? r : null;
  var s = [];
  // alte, geschlossene Runde (älter als 5 Tage): Ablauf beginnt mit einer neuen Anmeldung
  var stale = r && !evIsOpen(r) && Date.now() - new Date(r.created_at || 0) > 5 * 86400000;
  s.push({ t: 'Anmeldung starten', done: !!r && !stale, info: r ? esc(r.label) + ' · ' + (evIsOpen(r) ? 'offen' : 'geschlossen') + ' · ' + (r.signups || []).length + ' Antworten' : 'noch keine Runde',
    now: stale ? 'Die letzte Runde ist vorbei. Starte die Anmeldung für das nächste Event und kopiere den Aufruf in den Allianz-Chat.' : 'Lege eine Anmelderunde an und kopiere den Aufruf in den Allianz-Chat.' });
  s.push({ t: 'Spieler einteilen', done: asg > 0, info: asg ? asg + ' Spieler eingeteilt' : 'noch niemand eingeteilt',
    now: r && (r.signups || []).length ? 'Tippe in Schritt 1 auf „In Schritt 2 übernehmen“ – die Anmeldungen werden automatisch auf die Teams verteilt. Danach prüfen.' : 'Warte auf Antworten der Spieler (Schritt 1) und übernimm sie dann in die Teams.' });
  s.push({ t: 'Uhrzeit & Taktik', done: !!(st.time.A || st.time.B), info: ['A','B'].map(function(t){ return st.time[t] ? 'Team ' + t + ': ' + esc(st.time[t]) : ''; }).filter(Boolean).join(' · ') || 'noch keine Uhrzeit',
    now: 'Trag die Uhrzeit je Team ein und prüfe die vorgeschlagene Taktik.' });
  s.push({ t: 'Plan erstellen & veröffentlichen', done: !!pubNew, info: pubNew ? 'veröffentlicht ' + fmtDateTime(new Date(pub.at)) : last && !last.example ? 'erstellt, noch nicht veröffentlicht' : 'noch kein Plan',
    now: last && !last.example ? 'Plan prüfen, im Chat teilen und „Für Spieler veröffentlichen“ tippen.' : 'Tippe auf „Taktik erstellen“, prüfe den Plan, teile ihn und veröffentliche ihn.' });
  s.push({ t: 'Nach dem Event: Fehlende eintragen', done: !!(lr && (lr.absent || []).length), later: !pubNew, info: lr && (lr.absent || []).length ? (lr.absent || []).length + ' als gefehlt markiert (' + esc(lr.label) + ')' : 'nach dem Kampf',
    now: 'Kreuze an, wer eingeteilt war, aber nicht da war – das zählt für Rotation, Marken und Profil.' });
  return s;
}
function ablRender(k){
  var sec = $('tab-' + k); if (!sec || !D) return;
  ablInit(k);
  var box = $('abl_' + k);
  if (!box) { box = document.createElement('div'); box.className = 'card abl'; box.id = 'abl_' + k; sec.insertBefore(box, sec.firstChild); }
  var s = ablState(k), cur = 0; while (cur < 4 && s[cur].done) cur++;
  box.innerHTML = '<div class="abl-top"><h2>🧭 So läuft eine Runde ab</h2><label class="small abl-tg"><input type="checkbox" data-ablhelp' + (ABL_HELP ? ' checked' : '') + '> Hilfetexte</label></div>' +
    '<ol class="abl-steps">' + s.map(function(x, i){
      var cls = i === cur ? 'now' : x.done ? 'done' : 'todo';
      return '<li class="' + cls + '" data-ablgo="' + i + '"><span class="abl-n">' + (x.done && i !== cur ? '✓' : i + 1) + '</span><div><b>' + x.t + '</b><small>' + x.info + '</small></div><span class="abl-go">›</span></li>';
    }).join('') + '</ol>' +
    '<div class="abl-now"><b>Jetzt dran – Schritt ' + (cur + 1) + ':</b> ' + s[cur].now + ' <button class="mini" data-ablgo="' + cur + '">Zu Schritt ' + (cur + 1) + ' ›</button></div>';
}
function ablGo(k, i){
  var C = ablCards(k), el = [C.ev, C.pick, C.tac, C.plan, C.ev][i]; if (!el) return;
  if (window.Klapp && el.classList.contains('zu')) Klapp.open(el);
  if (i === 0) { var nd = el.querySelector('details:not(.abl-more)'); if (nd && !evCur(k)) nd.open = true; }
  if (i === 4) { var ab = el.querySelector('[data-ev="absent"]'); if (ab) { var d = ab.closest('details'); if (d) d.open = true; el = d || el; } }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
['ds','cs'].forEach(function(k){
  var sec = $('tab-' + k); if (!sec) return;
  sec.addEventListener('click', function(e){
    var g = e.target.closest('[data-ablgo]'); if (g) { ablGo(k, +g.dataset.ablgo); return; }
    setTimeout(function(){ ablRender(k); }, 60);            // Status nach Aktionen auffrischen
  });
  sec.addEventListener('change', function(e){
    if (e.target.matches('[data-ablhelp]')) { ABL_HELP = e.target.checked; try { localStorage.setItem('skws_admin_help', ABL_HELP ? '1' : '0'); } catch(x){}
      Array.prototype.forEach.call(document.querySelectorAll('.abl-help'), function(h){ h.classList.toggle('hide', !ABL_HELP); }); return; }
    setTimeout(function(){ ablRender(k); }, 60);
  });
});
