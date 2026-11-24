/* SKWS Squads – Spielerseite */
(function(){
  var DATA = null, LANG = 'en', busy = false;
  var $ = function(id){ return document.getElementById(id); };
  var REQ_SQUADS = 3; // T1–T3 sind Pflicht
  var COLORS = { tank:'var(--tank)', missile:'var(--missile)', aircraft:'var(--aircraft)', mixed:'var(--mixed)' };

  function store(k, v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }

  function t(k, vars){
    var d = DATA ? DATA.i18n : {}, s = (d[LANG] && d[LANG][k]) || (d.en && d.en[k]) || k;
    if (vars) for (var v in vars) s = s.split('{'+v+'}').join(vars[v]);
    return s;
  }
  function fmtPow(n){
    if (n === null || n === undefined || n === '') return '–';
    return Number(n).toLocaleString(LANG, {maximumFractionDigits:2}) + ' M';
  }
  function fmtDate(iso){
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(LANG, {dateStyle:'medium', timeStyle:'short'}); }
    catch(e){ return new Date(iso).toLocaleString(); }
  }

  /* ---------- Aufbau ---------- */
  function buildSquads(){
    var box = $('squads'); box.innerHTML = '';
    for (var i = 0; i < DATA.squads; i++){
      var c = document.createElement('div');
      var req = i < REQ_SQUADS;
      c.className = 'card sq' + (req ? '' : ' opt'); c.id = 'sq' + i; c.dataset.type = '';
      c.innerHTML =
        '<div class="sq-h"><b>T' + (i+1) + '</b><span class="tag' + (req ? ' req' : '') + '" data-t="' + (req ? 'required' : 'optional') + '"></span></div>' +
        '<div class="row">' +
          '<div><label class="l" data-t="troopType"></label><select class="type"></select></div>' +
          '<div><label class="l" data-t="power"></label><input class="pow" type="text" inputmode="decimal" autocomplete="off"></div>' +
        '</div>' + (i ? '' : '<div class="hint" data-t="powerHint"></div>');
      (function(card){
        card.querySelector('.type').addEventListener('change', function(){ card.dataset.type = this.value; });
      })(c);
      box.appendChild(c);
    }
  }

  function fillTypeOptions(){
    var sels = document.querySelectorAll('#squads .type');
    for (var i = 0; i < sels.length; i++){
      var s = sels[i], v = s.value;
      s.innerHTML = '<option value="">' + t('choose') + '</option>' +
        DATA.troops.map(function(k){ return '<option value="'+k+'">'+t(k)+'</option>'; }).join('');
      s.value = v;
    }
  }

  function fillNames(){
    var sel = $('name'), cur = sel.value, q = $('search').value.trim().toLowerCase();
    var list = DATA.members.slice().sort(function(a,b){ return a.localeCompare(b, undefined, {sensitivity:'base'}); });
    sel.innerHTML = '';
    var o = document.createElement('option'); o.value = ''; o.textContent = t('namePlaceholder'); sel.appendChild(o);
    list.forEach(function(n){
      if (q && n.toLowerCase().indexOf(q) < 0 && n !== cur) return;
      var op = document.createElement('option');
      op.value = n; op.textContent = n + (DATA.entries[n] ? '  ✓' : '');
      sel.appendChild(op);
    });
    sel.value = cur;
  }

  function applyLang(){
    document.documentElement.lang = LANG;
    var els = document.querySelectorAll('[data-t]');
    for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].dataset.t);
    $('tabProfile').textContent = (PROF_I18N[LANG] || PROF_I18N.en).tab;
    if (window.Funk && DATA) Funk.lang();
    $('newPinHint').textContent = F_().regPin; $('newPin').placeholder = F_().pinNew; $('newPin2').placeholder = F_().pinAgain;
    renderAuth();
    if (!$('profileView').classList.contains('hide')) renderProfile();
    var ph = document.querySelectorAll('[data-tp]');
    for (var j = 0; j < ph.length; j++) ph[j].placeholder = t(ph[j].dataset.tp);
    var pows = document.querySelectorAll('#squads .pow');
    for (var k = 0; k < pows.length; k++) pows[k].placeholder = LANG === 'en' ? '25.4' : '25,4';
    fillTypeOptions(); fillNames(); showMeta(); renderOverview();
    document.title = DATA.alliance + ' · ' + t('title');
  }

  /* ---------- Wüstensturm-Einsatz ---------- */
  function renderDs(){ renderPlan('ds'); renderPlan('cs'); }
  function renderPlan(kind){
    var card = $(kind + 'Card'), P = DATA && DATA[kind], n = $('name').value;
    if (!P || !P.teams || !n) { card.classList.add('hide'); return; }
    var L = DS_I18N[LANG] || DS_I18N.en, hit = null;
    if (kind === 'cs') { var C = CS_I18N[LANG] || CS_I18N.en, M = {}; Object.keys(L).forEach(function(k){ M[k] = L[k]; }); Object.keys(C).forEach(function(k){ M[k] = C[k]; }); M.ph = [C.pl.p0, C.pl.p7, C.pl.p14]; L = M; }
    Object.keys(P.teams).forEach(function(t){
      var T = P.teams[t];
      (T.m || []).forEach(function(x){ if (x[0] === n) hit = { t: t, T: T, g: x[1] }; });
      (T.s || []).forEach(function(x, i){ if (x === n) hit = { t: t, T: T, sub: i + 1 }; });
    });
    if (!hit) { card.classList.add('hide'); return; }
    function act(s){ var a = L.a[s[0]] || s[0]; return a.split('{b}').join(L.b[s[1]] || '').split('{t}').join((hit.T.open && hit.T.open[s[1]]) || ''); }
    $(kind + 'Title').textContent = L.title;
    $(kind + 'Team').textContent = L.team + ' ' + hit.t + ' · ' + (hit.sub ? L.ersatz : L.stamm);
    $(kind + 'Meta').textContent = [hit.T.time, hit.T.opp ? L.vs + ' ' + hit.T.opp : ''].filter(Boolean).join(' · ');
    var ol = $(kind + 'Steps'); ol.innerHTML = '';
    if (hit.sub) {
      var li = document.createElement('li'); li.textContent = L.sub.replace('{n}', hit.sub); ol.appendChild(li);
      var ssk = hit.T.ss && hit.T.ss[hit.sub - 1];
      if (ssk && L.b[ssk]) { var li2 = document.createElement('li'); li2.textContent = (L.suba || '{b}').replace('{b}', L.b[ssk]); ol.appendChild(li2); }
      $(kind + 'With').textContent = '';
    } else {
      var steps = (hit.T.g && hit.T.g[hit.g]) || (kind === 'ds' ? DS_GROUPS[hit.g] : null) || [];
      steps.forEach(function(s, i){
        var li = document.createElement('li'), b = document.createElement('b'); b.textContent = (hit.T.ph && L.pl[hit.T.ph[i]]) || L.ph[i];
        li.appendChild(b); li.appendChild(document.createTextNode(act(s))); ol.appendChild(li);
      });
      var mates = (hit.T.m || []).filter(function(x){ return x[1] === hit.g && x[0] !== n; }).map(function(x){ return x[0]; });
      $(kind + 'With').textContent = mates.length ? L['with'] + ': ' + mates.join(', ') : '';
    }
    if (hit.T.note) {
      var nl = document.createElement('li'); nl.style.listStyle = 'none'; nl.style.marginLeft = '-20px';
      var nb = document.createElement('b'); nb.textContent = L.note; nl.appendChild(nb); nl.appendChild(document.createTextNode(hit.T.note)); ol.appendChild(nl);
    }
    card.classList.remove('hide');
  }

  /* ---------- Formular ---------- */
  function loadMember(){
    var n = $('name').value, e = DATA.entries[n];
    for (var i = 0; i < DATA.squads; i++){
      var c = $('sq'+i), s = e && e.squads[i];
      c.querySelector('.type').value = (s && s.type) || '';
      c.dataset.type = (s && s.type) || '';
      var p = s && s.power !== null && s.power !== undefined ? s.power : '';
      c.querySelector('.pow').value = p === '' ? '' : String(p).replace('.', LANG === 'en' ? '.' : ',');
    }
    var hp = e && e.hero !== null && e.hero !== undefined ? String(e.hero).replace('.', LANG === 'en' ? '.' : ',') : '';
    $('hero').value = hp;
    $('gorilla').value = e && e.gorilla ? String(e.gorilla) : '';
    $('gstage').value = e && e.gstage ? String(e.gstage) : '';
    $('gpower').value = e && e.gpower ? String(Math.round(e.gpower)) : '';
    $('email').value = '';
    renderAuth();
    if (e && e.lang && DATA.i18n[e.lang] && !store('skws_lang_manual')) setLang(e.lang, false);
    showMeta(); setMsg('');
  }

  /* ---------- Anmeldung mit PIN (gemeinsam mit Funk) ---------- */
  function F_(){ return FUNK_I18N[LANG] || FUNK_I18N.en; }
  function authed(n){ var s = window.Funk && Funk.session(); return !!(s && n && s.name === n); }
  function tok(){ var s = window.Funk && Funk.session(); return s ? s.tok : null; }
  function renderAuth(){
    var box = $('authBox'); if (!box || !window.Funk || !Funk.ready()) return;
    var n = $('name').value, F = F_(); box.innerHTML = '';
    if (!n) return;
    if (DATA.av && DATA.av[n]) { var big = avEl(n, 96); big.classList.add('zoom'); big.addEventListener('click', function(){ avBig(n); }); var wr = document.createElement('div'); wr.className = 'auth-av'; wr.appendChild(big); box.appendChild(wr); loadAvatars([n], renderAuth); }
    if (authed(n)) {
      var d = document.createElement('div'); d.className = 'fk-authok'; d.textContent = F.loggedIn.replace('{n}', n) + ' · ';
      var a = document.createElement('a'); a.href = '#'; a.className = 'fk-link'; a.textContent = F.notYou;
      a.addEventListener('click', function(e){ e.preventDefault(); Funk.logout(); }); d.appendChild(a); box.appendChild(d); return;
    }
    var h = document.createElement('div'); h.className = 'hint'; h.textContent = F.needPin; box.appendChild(h);
    var inner = document.createElement('div'); box.appendChild(inner);
    Funk.authBox(inner, n, null);
  }

  function renderEv(){
    var box = $('evCards'); box.innerHTML = '';
    var ev = DATA && DATA.ev; if (!ev) return;
    var T = EV_I18N[LANG] || EV_I18N.en, n = $('name').value;
    ['ds','cs'].forEach(function(kind){
      var r = ev[kind]; if (!r) return;
      var mine = n && r.signups ? r.signups[n] : null;
      if (!r.open && !mine) return;
      var card = document.createElement('div'); card.className = 'card';
      var hd = document.createElement('div'); hd.className = 'sq-h';
      var b = document.createElement('b'); b.textContent = T.signup + ' ' + T[kind]; hd.appendChild(b);
      var tg = document.createElement('span'); tg.className = 'tag req'; tg.textContent = r.label; hd.appendChild(tg); card.appendChild(hd);
      var cnt = Object.keys(r.signups || {}).filter(function(k){ return r.signups[k] !== 'no'; }).length;
      var meta = document.createElement('div'); meta.className = 'hint'; meta.style.marginTop = '0';
      meta.textContent = [r.open ? (r.deadline ? T.deadline + ': ' + new Date(r.deadline).toLocaleString(LANG, { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '') : T.closed, cnt + ' ' + T.count].filter(Boolean).join(' · ');
      card.appendChild(meta);
      if (!n) { var pn = document.createElement('div'); pn.className = 'hint'; pn.textContent = T.pickName; card.appendChild(pn); box.appendChild(card); return; }
      var note = document.createElement('input'); note.type = 'text'; note.maxLength = 120; note.placeholder = T.note; note.style.marginTop = '8px';
      var ok = authed(n);
      if (r.open && !ok) { var lf = document.createElement('div'); lf.className = 'hint fk-first'; lf.textContent = F_().loginFirst; card.appendChild(lf); }
      if (r.open && ok) card.appendChild(note);
      function lbl(c){ return c === 'no' ? T.no : (c.indexOf('sub') === 0 ? T.hE : T.hS) + ': ' + (/A$/.test(c) && c !== 'AB' && c !== 'sub' ? T.tA : /B$/.test(c) && c !== 'AB' && c !== 'sub' ? T.tB : T.AB); }
      [['hS', [['A', T.tA, r.time_a], ['B', T.tB, r.time_b], ['AB', T.AB, '']]], ['hE', [['subA', T.tA, r.time_a], ['subB', T.tB, r.time_b], ['sub', T.AB, '']]], ['', [['no', T.no, '']]]].forEach(function(grp){
        if (grp[0]) { var gh = document.createElement('div'); gh.className = 'hint'; gh.style.margin = '10px 0 0'; gh.style.fontWeight = '700'; gh.textContent = T[grp[0]]; card.appendChild(gh); }
        grp[1].forEach(function(o){
          var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'evopt' + (mine === o[0] ? ' on' : '');
          bt.textContent = (mine === o[0] ? '✓ ' : '') + o[1] + (o[2] ? ' (' + o[2] + ')' : '');
          bt.disabled = !r.open || !ok;
          bt.addEventListener('click', function(){
            bt.disabled = true; msg.textContent = '…';
            rpc('event_signup', { p_name: n, p_round: r.id, p_choice: o[0], p_note: note.value || null, p_token: tok() }).then(function(){
              r.signups = r.signups || {}; r.signups[n] = o[0]; renderEv();
              var m2 = document.querySelector('#evCards [data-ev="' + kind + '"]'); if (m2) { m2.textContent = T.saved + ' – ' + T.hint; m2.style.color = 'var(--ok)'; }
            }).catch(function(e){ bt.disabled = false; if (String(e && e.message).indexOf('ERR_LOGIN') >= 0) { Funk.expired(); return; } msg.textContent = T.err; msg.style.color = 'var(--err)'; });
          });
          card.appendChild(bt);
        });
      });
      var msg = document.createElement('div'); msg.className = 'hint'; msg.dataset.ev = kind; msg.textContent = mine ? T.yours + ': ' + lbl(mine) + ' · ' + T.hint : T.hint;
      card.appendChild(msg);
      box.appendChild(card);
    });
  }

  var MER_FOR = null, MER_DATA = [];
  function loadMerits(){
    var n = $('name').value;
    if (!n) { MER_FOR = null; MER_DATA = []; renderMerits(); return; }
    if (n === MER_FOR) { renderMerits(); return; }
    MER_FOR = n; MER_DATA = []; renderMerits();
    rpc('my_merits', { p_name: n }).then(function(r){ if (MER_FOR !== n) return; MER_DATA = Array.isArray(r) ? r : []; renderMerits(); renderWeek(); }).catch(function(){});
  }
  function renderMerits(){
    var card = $('merCard'); if (!MER_DATA.length) { card.classList.add('hide'); return; }
    var T = MER_I18N[LANG] || MER_I18N.en, E = EV_I18N[LANG] || EV_I18N.en, list = $('merList'); list.innerHTML = '';
    $('merTitle').textContent = T.title; $('merHint').textContent = T.hint;
    MER_DATA.forEach(function(m){
      var ev = m.scope === 'both' ? E.ds + ' & ' + E.cs : E[m.scope];
      var row = document.createElement('div'); row.style.cssText = 'padding:8px 0;border-top:1px solid var(--line)';
      var h = document.createElement('div'); h.style.fontWeight = '700'; h.style.color = m.kind === 'malus' ? 'var(--err)' : 'var(--ok)';
      h.textContent = (m.kind === 'malus' ? '▼ ' + T.malus : '▲ ' + T.bonus) + ': ' + (T[m.effect] || '').replace('{ev}', ev); row.appendChild(h);
      var r = document.createElement('div'); r.textContent = m.reason; row.appendChild(r);
      var d = [], fmtD = function(x){ return new Date(x).toLocaleDateString(LANG, { day:'2-digit', month:'2-digit', year:'numeric' }); };
      if (m.rounds !== null && m.rounds !== undefined) {
        if (m.scope === 'both') { if (m.left_ds) d.push(E.ds + ': ' + T.left.replace('{n}', m.left_ds)); if (m.left_cs) d.push(E.cs + ': ' + T.left.replace('{n}', m.left_cs)); }
        else d.push(T.left.replace('{n}', m.scope === 'ds' ? m.left_ds : m.left_cs));
      }
      if (m.until) d.push(T.until.replace('{d}', fmtD(m.until)));
      if (!d.length && m.effect !== 'none') d.push(T.forever);
      if (d.length) { var dd = document.createElement('div'); dd.className = 'hint'; dd.style.marginTop = '2px'; dd.textContent = d.join(' · '); row.appendChild(dd); }
      list.appendChild(row);
    });
    card.classList.remove('hide');
  }

  /* ---------- Diese Woche: was steht für mich an? ---------- */
  function renderWeek(){
    var card = $('weekCard'), n = $('name').value; if (!n || !DATA) { card.classList.add('hide'); return; }
    var T = HOF_I18N[LANG] || HOF_I18N.en, E = EV_I18N[LANG] || EV_I18N.en, items = [];
    function add(icon, txt, cls, target){ items.push({ i: icon, t: txt, c: cls || '', to: target }); }
    ['ds','cs'].forEach(function(k){
      var r = DATA.ev && DATA.ev[k]; if (r && r.open) { var mine = r.signups && r.signups[n];
        add(mine ? '✅' : '📝', (mine ? T.answered : T.openSign).replace('{ev}', E[k]).replace('{l}', r.label), mine ? 'ok' : 'warn', 'evCards'); }
      var P = DATA[k]; if (P && P.teams) Object.keys(P.teams).forEach(function(t){ var Tm = P.teams[t];
        var inM = (Tm.m || []).some(function(x){ return x[0] === n; }), inS = (Tm.s || []).indexOf(n) >= 0;
        if (inM || inS) add('⚔️', T.job.replace('{ev}', E[k]).replace('{t}', t).replace('{time}', Tm.time ? ' · ' + Tm.time : ''), '', k + 'Card'); });
    });
    var e = DATA.entries[n];
    if (!e) add('⚠️', T.never, 'warn', 'squads');
    else { var d = Math.floor((Date.now() - new Date(e.updated)) / 86400000); if (d > 7) add('⏰', T.stale.replace('{n}', d), 'warn', 'squads'); else add('✅', T.fresh, 'ok'); }
    (MER_DATA || []).filter(function(m){ return m.kind === 'bonus' && (Date.now() - new Date(m.created_at)) < 7 * 86400000; }).forEach(function(m){ add('🐝', T.newBee.replace('{r}', m.reason), 'ok', 'merCard'); });
    $('weekTitle').textContent = T.week; var l = $('weekList'); l.innerHTML = '';
    items.forEach(function(x){ var d = document.createElement('div'); d.className = 'wk ' + x.c; var ic = document.createElement('span'); ic.className = 'i'; ic.textContent = x.i; d.appendChild(ic);
      var tx = document.createElement('span'); tx.style.flex = '1'; tx.textContent = x.t; d.appendChild(tx);
      if (x.to && $(x.to)) { d.style.cursor = 'pointer'; d.addEventListener('click', function(){ $(x.to).scrollIntoView({ behavior:'smooth', block:'start' }); }); }
      l.appendChild(d); });
    card.classList.toggle('hide', !items.length);
  }

  /* ---------- Ruhmeshalle (nur Positives) ---------- */
  function renderHof(){
    var card = $('hofCard'); if (!PROF_STATS) { if (!PROF_BUSY) { PROF_BUSY = true; rpc('profile_stats').then(function(r){ PROF_STATS = r || {}; }).catch(function(){ PROF_STATS = {}; }).then(function(){ PROF_BUSY = false; renderHof(); }); } return; }
    var T = HOF_I18N[LANG] || HOF_I18N.en, S = PROF_STATS, names = Object.keys(S), box = $('hofBox'); box.innerHTML = '';
    $('hofTitle').textContent = T.hof;
    function top(f, min){ return names.map(function(n){ return { n: n, v: f(S[n] || {}) }; }).filter(function(x){ return x.v > (min || 0); }).sort(function(a, b){ return b.v - a.v || a.n.localeCompare(b.n); }).slice(0, 5); }
    var pm = names.slice().filter(function(n){ return (S[n].b30 || 0) > 0 || (S[n].g30 || 0) > 0; }).sort(function(a, b){ return (S[b].b30 || 0) - (S[a].b30 || 0) || (S[b].g30 || 0) - (S[a].g30 || 0); })[0];
    var lists = [[T.topBees, top(function(s){ return s.b || 0; }), function(v){ return '🐝 ' + v; }], [T.topGrowth, top(function(s){ return s.g30 || 0; }), function(v){ return '+' + String(v).replace('.', LANG === 'en' ? '.' : ',') + ' %'; }],
                 [T.topEvents, top(function(s){ return (s.pds || 0) + (s.pcs || 0); }), function(v){ return T.evN.replace('{n}', v); }]];
    if (!pm && !lists.some(function(l){ return l[1].length; })) { var no = document.createElement('div'); no.className = 'hint'; no.textContent = T.none; box.appendChild(no); card.classList.remove('hide'); return; }
    loadAvatars(names, function(){ renderHof(); });
    if (pm) { var p = document.createElement('div'); p.className = 'hof-potm'; p.appendChild(avEl(pm, 76)); var t = document.createElement('div');
      var k = document.createElement('div'); k.className = 'hint'; k.style.marginTop = '0'; k.textContent = '👑 ' + T.potm; t.appendChild(k);
      var b = document.createElement('b'); b.textContent = pm; t.appendChild(b);
      var w = document.createElement('div'); w.className = 'hint'; w.style.marginTop = '0'; w.textContent = (S[pm].b30 ? T.whyB.replace('{n}', S[pm].b30) : T.whyG.replace('{g}', S[pm].g30)); t.appendChild(w);
      p.appendChild(t); p.addEventListener('click', function(){ openProfile(pm); }); box.appendChild(p); }
    var g = document.createElement('div'); g.className = 'hof-grid';
    lists.forEach(function(l){ if (!l[1].length) return; var c = document.createElement('div'); var h = document.createElement('h4'); h.textContent = l[0]; c.appendChild(h);
      l[1].forEach(function(x, i){ var r = document.createElement('div'); r.className = 'hof-row'; r.appendChild(avEl(x.n, 34)); var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = (i + 1) + '. ' + x.n; r.appendChild(nm);
        var v = document.createElement('span'); v.className = 'v'; v.textContent = l[2](x.v); r.appendChild(v); r.addEventListener('click', function(){ openProfile(x.n); }); c.appendChild(r); });
      g.appendChild(c); });
    box.appendChild(g); card.classList.remove('hide');
  }

  function showMeta(){
    loadMerits(); renderWeek();
    if (!$('profileView').classList.contains('hide')) loadProfile();
    renderEv();
    renderDs();
    var nm = $('name').value;
    $('nameSaved').classList.toggle('hide', !nm);
    $('adminBtn').classList.toggle('hide', !(nm && DATA && (DATA.leaders || []).indexOf(nm) >= 0));
    $('linkAdminBox').classList.toggle('hide', !(nm && DATA && (DATA.leaders || []).indexOf(nm) >= 0));
    var e = DATA && DATA.entries[$('name').value];
    $('lastUpdate').classList.toggle('hide', !(e && e.updated));
    if (e && e.updated) $('lastUpdate').textContent = t('lastUpdate') + ': ' + fmtDate(e.updated);
    $('emailActive').classList.toggle('hide', !(e && e.hasEmail));
  }

  function setMsg(txt, cls){ var m = $('msg'); m.textContent = txt || ''; m.className = 'msg' + (cls ? ' ' + cls : ''); }

  function parsePow(v){
    v = String(v || '').trim().replace(/\s/g,'').replace(/[mM]$/,'');
    if (!v) return null;
    if (/^\d{1,3}([.,]\d{3}){2,}$/.test(v)) v = v.replace(/[.,]/g,'');
    var n = Number(v.replace(',', '.'));
    return isFinite(n) && n > 0 ? n : NaN;
  }

  var NEW_MODE = false;
  function setNewMode(on){
    NEW_MODE = !!on;
    $('pickBox').classList.toggle('hide', NEW_MODE);
    $('newBox').classList.toggle('hide', !NEW_MODE);
    if (NEW_MODE) { $('name').value = ''; loadMember(); $('newName').focus(); }
    else { $('newName').value = ''; }
    setMsg('');
  }

  function collect(){
    var name = NEW_MODE ? $('newName').value.trim().replace(/\s+/g, ' ') : $('name').value;
    if (NEW_MODE) {
      if (name.length < 2 || name.length > 40) return { err: t('errNewName') };
      var hit = DATA.members.filter(function(m){ return m.toLowerCase() === name.toLowerCase(); })[0];
      if (hit) return { err: t('errExists') };
    }
    if (!name) return { err: t('errName') };
    var squads = [];
    for (var i = 0; i < DATA.squads; i++){
      var c = $('sq'+i), type = c.querySelector('.type').value, raw = c.querySelector('.pow').value, p = parsePow(raw);
      if (p !== null && isNaN(p)) return { err: t('errPower') };
      if (i < REQ_SQUADS && (!type || p === null)) return { err: t('errTreq', {n: i+1}) };
      if (!!type !== (p !== null)) return { err: t('errSquad', {n: i+1}) };
      squads.push({ type: type, power: p === null ? null : (p >= 10000 ? Math.round(p / 1e4) / 100 : p) });
    }
    var hero = parsePow($('hero').value);
    if (hero === null || isNaN(hero)) return { err: t('errHero') };
    if (hero >= 10000) hero = Math.round(hero / 1e4) / 100;
    var gtxt = $('gorilla').value.trim(), gor = /^\d{1,3}$/.test(gtxt) ? parseInt(gtxt, 10) : NaN;
    if (!(gor >= 1)) return { err: t('errGorilla') };
    var stxt = $('gstage').value.trim(), gst = /^\d{1,2}$/.test(stxt) ? parseInt(stxt, 10) : NaN;
    if (!(gst >= 1 && gst <= 30)) return { err: t('errGstage') };
    var gpw = parsePow($('gpower').value);
    if (gpw === null || isNaN(gpw)) return { err: t('errGpower') };
    gpw = Math.round(gpw < 10000 ? gpw * 1e6 : gpw);
    if (gpw > 1e9) return { err: t('errGpower') };
    var email = $('email').value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { err: t('errEmail') };
    var ex = NEW_MODE ? null : DATA.entries[name];
    if (!email && !(ex && ex.hasEmail)) return { err: t('errEmailReq') };
    var pin = null;
    if (NEW_MODE) { pin = $('newPin').value; if (pin.length < 4 || pin.length > 32) return { err: F_().err.ERR_PINLEN }; if (pin !== $('newPin2').value) return { err: F_().pinMismatch }; }
    else if (!authed(name)) return { err: F_().loginFirst };
    return { data: { pin: pin, name: name, squads: squads, email: email, removeEmail: false, lang: LANG, hero: hero, gorilla: gor, gstage: gst, gpower: gpw } };
  }

  function errText(m){
    m = String(m || '');
    var sq = m.match(/ERR_SQUAD:(\d)/);
    if (sq) return t('errSquad', {n: sq[1]});
    var tr = m.match(/ERR_TREQ:(\d)/);
    if (tr) return t('errTreq', {n: tr[1]});
    if (m.indexOf('ERR_HERO') >= 0) return t('errHero');
    if (m.indexOf('ERR_GORILLA') >= 0) return t('errGorilla');
    if (m.indexOf('ERR_GSTAGE') >= 0) return t('errGstage');
    if (m.indexOf('ERR_GPOWER') >= 0) return t('errGpower');
    if (m.indexOf('ERR_NEWNAME') >= 0) return t('errNewName');
    if (m.indexOf('ERR_EXISTS') >= 0) return t('errExists');
    if (m.indexOf('ERR_EMAIL_RETURN') >= 0) return F_().err.ERR_EMAIL;
    if (m.indexOf('ERR_LOGIN') >= 0) return F_().loginFirst;
    if (m.indexOf('ERR_PINLEN') >= 0) return F_().err.ERR_PINLEN;
    if (m.indexOf('ERR_PIN') >= 0) return F_().err.ERR_PIN.split('.')[0] + '.';
    if (m.indexOf('ERR_RATE') >= 0) return t('errRate');
    if (m.indexOf('ERR_NAME') >= 0) return t('errName');
    if (m.indexOf('ERR_T1') >= 0) return t('errT1');
    if (m.indexOf('ERR_POWER') >= 0) return t('errPower');
    if (m.indexOf('ERR_EMAIL_TAKEN') >= 0) return t('errEmailTaken');
    if (m.indexOf('ERR_EMAIL_REQ') >= 0) return t('errEmailReq');
    if (m.indexOf('ERR_EMAIL') >= 0) return t('errEmail');
    return t('errSave');
  }

  function save(){
    if (busy) return;
    var r = collect();
    if (r.err) { setMsg(r.err, 'err'); return; }
    busy = true; $('save').disabled = true; $('save').textContent = t('saving'); setMsg('');
    var isNew = NEW_MODE;
    var call = isNew
      ? rpc('register_entry', { p_name: r.data.name, p_squads: r.data.squads, p_email: r.data.email, p_lang: r.data.lang, p_hero: r.data.hero, p_gorilla: r.data.gorilla, p_gstage: r.data.gstage, p_gpower: r.data.gpower, p_pin: r.data.pin })
      : rpc('save_entry', { p_name: r.data.name, p_squads: r.data.squads, p_email: r.data.email, p_remove_email: false, p_lang: r.data.lang, p_hero: r.data.hero, p_gorilla: r.data.gorilla, p_gstage: r.data.gstage, p_gpower: r.data.gpower, p_token: tok() });
    call
      .then(function(res){
        var nm = (isNew && res.name) || r.data.name;
        if (isNew && DATA.members.indexOf(nm) < 0) DATA.members.push(nm);
        DATA.entries[nm] = { squads: res.squads, hasEmail: res.hasEmail, lang: res.lang, updated: res.updated, hero: res.hero, gorilla: res.gorilla, gstage: res.gstage, gpower: res.gpower };
        done();
        $('email').value = '';
        if (isNew && res.token) { $('newPin').value = $('newPin2').value = ''; Funk.adopt(res.token, nm, res.level); }
        if (isNew) {
          setNewMode(false); fillNames(); $('name').value = nm;
          store('skws_name', nm);
          if (window.SKWSAndroid && window.SKWSAndroid.setName) { try { window.SKWSAndroid.setName(nm); } catch(e){} }
        }
        fillNames(); showMeta(); renderOverview();
        setMsg(t('saved'), 'ok');
      })
      .catch(function(err){ done(); if (String(err && err.message).indexOf('ERR_LOGIN') >= 0 && authed(r.data.name)) Funk.expired(); setMsg(errText(err && err.message), 'err'); });
    function done(){ busy = false; $('save').disabled = false; $('save').textContent = t('save'); }
  }

  /* ---------- Übersicht ---------- */
  function renderOverview(){
    if (!DATA) return;
    var members = DATA.members, rows = [], missing = [];
    members.forEach(function(n){
      var e = DATA.entries[n];
      if (!e) { missing.push(n); return; }
      var total = 0; e.squads.forEach(function(s){ if (s.power) total += Number(s.power); });
      rows.push({ name: n, t1: e.squads[0] || {}, total: total, hero: e.hero, gorilla: e.gorilla, gstage: e.gstage, gpower: e.gpower });
    });
    rows.sort(function(a,b){ return (b.t1.power||0) - (a.t1.power||0); });
    var x = members.length - missing.length, y = members.length;
    $('statTxt').textContent = t('submitted', {x: x, y: y});
    $('ovHint').textContent = (AV_I18N[LANG] || AV_I18N.en).tapName;
    if (!renderOverview.busy) renderHof();
    $('statBar').style.width = (y ? Math.round(x / y * 100) : 0) + '%';

    var tb = $('ovBody'); tb.innerHTML = '';
    loadAvatars(members, function(){ if (!$('overviewView').classList.contains('hide') && !renderOverview.busy) { renderOverview.busy = true; renderOverview(); renderOverview.busy = false; } });
    rows.forEach(function(r, i){
      var tr = document.createElement('tr');
      var td0 = document.createElement('td'); td0.textContent = i + 1; td0.className = 'typ';
      var td1 = document.createElement('td'), nm = document.createElement('div'); nm.className = 'ovname'; nm.appendChild(avEl(r.name, 40));
      var ns = document.createElement('span'); ns.textContent = r.name; nm.appendChild(ns); td1.appendChild(nm);
      nm.addEventListener('click', (function(x){ return function(){ openProfile(x); }; })(r.name));
      if (r.hero || r.gorilla) {
        var hs = document.createElement('div'); hs.className = 'typ';
        var g = [r.gstage ? '★' + r.gstage : '', r.gorilla ? 'Lv ' + r.gorilla : '', r.gpower ? fmtPow(Math.round(r.gpower / 1e4) / 100) : ''].filter(Boolean).join(' ');
        hs.textContent = [r.hero ? t('heroShort') + ' ' + fmtPow(r.hero) : '', g ? '🦍 ' + g : ''].filter(Boolean).join(' · ');
        td1.appendChild(hs);
      }
      var td2 = document.createElement('td'); td2.className = 'n';
      var dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = COLORS[r.t1.type] || 'var(--mixed)';
      dot.title = r.t1.type ? t(r.t1.type) : '';
      td2.appendChild(dot); td2.appendChild(document.createTextNode(fmtPow(r.t1.power)));
      var sub = document.createElement('div'); sub.className = 'typ'; sub.textContent = r.t1.type ? t(r.t1.type) : '';
      td2.appendChild(sub);
      var td3 = document.createElement('td'); td3.className = 'n'; td3.textContent = fmtPow(r.total);
      tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tb.appendChild(tr);
    });

    $('missingCard').classList.toggle('hide', !missing.length);
    var ml = $('missingList'); ml.innerHTML = '';
    missing.sort(function(a,b){ return a.localeCompare(b, undefined, {sensitivity:'base'}); }).forEach(function(n){
      var s = document.createElement('span'); s.textContent = n; ml.appendChild(s);
    });
  }

  function showTab(which){
    $('tabForm').classList.toggle('on', which === 'form');
    $('tabOverview').classList.toggle('on', which === 'overview');
    $('tabProfile').classList.toggle('on', which === 'profile');
    $('formView').classList.toggle('hide', which !== 'form');
    $('overviewView').classList.toggle('hide', which !== 'overview');
    $('profileView').classList.toggle('hide', which !== 'profile');
    $('tabFunk').classList.toggle('on', which === 'funk');
    $('funkView').classList.toggle('hide', which !== 'funk');
    if (which === 'profile') loadProfile();
    if (which === 'funk') Funk.show();
  }

  /* ---------- Avatare ---------- */
  var AV = {}, AV_LOADING = {};
  (function(){ try { var c = JSON.parse(localStorage.getItem('skws_av') || '{}'); Object.keys(c).forEach(function(n){ AV[n] = c[n]; }); } catch(e){} })();
  function avStore(){ try { localStorage.setItem('skws_av', JSON.stringify(AV)); } catch(e){} }
  // Bilder für die Namen laden, die einen neueren Stand haben als im Zwischenspeicher
  function loadAvatars(names, cb){
    var ver = (DATA && DATA.av) || {}, need = names.filter(function(n){ return ver[n] && (!AV[n] || AV[n].v !== ver[n]) && !AV_LOADING[n]; });
    Object.keys(AV).forEach(function(n){ if (!ver[n]) delete AV[n]; });
    if (!need.length) return;
    need.forEach(function(n){ AV_LOADING[n] = 1; });
    var chunks = []; for (var i = 0; i < need.length; i += 100) chunks.push(need.slice(i, i + 100));
    Promise.all(chunks.map(function(c){ return rpc('get_avatars', { p_names: c }).then(function(r){ Object.keys(r || {}).forEach(function(n){ AV[n] = r[n]; }); }); }))
      .catch(function(){}).then(function(){ need.forEach(function(n){ delete AV_LOADING[n]; }); avStore(); if (cb) cb(); });
  }
  function avEl(name, size){
    var d = document.createElement('span'); d.className = 'av'; d.style.width = d.style.height = size + 'px'; d.style.fontSize = Math.round(size * .45) + 'px';
    var a = AV[name] && (DATA && DATA.av && DATA.av[name]) ? AV[name].d : null;
    if (a) { var im = document.createElement('img'); im.src = a; im.alt = ''; d.appendChild(im); }
    else { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; d.style.background = 'hsl(' + h + ',60%,62%)'; d.textContent = (name.match(/[A-Za-z0-9À-ž]/) || [name[0] || '?'])[0].toUpperCase(); }
    return d;
  }
  // Bild verkleinern: quadratischer Ausschnitt 160x160 als JPEG
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
  // Profilbild groß anzeigen (Antippen schließt)
  function avBig(n){
    if (!(AV[n] && DATA.av && DATA.av[n])) return;
    var o = document.createElement('div'); o.className = 'av-big';
    var im = document.createElement('img'); im.src = AV[n].d; im.alt = n; o.appendChild(im);
    var cap = document.createElement('div'); cap.textContent = n; o.appendChild(cap);
    o.addEventListener('click', function(){ o.remove(); });
    document.body.appendChild(o);
  }
  var PROF_VIEW = null;
  function openProfile(n){ PROF_VIEW = n === $('name').value ? null : n; showTab('profile'); window.scrollTo(0, 0); }

  /* ---------- Profil: Bienchen, Teufelchen, Erfolge ---------- */
  var PROF_STATS = null, PROF_STK = {}, PROF_BUSY = false;
  var BEE_T = [0, 1, 3, 6, 10, 15], DEV_T = [0, 1, 2, 4, 6];
  var ACH = [
    { id:'melder', ic:'📝', t:[3, 10, 25], v:function(s){ return s.hn || 0; } },
    { id:'growth', ic:'📈', t:[5, 15, 30], v:function(s){ return s.g || 0; } },
    { id:'power', ic:'⚔️', t:[35, 45, 55], v:function(s, e){ return e && e.squads && e.squads[0] ? Number(e.squads[0].power || 0) : 0; } },
    { id:'hero', ic:'🦸', t:[100, 150, 200], v:function(s, e){ return e && e.hero ? Number(e.hero) : 0; } },
    { id:'gorilla', ic:'🦍', t:[5, 10, 15], v:function(s, e){ return e && e.gstage ? Number(e.gstage) : 0; } },
    { id:'ds', ic:'🏜️', t:[1, 5, 15], v:function(s){ return s.pds || 0; } },
    { id:'cs', ic:'🏔️', t:[1, 5, 15], v:function(s){ return s.pcs || 0; } },
    { id:'ready', ic:'✋', t:[3, 10, 25], v:function(s){ return s.su || 0; } },
    { id:'joker', ic:'🃏', t:[1, 3, 8], v:function(s){ return s.sub || 0; } },
    { id:'bees', ic:'🐝', t:[1, 5, 12], v:function(s){ return s.b || 0; } },
    { id:'loyal', ic:'🛡️', t:[30, 90, 365], v:function(s){ var d = s.jd || s.fe; return d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 0; } },
    { id:'mentor', ic:'🎓', t:[1], v:function(s){ return s.role === 'mentor' || s.role === 'r4' ? 1 : 0; } },
    { id:'clean', ic:'😇', t:[1], v:function(s){ var d = s.jd || s.fe; return !s.d && d && (Date.now() - new Date(d)) >= 30 * 86400000 ? 1 : 0; } },
    { id:'redeemed', ic:'🌅', t:[1], v:function(s){ return s.d > 0 && !s.d90 ? 1 : 0; } }
  ];
  function avUploader(n, AT){
    var w = document.createElement('div'); w.className = 'avup';
    var tg = document.createElement('button'); tg.type = 'button'; tg.textContent = '🖼️ ' + AT.change; w.appendChild(tg);
    var bx = document.createElement('div'); bx.className = 'hide'; w.appendChild(bx);
    tg.addEventListener('click', function(){ bx.classList.toggle('hide'); });
    var A = window.SKWSAndroid;
    if (A && !A.canPickFile) { var o = document.createElement('div'); o.className = 'hint'; o.style.color = 'var(--warn)'; o.textContent = AT.oldApp; bx.appendChild(o); }
    var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none'; bx.appendChild(fi);
    var pv = document.createElement('div'); pv.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:8px'; bx.appendChild(pv);
    if (!authed(n)) { var lg = document.createElement('div'); lg.className = 'hint fk-first'; lg.textContent = F_().avLogin; bx.appendChild(lg); return w; }
    var row = document.createElement('div'); row.className = 'row2'; bx.appendChild(row);
    var bp = document.createElement('button'); bp.type = 'button'; bp.textContent = AT.pick; row.appendChild(bp);
    var bs = document.createElement('button'); bs.type = 'button'; bs.className = 'pri'; bs.textContent = AT.save; bs.disabled = true; row.appendChild(bs);
    var bd = document.createElement('button'); bd.type = 'button'; bd.textContent = AT.del; if (!(DATA.av && DATA.av[n])) bd.style.display = 'none'; row.appendChild(bd);
    var msg = document.createElement('div'); msg.className = 'hint'; bx.appendChild(msg);
    var hn = document.createElement('div'); hn.className = 'hint'; hn.textContent = AT.hint; bx.appendChild(hn);
    var data = null;
    bp.addEventListener('click', function(){ fi.click(); });
    fi.addEventListener('change', function(){ var f = fi.files && fi.files[0]; if (!f) return; msg.textContent = '…';
      avShrink(f, function(u){ data = u; msg.textContent = u ? '' : AT.err; pv.innerHTML = ''; if (u) { var im = document.createElement('img'); im.src = u; im.style.cssText = 'width:64px;height:64px;border-radius:50%;object-fit:cover'; pv.appendChild(im); } bs.disabled = !u; }); });
    function send(d){
      msg.textContent = '…'; msg.style.color = '';
      rpc('set_avatar', { p_token: tok(), p_data: d || '' }).then(function(r){
        if (r && r.ok === false) throw new Error(r.err || 'ERR');
        var v = Math.floor(Date.now() / 1000); DATA.av = DATA.av || {};
        if (d) { DATA.av[n] = v; AV[n] = { d: d, v: v }; } else { delete DATA.av[n]; delete AV[n]; }
        avStore(); renderProfile(); if (typeof renderOverview === 'function') renderOverview();
      }).catch(function(e){ var m = String(e && e.message); msg.style.color = 'var(--err)';
        if (m.indexOf('ERR_LOGIN') >= 0) { msg.textContent = F_().avLogin; Funk.expired(); return; }
        msg.textContent = m.indexOf('ERR_RATE') >= 0 ? AT.rate : AT.err; });
    }
    bs.addEventListener('click', function(){ if (data) send(data); });
    bd.addEventListener('click', function(){ send(null); });
    return w;
  }
  function achTier(a, s, e){ var v = a.v(s || {}, e), t = 0; a.t.forEach(function(x, i){ if (v >= x) t = i + 1; }); return { v: v, t: t }; }
  function loadProfile(){
    var n = PROF_VIEW || $('name').value;
    if (n) loadAvatars([n], renderProfile);
    if (!PROF_STATS && !PROF_BUSY) { PROF_BUSY = true; rpc('profile_stats').then(function(r){ PROF_STATS = r || {}; }).catch(function(){ PROF_STATS = {}; }).then(function(){ PROF_BUSY = false; renderProfile(); }); }
    if (n && !PROF_STK[n]) rpc('player_profile', { p_name: n }).then(function(r){ PROF_STK[n] = (r && r.stickers) || []; renderProfile(); }).catch(function(){ PROF_STK[n] = []; renderProfile(); });
    renderProfile();
  }
  function renderProfile(){
    var box = $('profBox'), T = PROF_I18N[LANG] || PROF_I18N.en, AT = AV_I18N[LANG] || AV_I18N.en, me = $('name').value, n = PROF_VIEW || me, own = !PROF_VIEW || PROF_VIEW === me; box.innerHTML = '';
    function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; }
    if (!n) { var c0 = el('div', 'card'); c0.appendChild(el('div', 'hint', T.pickName)); box.appendChild(c0); return; }
    if (!PROF_STATS) { var c1 = el('div', 'card'); c1.appendChild(el('div', 'hint', '…')); box.appendChild(c1); return; }
    var s = PROF_STATS[n] || {}, e = DATA.entries[n], stk = PROF_STK[n] || [];
    var fmtD = function(x){ return new Date(x).toLocaleDateString(LANG, { day:'2-digit', month:'2-digit', year:'numeric' }); };
    // Kopf
    if (!own) { var bk = el('button', 'linkbtn', me ? '← ' + AT.back : '←'); bk.style.marginTop = '0'; bk.style.marginBottom = '12px'; bk.addEventListener('click', function(){ PROF_VIEW = null; loadProfile(); }); box.appendChild(bk); }
    var c = el('div', 'card'), h = el('div', 'prof-h'), lvlB = 0; BEE_T.forEach(function(x, i){ if ((s.b || 0) >= x) lvlB = i; });
    var lvlD = 0; DEV_T.forEach(function(x, i){ if ((s.d90 || 0) >= x) lvlD = i; });
    var pav = el('div', 'prof-av', (AV[n] && DATA.av && DATA.av[n]) ? '' : (lvlD >= 2 ? '😈' : lvlB >= 1 ? '🐝' : '🙂'));
    if (AV[n] && DATA.av && DATA.av[n]) { var pim = el('img'); pim.src = AV[n].d; pim.alt = ''; pav.appendChild(pim); pav.classList.add('zoom'); pav.addEventListener('click', function(){ avBig(n); }); }
    h.appendChild(pav);
    var hn = el('div'); hn.appendChild(el('b', '', n));
    var sub = []; if (s.jd || s.fe) sub.push(T.since.replace('{d}', fmtD(s.jd || s.fe))); if (s.role) sub.push(T.role[s.role]);
    hn.appendChild(el('div', 'hint', sub.join(' · '))); h.appendChild(hn); c.appendChild(h);
    var lv = el('div', 'lvl');
    function lvlBox(title, icon, count, idx, th, names, col){
      var d = el('div'); d.appendChild(el('div', 'hint', title)); var big = el('div', 'big'); big.appendChild(el('span', '', icon + ' ' + count)); d.appendChild(big);
      d.appendChild(el('div', '', names[idx]));
      var bar = el('div', 'bar'), i = el('i'); var nx = th[idx + 1];
      i.style.width = (nx === undefined ? 100 : Math.round((count - th[idx]) / (nx - th[idx]) * 100)) + '%'; i.style.background = col; bar.appendChild(i); d.appendChild(bar);
      d.appendChild(el('div', 'hint', nx === undefined ? T.maxed : T.next.replace('{n}', nx - count).replace('{lvl}', names[idx + 1])));
      return d;
    }
    lv.appendChild(lvlBox(T.beeLevel, '🐝', s.b || 0, lvlB, BEE_T, T.beeL, '#f5c518'));
    var dv = lvlBox(T.devilLevel, '😈', s.d90 || 0, lvlD, DEV_T, T.devL, '#ff6b6b'); if (!lvlD) dv.lastChild.textContent = '😇';
    lv.appendChild(dv); c.appendChild(lv);
    if (own) c.appendChild(avUploader(n, AT));
    box.appendChild(c);
    // Sticker-Wand
    var c2 = el('div', 'card'), hd = el('div', 'sq-h'); hd.appendChild(el('b', '', T.stickers)); hd.appendChild(el('span', 'tag', '🐝 ' + (s.b || 0) + '  ·  😈 ' + (s.d || 0))); c2.appendChild(hd);
    var info = el('div', 'hint');
    if (!stk.length) c2.appendChild(el('div', 'hint', T.noStickers));
    else {
      var w = el('div', 'stk');
      stk.forEach(function(x){
        var old = x.kind === 'malus' && (Date.now() - new Date(x.t)) > 90 * 86400000;
        var sp = el('span', (x.kind === 'bonus' ? 'b' : 'd') + (old ? ' old' : ''), x.kind === 'bonus' ? '🐝' : '😈');
        sp.title = fmtD(x.t) + ' · ' + x.reason + (old ? ' (' + T.old + ')' : '');
        sp.addEventListener('click', function(){ info.textContent = sp.title; });
        w.appendChild(sp);
      });
      c2.appendChild(w);
    }
    c2.appendChild(info); box.appendChild(c2);
    // Erfolge mit Seltenheit
    var all = Object.keys(PROF_STATS), c3 = el('div', 'card'), h3 = el('div', 'sq-h'); h3.appendChild(el('b', '', T.ach));
    var got = 0; ACH.forEach(function(a){ if (achTier(a, s, e).t) got++; });
    h3.appendChild(el('span', 'tag req', T.unlocked.replace('{a}', got).replace('{b}', ACH.length))); c3.appendChild(h3);
    var g = el('div', 'achs');
    ACH.slice().sort(function(a, b){ return achTier(b, s, e).t - achTier(a, s, e).t; }).forEach(function(a){
      var r = achTier(a, s, e), tx = T.a[a.id], multi = a.t.length > 1;
      var card = el('div', 'achv ' + (r.t ? 't' + (multi ? r.t : 3) : 'lock'));
      card.appendChild(el('div', 'ic', a.ic)); card.appendChild(el('b', '', tx[0] + (multi && r.t ? ' ' + ['I', 'II', 'III'][r.t - 1] : '')));
      var goal = a.t[Math.min(r.t, a.t.length - 1)];
      card.appendChild(el('small', '', tx[1].replace('{n}', r.t ? a.t[r.t - 1] : a.t[0])));
      if (multi && r.t < a.t.length) {
        var bar = el('div', 'bar'), i = el('i'); i.style.width = Math.min(100, Math.round(r.v / goal * 100)) + '%'; bar.appendChild(i); card.appendChild(bar);
        card.appendChild(el('small', '', (Math.round(r.v * 10) / 10) + ' / ' + goal + (r.t ? ' → ' + T.tiers[r.t] : '')));
      }
      if (r.t && multi) card.appendChild(el('small', '', T.tiers[r.t - 1]));
      var cnt = all.filter(function(m){ return achTier(a, PROF_STATS[m], DATA.entries[m]).t >= Math.max(1, r.t); }).length;
      card.appendChild(el('small', '', r.t ? T.rarity.replace('{p}', all.length ? Math.round(cnt / all.length * 100) : 0) : T.locked));
      g.appendChild(card);
    });
    c3.appendChild(g); box.appendChild(c3);
  }

  /* ---------- Sprache ---------- */
  function setLang(l, manual){
    if (!DATA.i18n[l]) l = 'en';
    LANG = l; $('lang').value = l; store('skws_lang', l);
    if (manual) store('skws_lang_manual', '1');
    applyLang();
  }

  function pickLang(){
    var saved = store('skws_lang');
    if (saved && DATA.i18n[saved]) return saved;
    var nav = (navigator.languages || [navigator.language || 'en']);
    for (var i = 0; i < nav.length; i++){ var c = String(nav[i]).slice(0,2).toLowerCase(); if (DATA.i18n[c]) return c; }
    return 'en';
  }

  /* ---------- Handy-Erinnerung (nur in der Android-App) ---------- */
  var APP = window.SKWSAndroid && window.SKWSAndroid.getReminder ? window.SKWSAndroid : null;
  function remState(){ try { return JSON.parse(APP.getReminder()); } catch(e){ return {}; } }
  function showRem(){
    if (!APP) return;
    var st = remState(), msg = '';
    $('appRemCard').classList.remove('hide');
    $('appRem').checked = !!st.on;
    if (st.on && !st.perm) msg = t('appRemNoPerm');
    $('appRemMsg').textContent = msg;
  }
  function setupLinks(){
    if (!window.SKWSAndroid) return;
    $('linksCard').classList.remove('hide');
    var btns = document.querySelectorAll('#linksCard .cpy');
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', function(){
      var b = this, url = b.dataset.url;
      function ok(){ b.textContent = t('copied'); setTimeout(function(){ b.textContent = t('copy'); }, 2000); }
      if (window.SKWSAndroid.copy) { try { window.SKWSAndroid.copy(url); ok(); return; } catch(e){} }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function(){});
    });
  }
  function setupRem(){
    if (!APP) return;
    showRem();
    $('appRem').addEventListener('change', function(){
      var n = $('name').value;
      if (this.checked && !n) { this.checked = false; $('appRemMsg').textContent = t('appRemPickName'); return; }
      $('appRemMsg').textContent = '';
      APP.setReminder(this.checked, n);
      setTimeout(showRem, 1500); setTimeout(showRem, 5000);
    });
    $('appRemTest').addEventListener('click', function(){ APP.testNotification($('name').value || ''); setTimeout(showRem, 1500); });
    $('name').addEventListener('change', function(){ var st = remState(); if (st.on && this.value) APP.setReminder(true, this.value); });
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) showRem(); });
  }

  /* ---------- Start ---------- */
  function init(data){
    DATA = data;
    $('allianceName').textContent = DATA.alliance;
    var ls = $('lang');
    Object.keys(DATA.langs).forEach(function(k){
      var o = document.createElement('option'); o.value = k; o.textContent = DATA.langs[k]; ls.appendChild(o);
    });
    buildSquads();
    LANG = pickLang(); ls.value = LANG;
    applyLang();
    $('loading').classList.add('hide'); $('app').classList.remove('hide');

    ls.addEventListener('change', function(){ setLang(this.value, true); });
    $('search').addEventListener('input', fillNames);
    $('name').addEventListener('change', function(){ store('skws_name', this.value); if (window.SKWSAndroid && window.SKWSAndroid.setName) { try { window.SKWSAndroid.setName(this.value); } catch(e){} } loadMember(); });
    $('save').addEventListener('click', save);
    $('newBtn').addEventListener('click', function(){ setNewMode(true); });
    $('backBtn').addEventListener('click', function(){ setNewMode(false); });
    $('tabForm').addEventListener('click', function(){ showTab('form'); });
    $('tabOverview').addEventListener('click', function(){ showTab('overview'); });
    $('tabProfile').addEventListener('click', function(){ PROF_VIEW = null; showTab('profile'); });
    $('tabFunk').addEventListener('click', function(){ showTab('funk'); });

    setupRem();
    setupLinks();
    Funk.init({ data: function(){ return DATA; }, lang: function(){ return LANG; }, myName: function(){ return $('name').value; },
      avEl: avEl, loadAvatars: loadAvatars, openProfile: openProfile,
      onAuth: function(){ renderAuth(); renderEv(); if (!$('profileView').classList.contains('hide')) renderProfile(); } });
    var last = store('skws_name');
    if (last && DATA.members.indexOf(last) >= 0){ $('name').value = last; loadMember(); }
    renderAuth();
  }

  var nl = (navigator.language || 'en').slice(0,2);
  $('loadingTxt').textContent = ({de:'Lade…',fr:'Chargement…',es:'Cargando…',pt:'Carregando…',it:'Caricamento…',tr:'Yükleniyor…',ru:'Загрузка…',pl:'Ładowanie…'})[nl] || 'Loading…';

  var qs = new URLSearchParams(location.search);
  if (qs.get('unsub')) {
    var ul = I18N[qs.get('lang')] ? qs.get('lang') : (I18N[nl] ? nl : 'en');
    rpc('unsubscribe', { p_token: qs.get('unsub') })
      .then(function(ok){ $('loadingTxt').textContent = ok ? I18N[ul].unsubDone : I18N[ul].unsubFail; })
      .catch(function(){ $('loadingTxt').textContent = I18N[ul].unsubFail; });
    document.querySelector('#loading .spin').style.display = 'none';
    return;
  }
  rpc('get_init')
    .then(function(res){
      init({ alliance: ALLIANCE, members: res.members || [], leaders: res.leaders || [], entries: res.entries || {}, ds: res.ds || null, cs: res.cs || null, ev: res.ev || null, av: res.av || {},
             troops: ['tank','missile','aircraft','mixed'], squads: 4, langs: LANG_NAMES, i18n: I18N });
    })
    .catch(function(){ $('loadingTxt').textContent = 'Error – please reload / Fehler – bitte neu laden'; });
})();
