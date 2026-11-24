/* SKWS Squads – Admin: Zugänge (Anmelde-Protokoll, Fehlversuche, Start-PIN) */
var ACC = null;
var ACC_EV = {
  login:        ['ok',   '✔ Angemeldet'],
  register:     ['ok',   '✔ Neu eingetragen, PIN festgelegt'],
  pin_set:      ['ok',   '🔑 Eigene PIN festgelegt'],
  pin_change:   ['ok',   '🔑 PIN geändert'],
  reset_self:   ['warn', '🔑 Neue PIN über „PIN vergessen“'],
  pin_fail:     ['bad',  '✖ Falsche PIN'],
  mail_fail:    ['bad',  '✖ E-Mail passt nicht'],
  locked:       ['bad',  '⛔ Versuch trotz Sperre'],
  reset_nomail: ['bad',  '✖ PIN vergessen – keine E-Mail hinterlegt'],
  reset_admin:  ['adm',  '🛡️ PIN zurückgesetzt'],
  pin_initial:  ['adm',  '🛡️ Start-PIN vergeben']
};
function accLoad(){
  var nm = $('accName').value, fails = $('accFails').checked;
  $('accList').innerHTML = '<div class="empty">Lädt …</div>';
  return rpc('admin_funk', { p_pw: PW, p_action: 'auth_log', p_data: { name: nm || null, fails: fails } })
    .then(function(r){ ACC = r.items || []; accRender(); })
    .catch(function(){ ACC = null; $('accList').innerHTML = '<div class="empty">Konnte nicht geladen werden (fehlt die Datenbank-Erweiterung „zugaenge“?).</div>'; });
}
function accRender(){
  var sel = $('accName'), cur = sel.value;
  sel.innerHTML = '<option value="">alle Spieler</option>' + D.all.map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('');
  sel.value = cur;
  var ip = $('accInitName'), ic = ip.value;
  ip.innerHTML = '<option value="">– Spieler wählen –</option>' + D.players.map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join('');
  ip.value = ic;
  if (!$('accPin').value) $('accPin').value = accGen();
  var day = Date.now() - DAY, L = ACC || [];
  var ok24 = L.filter(function(x){ return x.ev === 'login' && new Date(x.t) > day; }).length;
  var bad24 = L.filter(function(x){ return ACC_EV[x.ev] && ACC_EV[x.ev][0] === 'bad' && new Date(x.t) > day; }).length;
  $('accTiles').innerHTML = tile('Anmeldungen 24 h', String(ok24), 'erfolgreich') + tile('Fehlversuche 24 h', String(bad24), bad24 ? '<span class="down">bitte prüfen</span>' : 'alles ruhig') +
    tile('Gesperrt', String(FK && FK.locked ? FK.locked.length : 0), FK && FK.locked && FK.locked.length ? esc(FK.locked.join(', ')) : 'niemand') +
    tile('Mit PIN', (FK ? FK.pins.length : '–') + ' / ' + D.players.length, FK && FK.must && FK.must.length ? FK.must.length + ' noch mit Start-PIN' : '');
  if (!ACC) return;
  var last = '';
  $('accList').innerHTML = L.length ? L.map(function(x){
    var e = ACC_EV[x.ev] || ['', x.ev], d = new Date(x.t), k = d.toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit' });
    var head = k !== last ? '<div class="logday">' + k + '</div>' : ''; last = k;
    return head + '<div class="acc-row acc-' + e[0] + '"><time>' + d.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' }) + '</time>' +
      '<a data-accname="' + esc(x.name) + '">' + av(x.name, 28) + esc(x.name) + '</a><span>' + e[1] + (x.by ? ' <span class="muted">von ' + esc(x.by) + '</span>' : '') + '</span>' +
      '<span class="muted small">' + esc(x.dev || '') + '</span></div>';
  }).join('') : '<div class="empty">Keine Einträge.</div>';
}
function accGen(){ var a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a); return String(100000 + a[0] % 900000); }
function accInitial(){
  var n = $('accInitName').value, pin = $('accPin').value.trim();
  if (!n) { $('accInitMsg').textContent = 'Bitte Spieler wählen.'; $('accInitMsg').className = 'msg err'; return; }
  if (pin.length < 4) { $('accInitMsg').textContent = 'Die PIN muss mindestens 4 Zeichen haben.'; $('accInitMsg').className = 'msg err'; return; }
  if (!confirm('Start-PIN „' + pin + '“ für ' + n + ' setzen? Eine bisherige PIN wird ersetzt und ' + n + ' auf allen Geräten abgemeldet.')) return;
  rpc('admin_funk', { p_pw: PW, p_action: 'pin_initial', p_data: { name: n, pin: pin }, p_actor: ACTOR || null }).then(function(){
    $('accInitOut').innerHTML = '<div class="acc-out"><div class="small muted">Start-PIN für</div><b>' + esc(n) + '</b><div class="acc-pin">' + esc(pin) + '</div>' +
      '<div class="small">Gib die PIN im Spiel-Chat weiter. Beim ersten Anmelden wird ' + esc(n) + ' gebeten, eine eigene PIN festzulegen.</div>' +
      '<button class="mini" id="accCopy">📋 Text kopieren</button></div>';
    var txt = 'Deine Start-PIN für die SKWS-Seite: ' + pin + ' – Name: ' + n + '. Bitte beim ersten Anmelden eine eigene PIN festlegen. https://matdan1987.github.io/skws-squads/';
    $('accCopy').addEventListener('click', function(){ var b = this;
      function ok(){ b.textContent = '✔ Kopiert'; }
      if (window.SKWSAndroid && window.SKWSAndroid.copy) { window.SKWSAndroid.copy(txt); ok(); } else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok); });
    $('accInitMsg').textContent = ''; $('accPin').value = accGen();
    return fkLoad().then(accLoad);
  }).catch(function(e){ $('accInitMsg').textContent = 'Fehler: ' + e.message; $('accInitMsg').className = 'msg err'; });
}
function accPick(n){ $('accInitName').value = n; $('accName').value = n; accLoad(); $('accInitOut').innerHTML = ''; }
$('accName').addEventListener('change', accLoad);
$('accFails').addEventListener('change', accLoad);
$('accNew').addEventListener('click', function(){ $('accPin').value = accGen(); });
$('accSet').addEventListener('click', accInitial);
$('accList').addEventListener('click', function(e){ var a = e.target.closest('[data-accname]'); if (a) { $('accName').value = a.dataset.accname; accLoad(); } });
