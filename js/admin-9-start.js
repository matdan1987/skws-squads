/* SKWS Squads – Admin: start (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Steuerung ---------- */
function showTab(name){
  var bs = document.querySelectorAll('#tabs button');
  for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', bs[i].dataset.tab === name);
  ['ov','mem','hist','pl','dev','exp','ds','cs','mg','mer','adm','log'].forEach(function(t){ $('tab-' + t).classList.toggle('hide', t !== name); });
  store('skws_admin_tab', name);
  if (name === 'hist') renderHistory();
  if (name === 'ov') renderOverview();
  if (name === 'pl') renderPlayer();
  if (name === 'adm') renderAdmin();
  if (name === 'exp') renderExport();
  if (name === 'ds') dsRender();
  if (name === 'cs') csRender();
  if (name === 'mg') mgRender();
  if (name === 'mer') merRender();
  if (name === 'dev') renderDev();
  if (name === 'log') loadLog(false);
}
function renderAll(){
  renderOverview(); renderMembers(); fillPlayerSelect();
  showTab(store('skws_admin_tab') || 'ov');
}
function load(pw, silent){
  $('loginBtn').disabled = true; $('loginMsg').textContent = '';
  return rpc('admin_data', { p_pw: pw }).then(function(raw){
    DS_PUB = raw.ds || null;
    var first = !PW && !silent;
    PW = pw; store('skws_admin_pw', pw); if (!silent) { if ($('remember').checked) ls('skws_admin_pw_keep', pw); else ls('skws_admin_pw_keep', null); }
    D = prep(raw); mgInit(raw); EV = raw.ev || []; EVCFG = raw.evcfg || {}; MER = raw.merits || []; MERCFG = raw.meritcfg || null;
    $('who').textContent = ACTOR ? ACTOR : 'R4/R5';
    if (first) rpc('admin_login', { p_pw: pw, p_actor: ACTOR || null }).catch(function(){});
    $('loginView').classList.add('hide'); $('app').classList.remove('hide');
    $('reload').classList.remove('hide'); $('logout').classList.remove('hide');
    renderAll(); avLoad();
  }).catch(function(err){
    if (String(err && err.message).indexOf('ERR_AUTH') >= 0) forgetPw();
    if (!silent) $('loginMsg').textContent = String(err && err.message).indexOf('ERR_AUTH') >= 0 ? 'Kennwort falsch.' : 'Laden fehlgeschlagen – bitte erneut versuchen.';
  }).then(function(){ $('loginBtn').disabled = false; });
}

$('actor').value = ACTOR;
$('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  ACTOR = $('actor').value.trim() || ls('skws_name') || ''; ls('skws_admin_actor', ACTOR || null);
  load($('pw').value);
});
$('logout').addEventListener('click', function(){ forgetPw(); location.reload(); });
$('reload').addEventListener('click', function(){ if (PW) load(PW, true); });
$('tabs').addEventListener('click', function(e){ var b = e.target.closest('button'); if (b) showTab(b.dataset.tab); });
['memSearch','memSort','memFilter'].forEach(function(id){ $(id).addEventListener(id === 'memSearch' ? 'input' : 'change', renderMembers); });
$('memTable').addEventListener('click', function(e){
  var tr = e.target.closest('tr.click'); if (!tr) return;
  curPlayer = tr.dataset.name; $('plSelect').value = curPlayer; showTab('pl');
});
$('plSelect').addEventListener('change', function(){ curPlayer = this.value; renderPlayer(); });
$('admSearch').addEventListener('input', renderAdmin);
$('selSearch').addEventListener('input', renderExport);
['logView','logFilter'].forEach(function(id){ $(id).addEventListener('change', renderLog); });
$('logSearch').addEventListener('input', renderLog);
$('logMore').addEventListener('click', function(){ loadLog(true); });
$('logList').addEventListener('click', function(e){
  var a = e.target.closest('a[data-name]'); if (!a) return;
  if (!D.all.some(function(p){ return p.name === a.dataset.name; })) return;
  curPlayer = a.dataset.name; $('plSelect').value = curPlayer; showTab('pl');
});
['devPeriod','devMetric','devBy'].forEach(function(id){ $(id).addEventListener('change', renderDev); });
$('odList').addEventListener('click', function(e){ var r = e.target.closest('.dev'); if (!r) return; curPlayer = r.dataset.name; $('plSelect').value = curPlayer; showTab('pl'); });
$('odCopy').addEventListener('click', function(){
  var od = D.players.filter(function(p){ return p.entry && p.stale; }).map(function(p){ return p.name; });
  var never = D.players.filter(function(p){ return !p.entry; }).map(function(p){ return p.name; });
  if (!od.length && !never.length) { $('odNote').textContent = 'Niemand zu erinnern.'; $('odNote').className = 'note ok'; return; }
  var t = 'SKWS - Erinnerung Squad-Meldung';
  if (od.length) t += '\n\nBitte aktualisiert eure Werte (seit ueber 7 Tagen nicht aktualisiert) / Please update your values:\n' + od.join(', ');
  if (never.length) t += '\n\nBitte tragt euch ein (noch keine Meldung) / Please enter your squads:\n' + never.join(', ');
  copyText(t, 'odNote');
});
$('tab-dev').addEventListener('click', function(e){ var r = e.target.closest('.dev'); if (!r) return; curPlayer = r.dataset.name; $('plSelect').value = curPlayer; showTab('pl'); });
$('pickList').addEventListener('change', function(e){ var c = e.target; if (!c.dataset.name) return; if (c.checked) SEL[c.dataset.name] = 1; else delete SEL[c.dataset.name]; updateSelCount(); });
$('tab-exp').querySelector('.chips').addEventListener('click', function(e){
  var b = e.target.closest('[data-sel]'); if (!b) return; var k = b.dataset.sel;
  if (k === 'all') D.players.forEach(function(p){ SEL[p.name] = 1; });
  else if (k === 'none') SEL = {};
  else if (k === 'done') { SEL = {}; D.players.forEach(function(p){ if (p.entry) SEL[p.name] = 1; }); }
  else D.players.forEach(function(p){ if (p.rank === k || (p.entry && sq(p.entry,0).type === k)) SEL[p.name] = 1; });
  renderExport();
});
['expSort','expCols'].forEach(function(id){ $(id).addEventListener('change', updateSelCount); });
$('expCsv').addEventListener('click', function(){
  var list = sortList(selected(), $('expSort').value);
  if (!list.length) { $('expNote').textContent = 'Bitte zuerst Spieler auswählen.'; $('expNote').className = 'note err'; return; }
  download('SKWS-Squads-' + fileDate() + '.csv', csv([CSV_HEAD].concat(list.map(playerRow))));
  $('expNote').textContent = 'CSV mit ' + list.length + ' Spielern erstellt.'; $('expNote').className = 'note ok';
});
$('expCopy').addEventListener('click', function(){ copyText(exportText(), 'expNote'); });
var FR_TYPES = { tank:'Tank', missile:'Missile', aircraft:'Plane', mixed:'Hybrid' };
var FR_HEAD = ['Username','Hero Power','Type T1','T1','Type T2','T2','Type T3','T3','T4','Niv Gorilla','TOTAL'];
function frNum(v){ return v ? String(Math.round(v * 100) / 100).replace('.', ',') : ''; }
function frRows(){
  var list = selected().filter(function(p){ return p.entry; }).sort(function(a,b){ return b.total - a.total; });
  return list.map(function(p){
    var e = p.entry, r = [p.name, e.hero ? String(Math.round(e.hero * 1e6)) : ''];
    for (var i = 0; i < 3; i++) { var s = sq(e, i); r.push(s.type ? FR_TYPES[s.type] : '', s.type ? frNum(s.power) : ''); }
    var s4 = sq(e, 3); r.push(s4.type ? frNum(s4.power) : '');
    r.push(e.gstage ? String(e.gstage) : '', frNum(p.total));
    return r;
  });
}
function frCheck(rows){
  if (rows.length) return true;
  $('expNote').textContent = 'Bitte zuerst Spieler mit Meldung auswählen.'; $('expNote').className = 'note err'; return false;
}
$('expFrCopy').addEventListener('click', function(){
  var rows = frRows(); if (!frCheck(rows)) return;
  copyText(rows.map(function(r){ return r.join('\t'); }).join('\n'), 'expNote');
});
$('expFrCsv').addEventListener('click', function(){
  var rows = frRows(); if (!frCheck(rows)) return;
  download('SKWS-Serverliste-' + fileDate() + '.csv', csv([FR_HEAD].concat(rows)));
  $('expNote').textContent = 'Server-Liste mit ' + rows.length + ' Spielern erstellt.'; $('expNote').className = 'note ok';
});
$('addForm').addEventListener('submit', function(e){
  e.preventDefault();
  var n = $('addName').value.trim(); if (!n) return note('Bitte einen Namen eingeben.', false);
  var r = $('addRank').value;
  memberAction('add', n, r, n + ' wurde als ' + r + ' hinzugefügt.').then(function(){ $('addName').value = ''; });
});
$('admActive').addEventListener('change', function(e){
  var s = e.target.closest('select.rk'); if (!s) return;
  memberAction('rank', s.dataset.name, s.value, s.dataset.name + ' ist jetzt ' + s.value + '.');
});
$('tab-adm').addEventListener('click', function(e){
  var b = e.target.closest('button[data-act]'); if (!b) return;
  var n = b.dataset.name, a = b.dataset.act;
  if (a === 'leave' && confirm(n + ' als ausgeschieden markieren?\nDer Spieler verschwindet von der Eintragsseite und bekommt keine Erinnerungen mehr. Sein Verlauf bleibt erhalten.'))
    memberAction('leave', n, null, n + ' ist als ausgeschieden markiert.');
  if (a === 'rejoin') memberAction('rejoin', n, null, n + ' ist wieder aktiv.');
  if (a === 'avdel' && confirm('Avatar von ' + n + ' entfernen?')) rpc('admin_avatar', { p_pw: PW, p_name: n, p_actor: ACTOR || null }).then(function(){ delete AVA[n]; renderAdmin(); note('Avatar von ' + n + ' entfernt.', true); }).catch(function(){ note('Fehler – ist die Datenbank-Erweiterung „avatar“ eingespielt?', false); });
  if (a === 'rename') { var nn = prompt('Neuer Name für ' + n + ':', n); if (nn && nn.trim() && nn.trim() !== n) { nn = nn.trim(); memberAction('rename', n, nn, n + ' heißt jetzt ' + nn + '.').then(function(){ mgRename(n, nn); }); } }
});

var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ if (!D) return; var t = store('skws_admin_tab') || 'ov'; showTab(t); }, 200); });
var saved = savedPw();
if (saved) load(saved, true);
