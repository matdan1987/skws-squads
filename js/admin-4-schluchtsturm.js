/* SKWS Squads – Admin: schluchtsturm (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Schluchtsturm (Canyon Storm, 2 gegen 1) ---------- */
var CS_KEY = 'skws_cs', CS_ONLYSEL = false, CS_LAST = null;
function csState(){
  var st = null; try { st = JSON.parse(ls(CS_KEY) || 'null'); } catch(e){}
  st = st || {}; st.assign = st.assign || {}; st.time = st.time || {A:'',B:''}; st.opp = st.opp || {A:'',B:''};
  st.note = st.note || {A:'',B:''}; st.tac = st.tac || {A:'lab',B:'mid'}; st.metric = st.metric || 't1';
  return st;
}
function csSave(st){ try { ls(CS_KEY, JSON.stringify(st)); } catch(e){} }
function csAct(step, lang){ var t = CS_A[lang || 'de'][step[0]] || step[0]; return t.split('{b}').join(CS_B[lang || 'de'][step[1]] || '').split('{t}').join(CS_OPEN[step[1]] || ''); }
function csTacInfo(t){
  var T = CS_TACTICS[$('csTac' + t).value] || CS_TACTICS.lab;
  $('csTacInfo' + t).innerHTML = '<b>' + esc(T.name) + '</b><br>' + esc(T.desc) + '<br><span class="muted">Wann: </span>' + esc(T.when) + '<br><span class="up">+ </span>' + esc(T.pro) + '<br><span class="down">− </span>' + esc(T.con);
}
function csRender(){
  if (!D) return;
  var st = csState();
  ['A','B'].forEach(function(t){
    $('csTime' + t).value = st.time[t]; $('csOpp' + t).value = st.opp[t]; $('csNote' + t).value = st.note[t];
    $('csTac' + t).value = CS_TACTICS[st.tac[t]] ? st.tac[t] : 'lab'; csTacInfo(t);
  });
  $('csMetric').value = st.metric;
  evRender('cs'); csPubInfo();
  csRenderList();
  if (typeof ablRender === 'function') ablRender('cs');
}
function csRenderList(){
  var st = csState(), m = st.metric, q = $('csSearch').value.trim().toLowerCase();
  var list = D.players.filter(function(p){ return p.active; }).slice().sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); });
  var c = { AS:0, AE:0, BS:0, BE:0 };
  list.forEach(function(p){ var v = st.assign[p.name]; if (c[v] !== undefined) c[v]++; });
  function box(t){ var s = c[t+'S'], e = c[t+'E']; return '<div>Team ' + t + (st.time[t] ? ' · ' + esc(st.time[t]) : '') + '<b><span class="' + (s > 20 ? 'over' : '') + '">' + s + '/20 Stamm</span> · <span>' + e + ' Ersatz</span></b></div>'; }
  $('csCount').innerHTML = box('A') + box('B');
  $('csOnlySel').textContent = CS_ONLYSEL ? 'alle Spieler zeigen' : 'nur Zugeordnete zeigen';
  var opts = [['','–'],['AS','A Stamm'],['AE','A Ersatz'],['BS','B Stamm'],['BE','B Ersatz']];
  $('csList').innerHTML = list.filter(function(p){ if (CS_ONLYSEL && !st.assign[p.name]) return false; return !q || p.name.toLowerCase().indexOf(q) >= 0; }).map(function(p){
    var v = st.assign[p.name] || '';
    return '<label class="' + (v ? (v[0] === 'A' ? 'as' : 'bs') : '') + (p.entry ? '' : ' nodata') + '"><span class="nm">' + av(p.name, 30) + esc(p.name) + mgBadge(p.name) + merBadge(p.name, 'cs') + '</span><span class="meta">' + p.rank + ' · ' + dsMetricTxt(p, m) + '</span>' +
      '<select data-cs="' + esc(p.name) + '">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
  }).join('') || '<div class="empty">Keine Treffer.</div>';
}
function csBuild(st){
  st = st || csState(); var m = st.metric, by = {}; D.players.forEach(function(p){ by[p.name] = p; });
  var plan = { teams: {} }, warn = [];
  ['A','B'].forEach(function(t){
    function pick(r){ return Object.keys(st.assign).filter(function(n){ return st.assign[n] === t + r && by[n] && by[n].active; }).map(function(n){ return by[n]; })
      .sort(function(a,b){ return dsMetricVal(b,m) - dsMetricVal(a,m) || a.name.localeCompare(b.name); }); }
    var stamm = pick('S'), subs = pick('E');
    if (!stamm.length && !subs.length) return;
    var tk = CS_TACTICS[st.tac[t]] ? st.tac[t] : 'lab', TC = CS_TACTICS[tk], members = [], i = 0, last = TC.groups[TC.groups.length - 1].k;
    TC.groups.forEach(function(g){ for (var k = 0; k < g.n && i < stamm.length; k++, i++) members.push([stamm[i].name, g.k]); });
    for (; i < stamm.length; i++) members.push([stamm[i].name, last]);
    if (stamm.length > 20) warn.push('Team ' + t + ': ' + stamm.length + ' Stammspieler – im Spiel sind nur 20 möglich.');
    var used = {}; TC.groups.forEach(function(g){ if (members.some(function(x){ return x[1] === g.k; })) used[g.k] = g.steps; });
    plan.teams[t] = { time: st.time[t] || '', opp: st.opp[t] || '', note: st.note[t] || '', tac: tk, ph: TC.ph, g: used, open: CS_OPEN, top: !!TC.top, m: members, s: subs.map(function(p){ return p.name; }) };
  });
  return { plan: plan, warn: warn, by: by };
}
var CS_PUB = null;
function csPubInfo(){
  var p = CS_PUB;
  $('csPubInfo').textContent = p && p.at ? 'Aktuell veröffentlicht: ' + fmtDateTime(new Date(p.at)) + ' (' + Object.keys(p.teams || {}).map(function(t){ return 'Team ' + t; }).join(' + ') + ')' : 'Aktuell ist kein Schluchtsturm-Einsatz veröffentlicht.';
}
function csPublish(plan){
  $('csMsg').textContent = 'Speichere…'; $('csMsg').className = 'note';
  rpc('admin_cs_publish', { p_pw: PW, p_plan: plan, p_actor: ACTOR || null }).then(function(){
    CS_PUB = plan; csPubInfo(); if (typeof ablRender === 'function') ablRender('cs');
    $('csMsg').textContent = plan ? 'Veröffentlicht – die Spieler sehen ihren Schluchtsturm-Einsatz jetzt auf der Seite.' : 'Veröffentlichung zurückgenommen.'; $('csMsg').className = 'note ok';
  }).catch(function(e){ $('csMsg').textContent = 'Fehler beim Speichern – ist die Datenbank-Erweiterung „ausbau“ eingespielt? ' + (e && e.message || ''); $('csMsg').className = 'note err'; });
}
function csRun(example){
  var st = null;
  if (example === true) {
    st = JSON.parse(JSON.stringify(csState())); var mm = st.metric;
    var list = D.players.filter(function(p){ return p.active && p.entry; }).sort(function(a,b){ return dsMetricVal(b,mm) - dsMetricVal(a,mm); });
    st.assign = {}; list.forEach(function(p, i){ var v = i < 40 ? (i % 2 ? 'BS' : 'AS') : i < 50 ? (i % 2 ? 'BE' : 'AE') : ''; if (v) st.assign[p.name] = v; });
    st.time = { A: st.time.A || 'Do 15:00', B: st.time.B || 'Do 15:00' };
  }
  var moved = [];
  if (example !== true) { var st0 = csState(); moved = evFill('cs', st0.assign, st0.metric); if (moved.length) { csSave(st0); csRenderList(); } }
  var r = csBuild(st); if (moved.length) r.warn.unshift('Ersatz rückt in den Stamm nach, weil das Team sonst nicht voll ist: ' + moved.join(', ') + '.');
  r.example = example === true; CS_LAST = r;
  $('csPublish').disabled = !!r.example; $('csPublish').style.opacity = r.example ? .4 : '';
  if (example !== true) evSaveLineup('cs', csState().assign);
  var P = r.plan, h = '';
  ['A','B'].forEach(function(t){
    var T = P.teams[t]; if (!T) return; var TC = CS_TACTICS[T.tac];
    h += '<div class="team"><h3>Team ' + t + (T.time ? ' · ' + esc(T.time) : '') + (T.opp ? ' · gegen ' + esc(T.opp) : '') + '<span>' + esc(TC.name) + ' · ' + T.m.length + ' Stamm · ' + T.s.length + ' Ersatz</span></h3>';
    if (T.note) h += '<p class="small" style="margin:0 0 6px">Hinweis: ' + esc(T.note) + '</p>';
    h += '<div class="tw"><table class="grp"><tr><th>Gruppe</th><th>Spieler</th>' + T.ph.map(function(k){ return '<th>' + CS_PHL.de[k] + '</th>'; }).join('') + '</tr>';
    csGroupsOf(T).forEach(function(x){
      h += '<tr><td><b>' + esc(x.g.label) + '</b></td><td>' + x.names.map(function(n){ return esc(n) + '<div class="phase">' + dsMetricTxt(r.by[n], CS_LAST && csState().metric) + '</div>'; }).join('') + '</td>' +
        x.g.steps.map(function(s){ return '<td>' + esc(csAct(s)) + '</td>'; }).join('') + '</tr>';
    });
    if (T.s.length) h += '<tr class="rankhead"><td colspan="5">Ersatz (Reihenfolge = wer zuerst nachrückt)</td></tr><tr><td colspan="5" style="white-space:normal">' + T.s.map(function(n, i){ return 'E' + (i+1) + ' ' + esc(n); }).join(' · ') + '</td></tr>';
    h += '</table></div></div>';
  });
  if (!Object.keys(P.teams).length) h = '<div class="empty">Bitte zuerst oben Spieler Team A oder B zuordnen.</div>';
  if (r.example && Object.keys(P.teams).length) h = '<div class="note ok">BEISPIEL – gemischt verteilt, nur zum Ausprobieren.</div>' + h;
  if (r.warn.length) h = '<div class="note err">' + r.warn.map(esc).join('<br>') + '</div>' + h;
  $('csResult').innerHTML = h; $('csOut').innerHTML = '';
  $('csActions').classList.toggle('hide', !Object.keys(P.teams).length);
  ['A','B'].forEach(function(t){ ['csCopy','csPic'].forEach(function(id){ $(id + t).classList.toggle('hide', !P.teams[t]); }); $('csPic' + t + 'de').classList.toggle('hide', !P.teams[t]); });
}
function csChat(t){
  var T = CS_LAST.plan.teams[t], out = ['SKWS Schluchtsturm Team ' + t + (T.time ? ' - ' + T.time : '') + ' - Plan siehe Bild'];
  csGroupsOf(T).forEach(function(x){ x.g.steps.forEach(function(s){ if (s[0] === 'rally') out.push('- ' + x.names.join(', ') + ': ab 13:30 sammeln, um 14:00 zusammen aufs Viruslabor und bis zum Ende halten.'); }); });
  if (T.s.length) out.push('- Ersatz in dieser Reihenfolge: ' + T.s.join(', ') + '. Ersatz übernimmt die Aufgabe dessen, der ausfällt.');
  out.push('- Öffnungszeiten: Abwehrsysteme ab 7, Serumfabriken ab 10, Viruslabor ab 14 Minuten.');
  out.push('- Basen nicht direkt nebeneinander stellen (Judicator trifft benachbarte Basen).');
  out.push('- Höchstens 5 Spieler pro Gebäude. Gebäude halten, Punkte-Kisten einsammeln.');
  out.push('- Das Viruslabor in den letzten Minuten nicht verlassen.');
  out.push('Deinen Einsatz siehst du auch im Bild.');
  return out.join('\n');
}
function csRender_img(t, lang, IMG){
  var L = lang === 'de' ? 'de' : 'en', url = csDraw(CS_LAST.plan.teams[t], t, lang, IMG);
  var name = 'SKWS-Schluchtsturm-Team-' + t + '-' + L.toUpperCase() + '-' + fileDate() + '.png', A = window.SKWSAndroid;
  var hh = '<img src="' + url + '" alt="Plan Team ' + t + '">';
  if (A && A.saveImage) hh += '<button class="btn" id="csSave" style="width:100%;margin-top:8px">Bild in der Galerie speichern</button>';
  else if (A) hh += '<p class="small" style="color:var(--warn)">Zum Speichern in der App bitte App-Version 1.2 installieren – oder die Admin-Seite im Browser öffnen.</p>';
  else hh += '<a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:8px" download="' + name + '" href="' + url + '">Bild herunterladen</a>';
  $('csOut').innerHTML = hh;
  if ($('csSave')) $('csSave').addEventListener('click', function(){ A.saveImage(name, url); });
}
(function(){
  function upd(fn){ var st = csState(); fn(st); csSave(st); }
  var tacOpts = Object.keys(CS_TACTICS).map(function(k){ return '<option value="' + k + '">' + esc(CS_TACTICS[k].name) + '</option>'; }).join('');
  ['A','B'].forEach(function(t){
    $('csTac' + t).innerHTML = tacOpts;
    $('csTac' + t).addEventListener('change', function(){ var v = this.value; upd(function(st){ st.tac[t] = v; }); csTacInfo(t); });
    $('csTime' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.time[t] = v; }); csRenderList(); });
    $('csOpp' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.opp[t] = v; }); });
    $('csNote' + t).addEventListener('input', function(){ var v = this.value; upd(function(st){ st.note[t] = v; }); });
    $('csCopy' + t).addEventListener('click', function(){ if (CS_LAST && CS_LAST.plan.teams[t]) copyText(csChat(t), 'csMsg'); });
    ['', 'de'].forEach(function(sfx){ $('csPic' + t + sfx).addEventListener('click', function(){
      var lang = this.dataset.lang; if (!CS_LAST || !CS_LAST.plan.teams[t]) return;
      csLoadTpl(t, lang, function(im){ if (im) csRender_img(t, lang, im); else { $('csMsg').textContent = 'Vorlage konnte nicht geladen werden.'; $('csMsg').className = 'note err'; } });
    }); });
  });
  $('csMetric').addEventListener('change', function(){ var v = this.value; upd(function(st){ st.metric = v; }); csRenderList(); });
  $('csSearch').addEventListener('input', csRenderList);
  $('csOnlySel').addEventListener('click', function(){ CS_ONLYSEL = !CS_ONLYSEL; csRenderList(); });
  $('csClear').addEventListener('click', function(){ if (!confirm('Alle Schluchtsturm-Zuordnungen löschen?')) return; upd(function(st){ st.assign = {}; }); csRenderList(); });
  $('csList').addEventListener('change', function(e){ var s = e.target.closest('select[data-cs]'); if (!s) return; var n = s.dataset.cs, v = s.value; upd(function(st){ if (v) st.assign[n] = v; else delete st.assign[n]; }); csRenderList(); });
  $('csRun').addEventListener('click', function(){ csRun(false); });
  $('csPublish').addEventListener('click', function(){ if (!CS_LAST || CS_LAST.example) return; csRun(false); if (!Object.keys(CS_LAST.plan.teams).length || !confirm('Schluchtsturm-Einsatz für die Spieler veröffentlichen?')) return; var pl = JSON.parse(JSON.stringify(CS_LAST.plan)); pl.at = new Date().toISOString(); csPublish(pl); });
  $('csUnpublish').addEventListener('click', function(){ if (confirm('Veröffentlichten Schluchtsturm-Einsatz zurücknehmen?')) csPublish(null); });
  $('csExample').addEventListener('click', function(){ csRun(true); });
})();
