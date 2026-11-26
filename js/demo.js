/* SKWS Squads – Demo-Modus (Spielerseite und Admin-Bereich)
   Aufruf mit ?demo (z. B. index.html?demo oder admin.html?demo). Dann gilt:
   - Es wird NICHTS an die Datenbank geschickt: alle Anfragen beantwortet eine erfundene Beispiel-Allianz im Browser.
   - Echte Daten sind nicht sichtbar; Gespeichertes des Geräts (Name, Anmeldung, Admin-Kennwort) bleibt unberührt.
   - Alles lässt sich ausprobieren; Änderungen gelten nur in diesem Browser-Tab und verschwinden mit „Demo beenden“.
   Muss als erstes Skript geladen werden. */
(function(){
  var qs = new URLSearchParams(location.search), on = false, SS = window.sessionStorage;
  try {
    if (qs.get('demo') === 'aus') { SS.removeItem('skws_demo'); SS.removeItem('skws_demo_db'); SS.removeItem('skws_demo_ls'); SS.removeItem('skws_demo_ss'); }
    else if (qs.has('demo')) { SS.setItem('skws_demo', '1'); on = true; }
    else on = SS.getItem('skws_demo') === '1';
  } catch(e){ on = qs.has('demo'); }
  window.SKWS_DEMO = on;
  if (!on) return;
  var ADMIN = /admin\.html/.test(location.pathname), ME = 'Kestrel', NOW = Date.now(), MIN = 60000, DAY = 86400000;

  /* ---------- Speicher des Geräts abschirmen: Demo liest und schreibt nur in eine eigene Kopie ---------- */
  var P = Storage.prototype, oG = P.getItem, oS = P.setItem, oR = P.removeItem, LS = null, mem = {};
  try { LS = window.localStorage; } catch(e){}
  function memLoad(k){ try { return JSON.parse(oG.call(SS, k) || 'null'); } catch(e){ return null; } }
  mem.l = memLoad('skws_demo_ls') || { skws_name: ME, skws_funk: JSON.stringify({ tok: 'demo-' + ME, name: ME }), skws_admin_pw_keep: 'demo', skws_admin_actor: 'Demo' };
  mem.s = memLoad('skws_demo_ss') || {};
  // Sprache des Geräts übernehmen, damit die Demo in der gewohnten Sprache startet
  ['skws_lang','skws_admin_lang'].forEach(function(k){ try { var v = LS && oG.call(LS, k); if (v && !(k in mem.l)) mem.l[k] = v; } catch(e){} });
  function box(st){ return st === LS ? 'l' : st === SS ? 's' : null; }
  function own(k){ return String(k).indexOf('skws_demo') === 0; }
  function memSave(b){ oS.call(SS, b === 'l' ? 'skws_demo_ls' : 'skws_demo_ss', JSON.stringify(mem[b])); }
  P.getItem = function(k){ var b = box(this); if (!b || own(k)) return oG.call(this, k); return Object.prototype.hasOwnProperty.call(mem[b], k) ? mem[b][k] : null; };
  P.setItem = function(k, v){ var b = box(this); if (!b || own(k)) return oS.call(this, k, v); mem[b][k] = String(v); memSave(b); };
  P.removeItem = function(k){ var b = box(this); if (!b || own(k)) return oR.call(this, k); delete mem[b][k]; memSave(b); };
  // App-Brücke (Android) im Demo nicht benutzen – sonst würde z. B. der gemerkte Name der App überschrieben
  try { Object.defineProperty(window, 'SKWSAndroid', { value: undefined, configurable: true }); } catch(e){ try { window.SKWSAndroid = undefined; } catch(x){} }

  /* ---------- Beispiel-Allianz ---------- */
  var seed = 20261125; function rnd(){ seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function pick(a){ return a[Math.floor(rnd() * a.length)]; }
  function iso(ms){ return new Date(ms).toISOString(); }
  function r2(x){ return Math.round(x * 100) / 100; }
  var NAMES = ['Nova','Orion','Lyra','Vega','Atlas','Kestrel','Juno','Rigel','Zephyr','Sirius','Mira','Altair','Deneb','Castor','Pollux','Electra','Talon','Echo','Blaze','Frost',
               'Raven','Ember','Pixel','Comet','Nebula','Quasar','Titan','Aurora','Phoenix','Draco','Solara','Luna','Onyx','Cobalt','Indigo','Saffron'];
  function makeDB(){
    var TYPES = ['tank','tank','tank','aircraft','missile','mixed'], db = { id: 1000, members: [], entries: {}, history: [], rounds: [], ds: null, cs: null, merits: [], meritcfg: null, evcfg: {},
      msgs: [], shouts: [], gifts: [], badges: [], claimEv: [], seasons: [], notes: [], polls: [], pvotes: [], kv: {}, pstate: {}, style: {}, sassets: [], wallet: {}, owned: {}, absences: [], cal: [], vs: [], help: [], log: [], avatars: {}, pins: {}, mg: null };
    NAMES.forEach(function(n, i){
      var rank = i === 0 ? 'R5' : i < 5 ? 'R4' : ['R3','R3','R2','R1','R2','R3','R1'][i % 7];
      var aj = i % 5 === 3 ? null : iso(NOW - (20 + Math.floor(rnd() * 600)) * DAY).slice(0, 10);
      db.members.push({ name: n, rank: rank, active: true, left_at: null, joined_at: iso(NOW - 9 * DAY), ajoin: aj });
      if (i % 9 !== 7) db.pins[n] = true;
      if (i % 8 === 6) return;                                   // ein paar haben noch nichts eingetragen
      var t1 = 26 + rnd() * 22, ty = pick(TYPES), sq = [{ type: ty, power: r2(t1) }, { type: pick(TYPES), power: r2(t1 * (0.7 + rnd() * 0.15)) },
        { type: pick(TYPES), power: r2(t1 * (0.6 + rnd() * 0.15)) }, { type: pick(TYPES), power: r2(t1 * (0.5 + rnd() * 0.15)) }];
      var upd = NOW - (i % 6 === 5 ? 9 + rnd() * 10 : rnd() * 6) * DAY;
      db.entries[n] = { squads: sq, email: i % 4 ? 'demo' : '', lang: 'de', updated: iso(upd), hero: r2(70 + rnd() * 90), gorilla: 10 + Math.floor(rnd() * 20), gstage: 1 + Math.floor(rnd() * 3), gpower: Math.round(1e6 + rnd() * 2e6) };
      for (var k = 3; k >= 1; k--) db.history.push({ name: n, squads: sq.map(function(s){ return { type: s.type, power: r2(s.power * (1 - k * (0.01 + rnd() * 0.03))) }; }), t: iso(upd - k * 7 * DAY) });
      db.history.push({ name: n, squads: sq, t: iso(upd) });
    });
    var act = db.members.map(function(m){ return m.name; });
    // Mentorengruppen
    db.mg = { thr: 35, groups: [
      { r4: 'Orion', mentors: ['Kestrel', 'Juno'], members: act.slice(10, 18) },
      { r4: 'Lyra', mentors: ['Rigel'], members: act.slice(18, 26) },
      { r4: 'Vega', mentors: ['Zephyr', 'Sirius'], members: act.slice(26, 34), intensive: true } ], join: {} };
    db.mg.groups[0].members.forEach(function(n, i){ db.mg.join[n] = { g: 0, at: iso(NOW - (8 - i) * DAY), ok: i % 3 === 2 ? null : iso(NOW - (6 - i % 5) * DAY), ts: iso(NOW - 5 * DAY) }; });
    db.mg.groups[1].members.forEach(function(n, i){ db.mg.join[n] = { g: 1, at: iso(NOW - 4 * DAY), ok: i % 2 ? iso(NOW - 2 * DAY) : null, ts: iso(NOW - 2 * DAY) }; });
    // Event-Runden: je zwei abgeschlossene mit Aufstellung, eine offene Wüstensturm-Anmeldung
    function round(kind, label, ago, open){
      var id = ++db.id, lu = {}, abs = [], su = [];
      act.forEach(function(n, i){ var x = (i * 7 + id) % 10; if (open && n === ME) return; if (x < 7) su.push({ name: n, choice: pick(['A','B','AB','A','B','subA','no']), note: null, admin: false, t: iso(NOW - (ago + 1) * DAY + i * MIN) }); });
      if (!open) { su.forEach(function(s, i){ if (s.choice !== 'no') lu[s.name] = (s.choice.indexOf('B') >= 0 ? 'B' : 'A') + (s.choice.indexOf('sub') === 0 || i % 6 === 5 ? 'E' : 'S'); }); abs = Object.keys(lu).filter(function(n, i){ return i % 11 === 4; }); }
      db.rounds.push({ id: id, kind: kind, label: label, time_a: kind === 'ds' ? 'Fr 21:00' : 'Do 15:00', time_b: kind === 'ds' ? 'Fr 12:00' : 'Do 15:00',
        deadline: iso(NOW + (open ? 2 * DAY : -(ago - 1) * DAY)), open: !!open, created_at: iso(NOW - (ago + 2) * DAY), by: 'Nova', lineup: lu, absent: abs, signups: open ? su.slice(0, 9) : su,
        meta: open ? null : { plan: { A: { tac: 'Ausgewogen – Silo-Sturm', time: kind === 'ds' ? 'Fr 21:00' : 'Do 15:00', opp: 'Beispiel-Allianz', note: '' }, B: { tac: 'Ausgewogen – Silo-Sturm', time: kind === 'ds' ? 'Fr 12:00' : 'Do 15:00' } }, remark: ago > 10 ? 'Sieg mit knappem Vorsprung' : '' } });
    }
    round('ds', 'KW 46', 14); round('cs', 'KW 46', 12); round('ds', 'KW 47', 7); round('cs', 'KW 47', 5); round('ds', 'KW 48', 0, true); round('cs', 'KW 48', 0, true);
    // veröffentlichter Wüstensturm-Einsatz (so sieht ihn der Spieler unter „Events“)
    db.ds = { at: iso(NOW - 2 * 60 * MIN), metric: 't1', teams: {
      A: { time: 'Fr 21:00', opp: 'Beispiel-Allianz', tac: 'std', note: 'Alle: bei Minute 10 gemeinsam ans Silo!', m: [[ME,'silo'],['Orion','silo'],['Lyra','silo'],['Vega','ref2'],['Atlas','ref2'],['Juno','ref1'],['Rigel','info'],['Zephyr','hosp1'],['Sirius','hosp2']], s: ['Talon','Echo'] },
      B: { time: 'Fr 12:00', tac: 'std', m: [['Mira','silo'],['Altair','silo'],['Deneb','ref2'],['Castor','ref1'],['Pollux','info']], s: ['Blaze'] } } };
    db.cs = { at: iso(NOW - 3 * 60 * MIN), teams: { A: { time: 'Do 15:00', tac: 'lab', ph: ['p0','p7','p14'], g: { sturm: [['take','tower'],['hold','tower'],['rally','lab']], dc1: [['take','dc1'],['hold','dc1'],['hold','dc1']], dc2: [['take','dc2'],['hold','dc2'],['hold','dc2']], sw1: [['take','sw1'],['hold','sw1'],['hold','sw1']] }, open: { ds1:7, ds2:7, sf1:10, sf2:10, lab:14 }, m: [['Orion','sturm'],[ME,'sturm'],['Lyra','sturm'],['Vega','dc1'],['Atlas','dc1'],['Juno','dc2'],['Rigel','sw1']], s: ['Echo'] } } };
    // Bonus / Malus
    function merit(name, kind, effect, reason, ago, vis, rounds){ db.merits.push({ id: ++db.id, name: name, kind: kind, effect: effect, scope: 'ds', reason: reason, rounds: rounds || null, until: null,
      created_at: iso(NOW - ago * DAY), vis: vis || 'public', note: null, by: 'Nova', revoked_at: null, revoked_by: null, left_ds: rounds || null, left_cs: null }); }
    merit('Kestrel', 'bonus', 'prio', 'Top-Punkte im Wüstensturm', 3, 'public', 2); merit('Echo', 'bonus', 'none', 'Hilft neuen Mitgliedern', 6); merit('Talon', 'bonus', 'none', 'Immer pünktlich', 9);
    merit('Frost', 'malus', 'sub', 'Angemeldet, aber nicht erschienen', 5, 'player', 1); merit('Pixel', 'malus', 'none', 'Schild vergessen', 20, 'hidden');
    // Nachrichten, Shoutbox, Geschenke
    db.msgs.push({ id: ++db.id, kind: 'bc', from: 'Nova', subject: 'Willkommen in der Demo', body: 'Das ist eine Rundnachricht. Spieler müssen sie nach dem Anmelden bestätigen – hier siehst du, wie das aussieht.', t: iso(NOW - 2 * DAY),
      audience: { all: true }, rcpt: act.map(function(n, i){ return { name: n, ack: i % 3 ? iso(NOW - DAY) : null }; }) });
    db.msgs.push({ id: ++db.id, kind: 'pm', from: 'Orion', subject: '', body: 'Hi Kestrel, kannst du Freitag Team A übernehmen?', t: iso(NOW - 5 * 60 * MIN), rcpt: [{ name: ME, ack: iso(NOW - 4 * 60 * MIN) }] });
    db.msgs.forEach(function(m){ if (m.kind === 'bc') m.rcpt.forEach(function(r){ if (r.name === ME) r.ack = iso(NOW - DAY); }); });
    [['all','Nova','Guten Morgen zusammen! ☀️',300],['all','Echo','Wer ist heute beim Wüstensturm dabei?',120],['all','Lyra','Ich! Team B 💪',100],['mentor','Orion','Mentoren: bitte die offenen Beitritte prüfen.',60],['lead','Nova','R4-Runde: Taktik für Freitag steht.',30]]
      .forEach(function(x){ db.shouts.push({ id: ++db.id, room: x[0], name: x[1], body: x[2], t: iso(NOW - x[3] * MIN) }); });
    [['Orion','Kestrel','heart','Danke für die Hilfe!',200],['Lyra','Kestrel','coffee','',2000],['Kestrel','Echo','thumb','Starke Runde',3000],['Nova','Talon','trophy','Bester Spieler der Woche',4000]]
      .forEach(function(x){ db.gifts.push({ id: ++db.id, from: x[0], to: x[1], kind: x[2], note: x[3], t: iso(NOW - x[4] * MIN) }); });
    db.badges.push({ id: ++db.id, key: 'demo-zombie', label: 'Zombie-Belagerung KW 47', icon: '🧟', name: 'Kestrel', t: iso(NOW - 6 * DAY), by: 'Nova' });
    db.badges.push({ id: ++db.id, key: 'demo-zombie', label: 'Zombie-Belagerung KW 47', icon: '🧟', name: 'Echo', t: iso(NOW - 6 * DAY), by: 'Nova' });
    db.claimEv.push({ id: ++db.id, label: 'Zombie-Belagerung KW 48', icon: '🧟', open: true, t: iso(NOW - DAY), claims: [{ name: 'Echo', status: 'pending' }, { name: 'Blaze', status: 'pending' }, { name: 'Raven', status: 'ok' }] });
    db.seasons.push({ id: ++db.id, label: 'Weihnachten 2026', icon: '🎄', from: '2026-12-20', to: '2026-12-31' });
    // Abwesenheit, Kalender, Allianz-Duell, Hilfe & Fragen
    function dstr(off){ var d = new Date(NOW + off * DAY); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    db.absences.push({ id: ++db.id, name: 'Vega', from: dstr(-1), to: dstr(6), note: 'Urlaub', by: 'Vega', t: iso(NOW - 2 * DAY) });
    db.absences.push({ id: ++db.id, name: 'Rigel', from: dstr(4), to: dstr(9), note: null, by: 'Nova', t: iso(NOW - DAY) });
    db.cal.push({ id: ++db.id, title: 'Zombie-Belagerung', kind: 'zombie', weekly: true, day: null, wd: 2, tm: '20:30', dur: 30, note: null });
    db.cal.push({ id: ++db.id, title: 'Allianz-Treffen im Chat', kind: 'meet', weekly: false, day: dstr(3), wd: null, tm: '19:00', dur: 60, note: 'Planung für Dezember' });
    var mon = new Date(NOW); mon.setHours(12, 0, 0, 0); mon.setDate(mon.getDate() - (mon.getDay() + 6) % 7);
    db.members.forEach(function(m, i){ if (!m.active || i > 24) return; for (var d = 0; d < 6; d++) { var day = new Date(mon.getTime() + d * DAY); if (day.getTime() > NOW) break;
      db.vs.push({ name: m.name, day: day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0'), pts: Math.round((2 + rnd() * 9) * 1e6), self: rnd() > .5 }); } });
    db.help.push({ id: ++db.id, name: 'Juno', kind: 'ask', body: 'Welche Helden lohnen sich am Anfang für Panzer am meisten?', t: iso(NOW - DAY / 2), done: null, replies: [{ id: ++db.id, name: 'Orion', body: 'Schau dir die Kombination aus dem Allianz-Guide an – ich erklär’s dir gern im Chat.', t: iso(NOW - DAY / 3) }] });
    db.help.push({ id: ++db.id, name: 'Atlas', kind: 'team', body: 'Suche 2 Leute für Rallyes auf Level-8-Zombies heute ab 21 Uhr.', t: iso(NOW - DAY / 5), done: null, replies: [] });
    db.help.push({ id: ++db.id, name: 'Nova', kind: 'tip', body: 'Vor dem Wüstensturm die Lazarett-Truppen abholen – das spart später viel Zeit.', t: iso(NOW - 2 * DAY), done: iso(NOW - DAY), replies: [] });
    db.style.Orion = { frame: 'gold', header: 'aurora', bg: 'stars', show: ['a:ds', 'a:bees'], header_img: null, bg_img: null };
    db.style.Nova = { frame: 'legend', header: 'leader', bg: 'nebula', show: [], header_img: null, bg_img: null };
    db.wallet[ME] = { coins: 140, xp: 160, streak: 4, best: 6, days: 12, last: null }; db.wallet.Orion = { coins: 20, xp: 420, streak: 9, best: 12, days: 31, last: null }; db.wallet.Nova = { coins: 300, xp: 900, streak: 2, best: 20, days: 64, last: null };
    // Umfragen
    function poll(o){ o.id = ++db.id; o.at = iso(NOW - (o.ago || 1) * DAY); delete o.ago; db.polls.push(o); return o.id; }
    var p1 = poll({ q: 'Welches Event sollen wir als Nächstes gemeinsam üben?', opts: ['Wüstensturm', 'Schluchtsturm', 'Zombie-Belagerung'], multi: false, other: true, results: 'live', anon: false, ranks: null, grp: null, closes_at: iso(NOW + 3 * DAY), closed_at: null, by: 'Nova', ago: 1 });
    var p2 = poll({ q: 'Wann passt euch das nächste Gruppentreffen?', opts: ['Mo 20:00', 'Mi 20:00', 'Sa 18:00'], multi: true, other: false, results: 'end', anon: true, ranks: null, grp: 0, closes_at: iso(NOW + 2 * DAY), closed_at: null, by: ME, ago: 0.5 });
    var p3 = poll({ q: 'Neues Allianz-Logo – welches gefällt euch?', opts: ['Variante A (blau)', 'Variante B (gold)'], multi: false, other: false, results: 'live', anon: false, ranks: null, grp: null, closes_at: null, closed_at: iso(NOW - 2 * DAY), by: 'Nova', ago: 6 });
    [['Orion',[0]],['Lyra',[0]],['Vega',[1]],['Atlas',[0]],['Juno',[],'Bärenjagd']].forEach(function(v){ db.pvotes.push({ id: p1, name: v[0], c: v[1], o: v[2] || null, t: iso(NOW - DAY / 2) }); });
    [['Orion',[1,2]],['Lyra',[1]]].forEach(function(v){ db.pvotes.push({ id: p2, name: v[0], c: v[1], o: null, t: iso(NOW - DAY / 3) }); });
    [['Orion',[1]],['Lyra',[0]],['Vega',[1]],['Atlas',[1]],[ME,[1]]].forEach(function(v){ db.pvotes.push({ id: p3, name: v[0], c: v[1], o: null, t: iso(NOW - 4 * DAY) }); });
    db.notes.push({ id: ++db.id, name: ME, body: 'Super Einsatz beim letzten Wüstensturm – danke fürs Halten der Raffinerie!', vis: 'player', t: iso(NOW - 2 * DAY), by: 'Nova' });
    db.notes.push({ id: ++db.id, name: ME, body: 'Kandidat für R4, im Blick behalten.', vis: 'lead', t: iso(NOW - 3 * DAY), by: 'Nova' });
    db.notes.push({ id: ++db.id, name: 'Frost', body: 'Zweimal unentschuldigt gefehlt – beim nächsten Mal ansprechen.', vis: 'lead', t: iso(NOW - 4 * DAY), by: 'Nova' });
    [['save','Echo',{ total_new: 150.2, t1_new: 45.1 },60],['ev_signup','Lyra',{ kind: 'ds', round: 'KW 48', choice: 'B' },100],['merit','Kestrel',{ what: 'add', kind: 'bonus', reason: 'Top-Punkte im Wüstensturm' },4320],['login','Kestrel',{},20]]
      .forEach(function(x){ log(db, x[0] === 'merit' ? 'Nova' : x[1], x[0], x[1], x[2], x[3]); });
    return db;
  }
  function log(db, actor, action, target, details, ago){ db.log.unshift({ id: ++db.id, at: iso(Date.now() - (ago || 0) * MIN), actor: actor, action: action, target: target || null, details: details || {} }); }
  var DB = memLoad('skws_demo_db'); if (!DB || DB.v !== 9) { DB = makeDB(); DB.v = 9; }
  function save(){ try { oS.call(SS, 'skws_demo_db', JSON.stringify(DB)); } catch(e){} }
  save();

  /* ---------- Hilfen ---------- */
  function mem_(n){ return DB.members.filter(function(m){ return m.name === n; })[0]; }
  function active(){ return DB.members.filter(function(m){ return m.active; }); }
  function tokName(t){ return t && String(t).indexOf('demo-') === 0 && mem_(String(t).slice(5)) ? String(t).slice(5) : null; }
  function grpOf(n){ var out = null; DB.mg.groups.forEach(function(G, i){ if (G.r4 === n) out = { i: i, role: 'r4' }; else if (G.mentors.indexOf(n) >= 0) out = out || { i: i, role: 'mentor' }; else if (G.members.indexOf(n) >= 0) out = out || { i: i, role: 'member' }; }); return out; }
  function pollOpen(p){ return !p.closed_at && (!p.closes_at || new Date(p.closes_at) > new Date()); }
  function pollIn(p, n){ var m = mem_(n); if (!m || !m.active || (p.ranks && p.ranks.indexOf(m.rank) < 0)) return false; if (p.grp === null || p.grp === undefined) return true; var G = DB.mg.groups[p.grp]; return !!G && (G.r4 === n || G.mentors.indexOf(n) >= 0 || G.members.indexOf(n) >= 0); }
  function pollOut(p, me, res, names){ var vs = DB.pvotes.filter(function(v){ return v.id === p.id; }), mine = vs.filter(function(v){ return v.name === me; })[0];
    return { id: p.id, q: p.q, opts: p.opts, multi: p.multi, other: p.other, results: p.results, anon: p.anon, ranks: p.ranks, grp: p.grp, closes_at: p.closes_at, closed_at: p.closed_at, open: pollOpen(p), by: p.by, at: p.at,
      mine: mine ? { c: mine.c, o: mine.o } : null, n: vs.length,
      res: res ? { counts: p.opts.map(function(x, i){ return vs.filter(function(v){ return v.c.indexOf(i) >= 0; }).length; }),
        other: vs.filter(function(v){ return v.o; }).map(function(v){ return names && !p.anon ? { t: v.o, n: v.name } : { t: v.o }; }),
        voters: names && !p.anon ? vs.map(function(v){ return { n: v.name, c: v.c }; }) : null } : null }; }
  function pollAdd(d, by, grp){ var opts = (d.opts || []).map(function(x){ return String(x).trim(); }).filter(Boolean); if (!String(d.q || '').trim() || !opts.length) throw new Error('ERR_EMPTY');
    var id = ++DB.id; DB.polls.push({ id: id, q: String(d.q).trim(), opts: opts, multi: !!d.multi, other: !!d.other, results: d.results || 'live', anon: !!d.anon, ranks: d.ranks && d.ranks.length ? d.ranks : null, grp: grp, closes_at: d.closes_at || null, closed_at: null, by: by, at: iso(Date.now()) }); return id; }
  function pollAct(id, a){ var p = DB.polls.filter(function(x){ return x.id === id; })[0]; if (!p) throw new Error('ERR_POLL');
    if (a === 'close') p.closed_at = iso(Date.now()); else if (a === 'reopen') { p.closed_at = null; if (p.closes_at && new Date(p.closes_at) < new Date()) p.closes_at = null; }
    else if (a === 'delete') { DB.polls = DB.polls.filter(function(x){ return x.id !== id; }); DB.pvotes = DB.pvotes.filter(function(v){ return v.id !== id; }); } return { ok: true }; }
  function today(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function awayMap(){ var o = {}; DB.absences.filter(function(a){ return a.to >= today(); }).forEach(function(a){ (o[a.name] = o[a.name] || []).push({ from: a.from, to: a.to }); }); return o; }
  function monday(){ var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayIdx(day, mon){ return Math.round((new Date(day + 'T12:00:00') - new Date(mon + 'T12:00:00')) / 86400000); }
  function level(n){ var m = mem_(n); if (!m) return null; if (m.rank === 'R4' || m.rank === 'R5') return 'lead'; var g = grpOf(n); return g && g.role !== 'member' ? 'mentor' : 'member'; }
  function entryOut(e){ return e ? { squads: e.squads, hasEmail: !!e.email, lang: e.lang, updated: e.updated, hero: e.hero, gorilla: e.gorilla, gstage: e.gstage, gpower: e.gpower } : null; }
  function meritActive(m){ return !m.revoked_at && (!m.until || new Date(m.until) > new Date()); }
  function meritOut(m, full){ var o = { id: m.id, name: m.name, kind: m.kind, effect: m.effect, scope: m.scope, reason: m.reason, rounds: m.rounds, until: m.until, created_at: m.created_at, vis: m.vis,
    left_ds: m.left_ds, left_cs: m.left_cs, active: meritActive(m) }; if (full) { o.note = m.note; o.by = m.by; o.revoked_at = m.revoked_at; o.revoked_by = m.revoked_by; } return o; }
  function latest(kind){ return DB.rounds.filter(function(r){ return r.kind === kind; }).sort(function(a, b){ return b.id - a.id; })[0]; }
  function played(n, kind){ return DB.rounds.filter(function(r){ return r.kind === kind && !r.open && /S$/.test((r.lineup || {})[n] || '') && (r.absent || []).indexOf(n) < 0; }); }
  function err(code){ throw new Error(code); }
  function giftsLeft(n){ if (level(n) === 'lead') return 999; return 5 - DB.gifts.filter(function(g){ return g.from === n && Date.now() - new Date(g.t) < DAY; }).length; }

  /* ---------- Antworten auf alle Anfragen ---------- */
  var H = {
    get_init: function(){ var ev = {}; ['ds','cs'].forEach(function(k){ var r = latest(k); if (!r) return; var su = {}; r.signups.forEach(function(s){ su[s.name] = s.choice; });
        ev[k] = { id: r.id, label: r.label, time_a: r.time_a, time_b: r.time_b, deadline: r.deadline, open: r.open && (!r.deadline || new Date(r.deadline) > new Date()), signups: su }; });
      var en = {}, av = {}; active().forEach(function(m){ if (DB.entries[m.name]) en[m.name] = entryOut(DB.entries[m.name]); if (DB.avatars[m.name]) av[m.name] = DB.avatars[m.name].ts; });
      return { members: active().map(function(m){ return m.name; }), leaders: active().filter(function(m){ return m.rank === 'R4' || m.rank === 'R5'; }).map(function(m){ return m.name; }),
        entries: en, ds: DB.ds, cs: DB.cs, ev: ev, av: av, away: awayMap(), cal: DB.cal, sty: (function(){ var o = {}; Object.keys(DB.style).forEach(function(n){ if (DB.style[n].frame) o[n] = DB.style[n].frame; }); return o; })(),
        rk: (function(){ var o = {}; active().forEach(function(m){ if (m.rank === 'R4' || m.rank === 'R5') o[m.name] = m.rank; }); return o; })() }; },
    profile_stats: function(){ var out = {}; active().forEach(function(m){ var n = m.name, ms = DB.merits.filter(function(x){ return x.name === n && !x.revoked_at && x.vis === 'public'; }), g = grpOf(n);
        var h = DB.history.filter(function(x){ return x.name === n; }), tot = function(x){ return x.squads.reduce(function(a, s){ return a + (s.power || 0); }, 0); };
        out[n] = { b: ms.filter(function(x){ return x.kind === 'bonus'; }).length, d: ms.filter(function(x){ return x.kind === 'malus'; }).length, d90: ms.filter(function(x){ return x.kind === 'malus'; }).length,
          pds: played(n, 'ds').length, pcs: played(n, 'cs').length, abs: DB.rounds.filter(function(r){ return (r.absent || []).indexOf(n) >= 0; }).length,
          b30: ms.filter(function(x){ return x.kind === 'bonus' && Date.now() - new Date(x.created_at) < 30 * DAY; }).length,
          g30: h.length > 1 ? Math.round((tot(h[h.length - 1]) / tot(h[0]) - 1) * 1000) / 10 : null, sub: DB.rounds.filter(function(r){ return /E$/.test((r.lineup || {})[n] || ''); }).length,
          su: DB.rounds.filter(function(r){ return r.signups.some(function(s){ return s.name === n; }); }).length, hn: h.length, fe: h.length ? h[0].t : null,
          jd: m.ajoin ? m.ajoin + 'T12:00:00Z' : m.joined_at, sj: m.joined_at, gf: DB.gifts.filter(function(x){ return x.to === n; }).length, g: null, role: g ? g.role : 'member' }; });
      return out; },
    player_profile: function(b){ var n = b.p_name, m = mem_(n) || {}, gl = DB.gifts.filter(function(g){ return g.to === n; }).sort(function(a, c){ return new Date(c.t) - new Date(a.t); }), gc = {};
      gl.forEach(function(g){ gc[g.kind] = (gc[g.kind] || 0) + 1; });
      var badges = []; DB.rounds.forEach(function(r){ if (!r.open && /S$/.test((r.lineup || {})[n] || '') && (r.absent || []).indexOf(n) < 0) badges.push({ k: r.kind, label: r.label, t: r.deadline }); });
      DB.badges.filter(function(x){ return x.name === n; }).forEach(function(x){ badges.push({ k: 'x', label: x.label, icon: x.icon, t: x.t }); });
      DB.claimEv.forEach(function(e){ e.claims.forEach(function(c){ if (c.name === n && c.status === 'ok') badges.push({ k: 'x', label: e.label, icon: e.icon, t: e.t }); }); });
      badges.sort(function(a, c){ return new Date(c.t) - new Date(a.t); });
      var from = m.ajoin || (m.joined_at || '').slice(0, 10), yrs = []; for (var y = +from.slice(0, 4); y <= new Date().getFullYear(); y++) yrs.push(y);
      return { stickers: DB.merits.filter(function(x){ return x.name === n && !x.revoked_at && x.vis === 'public'; }).map(function(x){ return { kind: x.kind, reason: x.reason, t: x.created_at }; }),
        gifts: gc, gift_list: gl.map(function(g){ return { id: g.id, kind: g.kind, from: g.from, note: g.note, t: g.t }; }), badges: badges,
        member: { from: from, to: new Date().toISOString().slice(0, 10), years: yrs, seasons: [] }, streak: { ds: played(n, 'ds').length, cs: played(n, 'cs').length } }; },
    my_merits: function(b){ var me = tokName(b.p_token) === b.p_name; return DB.merits.filter(function(m){ return m.name === b.p_name && !m.revoked_at && (m.vis === 'public' || (m.vis === 'player' && me)) && meritActive(m); })
      .map(function(m){ return meritOut(m, false); }); },
    get_avatars: function(b){ var out = {}; Object.keys(DB.avatars).forEach(function(n){ if (!b.p_names || b.p_names.indexOf(n) >= 0) out[n] = { d: DB.avatars[n].d, t: DB.avatars[n].ts }; }); return out; },
    unsubscribe: function(){ return true; },
    auth_status: function(b){ return { ok: !!mem_(b.p_name), has_pin: true, need_email: false }; },
    auth_login: function(b){ if (!mem_(b.p_name)) return { ok: false, err: 'ERR_NAME' }; return { ok: true, token: 'demo-' + b.p_name, name: b.p_name, level: level(b.p_name), must_change: false }; },
    auth_reset_pin: function(b){ return H.auth_login(b); },
    auth_logout: function(){ return { ok: true }; }, auth_change_pin: function(){ return { ok: true }; }, auth_force_pin: function(){ return { ok: true }; },
    funk_status: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var lv = level(n), rooms = {};
      ['all','mentor','lead'].forEach(function(r){ if (r === 'all' || (r === 'mentor' && lv !== 'member') || (r === 'lead' && lv === 'lead')) rooms[r] = Math.max.apply(null, [0].concat(DB.shouts.filter(function(s){ return s.room === r; }).map(function(s){ return s.id; }))) || null; });
      return { ok: true, name: n, level: lv, unacked: DB.msgs.filter(function(m){ return m.rcpt.some(function(r){ return r.name === n && !r.ack; }); }).length, gifts_left: giftsLeft(n), must_change: false, rooms: rooms }; },
    msg_inbox: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' };
      var inbox = DB.msgs.filter(function(m){ return m.rcpt.some(function(r){ return r.name === n; }); }).map(function(m){ var r = m.rcpt.filter(function(x){ return x.name === n; })[0];
        return { id: m.id, kind: m.kind, from: m.from, subject: m.subject, body: m.body, t: m.t, ack: r.ack }; }).sort(function(a, c){ return (!c.ack) - (!a.ack) || c.id - a.id; });
      var sent = DB.msgs.filter(function(m){ return m.kind === 'pm' && m.from === n; }).map(function(m){ return { id: m.id, subject: m.subject, body: m.body, t: m.t, to: m.rcpt }; }).reverse();
      return { ok: true, inbox: inbox, sent: sent }; },
    msg_ack: function(b){ var n = tokName(b.p_token); DB.msgs.forEach(function(m){ if (m.id === b.p_id) m.rcpt.forEach(function(r){ if (r.name === n) r.ack = iso(Date.now()); }); }); return { ok: true }; },
    msg_send: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; if (!mem_(b.p_to)) return { ok: false, err: 'ERR_NAME' };
      DB.msgs.push({ id: ++DB.id, kind: 'pm', from: n, subject: b.p_subject || '', body: b.p_body || '', t: iso(Date.now()), rcpt: [{ name: b.p_to, ack: null }] }); return { ok: true }; },
    shout_list: function(b){ return { ok: true, items: DB.shouts.filter(function(s){ return s.room === b.p_room; }).map(function(s){ return { id: s.id, name: s.name, body: s.body, t: s.t }; }) }; },
    shout_post: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; DB.shouts.push({ id: ++DB.id, room: b.p_room, name: n, body: String(b.p_body || '').slice(0, 500), t: iso(Date.now()) }); return { ok: true }; },
    shout_delete: function(b){ DB.shouts = DB.shouts.filter(function(s){ return s.id !== b.p_id; }); return { ok: true }; },
    gift_send: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; if (giftsLeft(n) <= 0) return { ok: false, err: 'ERR_LIMIT', left: 0 };
      DB.gifts.push({ id: ++DB.id, from: n, to: b.p_to, kind: b.p_kind, note: b.p_note || '', t: iso(Date.now()) });
      DB.msgs.push({ id: ++DB.id, kind: 'gift', from: n, subject: b.p_kind, body: b.p_note || '', t: iso(Date.now()), rcpt: [{ name: b.p_to, ack: null }] });
      return { ok: true, left: giftsLeft(n) }; },
    save_entry: function(b){ if (tokName(b.p_token) !== b.p_name) err('ERR_LOGIN'); return saveEntry(b); },
    register_entry: function(b){ var n = String(b.p_name || '').trim(); if (!n) err('ERR_NEWNAME'); if (mem_(n)) err('ERR_EXISTS');
      DB.members.push({ name: n, rank: 'R1', active: true, left_at: null, joined_at: iso(Date.now()), ajoin: null }); var r = saveEntry(b); r.name = n; r.token = 'demo-' + n; r.level = 'member'; return r; },
    event_signup: function(b){ if (tokName(b.p_token) !== b.p_name) err('ERR_LOGIN'); var r = DB.rounds.filter(function(x){ return x.id === b.p_round; })[0]; if (!r || !r.open) err('ERR_CLOSED');
      r.signups = r.signups.filter(function(s){ return s.name !== b.p_name; }); r.signups.push({ name: b.p_name, choice: b.p_choice, note: b.p_note || null, admin: false, t: iso(Date.now()) });
      log(DB, b.p_name, 'ev_signup', b.p_name, { kind: r.kind, round: r.label, choice: b.p_choice }); return { ok: true, choice: b.p_choice }; },
    claim_list: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' };
      return { ok: true, items: DB.claimEv.filter(function(e){ return e.open || e.claims.some(function(c){ return c.name === n; }); }).map(function(e){ var c = e.claims.filter(function(x){ return x.name === n; })[0];
        return { id: e.id, label: e.label, icon: e.icon, open: e.open, status: c ? c.status : null }; }) }; },
    claim_send: function(b){ var n = tokName(b.p_token); DB.claimEv.forEach(function(e){ if (e.id === b.p_event && !e.claims.some(function(c){ return c.name === n; })) e.claims.push({ name: n, status: 'pending' }); }); return { ok: true }; },
    set_avatar: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_LOGIN' }; if (b.p_data) DB.avatars[n] = { d: b.p_data, ts: Math.floor(Date.now() / 1000) }; else delete DB.avatars[n]; return { ok: true, name: n }; },
    notes_for: function(b){ var n = tokName(b.p_token), lv = level(n), g = grpOf(b.p_name), mine = grpOf(n), grp = !!(g && mine && g.i === mine.i && mine.role !== 'member'), self = n === b.p_name, ok = lv === 'lead' || grp || self;
      return { ok: true, allowed: !!ok, self: self, items: ok ? DB.notes.filter(function(x){ return x.name === b.p_name && (lv === 'lead' || (grp && x.vis !== 'lead') || (self && x.vis === 'player')); }) : [] }; },
    my_state: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; return { ok: true, items: DB.pstate[n] || {} }; },
    my_state_set: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; (DB.pstate[n] = DB.pstate[n] || {})[b.p_key] = b.p_data; return { ok: true }; },
    admin_kv: function(b){ if (b.p_action === 'get') { var o = {}; Object.keys(DB.kv).forEach(function(k){ o[k] = DB.kv[k]; }); return { ok: true, items: o }; }
      if (b.p_data === null || b.p_data === undefined) delete DB.kv[b.p_key]; else DB.kv[b.p_key] = { data: b.p_data, at: iso(Date.now()), by: b.p_actor || 'Demo' }; return { ok: true }; },
    absence_mine: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; return { ok: true, items: DB.absences.filter(function(a){ return a.name === n && a.to >= today(); }) }; },
    absence_add: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; if (!b.p_from || !b.p_to || b.p_to < b.p_from || b.p_to < today()) throw new Error('ERR_DATE');
      DB.absences.push({ id: ++DB.id, name: n, from: b.p_from, to: b.p_to, note: b.p_note || null, by: n, t: iso(Date.now()) }); return { ok: true }; },
    absence_del: function(b){ var n = tokName(b.p_token); DB.absences = DB.absences.filter(function(a){ return !(a.id === b.p_id && (a.name === n || level(n) === 'lead')); }); return { ok: true }; },
    admin_absence: function(b){ var d = b.p_data || {}; if (b.p_action === 'list') return { ok: true, items: DB.absences.slice().sort(function(a, c){ return a.from < c.from ? -1 : 1; }) };
      if (b.p_action === 'add') { DB.absences.push({ id: ++DB.id, name: d.name, from: d.from, to: d.to, note: d.note || null, by: b.p_actor || 'Demo', t: iso(Date.now()) }); return { ok: true }; }
      DB.absences = DB.absences.filter(function(a){ return a.id !== +d.id; }); return { ok: true }; },
    admin_activity: function(){ var o = {}, k = 0; active().forEach(function(m){ k++; var e = DB.entries[m.name];
      if (k % 5 === 0) { o[m.name] = { seen: k % 10 ? iso(Date.now() - (16 + k) * 86400000) : null, entry: iso(Date.now() - (20 + k) * 86400000), signup: null, vote: null, chat: null, pin: k % 10 !== 0, rounds: 4, answered: 0 }; return; }
      o[m.name] = { seen: k % 5 ? iso(Date.now() - (k % 9) * 86400000) : (k % 2 ? iso(Date.now() - (18 + k) * 86400000) : null), entry: e ? e.updated : null, signup: k % 4 ? iso(Date.now() - (k % 11) * 86400000) : null,
        vote: k % 3 ? iso(Date.now() - (k % 6) * 86400000) : null, chat: k % 6 ? null : iso(Date.now() - 86400000), pin: k % 7 !== 0, rounds: 4, answered: k % 4 ? 3 : 0 }; }); return { ok: true, items: o }; },
    admin_cal: function(b){ var d = b.p_data || {};
      if (b.p_action === 'del') { DB.cal = DB.cal.filter(function(c){ return c.id !== +d.id; }); return { ok: true }; }
      if (b.p_action === 'edit') DB.cal = DB.cal.filter(function(c){ return c.id !== +d.id; });
      DB.cal.push({ id: ++DB.id, title: d.title, kind: d.kind || 'other', weekly: !!d.weekly, day: d.day || null, wd: d.wd === '' || d.wd === undefined ? null : +d.wd, tm: d.tm, dur: +d.dur || 60, note: d.note || null }); return { ok: true }; },
    vs_week: function(b){ var mon = b.p_monday || monday(), rows = {}, wk = {};
      DB.vs.forEach(function(v){ var i = dayIdx(v.day, mon); var m2 = new Date(v.day + 'T12:00:00'); m2.setDate(m2.getDate() - (m2.getDay() + 6) % 7); wk[m2.toISOString().slice(0, 10)] = 1;
        if (i < 0 || i > 6 || !(mem_(v.name) || {}).active) return; (rows[v.name] = rows[v.name] || {})[i] = v.pts; });
      return { monday: mon, rows: rows, weeks: Object.keys(wk).sort().reverse() }; },
    vs_set: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var ex = DB.vs.filter(function(v){ return v.name === n && v.day === b.p_day; })[0];
      if (ex && !ex.self) throw new Error('ERR_LOCKED'); DB.vs = DB.vs.filter(function(v){ return !(v.name === n && v.day === b.p_day); });
      if (b.p_pts !== null && b.p_pts !== undefined) DB.vs.push({ name: n, day: b.p_day, pts: +b.p_pts, self: true }); return { ok: true }; },
    admin_vs: function(b){ var d = b.p_data || {};
      if (b.p_action === 'week') return { ok: true, self: DB.vs.filter(function(v){ var i = dayIdx(v.day, d.monday); return v.self && i >= 0 && i <= 6; }).map(function(v){ return { n: v.name, d: v.day }; }) };
      (d.rows || []).forEach(function(r){ DB.vs = DB.vs.filter(function(v){ return !(v.name === r.name && v.day === d.day); }); if (r.pts !== '' && r.pts !== null && r.pts !== undefined) DB.vs.push({ name: r.name, day: d.day, pts: +r.pts, self: false }); });
      return { ok: true, n: (d.rows || []).length }; },
    player_history: function(b){ var by = {}; DB.history.filter(function(h){ return h.name === b.p_name; }).forEach(function(h){ by[h.t.slice(0, 10)] = h; });
      return Object.keys(by).sort().map(function(k){ return { t: k, v: Math.round(by[k].squads.reduce(function(a, s2){ return a + (+s2.power || 0); }, 0) * 100) / 100 }; }); },
    onboarding: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var g = grpOf(b.p_name), mine = grpOf(n);
      var ok = n === b.p_name || level(n) === 'lead' || (g && mine && g.i === mine.i && mine.role !== 'member'); if (!ok) return { ok: true, allowed: false };
      var h = b.p_name.length; return { ok: true, allowed: true, since: null, pin: true, entry: !!DB.entries[b.p_name], group: !!g, joined: !!(DB.mg.join[b.p_name] && DB.mg.join[b.p_name].ok), avatar: !!DB.avatars[b.p_name], signup: h % 2 === 0, played: h % 3 === 0 }; },
    help_list: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' };
      return { ok: true, lead: level(n) === 'lead', items: DB.help.slice().sort(function(a, c){ return (!!a.done - !!c.done) || (c.id - a.id); }) }; },
    help_post: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; if (!String(b.p_body || '').trim()) throw new Error('ERR_EMPTY');
      DB.help.push({ id: ++DB.id, name: n, kind: b.p_kind || 'ask', body: String(b.p_body).trim().slice(0, 500), t: iso(Date.now()), done: null, replies: [] }); return { ok: true }; },
    help_reply: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; DB.help.forEach(function(p){ if (p.id === b.p_id) p.replies.push({ id: ++DB.id, name: n, body: String(b.p_body).trim().slice(0, 500), t: iso(Date.now()) }); }); return { ok: true }; },
    help_manage: function(b){ var n = tokName(b.p_token), lead = level(n) === 'lead';
      if (b.p_action === 'delreply') { DB.help.forEach(function(p){ p.replies = p.replies.filter(function(r){ return !(r.id === b.p_id && (r.name === n || lead)); }); }); return { ok: true }; }
      if (b.p_action === 'delete') { DB.help = DB.help.filter(function(p){ return !(p.id === b.p_id && (p.name === n || lead)); }); return { ok: true }; }
      DB.help.forEach(function(p){ if (p.id === b.p_id && (p.name === n || lead)) p.done = b.p_action === 'done' ? iso(Date.now()) : null; }); return { ok: true }; },
    reminder_info: function(){ return { polls: [], away: false }; },
    daily_claim: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var w = DB.wallet[n] = DB.wallet[n] || { coins: 0, xp: 0, streak: 0, best: 0, days: 0, last: null }, t = today();
      if (w.last === t) return { ok: true, claimed: false, coins: w.coins, xp: w.xp, streak: w.streak, days: w.days };
      w.streak = w.streak + 1; var c = 10 + Math.min(w.streak - 1, 10) * 2 + (w.streak % 7 === 0 ? 25 : 0), x = 10 + Math.min(w.streak - 1, 10);
      w.coins += c; w.xp += x; w.days++; w.best = Math.max(w.best, w.streak); w.last = t; return { ok: true, claimed: true, gain: c, gainxp: x, coins: w.coins, xp: w.xp, streak: w.streak, days: w.days }; },
    wallet_me: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; return { ok: true, all: n === 'xX Meister Proper Xx', w: DB.wallet[n] || null, owned: DB.owned[n] || [] }; },
    wallet_pub: function(){ var o = {}; Object.keys(DB.wallet).forEach(function(n){ o[n] = { xp: DB.wallet[n].xp, days: DB.wallet[n].days, best: DB.wallet[n].best }; }); return o; },
    admin_wallet: function(b){ var w = DB.wallet[b.p_name] = DB.wallet[b.p_name] || { coins: 0, xp: 0, streak: 0, best: 0, days: 0, last: null }; w.coins = Math.max(0, w.coins + (+b.p_coins || 0)); return { ok: true, coins: w.coins }; },
    shop_buy: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var P = { 'frame:neon':100,'frame:emerald':150,'frame:sakura':200,'frame:storm':300,'frame:cosmic':400,'header:cherry':150,'header:cyber':200,'header:volcano':250,'header:arctic':250,'header:skyline':350,'bg:snow':120,'bg:matrix':180,'bg:embers':220,'bg:circuits':300 }[b.p_item];
      if (!P) throw new Error('ERR_ITEM'); var w = DB.wallet[n] = DB.wallet[n] || { coins: 0, xp: 0, streak: 0, best: 0, days: 0, last: null }; if (w.coins < P) throw new Error('ERR_COINS');
      w.coins -= P; (DB.owned[n] = DB.owned[n] || []).push(b.p_item); return { ok: true, coins: w.coins }; },
    style_get: function(){ var o = {}; Object.keys(DB.style).forEach(function(n){ var x = DB.style[n]; o[n] = { frame: x.frame, header: x.header, bg: x.bg, show: x.show || [], hi: !!x.header_img, bi: !!x.bg_img }; }); return o; },
    style_img: function(b){ var x = DB.style[b.p_name]; return x ? (b.p_kind === 'header' ? x.header_img : x.bg_img) || null : null; },
    style_assets: function(){ return DB.sassets; },
    style_set: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var d = b.p_data || {}; if ((d.frame === 'legend' || d.header === 'leader') && level(n) !== 'lead') throw new Error('ERR_LOCKED');
      var x = DB.style[n] = DB.style[n] || {}; x.frame = d.frame; x.header = d.header; x.bg = d.bg; x.show = (d.show || []).slice(0, 3); return { ok: true }; },
    style_upload: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var x = DB.style[n] = DB.style[n] || {};
      if (b.p_kind === 'header') { x.header_img = b.p_data; x.header = b.p_data ? 'own' : (x.header === 'own' ? null : x.header); } else { x.bg_img = b.p_data; x.bg = b.p_data ? 'own' : (x.bg === 'own' ? null : x.bg); } return { ok: true }; },
    admin_style: function(b){ var d = b.p_data || {};
      if (b.p_action === 'add') { DB.sassets.push({ id: ++DB.id, kind: d.kind, label: d.label, data: d.data }); return { ok: true }; }
      if (b.p_action === 'del') { DB.sassets = DB.sassets.filter(function(a){ return a.id !== +d.id; }); return { ok: true }; }
      if (b.p_action === 'own') return { ok: true, items: Object.keys(DB.style).filter(function(n){ return DB.style[n].header_img || DB.style[n].bg_img; }).map(function(n){ return { name: n, header: DB.style[n].header_img || null, bg: DB.style[n].bg_img || null, t: iso(Date.now()) }; }) };
      var x = DB.style[d.name]; if (x) { if (d.kind === 'header') { x.header_img = null; if (x.header === 'own') x.header = null; } else { x.bg_img = null; if (x.bg === 'own') x.bg = null; } } return { ok: true }; },
    polls_list: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var lv = level(n), g = grpOf(n);
      return { ok: true, lv: lv, grp: g && g.role !== 'member' ? g.i : null, items: DB.polls.filter(function(p){ return pollIn(p, n) || lv === 'lead' || p.by === n; })
        .filter(function(p){ return pollOpen(p) || Date.now() - new Date(p.closed_at || p.closes_at) < 30 * DAY; })
        .sort(function(a, b){ return (pollOpen(b) - pollOpen(a)) || (new Date(b.at) - new Date(a.at)); })
        .map(function(p){ var voted = DB.pvotes.some(function(v){ return v.id === p.id && v.name === n; }), op = pollOpen(p);
          var see = lv === 'lead' || p.by === n || (p.results === 'live' && (!op || voted)) || (p.results === 'end' && !op);
          var o = pollOut(p, n, see, lv === 'lead' || p.by === n || p.results !== 'lead'); o.can = pollIn(p, n); return o; }) }; },
    poll_vote: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var p = DB.polls.filter(function(x){ return x.id === b.p_id; })[0];
      if (!p || !pollOpen(p) || !pollIn(p, n)) throw new Error('ERR_CLOSED');
      var c = (b.p_choices || []).filter(function(i){ return i >= 0 && i < p.opts.length; }), o = p.other && b.p_other && String(b.p_other).trim() ? String(b.p_other).trim().slice(0, 120) : null;
      if (!p.multi && c.length + (o ? 1 : 0) > 1) throw new Error('ERR_MULTI');
      DB.pvotes = DB.pvotes.filter(function(v){ return !(v.id === p.id && v.name === n); });
      if (c.length || o) DB.pvotes.push({ id: p.id, name: n, c: c, o: o, t: iso(Date.now()) }); return { ok: true }; },
    poll_create: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var lv = level(n), g = grpOf(n); if (lv === 'member') throw new Error('ERR_RIGHTS');
      return { ok: true, id: pollAdd(b.p_data || {}, n, lv === 'lead' ? null : g.i) }; },
    poll_manage: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; return pollAct(b.p_id, b.p_action); },
    admin_poll: function(b){ var d = b.p_data || {};
      if (b.p_action === 'list') return { ok: true, items: DB.polls.slice().sort(function(a, c){ return new Date(c.at) - new Date(a.at); }).map(function(p){ return pollOut(p, null, true, true); }) };
      if (b.p_action === 'add') return { ok: true, id: pollAdd(d, 'Demo', /^\d+$/.test(String(d.grp)) ? +d.grp : null) };
      return pollAct(+d.id, b.p_action); },
    my_group: function(b){ var n = tokName(b.p_token); if (!n) return { ok: false, err: 'ERR_SESSION' }; var g = grpOf(n); if (!g) return { ok: true, g: null }; var G = DB.mg.groups[g.i];
      var o = { ok: true, g: g.i + 1, role: g.role, r4: G.r4, mentors: G.mentors, intensive: !!G.intensive };
      if (g.role === 'member' && level(n) !== 'lead') return o;
      o.members = G.members.map(function(x){ var m = mem_(x) || {}, j = DB.mg.join[x]; return { name: x, rank: m.rank || null, active: !!m.active, ok: j && j.g === g.i ? j.ok : null, at: j && j.g === g.i ? j.at : null }; });
      o.canEdit = true; return o; },
    group_join: function(b){ var n = tokName(b.p_token), g = grpOf(b.p_name), mine = grpOf(n); if (!g) return { ok: false, err: 'ERR_GROUP' };
      if (!(level(n) === 'lead' || (mine && mine.i === g.i && mine.role !== 'member'))) return { ok: false, err: 'ERR_RIGHTS' };
      var j = DB.mg.join[b.p_name] && DB.mg.join[b.p_name].g === g.i ? DB.mg.join[b.p_name] : { g: g.i, at: iso(Date.now()) }; j.ok = b.p_ok ? iso(Date.now()) : null; j.ts = iso(Date.now()); DB.mg.join[b.p_name] = j; return { ok: true }; },

    /* ----- Admin ----- */
    admin_login: function(){ return { ok: true }; },
    admin_data: function(){ return { members: DB.members.map(function(m){ return { name: m.name, rank: m.rank, active: m.active, left_at: m.left_at, joined_at: m.joined_at }; }),
      entries: (function(){ var o = {}; Object.keys(DB.entries).forEach(function(n){ o[n] = entryOut(DB.entries[n]); }); return o; })(), history: DB.history, ds: DB.ds, cs: DB.cs,
      mg: { data: DB.mg, updated: iso(Date.now() - DAY), by: 'Nova' },
      ev: DB.rounds.slice().sort(function(a, c){ return c.id - a.id; }).map(function(r){ var o = JSON.parse(JSON.stringify(r)); return o; }),
      evcfg: DB.evcfg, merits: DB.merits.slice().reverse().map(function(m){ return meritOut(m, true); }), meritcfg: DB.meritcfg }; },
    admin_log: function(b){ var l = DB.log.slice().sort(function(x, y){ return new Date(y.at) - new Date(x.at) || y.id - x.id; }); if (b.p_before) { var i = l.map(function(x){ return x.id; }).indexOf(b.p_before); l = i >= 0 ? l.slice(i + 1) : []; } return l.slice(0, b.p_limit || 50); },
    admin_member: function(b){ var m = mem_(b.p_name), a = b.p_action;
      if (a === 'add') { if (m) err('ERR_EXISTS'); DB.members.push({ name: b.p_name, rank: b.p_value || 'R1', active: true, left_at: null, joined_at: iso(Date.now()), ajoin: null }); }
      else if (!m) err('ERR_NAME');
      else if (a === 'rank') m.rank = b.p_value;
      else if (a === 'leave') { m.active = false; m.left_at = iso(Date.now()); }
      else if (a === 'rejoin') { m.active = true; m.left_at = null; }
      else if (a === 'rename') { if (mem_(b.p_value)) err('ERR_EXISTS'); var o = m.name; m.name = b.p_value; if (DB.entries[o]) { DB.entries[b.p_value] = DB.entries[o]; delete DB.entries[o]; } DB.history.forEach(function(h){ if (h.name === o) h.name = b.p_value; }); }
      log(DB, 'Demo', 'admin_' + a, b.p_value && a === 'rename' ? b.p_value : b.p_name, a === 'rename' ? { from: b.p_name } : a === 'rank' ? { to: b.p_value } : {}); return { ok: true }; },
    admin_event: function(b){ var d = b.p_data || {}, a = b.p_action;
      if (a === 'create') { DB.rounds.forEach(function(r){ if (r.kind === d.kind) r.open = false; });
        var id = ++DB.id; DB.rounds.push({ id: id, kind: d.kind, label: d.label || 'KW', time_a: d.time_a || null, time_b: d.time_b || null, deadline: d.deadline || null, open: true, created_at: iso(Date.now()), by: 'Demo', lineup: {}, absent: [], signups: [], meta: null });
        log(DB, 'Demo', 'ev_round', null, { kind: d.kind, what: 'create', label: d.label }); return { ok: true, id: id }; }
      if (a === 'config') { DB.evcfg[d.kind] = d.cfg; return { ok: true }; }
      var r = DB.rounds.filter(function(x){ return x.id === d.id; })[0]; if (!r) err('ERR_ROUND');
      if (a === 'update') { ['label','time_a','time_b','deadline'].forEach(function(k){ if (k in d) r[k] = d[k] || (k === 'label' ? r.label : null); }); }
      else if (a === 'lineup') r.lineup = d.lineup;
      else if (a === 'absent') r.absent = d.names;
      else if (a === 'close') r.open = false;
      else if (a === 'reopen') { DB.rounds.forEach(function(x){ if (x.kind === r.kind) x.open = false; }); r.open = true; }
      else if (a === 'set') { r.signups = r.signups.filter(function(s){ return s.name !== d.name; }); if (d.choice) r.signups.push({ name: d.name, choice: d.choice, note: null, admin: true, t: iso(Date.now()) }); }
      log(DB, 'Demo', 'ev_round', d.name || null, { kind: r.kind, what: a, label: r.label, choice: d.choice }); return { ok: true }; },
    admin_merit: function(b){ var d = b.p_data || {}, a = b.p_action;
      if (a === 'add') { var id = ++DB.id; DB.merits.push({ id: id, name: d.name, kind: d.kind, effect: d.effect, scope: d.scope, reason: d.reason, note: d.note || null, rounds: d.rounds ? +d.rounds : null, until: d.until || null,
          created_at: iso(Date.now()), vis: d.vis || 'public', by: 'Demo', revoked_at: null, revoked_by: null, left_ds: d.rounds ? +d.rounds : null, left_cs: d.rounds ? +d.rounds : null });
        log(DB, 'Demo', 'merit', d.name, { what: 'add', kind: d.kind, reason: d.reason }); return { ok: true, id: id }; }
      var m = DB.merits.filter(function(x){ return x.id === d.id; })[0];
      if (a === 'vis' && m) m.vis = d.vis; else if (a === 'revoke' && m) { m.revoked_at = iso(Date.now()); m.revoked_by = 'Demo'; } else if (a === 'config') DB.meritcfg = d.cfg;
      return { ok: true }; },
    admin_mg_save: function(b){ DB.mg = b.p_data; return { ok: true, join: DB.mg.join }; },
    admin_extra: function(b){ var d = b.p_data || {}, a = b.p_action;
      if (a === 'data') { var aj = {}; DB.members.forEach(function(m){ if (m.ajoin) aj[m.name] = m.ajoin; }); return { ajoin: aj, notes: DB.notes }; }
      if (a === 'ajoin') { var m = mem_(d.name); if (m) m.ajoin = d.date || null; return { ok: true }; }
      if (a === 'note_add') { DB.notes.unshift({ id: ++DB.id, name: d.name, body: d.body, vis: d.vis || 'lead', t: iso(Date.now()), by: 'Demo' }); return { ok: true }; }
      if (a === 'note_vis') { DB.notes.forEach(function(x){ if (x.id === d.id) x.vis = d.vis; }); return { ok: true }; }
      if (a === 'note_del') { DB.notes = DB.notes.filter(function(x){ return x.id !== d.id; }); return { ok: true }; }
      if (a === 'round_meta') { DB.rounds.forEach(function(r){ if (r.id === d.id) { r.meta = r.meta || {}; Object.keys(d.meta || {}).forEach(function(k){ r.meta[k] = d.meta[k]; }); } }); return { ok: true }; }
      if (a === 'rounds') return { items: DB.rounds.filter(function(r){ return (!d.kind || d.kind === 'all' || r.kind === d.kind) && (!d.before || r.id < d.before); }).sort(function(x, y){ return y.id - x.id; })
        .map(function(r){ var o = JSON.parse(JSON.stringify(r)); o.signups = r.signups.length; return o; }) };
      return { ok: true }; },
    admin_funk: function(b){ var a = b.p_action, d = b.p_data || {};
      if (!a) { var last = {}; return { pins: Object.keys(DB.pins), locked: [], must: [], last: last,
        bcs: DB.msgs.filter(function(m){ return m.kind === 'bc'; }).slice().reverse().map(function(m){ return { id: m.id, subject: m.subject, body: m.body, t: m.t, from: m.from, audience: m.audience || {}, rcpt: m.rcpt }; }) }; }
      if (a === 'auth_log') { var it = []; Object.keys(DB.pins).slice(0, 14).forEach(function(n, i){ it.push({ name: n, ev: i % 5 === 4 ? 'pin_fail' : 'login', t: iso(Date.now() - (i * 97 + 5) * MIN), dev: pick(['Android · App', 'Android · Chrome', 'iPhone · Safari', 'Windows · Chrome']) }); });
        if (d.name) it = it.filter(function(x){ return x.name === d.name; }); if (d.fails) it = it.filter(function(x){ return x.ev !== 'login'; }); return { items: it }; }
      if (a === 'pin_reset') { delete DB.pins[d.name]; return { ok: true }; }
      if (a === 'pin_initial') { DB.pins[d.name] = true; return { ok: true }; }
      if (a === 'bc_delete') { DB.msgs = DB.msgs.filter(function(m){ return m.id !== d.id; }); return { ok: true }; }
      return { ok: true }; },
    admin_msg: function(b){ var d = b.p_data || {}, names = active().filter(function(m){ var g = grpOf(m.name); return d.all || (d.ranks || []).indexOf(m.rank) >= 0 || (d.names || []).indexOf(m.name) >= 0 || (d.mentors && g && g.role === 'mentor'); }).map(function(m){ return m.name; });
      if (!names.length) err('ERR_NOBODY'); DB.msgs.push({ id: ++DB.id, kind: 'bc', from: 'Demo', subject: d.subject || '', body: d.body || '', t: iso(Date.now()), audience: d, rcpt: names.map(function(n){ return { name: n, ack: null }; }) });
      return { ok: true, count: names.length }; },
    admin_badge: function(b){ var d = b.p_data || {}, a = b.p_action;
      if (a === 'list') return { ok: true, items: DB.badges.map(function(x){ return { id: x.id, key: x.key, label: x.label, icon: x.icon, name: x.name, t: x.t, by: x.by }; }) };
      if (a === 'add') { var key = d.key || 'demo-' + (++DB.id); (d.names || []).forEach(function(n){ DB.badges.push({ id: ++DB.id, key: key, label: d.label, icon: d.icon || '🎖️', name: n, t: iso(Date.now()), by: 'Demo' }); }); return { ok: true, count: (d.names || []).length }; }
      if (a === 'delete') { DB.badges = DB.badges.filter(function(x){ return d.key ? x.key !== d.key : x.id !== d.id; }); return { ok: true }; }
      return { ok: true }; },
    admin_claim: function(b){ var d = b.p_data || {}, a = b.p_action, e = DB.claimEv.filter(function(x){ return x.id === d.id; })[0];
      if (a === 'list') return { ok: true, events: DB.claimEv, seasons: DB.seasons };
      if (a === 'create') DB.claimEv.unshift({ id: ++DB.id, label: d.label, icon: d.icon || '🎖️', open: true, t: iso(Date.now()), claims: [] });
      else if (a === 'close' && e) e.open = false; else if (a === 'reopen' && e) e.open = true;
      else if (a === 'delete') DB.claimEv = DB.claimEv.filter(function(x){ return x.id !== d.id; });
      else if (a === 'decide' && e) e.claims.forEach(function(c){ if ((d.names || []).indexOf(c.name) >= 0) c.status = d.status; });
      else if (a === 'season_add') DB.seasons.push({ id: ++DB.id, label: d.label, icon: d.icon, from: d.from, to: d.to });
      else if (a === 'season_del') DB.seasons = DB.seasons.filter(function(x){ return x.id !== d.id; });
      return { ok: true }; },
    admin_gift: function(b){ DB.gifts = DB.gifts.filter(function(g){ return g.id !== b.p_id; }); return { ok: true }; },
    admin_ds_publish: function(b){ DB.ds = b.p_plan || null; return { ok: true }; },
    admin_cs_publish: function(b){ DB.cs = b.p_plan || null; return { ok: true }; },
    admin_backup: function(){ return { demo: true, hinweis: 'Demo-Sicherung mit erfundenen Daten', members: DB.members, entries: DB.entries }; },
    admin_avatar: function(b){ delete DB.avatars[b.p_name]; return { ok: true }; },
    admin_avatar_set: function(b){ if (!mem_(b.p_name)) return { ok: false, err: 'ERR_NAME' }; if (b.p_data) DB.avatars[b.p_name] = { d: b.p_data, ts: Math.floor(Date.now() / 1000) }; else delete DB.avatars[b.p_name]; return { ok: true }; }
  };
  function saveEntry(b){ var n = b.p_name; DB.entries[n] = { squads: b.p_squads, email: b.p_email || (DB.entries[n] || {}).email || '', lang: b.p_lang || 'de', updated: iso(Date.now()), hero: b.p_hero, gorilla: b.p_gorilla, gstage: b.p_gstage, gpower: b.p_gpower };
    DB.history.push({ name: n, squads: b.p_squads, t: iso(Date.now()) }); log(DB, n, 'save', n, { total_new: b.p_squads.reduce(function(a, s){ return a + (s.power || 0); }, 0) });
    var o = entryOut(DB.entries[n]); o.ok = true; return o; }

  /* ---------- Netz abfangen: Datenbank-Anfragen beantwortet die Demo, nichts geht nach draußen ---------- */
  var oF = window.fetch;
  window.fetch = function(url, opt){
    var u = String(url && url.url || url);
    if (u.indexOf('/rest/v1/') >= 0 || u.indexOf('supabase.co') >= 0) {
      var fn = (u.split('/rpc/')[1] || '').split('?')[0], body = {};
      try { body = JSON.parse(opt && opt.body || '{}'); } catch(e){}
      return new Promise(function(res){ setTimeout(function(){
        var out, st = 200;
        try { if (!H[fn]) throw new Error('ERR_DEMO'); out = H[fn](body); save(); } catch(e){ st = 400; out = { message: String(e && e.message || e) }; }
        res(new Response(JSON.stringify(out === undefined ? null : out), { status: st, headers: { 'Content-Type': 'application/json' } }));
      }, 120); });
    }
    return oF.apply(this, arguments);
  };

  /* ---------- Hinweisleiste ---------- */
  function bar(){
    var de = (navigator.language || 'de').slice(0, 2) === 'de', b = document.createElement('div'); b.className = 'demo-bar';
    b.innerHTML = '<b>🧪 DEMO</b><span>' + (de ? 'Erfundene Beispieldaten – nichts wird gespeichert oder gezählt.' : 'Made-up sample data – nothing is saved or counted.') + '</span>' +
      '<a href="' + (ADMIN ? './?demo' : 'admin.html?demo') + '">' + (ADMIN ? (de ? '👥 Spielerseite' : '👥 Player page') : (de ? '🔒 Admin-Bereich' : '🔒 Admin area')) + '</a>' +
      '<a href="' + (ADMIN ? 'admin.html' : './') + '?demo=aus">' + (de ? 'Demo beenden' : 'End demo') + '</a>';
    var s = document.createElement('style');
    s.textContent = '.demo-bar{position:sticky;top:0;z-index:400;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 12px;background:linear-gradient(90deg,#f5b942,#ff8a5c);color:#1a1205;font:600 13px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
      '.demo-bar span{flex:1 1 200px}.demo-bar a{color:#1a1205;background:rgba(255,255,255,.45);padding:4px 10px;border-radius:8px;text-decoration:none;white-space:nowrap}';
    document.head.appendChild(s); document.body.insertBefore(b, document.body.firstChild);
    // Links zwischen Spielerseite und Admin bleiben im Demo
    Array.prototype.forEach.call(document.querySelectorAll('a[href="admin.html"], a[href="./"]'), function(a){ a.href = a.getAttribute('href') + '?demo'; });
    var t = document.querySelector('title'); if (t && t.textContent.indexOf('DEMO') < 0) t.textContent = 'DEMO · ' + t.textContent;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
})();
