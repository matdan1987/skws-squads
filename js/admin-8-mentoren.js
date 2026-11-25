/* SKWS Squads – Admin: mentoren (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
/* ---------- Mentorengruppen ---------- */
var MG_KEY = 'skws_mg';
var MG_DEF = [
  { r4:'MissLizzie', mentors:['Harald','Boss Ralle'], members:['TheEducated','G89op','Rakeeete','Valhala','RAC','AlxPWarrior','Sergio','Killergurke11','BlueeStars','Pepperpaws','soapbox169','Lizzie Pea'] },
  { r4:'ExXos', mentors:['Bzdziszewo','Mythe'], members:['Saschmaster','rouv','Sven der Schreck','Gabberdok','Ninchen1112','Dominic u','Rasty 85','Dreadmaw','Shuuk'] },
  { r4:'Zaradim', mentors:['Davewave','Schlöki'], members:['xX Karsten Xx','Herr BERT','Carlos23mj','Floka','PeterPan','TurbooTobse','AMILKAR WALKER','Markus'] },
  { r4:'Bedraloç', mentors:['SSAB'], members:['nienett','Döra','Böhse Onkelz','BarryTheBelson','ruskapunkku','HandyPanda','OnkelKuschel','Rafal Sobo'] },
  { r4:'Niek Langis', mentors:['Florinator97','Dr Blubb','BATMAN 81'], members:['Lia','Dörri','Marco oooo','Mephisto1793','Astrid','MihailaZe','Oz of the apocalypse','Master LeK','Nini','ALEKSANDAR','BayernBua','Klumpfuß'], intensive:true }
];
// Stand kommt aus der Datenbank (für alle R4/R5 gleich). Noch nichts gespeichert: früherer Gerätestand bzw. Ausgangsliste.
var MG_CUR = null, MG_INFO = null, MG_DIRTY = false;
function mgInit(raw){
  var st = raw && raw.mg && raw.mg.data, local = null;
  MG_INFO = raw && raw.mg ? { updated: raw.mg.updated, by: raw.mg.by } : null;
  MG_DIRTY = false;
  if (!st || !st.groups) { try { local = JSON.parse(ls(MG_KEY) || 'null'); } catch(e){} st = local && local.groups ? local : { groups: JSON.parse(JSON.stringify(MG_DEF)), thr: 35 }; MG_DIRTY = true; }
  MG_CUR = st;
}
function mgState(){
  if (!MG_CUR) mgInit(null);
  var st = JSON.parse(JSON.stringify(MG_CUR));
  if (typeof st.thr !== 'number') st.thr = 35;
  return st;
}
function mgSave(st){
  MG_CUR = JSON.parse(JSON.stringify(st));
  var n = $('mgNote'); n.textContent = 'Speichere …'; n.className = 'note ok';
  return rpc('admin_mg_save', { p_pw: PW, p_data: MG_CUR, p_actor: ACTOR || null }).then(function(r){
    // Bestätigungen, die Mentoren inzwischen auf der Spielerseite gesetzt haben, übernehmen
    if (r && r.join) { MG_CUR.join = r.join; if (typeof mgRender === 'function' && !$('tab-mg').classList.contains('hide')) setTimeout(mgRender, 0); }
    MG_DIRTY = false; MG_INFO = { updated: new Date().toISOString(), by: ACTOR || 'Admin' };
    try { ls(MG_KEY, null); } catch(e){}
    n.textContent = 'Gespeichert – für alle R4/R5 sichtbar.'; n.className = 'note ok'; mgInfo();
  }).catch(function(err){
    var m = String(err && err.message);
    n.textContent = m.indexOf('ERR_AUTH') >= 0 ? 'Nicht angemeldet – bitte neu anmelden.' : 'Speichern fehlgeschlagen – Änderung ist nur auf diesem Gerät.';
    n.className = 'note err'; try { ls(MG_KEY, JSON.stringify(MG_CUR)); } catch(e){}
  });
}
function mgInfo(){
  var el = $('mgInfo'); if (!el) return;
  el.textContent = MG_DIRTY ? 'Noch nicht zentral gespeichert – „Für alle speichern“ drücken, damit alle R4/R5 diesen Stand sehen.'
    : MG_INFO ? 'Zuletzt gespeichert am ' + fmtDateTime(new Date(MG_INFO.updated)) + (MG_INFO.by ? ' von ' + MG_INFO.by : '') + '.' : '';
  el.style.color = MG_DIRTY ? 'var(--warn)' : '';
  $('mgSaveAll').classList.toggle('hide', !MG_DIRTY);
}
// Rolle eines Spielers: { g: Gruppennummer (1-basiert), role: 'r4' | 'mentor' | 'member' }
function mgOf(name, st){
  st = st || mgState(); var out = null;
  st.groups.forEach(function(G, i){
    if (G.r4 === name) out = { g: i + 1, role: 'r4' };
    else if (G.mentors.indexOf(name) >= 0) out = { g: i + 1, role: 'mentor' };
    else if (G.members.indexOf(name) >= 0) out = { g: i + 1, role: 'member' };
  });
  return out;
}
function mgBadge(name){
  var m = mgOf(name); if (!m) return '';
  return '<span class="mgb' + (m.role === 'mentor' ? ' m' : m.role === 'r4' ? ' r' : '') + '" title="Mentorengruppe ' + m.g + '">G' + m.g + (m.role === 'mentor' ? ' · Mentor' : m.role === 'r4' ? ' · R4' : '') + '</span>';
}
function mgPlayers(){ var by = {}; (D ? D.players : []).forEach(function(p){ by[p.name] = p; }); return by; }
function mgStats(G, by){
  var all = G.mentors.concat(G.members).filter(function(n){ return by[n]; });
  var known = all.filter(function(n){ return by[n].entry; });
  return { n: G.mentors.length + G.members.length, known: known.length, avg: known.length ? known.reduce(function(a, n){ return a + by[n].t1; }, 0) / known.length : 0 };
}
function mgRecommend(st, by){
  var stats = st.groups.map(function(G){ var s = mgStats(G, by); return { n: s.n, sum: s.avg * s.known, known: s.known }; });
  var intensive = -1; st.groups.forEach(function(G, i){ if (G.intensive) intensive = i; });
  var free = D.players.filter(function(p){ return p.active && !mgOf(p.name, st) && p.rank !== 'R4' && p.rank !== 'R5'; })
    .sort(function(a, b){ return b.t1 - a.t1 || a.name.localeCompare(b.name); });
  return free.map(function(p){
    var weak = p.entry && p.t1 > 0 && p.t1 < st.thr, gi = -1, why;
    if (weak && intensive >= 0) { gi = intensive; why = 'T1 ' + fmt(p.t1) + ' unter ' + fmt(st.thr) + ' → Intensivgruppe'; }
    else {
      stats.forEach(function(s, i){
        if (i === intensive) return;
        if (gi < 0) { gi = i; return; }
        var b = stats[gi], av = s.known ? s.sum / s.known : 0, bv = b.known ? b.sum / b.known : 0;
        if (s.n < b.n || (s.n === b.n && av < bv)) gi = i;
      });
      why = p.entry ? 'kleinste Gruppe' + (stats[gi] ? ' (' + stats[gi].n + ' Spieler)' : '') : 'noch keine Werte – vorläufig in die kleinste Gruppe';
    }
    if (gi >= 0) { stats[gi].n++; if (p.entry && p.t1) { stats[gi].sum += p.t1; stats[gi].known++; } }
    return { p: p, g: gi, why: why };
  });
}
function mgDays(t){ var d = Math.floor((Date.now() - new Date(t)) / DAY); return d <= 0 ? 'seit heute' : d === 1 ? 'seit 1 Tag' : 'seit ' + d + ' Tagen'; }
function mgJoinSum(st, G, i){
  var c = { ok:0, open:0, unknown:0 }; G.mentors.concat(G.members).forEach(function(n){ c[mgJoin(st, n, i).s]++; });
  return '<div class="jsum"><span class="up">✅ ' + c.ok + ' beigetreten</span>' + (c.open ? ' · <span class="warn">⏳ ' + c.open + ' offen</span>' : '') + (c.unknown ? ' · <span class="muted">❔ ' + c.unknown + ' prüfen</span> <button class="mini" data-mgallok="' + i + '">alle als beigetreten</button>' : '') + '</div>';
}
function mgRenderOpen(st){
  var l = mgOpenList(st);
  $('mgOpenCount').textContent = l.length;
  $('mgOpen').innerHTML = l.length ? l.map(function(x){ var p = D.all.filter(function(q){ return q.name === x.n; })[0];
    return '<div class="mgrow"><span class="nm">' + av(x.n, 30) + esc(x.n) + ' <span class="v">→ Gruppe ' + (x.g + 1) + ' (' + esc(x.r4) + ')</span><div class="tl">zugewiesen ' + fmtDate(new Date(x.t)) + ' · ' + mgDays(x.t) + (p && !p.active ? ' · ausgeschieden' : '') + '</div></span>' +
      '<button class="mini okb" data-mgjoin="' + esc(x.n) + '" data-g="' + x.g + '" data-v="1">✅ beigetreten</button></div>'; }).join('') : '<div class="empty">Alle zugewiesenen Spieler sind im Spiel beigetreten (oder noch nicht erfasst – „❔ prüfen“ in den Gruppen).</div>';
  $('mgOpenCopy').disabled = $('mgOpenPm').disabled = !l.length;
}
function mgRender(){
  if (!D) return;
  var st = mgState(), by = mgPlayers();
  $('mgThr').value = st.thr; mgInfo();
  var total = 0, mentors = 0, inGroups = {};
  var opts = function(cur){
    var o = []; st.groups.forEach(function(G, i){ o.push(['m' + i, 'G' + (i + 1) + ' Mitglied']); o.push(['t' + i, 'G' + (i + 1) + ' Mentor']); });
    o.push(['x', 'aus Gruppe nehmen']);
    return o.map(function(x){ return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('');
  };
  function r4opts(cur){
    var used = {}; st.groups.forEach(function(G){ used[G.r4] = 1; });
    var c = D.players.filter(function(p){ return (p.rank === 'R4' || p.rank === 'R5') && (!used[p.name] || p.name === cur); }).map(function(p){ return p.name; });
    if (c.indexOf(cur) < 0) c.unshift(cur);
    return c.map(function(n){ return '<option value="' + esc(n) + '"' + (n === cur ? ' selected' : '') + '>' + (n === cur ? 'R4: ' : 'wechseln zu ') + esc(n) + (by[n] && n !== cur ? ' (' + by[n].rank + ')' : '') + '</option>'; }).join('');
  }
  function row(n, cur){
    var p = by[n]; inGroups[n] = 1;
    var v = !p ? '<span class="stale">nicht in der Mitgliederliste</span>' : p.entry ? 'T1 ' + fmt(p.t1) : 'keine Meldung';
    var gi = +cur.slice(1), j = mgJoin(st, n, gi);
    var chip = j.s === 'ok' ? '<button class="jchip ok" data-mgjoin="' + esc(n) + '" data-g="' + gi + '" data-v="0" title="Im Spiel beigetreten am ' + fmtDate(new Date(j.t)) + ' – antippen, um wieder auf offen zu setzen">✅ beigetreten</button>'
      : j.s === 'open' ? '<button class="jchip open" data-mgjoin="' + esc(n) + '" data-g="' + gi + '" data-v="1" title="Antippen, sobald er im Spiel beigetreten ist">⏳ offen ' + mgDays(j.t) + '</button>'
      : '<button class="jchip unk" data-mgjoin="' + esc(n) + '" data-g="' + gi + '" data-v="1" title="Noch nicht erfasst – antippen, wenn er im Spiel in der Gruppe ist">❔ prüfen</button>';
    return '<div class="mgrow"><span class="nm">' + av(n, 30) + esc(n) + '</span><span class="v">' + v + '</span>' + chip + '<select data-mg="' + esc(n) + '">' + opts(cur) + '</select></div>';
  }
  var free = mgRecommend(st, by);
  function addSel(i){ return free.length ? '<div class="mgadd"><select data-mgaddto="' + i + '"><option value="">+ Spieler ohne Gruppe hinzufügen (' + free.length + ')</option>' +
    free.map(function(r){ return '<option value="' + esc(r.p.name) + '">' + esc(r.p.name) + ' · ' + (r.p.entry ? 'T1 ' + fmt(r.p.t1) : 'keine Meldung') + '</option>'; }).join('') + '</select></div>' : ''; }
  $('mgGroups').innerHTML = st.groups.map(function(G, i){
    var s = mgStats(G, by); total += s.n; mentors += G.mentors.length; inGroups[G.r4] = 1;
    return '<div class="mgcard' + (G.intensive ? ' int' : '') + '"><h3>Gruppe ' + (i + 1) + ' – ' + esc(G.r4) + (G.intensive ? ' <span class="mgb m">Intensiv</span>' : '') + '</h3>' +
      '<div class="sub">' + s.n + ' Spieler + 1 R4 · Ø T1 ' + (s.known ? fmt(s.avg) : '–') + ' (' + s.known + ' mit Meldung)</div>' + mgJoinSum(st, G, i) +
      '<div class="mglbl">R4 – Kontrolle</div><div class="mgrow"><span class="nm">' + esc(G.r4) + '</span>' +
        (!by[G.r4] ? '<span class="v stale">nicht in der Mitgliederliste</span>' : (by[G.r4].rank !== 'R4' && by[G.r4].rank !== 'R5') ? '<span class="v stale">ist kein R4 mehr</span>' : '') +
        '<select data-mgr4="' + i + '" title="R4 der Gruppe wechseln">' + r4opts(G.r4) + '</select></div>' +
      '<div class="mglbl">' + (G.mentors.length === 1 ? 'Mentor' : 'Mentoren') + '</div>' + (G.mentors.map(function(n){ return row(n, 't' + i); }).join('') || '<div class="small muted">–</div>') +
      '<div class="mglbl">Mitglieder</div>' + (G.members.map(function(n){ return row(n, 'm' + i); }).join('') || '<div class="small muted">–</div>') + addSel(i) + '</div>';
  }).join('');
  var recs = mgRecommend(st, by);
  $('mgTiles').innerHTML = tile('In Gruppen', String(total), mentors + ' Mentoren · ' + st.groups.length + ' R4') + tile('Ohne Gruppe', String(recs.length), recs.length ? 'Liste direkt darunter' : 'alle verteilt') +
    tile('Größte / kleinste', Math.max.apply(null, st.groups.map(function(G){ return G.mentors.length + G.members.length; })) + ' / ' + Math.min.apply(null, st.groups.map(function(G){ return G.mentors.length + G.members.length; })), 'Spieler je Gruppe');
  $('mgFreeCount').textContent = recs.length;
  $('mgFree').innerHTML = recs.map(function(r){
    return '<div class="mgrow"><span class="nm">' + esc(r.p.name) + ' <span class="v">' + r.p.rank + ' · ' + (r.p.entry ? 'T1 ' + fmt(r.p.t1) : 'keine Meldung') + '</span><div class="tl">' + esc(r.why) + '</div></span>' +
      '<select data-mgpick="' + esc(r.p.name) + '" title="Gruppe frei wählen"><option value="">Gruppe wählen …</option>' + opts('').replace(/<option value="x"[^<]*<\/option>/, '') + '</select>' +
      '<button class="mini okb" data-mgadd="' + esc(r.p.name) + '" data-g="' + r.g + '" title="Empfehlung übernehmen">→ G' + (r.g + 1) + '</button></div>';
  }).join('') || '<div class="empty">Alle aktiven Spieler sind einer Gruppe zugeordnet.</div>';
  $('mgApplyAll').disabled = !recs.length; $('mgApplyAll').style.opacity = recs.length ? '' : .4;
  mgRenderMentors(st, by); mgRenderOpen(st);
  var lead = D.players.filter(function(p){ return (p.rank === 'R4' || p.rank === 'R5') && !inGroups[p.name]; }).map(function(p){ return p.name + ' (' + p.rank + ')'; });
  $('mgLead').textContent = lead.length ? 'R4/R5 ohne eigene Gruppe (werden nicht verteilt): ' + lead.join(', ') : '';
  var miss = Object.keys(inGroups).filter(function(n){ return !by[n]; });
  $('mgMissing').innerHTML = miss.length ? 'In einer Gruppe, aber nicht (mehr) als aktives Mitglied geführt: ' + miss.map(esc).join(', ') + ' <button class="mini" id="mgClean">aus Gruppen nehmen</button>' : '';
}
function mgMentorRecs(st, by, withR1){
  var ment = []; st.groups.forEach(function(G){ ment = ment.concat(G.mentors); });
  var known = ment.filter(function(n){ return by[n] && by[n].entry && by[n].t1; });
  var avg = known.length ? known.reduce(function(a, n){ return a + by[n].t1; }, 0) / known.length : 0;
  var ratio = st.groups.map(function(G){ return (G.mentors.length + G.members.length) / Math.max(1, G.mentors.length); });
  var worst = 0; ratio.forEach(function(r, i){ if (r > ratio[worst]) worst = i; });
  var list = D.players.filter(function(p){
    if (!p.active || !p.entry || !p.t1 || p.t1 < avg) return false;
    if (p.rank === 'R4' || p.rank === 'R5' || (p.rank === 'R1' && !withR1)) return false;
    var m = mgOf(p.name, st); return !m || m.role === 'member';
  }).sort(function(a, b){ return b.t1 - a.t1; });
  return { avg: avg, ratio: ratio, recs: list.map(function(p){ var m = mgOf(p.name, st); return { p: p, g: m ? m.g - 1 : worst, own: !!m }; }) };
}
function mgRenderMentors(st, by){
  var r = mgMentorRecs(st, by, $('mgR1').checked);
  $('mgMAvg').textContent = r.avg ? 'T1 ' + fmt(r.avg) : '–';
  $('mgMent').innerHTML = r.recs.map(function(x){
    var G = st.groups[x.g];
    return '<div class="mgrow"><span class="nm">' + esc(x.p.name) + ' <span class="v">' + x.p.rank + ' · T1 ' + fmt(x.p.t1) + '</span><div class="tl">' +
      (x.own ? 'jetzt Mitglied in Gruppe ' + (x.g + 1) : 'noch ohne Gruppe') + ' · Gruppe ' + (x.g + 1) + ' hat ' + G.mentors.length + ' Mentor' + (G.mentors.length === 1 ? '' : 'en') + ' für ' + (G.mentors.length + G.members.length) + ' Spieler</div></span>' +
      '<button class="mini okb" data-mgment="' + esc(x.p.name) + '" data-g="' + x.g + '">→ Mentor G' + (x.g + 1) + '</button></div>';
  }).join('') || '<div class="empty">Keine weiteren Kandidaten über dem Mentoren-Schnitt.</div>';
}
function mgSetR4(st, i, name){
  var G = st.groups[i]; if (!G || !name || G.r4 === name) return;
  // neuer R4 verlässt ggf. seine bisherige Mentoren-/Mitgliederrolle
  mgMove(st, name, 'x'); G.r4 = name;
}
function mgMove(st, name, val){
  st.groups.forEach(function(G){ G.mentors = G.mentors.filter(function(n){ return n !== name; }); G.members = G.members.filter(function(n){ return n !== name; }); });
  st.join = st.join || {};
  if (!val || val === 'x') { delete st.join[name]; return; }
  var i = +val.slice(1), G = st.groups[i]; if (!G) return;
  (val[0] === 't' ? G.mentors : G.members).push(name);
  // Beitritt im Spiel: bei neuer Gruppe offen; Rollenwechsel in derselben Gruppe ändert nichts
  var j = st.join[name];
  if (!j || j.g !== i) st.join[name] = { g: i, at: new Date().toISOString(), ok: null, ts: new Date().toISOString() };
}
// Beitrittsstatus: 'ok' (im Spiel beigetreten), 'open' (zugewiesen, noch nicht beigetreten), 'unknown' (älterer Stand ohne Angabe)
function mgJoin(st, name, i){ var j = st.join && st.join[name]; if (!j || j.g !== i) return { s: 'unknown' }; return j.ok ? { s: 'ok', t: j.ok } : { s: 'open', t: j.at }; }
function mgSetJoin(st, name, i, ok){ st.join = st.join || {}; var j = st.join[name] || { g: i, at: new Date().toISOString() }; j.g = i; j.ok = ok ? new Date().toISOString() : null; if (!ok) j.at = j.at || new Date().toISOString(); j.ts = new Date().toISOString(); st.join[name] = j; }
function mgOpenList(st){ var out = []; st.groups.forEach(function(G, i){ G.mentors.concat(G.members).forEach(function(n){ var j = mgJoin(st, n, i); if (j.s === 'open') out.push({ n: n, g: i, r4: G.r4, t: j.t }); }); });
  return out.sort(function(a, b){ return new Date(a.t) - new Date(b.t); }); }
function mgJoinChat(list){
  var by = {}; list.forEach(function(x){ (by[x.g] = by[x.g] || []).push(x); });
  return Object.keys(by).map(function(g){ var l = by[g], G = l[0];
    return 'Mentorengruppe ' + (+g + 1) + ' (R4: ' + G.r4 + ') – bitte im Spiel beitreten / please join in the game: ' + l.map(function(x){ return '@' + x.n; }).join(' '); }).join('\n');
}
// Ausgeschiedene aus den Gruppen nehmen (R4 einer Gruppe bleibt stehen, bis ein neuer R4 gewählt ist)
function mgLeave(n){
  var st = mgState(), inG = false, r4 = null;
  st.groups.forEach(function(G, i){ if (G.mentors.indexOf(n) >= 0 || G.members.indexOf(n) >= 0) inG = true; if (G.r4 === n) r4 = i + 1; });
  if (inG) { mgMove(st, n, 'x'); mgSave(st); }
  if (inG || r4) note(n + ' ist als ausgeschieden markiert' + (inG ? ' und aus der Mentorengruppe genommen' : '') + '.' + (r4 ? ' Achtung: ' + n + ' ist R4 von Gruppe ' + r4 + ' – bitte im Tab Mentoren einen neuen R4 wählen.' : ''), !r4);
}
function mgCleanup(){
  var st = mgState(), by = mgPlayers(), gone = [];
  st.groups.forEach(function(G){ G.mentors.concat(G.members).forEach(function(n){ if (!by[n]) gone.push(n); }); });
  if (!gone.length || !confirm(gone.length + ' Spieler aus den Gruppen nehmen, die nicht (mehr) aktive Mitglieder sind?\n\n' + gone.join(', '))) return;
  gone.forEach(function(n){ mgMove(st, n, 'x'); }); mgSave(st); mgRender();
}
function mgRename(o, nn){
  if (!D || !D.players.some(function(p){ return p.name === nn; })) return;
  var st = mgState(), hit = false;
  st.groups.forEach(function(G){
    if (G.r4 === o) { G.r4 = nn; hit = true; }
    ['mentors','members'].forEach(function(k){ G[k] = G[k].map(function(x){ if (x === o) { hit = true; return nn; } return x; }); });
  });
  if (st.join && st.join[o]) { st.join[nn] = st.join[o]; delete st.join[o]; }
  if (hit) mgSave(st).then(renderMembers);
}
function mgChat(){
  var st = mgState(), by = mgPlayers(), out = [], tot = 0, men = 0;
  st.groups.forEach(function(G, i){
    var n = G.mentors.length + G.members.length; tot += n; men += G.mentors.length;
    out.push('GRUPPE ' + (i + 1) + ' - ' + G.r4.toUpperCase() + (G.intensive ? ' (Intensiv)' : ''));
    out.push('R4: ' + G.r4);
    out.push((G.mentors.length === 1 ? 'Mentor: ' : 'Mentoren: ') + (G.mentors.join(', ') || '-'));
    out.push('Mitglieder: ' + (G.members.join(', ') || '-'));
    out.push('');
  });
  out.push('Gesamt: ' + tot + ' Spieler, davon ' + men + ' Mentoren, dazu ' + st.groups.length + ' R4');
  return out.join('\n');
}
(function(){
  $('mgGroups').addEventListener('change', function(e){
    var s = e.target.closest('select[data-mg]'); if (!s) return;
    var st = mgState(); mgMove(st, s.dataset.mg, s.value); mgSave(st); mgRender(); renderMembers();
  });
  $('mgGroups').addEventListener('change', function(e){
    var s = e.target.closest('select[data-mgr4]'); if (!s) return;
    var st = mgState(), G = st.groups[+s.dataset.mgr4], old = G.r4;
    if (!confirm('Gruppe ' + (+s.dataset.mgr4 + 1) + ': R4 von ' + old + ' auf ' + s.value + ' wechseln?')) { mgRender(); return; }
    mgSetR4(st, +s.dataset.mgr4, s.value); mgSave(st); mgRender(); renderMembers();
  });
  $('mgMent').addEventListener('click', function(e){
    var b = e.target.closest('[data-mgment]'); if (!b) return;
    var st = mgState(); mgMove(st, b.dataset.mgment, 't' + b.dataset.g); mgSave(st); mgRender(); renderMembers();
  });
  $('mgR1').addEventListener('change', function(){ mgRender(); });
  // Beitritt im Spiel bestätigen / zurücksetzen
  document.getElementById('tab-mg').addEventListener('click', function(e){
    var b = e.target.closest('[data-mgjoin]');
    if (b) { var st = mgState(); if (b.dataset.v === '0' && !confirm(b.dataset.mgjoin + ' wieder auf „noch nicht beigetreten“ setzen?')) return;
      mgSetJoin(st, b.dataset.mgjoin, +b.dataset.g, b.dataset.v === '1'); mgSave(st); mgRender(); return; }
    var a = e.target.closest('[data-mgallok]');
    if (a) { var st2 = mgState(), i = +a.dataset.mgallok, G = st2.groups[i]; if (!confirm('Alle noch nicht erfassten Spieler in Gruppe ' + (i + 1) + ' als „im Spiel beigetreten“ markieren?')) return;
      G.mentors.concat(G.members).forEach(function(n){ if (mgJoin(st2, n, i).s === 'unknown') mgSetJoin(st2, n, i, true); }); mgSave(st2); mgRender(); }
  });
  $('mgOpenCopy').addEventListener('click', function(){ copyText(mgJoinChat(mgOpenList(mgState())), 'mgOpenMsg'); });
  $('mgOpenPm').addEventListener('click', function(){
    var l = mgOpenList(mgState()); if (!l.length) return;
    var by = {}; l.forEach(function(x){ (by[x.g] = by[x.g] || []).push(x); });
    if (!confirm('Erinnerung als Nachricht an ' + l.length + ' Spieler senden? Sie sehen sie beim nächsten Anmelden unter „Funk“ und müssen sie bestätigen.')) return;
    var m = $('mgOpenMsg'); m.textContent = 'Sende …'; m.className = 'note ok';
    Promise.all(Object.keys(by).map(function(g){ var G = by[g][0];
      return rpc('admin_msg', { p_pw: PW, p_actor: ACTOR || null, p_data: { names: by[g].map(function(x){ return x.n; }), subject: 'Mentorengruppe ' + (+g + 1) + ' / Mentor group ' + (+g + 1),
        body: 'Bitte tritt im Spiel deiner Mentorengruppe bei: Gruppe ' + (+g + 1) + ', R4: ' + G.r4 + '.\n\nPlease join your mentor group in the game: group ' + (+g + 1) + ', R4: ' + G.r4 + '.' } }); }))
      .then(function(){ m.textContent = 'Gesendet an ' + l.length + ' Spieler.'; m.className = 'note ok'; })
      .catch(function(e){ m.textContent = 'Fehler: ' + e.message; m.className = 'note err'; });
  });
  $('mgMissing').addEventListener('click', function(e){ if (e.target.closest('#mgClean')) mgCleanup(); });
  $('mgFree').addEventListener('change', function(e){
    var s = e.target.closest('select[data-mgpick]'); if (!s || !s.value) return;
    var st = mgState(); mgMove(st, s.dataset.mgpick, s.value); mgSave(st); mgRender(); renderMembers();
  });
  $('mgGroups').addEventListener('change', function(e){
    var s = e.target.closest('select[data-mgaddto]'); if (!s || !s.value) return;
    var st = mgState(); mgMove(st, s.value, 'm' + s.dataset.mgaddto); mgSave(st); mgRender(); renderMembers();
  });
  $('mgFree').addEventListener('click', function(e){
    var b = e.target.closest('[data-mgadd]'); if (!b) return;
    var st = mgState(); mgMove(st, b.dataset.mgadd, 'm' + b.dataset.g); mgSave(st); mgRender(); renderMembers();
  });
  $('mgApplyAll').addEventListener('click', function(){
    var st = mgState(), recs = mgRecommend(st, mgPlayers()); if (!recs.length) return;
    if (!confirm(recs.length + ' Spieler wie empfohlen auf die Gruppen verteilen?')) return;
    recs.forEach(function(r){ if (r.g >= 0) mgMove(st, r.p.name, 'm' + r.g); }); mgSave(st); mgRender(); renderMembers();
  });
  $('mgThr').addEventListener('change', function(){ var v = parseFloat(this.value); var st = mgState(); st.thr = isFinite(v) && v >= 0 ? v : 35; mgSave(st); mgRender(); });
  $('mgCopy').addEventListener('click', function(){ copyText(mgChat(), 'mgNote'); });
  $('mgReset').addEventListener('click', function(){ if (!confirm('Gruppen für alle auf die Ausgangsliste zurücksetzen?')) return; var st = { groups: JSON.parse(JSON.stringify(MG_DEF)), thr: mgState().thr }; mgSave(st); mgRender(); renderMembers(); });
  $('mgSaveAll').addEventListener('click', function(){ mgSave(mgState()); });
})();
