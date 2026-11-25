/* SKWS Squads – Admin: Mitgliederliste (Einstieg für alles rund um einen Spieler) und Stammdaten in der Spielerakte */
var ML_OPEN = (function(){ try { return JSON.parse(ls('skws_admin_mlopen') || '{}') || {}; } catch(e){ return {}; } })();
function mlDays(n){ var d = ajDays(ajOf(n)); return d === '' ? null : +d; }
function mlMatch(p, f){
  if (f === 'noaj') return !ajOf(p.name);
  if (f === 'noentry') return !p.entry;
  if (f === 'nopin') return typeof fkHasPin === 'function' && typeof FK !== 'undefined' && FK && !fkHasPin(p.name);
  if (f === 'nomg') return !mgOf(p.name);
  return true;
}
function mlInfo(p){
  var d = mlDays(p.name), bits = [];
  bits.push(d === null ? '<span class="ml-miss">Beitrittsdatum fehlt</span>' : 'seit ' + d + ' Tagen in der Allianz');
  bits.push(p.entry ? (p.stale ? '<span class="ml-miss">Meldung vor ' + Math.floor((Date.now() - p.updated) / DAY) + ' Tagen</span>' : 'Meldung aktuell') : '<span class="ml-miss">keine Meldung</span>');
  if (typeof FK !== 'undefined' && FK) bits.push(fkHasPin(p.name) ? '🔑 PIN' : '<span class="muted">ohne PIN</span>');
  return bits.join(' · ');
}
function mlRender(){
  var b = $('mlList'); if (!b || !D) return;
  var q = ($('mlQ').value || '').trim().toLowerCase(), f = $('mlFilter').value, quick = $('mlQuick').checked;
  var list = D.players.filter(function(p){ return (!q || p.name.toLowerCase().indexOf(q) >= 0) && mlMatch(p, f); });
  $('mlCount').textContent = D.players.length;
  var noaj = D.players.filter(function(p){ return !ajOf(p.name); }).length;
  $('mlSum').textContent = EX ? (noaj ? noaj + ' Spieler ohne Beitrittsdatum (seit wann in der Allianz)' : 'Beitrittsdatum bei allen eingetragen') : 'Beitrittsdaten laden …';
  $('mlHits').textContent = list.length !== D.players.length ? list.length + ' Treffer' : '';
  b.classList.toggle('ml-quickon', quick);
  b.innerHTML = RANKS.map(function(r){
    var all = D.players.filter(function(p){ return p.rank === r; }), l = list.filter(function(p){ return p.rank === r; }).sort(function(x, y){ return x.name.localeCompare(y.name, 'de', { sensitivity:'base' }); });
    if (!l.length) return '';
    var miss = all.filter(function(p){ return !ajOf(p.name); }).length;
    return '<details class="aj-grp" data-mlr="' + r + '"' + (q || f !== 'all' || ML_OPEN[r] ? ' open' : '') + '><summary>' + r + ' <span class="muted">' + all.length + ' Spieler</span>' +
      (EX ? (miss ? '<span class="aj-miss">' + miss + ' ohne Beitrittsdatum</span>' : '<span class="aj-full">✓ Beitrittsdaten vollständig</span>') : '') + '</summary>' +
      l.map(function(p){
        if (quick) return '<div class="mgrow ml-q"><span class="nm"><a href="#" data-mlopen="' + esc(p.name) + '">' + av(p.name, 28) + esc(p.name) + '</a></span>' + rankSelect(p) + (EX ? ajInputs(p.name) : '') + '</div>';
        return '<div class="mlrow" data-mlopen="' + esc(p.name) + '">' + av(p.name, 36) + '<div class="ml-tx"><b>' + esc(p.name) + '</b>' + mgBadge(p.name) + '<div class="small muted">' + mlInfo(p) + '</div></div><span class="ml-go">›</span></div>';
      }).join('') + '</details>';
  }).join('') || '<div class="empty">Keine Treffer.</div>';
}
// nach dem Speichern eines Beitritts nur die Zähler auffrischen (Eingabefokus bleibt erhalten)
function mlCounts(el){
  if (!$('mlSum')) return;
  var noaj = D.players.filter(function(p){ return !ajOf(p.name); }).length;
  $('mlSum').textContent = noaj ? noaj + ' Spieler ohne Beitrittsdatum (seit wann in der Allianz)' : 'Beitrittsdatum bei allen eingetragen';
  var g = el && el.closest('.aj-grp'); if (!g) return;
  var r = g.dataset.mlr, miss = D.players.filter(function(p){ return p.rank === r && !ajOf(p.name); }).length, sp = g.querySelector('summary .aj-miss, summary .aj-full');
  if (sp) { sp.className = miss ? 'aj-miss' : 'aj-full'; sp.textContent = miss ? miss + ' ohne Beitrittsdatum' : '✓ Beitrittsdaten vollständig'; }
}
// Stammdaten-Karte oben in der Spielerakte: alles, was man an einem Spieler ändern kann
function stammHtml(p){
  var row = function(k, v){ return '<div class="st-row"><span class="st-k">' + k + '</span><span class="st-v">' + v + '</span></div>'; };
  var h = '<div class="card st-card"><h2>Stammdaten</h2>';
  if (p.active) {
    h += row('Rang', rankSelect(p) + '<span class="small muted">speichert sofort</span>');
    h += row('Name', '<b>' + esc(p.name) + '</b><button class="mini" data-act="rename" data-name="' + esc(p.name) + '">Umbenennen</button>');
    h += row('Allianzbeitritt', EX ? ajInputs(p.name) : '<span class="small muted">lädt …</span>');
    h += row('Auf dieser Seite', p.joinedAt ? fmtDate(p.joinedAt) : '–');
    h += row('Profilbild', '<label class="mini av-up">📷 ' + (AVA[p.name] ? 'Neues Bild hochladen' : 'Bild hochladen') + '<input type="file" accept="image/*" data-avup="' + esc(p.name) + '" hidden></label>' +
      (AVA[p.name] ? '<button class="mini" data-act="avdel" data-name="' + esc(p.name) + '">Entfernen</button>' : ''));
    h += row('Status', '<span>aktiv</span> <button class="mini danger" data-act="leave" data-name="' + esc(p.name) + '">Ausgeschieden …</button>');
  } else {
    h += row('Rang', p.rank);
    h += row('Status', '<span class="down">ausgeschieden</span>' + (p.leftAt ? ' <span class="muted">' + fmtDate(p.leftAt) + '</span>' : '') + ' <button class="mini okb" data-act="rejoin" data-name="' + esc(p.name) + '">Wieder aufnehmen</button>');
    h += row('Allianzbeitritt', ajOf(p.name) ? fmtDate(new Date(ajOf(p.name) + 'T12:00:00')) : '–');
  }
  return h + '</div>';
}
// kurze Rückmeldung unten am Bildschirm (gilt für Aktionen aus Liste und Akte)
function toast(txt, ok){
  var t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = txt; t.className = 'toast ' + (ok ? 'ok' : 'err') + ' on'; clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove('on'); }, 3200);
}
function mlOpen(n){ curPlayer = n; $('plSelect').value = n; showTab('pl'); window.scrollTo(0, 0); }

$('mlQ').addEventListener('input', mlRender);
$('mlFilter').addEventListener('change', mlRender);
$('mlQuick').addEventListener('change', mlRender);
$('mlList').addEventListener('click', function(e){
  var o = e.target.closest('[data-mlopen]'); if (!o) return;
  if (e.target.closest('input, select, button') ) return;
  e.preventDefault(); mlOpen(o.dataset.mlopen);
});
$('mlList').addEventListener('toggle', function(e){ var d = e.target; if (!d.dataset || !d.dataset.mlr) return;
  if (($('mlQ').value || '').trim() || $('mlFilter').value !== 'all') return;
  ML_OPEN[d.dataset.mlr] = d.open; ls('skws_admin_mlopen', JSON.stringify(ML_OPEN)); }, true);
$('plBack').addEventListener('click', function(){ showTab('mlist'); window.scrollTo(0, 0); });

// Profilbild für einen Spieler hochladen (R4/R5): quadratisch zuschneiden, verkleinern, als JPEG speichern
function avShrink(file, cb){
  var rd = new FileReader();
  rd.onload = function(){ var im = new Image(); im.onload = function(){
    var c = document.createElement('canvas'), S = 320; c.width = c.height = S; var g = c.getContext('2d');
    var m = Math.min(im.width, im.height), sx = (im.width - m) / 2, sy = (im.height - m) / 2;
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, S, S); g.drawImage(im, sx, sy, m, m, 0, 0, S, S);
    var q = .85, url = c.toDataURL('image/jpeg', q); while (url.length > 76000 && q > .3) { q -= .1; url = c.toDataURL('image/jpeg', q); }
    cb(url);
  }; im.onerror = function(){ cb(null); }; im.src = rd.result; };
  rd.onerror = function(){ cb(null); }; rd.readAsDataURL(file);
}
document.addEventListener('change', function(e){
  var inp = e.target.closest('input[data-avup]'); if (!inp || !inp.files || !inp.files[0]) return;
  var n = inp.dataset.avup;
  var zl = 'de'; try { zl = localStorage.getItem('skws_admin_lang') || 'de'; } catch(x){}
  var shrink = window.Zuschnitt ? function(f, cb){ Zuschnitt.open(f, zl, cb); } : avShrink;
  shrink(inp.files[0], function(url, cancel){
    inp.value = '';
    if (cancel) return;
    if (!url) { toast('Das Bild konnte nicht gelesen werden.', false); return; }
    rpc('admin_avatar_set', { p_pw: PW, p_name: n, p_data: url, p_actor: ACTOR || null }).then(function(r){
      if (!r || !r.ok) { toast(r && r.err === 'ERR_IMAGE' ? 'Bild ungültig oder zu groß.' : 'Speichern fehlgeschlagen.', false); return; }
      AVA[n] = url; showTab(store('skws_admin_tab') || 'pl'); toast('Profilbild von ' + n + ' gespeichert.', true);
    }).catch(function(err){ toast(String(err && err.message).indexOf('ERR_AUTH') >= 0 ? 'Nicht angemeldet – bitte neu anmelden.' : 'Fehler – ist die Datenbank-Erweiterung „admin_avatar“ eingespielt?', false); });
  });
});
