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
    evLabels();
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

  // nach Änderungen (z. B. Abwesenheit) die gemeinsamen Daten neu holen, ohne die Seite neu aufzubauen
  function refreshShared(){ rpc('get_init').then(function(res){ if (!DATA) return; DATA.away = res.away || null; DATA.cal = res.cal || null; DATA.ev = res.ev || DATA.ev; DATA.ds = res.ds || null; DATA.cs = res.cs || null;
    if (!$('profileView').classList.contains('hide')) renderProfile(); if (!$('overviewView').classList.contains('hide')) renderOverview(); renderEv(); }).catch(function(){}); }
  /* ---------- Zeitzonen: Event-Zeiten gelten in deutscher Zeit, Spieler woanders sehen zusätzlich ihre Ortszeit ---------- */
  var TZ_REF = 'Europe/Berlin', TZ_WD = { mo:1, di:2, mi:3, 'do':4, fr:5, sa:6, so:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:0 };
  function tzParts(d, tz){ var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' }).formatToParts(d).forEach(function(x){ o[x.type] = x.value; }); return o; }
  function tzOff(d, tz){ var o = tzParts(d, tz); return Math.round((Date.UTC(+o.year, o.month - 1, +o.day, +o.hour % 24, +o.minute) - Math.floor(d.getTime() / 60000) * 60000) / 60000); }
  // „Fr 21:00“ (deutsche Zeit) → Zeitpunkt in dieser oder der nächsten Woche; null, wenn nicht lesbar
  function tzWhen(txt){
    var m = String(txt || '').trim().match(/^(?:([A-Za-zÄÖÜäöü]+)\.?,?\s*)?(\d{1,2})[:.](\d{2})/); if (!m) return null;
    var w = m[1] ? m[1].toLowerCase() : '', wd = w ? (TZ_WD.hasOwnProperty(w.slice(0, 3)) ? TZ_WD[w.slice(0, 3)] : TZ_WD.hasOwnProperty(w.slice(0, 2)) ? TZ_WD[w.slice(0, 2)] : undefined) : null; if (w && wd === undefined) return null;
    var now = new Date(), b = tzParts(now, TZ_REF), dows = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }, add = wd === null || wd === undefined ? 0 : (wd - dows[b.weekday] + 7) % 7;
    var wall = Date.UTC(+b.year, b.month - 1, +b.day + add, +m[2], +m[3]);
    return new Date(wall - tzOff(new Date(wall), TZ_REF) * 60000);
  }
  function tzDiff(d){ try { return !!d && tzOff(d, TZ_REF) !== -d.getTimezoneOffset(); } catch(e){ return false; } }
  function tzFmt(d, lang){ return d.toLocaleString(lang || LANG, { weekday: 'short', hour: '2-digit', minute: '2-digit' }); }
  // Text für die Anzeige: „(bei dir: …)“ nur, wenn der Spieler nicht in deutscher Zeit lebt
  function tzLocal(txt){ try { var d = tzWhen(txt); return tzDiff(d) ? (XTRA_I18N[LANG] || XTRA_I18N.en).tzYou.replace('{t}', tzFmt(d)) : ''; } catch(e){ return ''; } }

  /* ---------- Wüstensturm-Einsatz ---------- */
  function renderDs(){ renderPlan('ds'); renderPlan('cs'); if ($('evIntro')) evLabels(); }
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
    var tl = tzLocal(hit.T.time);
    $(kind + 'Meta').textContent = [hit.T.time ? hit.T.time + (tl ? ' (' + tl + ')' : '') : '', hit.T.opp ? L.vs + ' ' + hit.T.opp : ''].filter(Boolean).join(' · ');
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
    PLAN_HIT[kind] = hit;
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, pk = [P.at, hit.t, LANG, n].join('|'), pic = $(kind + 'Pic');
    $(kind + 'PicBtn').textContent = X.planShow;
    card.classList.remove('hide');
    // Bild direkt mit anzeigen (nur neu zeichnen, wenn sich Plan, Team, Sprache oder Name geändert haben)
    if (pic.dataset.k !== pk) { pic.innerHTML = ''; pic.dataset.k = pk; planPic(kind); }
  }
  /* ---------- Plan-Bild (gleiches Bild wie im Admin-Bereich, eigener Name gelb markiert) ---------- */
  var PLAN_HIT = {}, PB_WAIT = null;
  function planLib(cb){
    if (typeof dstDraw === 'function') return cb(true);
    if (PB_WAIT) { PB_WAIT.push(cb); return; }
    PB_WAIT = [cb]; var sc = document.createElement('script'); sc.src = 'js/plan-bild.js?v=4';
    function fin(ok){ var l = PB_WAIT; PB_WAIT = null; if (!ok) sc.remove(); l.forEach(function(f){ f(ok); }); }
    sc.onload = function(){ fin(typeof dstDraw === 'function'); }; sc.onerror = function(){ fin(false); };
    document.head.appendChild(sc);
  }
  function planPic(kind){
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, box = $(kind + 'Pic'), btn = $(kind + 'PicBtn'), hit = PLAN_HIT[kind];
    if (!hit) return;
    var lang = LANG === 'de' ? 'de' : 'en', me = $('name').value, key = box.dataset.k;
    btn.classList.add('hide'); box.innerHTML = ''; var ld = document.createElement('div'); ld.className = 'hint'; ld.textContent = X.planLoad; box.appendChild(ld);
    function done(url){
      if (box.dataset.k !== key) return;   // inzwischen anderer Plan
      if (!url) { btn.classList.remove('hide'); box.innerHTML = ''; var er = document.createElement('div'); er.className = 'hint'; er.textContent = X.planErr; box.appendChild(er); return; }
      box.innerHTML = '';
      var im = document.createElement('img'); im.src = url; im.alt = X.planShow; im.addEventListener('click', function(){ planBig(url); }); box.appendChild(im);
      var h = document.createElement('div'); h.className = 'hint'; h.textContent = X.planHint; box.appendChild(h);
      var name = 'SKWS-' + (kind === 'ds' ? 'Wuestensturm' : 'Schluchtsturm') + '-Team-' + hit.t + '.jpg', A = window.SKWSAndroid;
      if (A && A.saveImage) { var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = X.planSave; b.addEventListener('click', function(){ try { A.saveImage(name, url); } catch(e){} }); box.appendChild(b); }
      else if (!A) { var a = document.createElement('a'); a.className = 'mini'; a.download = name; a.href = url; a.textContent = X.planSave; box.appendChild(a); }
    }
    planLib(function(ok){
      if (!ok) return done(null);
      try {
        var wd = tzWhen(hit.T.time), loc = tzDiff(wd) ? (lang === 'de' ? 'Deine Ortszeit: ' : 'Your local time: ') + tzFmt(wd, lang === 'de' ? 'de-DE' : 'en-GB') : '';
        if (kind === 'ds') dstLoad(hit.t, function(){ try { done(DST_IMG ? dstDraw(hit.T, lang, me, loc) : null); } catch(e){ done(null); } });
        else csLoadTpl(hit.t, lang, function(im){ try { done(im ? csDraw(hit.T, hit.t, lang, im, me, loc) : null); } catch(e){ done(null); } });
      } catch(e){ done(null); }
    });
  }
  function planBig(url){
    var o = document.createElement('div'); o.className = 'plan-big';
    var im = document.createElement('img'); im.src = url; o.appendChild(im);
    var x = document.createElement('button'); x.type = 'button'; x.className = 'plan-x'; x.textContent = '✕'; o.appendChild(x);
    im.addEventListener('click', function(){ o.classList.toggle('zoom'); });
    x.addEventListener('click', function(){ o.remove(); });
    o.addEventListener('click', function(e){ if (e.target === o) o.remove(); });
    document.body.appendChild(o);
  }
  ['ds', 'cs'].forEach(function(k){ $(k + 'PicBtn').addEventListener('click', function(){ planPic(k); }); });

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
    renderAuth(); loadClaims();
    if (e && e.lang && DATA.i18n[e.lang] && !store('skws_lang_manual')) setLang(e.lang, false);
    showMeta(); setMsg('');
  }

  /* ---------- Anmeldung mit PIN (gemeinsam mit Funk) ---------- */
  function F_(){ return FUNK_I18N[LANG] || FUNK_I18N.en; }
  function authed(n){ var s = window.Funk && Funk.session(); return !!(s && n && s.name === n); }
  function tok(){ var s = window.Funk && Funk.session(); return s ? s.tok : null; }
  // Schnellzugang zum Admin-Bereich für R4/R5 – der Admin-Bereich nutzt dieselbe Anmeldung (Name + PIN)
  function adminLink(){
    var n = $('name').value, lead = !!(DATA && DATA.leaders && n && DATA.leaders.indexOf(n) >= 0);
    $('hdrAdmin').classList.toggle('hide', !lead); $('hdrAdmin').title = (XTRA_I18N[LANG] || XTRA_I18N.en).admin;
  }
  function renderAuth(){
    adminLink();
    var box = $('authBox'); if (!box || !window.Funk || !Funk.ready()) return;
    var n = $('name').value, F = F_(); box.innerHTML = '';
    // Wer angemeldet ist, ist kein neues Mitglied: „Ich bin neu“ ausblenden
    // Angemeldet: Namensauswahl wird nicht mehr gebraucht (Wechsel über „Abmelden“)
    var inn = !!(n && authed(n)), XI = XTRA_I18N[LANG] || XTRA_I18N.en;
    $('newWrap').classList.toggle('hide', inn);
    ['search', 'name', 'nameLbl'].forEach(function(id){ $(id).classList.toggle('hide', inn); });
    $('nameSaved').classList.toggle('hide', inn || !n);
    $('introTxt').textContent = inn ? XI.introIn : t('intro');
    if (!n) return;
    if (DATA.av && DATA.av[n]) { var big = avEl(n, 96); big.classList.add('zoom'); big.addEventListener('click', function(){ avBig(n); }); var wr = document.createElement('div'); wr.className = 'auth-av'; wr.appendChild(big); box.appendChild(wr); loadAvatars([n], renderAuth); }
    if (authed(n)) {
      var d = document.createElement('div'); d.className = 'fk-authok'; d.textContent = F.loggedIn.replace('{n}', n) + ' · ';
      var a = document.createElement('a'); a.href = '#'; a.className = 'fk-link'; a.textContent = F.notYou;
      a.addEventListener('click', function(e){ e.preventDefault(); Funk.logout(); }); d.appendChild(a); box.appendChild(d); return;
    }
    // nicht angemeldet: erst nur ein Knopf, das PIN-Feld öffnet sich beim Antippen (oder beim Speichern)
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, h = document.createElement('div'); h.className = 'hint'; h.textContent = X.viewOk; box.appendChild(h);
    var inner = document.createElement('div'); box.appendChild(inner);
    if (AUTH_OPEN === n) { Funk.authBox(inner, n, null); return; }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ghost auth-open'; b.textContent = X.pinBtn;
    b.addEventListener('click', function(){ AUTH_OPEN = n; renderAuth(); var i = $('authBox').querySelector('input[type=password]'); if (i) i.focus(); }); inner.appendChild(b);
  }
  var AUTH_OPEN = null;
  function openAuth(){ var n = $('name').value; if (!n || authed(n)) return; AUTH_OPEN = n; renderAuth(); $('authBox').scrollIntoView({ behavior:'smooth', block:'center' }); setTimeout(function(){ var i = $('authBox').querySelector('input[type=password]'); if (i) i.focus(); }, 300); }

  // Reiter „Events“: Beschriftung, Hinweis wenn nichts offen ist, Punkt bei offener Anmeldung ohne Antwort
  function evLabels(){
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, n = $('name').value, ev = DATA && DATA.ev || {};
    var open = n && ['ds','cs'].some(function(k){ var r = ev[k]; return r && r.open && !(r.signups && r.signups[n]); }) || (window.Umfragen && Umfragen.ready() && Umfragen.pending() > 0);
    $('tabEvents').textContent = X.evTab; if (open) { var d = document.createElement('span'); d.className = 'fk-badge'; d.textContent = '•'; $('tabEvents').appendChild(d); }
    $('evIntro').textContent = X.evIntro.replace('{tab}', t('form'));
    var any = ['calBox','pollBox','evCards','claimCards'].some(function(id){ return $(id).children.length; }) || !$('dsCard').classList.contains('hide') || !$('csCard').classList.contains('hide');
    $('evEmptyTxt').textContent = n ? X.evEmpty : X.evPick.replace('{tab}', t('form'));
    $('evEmpty').classList.toggle('hide', any);
  }
  function renderEv(){
    renderEvCards();
    if (window.Mehr && Mehr.ready()) Mehr.calCard($('calBox'));
    if (window.Umfragen && Umfragen.ready()) { var me = $('name').value; if (Umfragen.who() !== (me && authed(me) ? me : null)) Umfragen.load(); else Umfragen.render(); }
    evLabels();
  }
  function renderEvCards(){
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
      if (r.time_a && tzLocal(r.time_a) || r.time_b && tzLocal(r.time_b)) { var tzh = document.createElement('div'); tzh.className = 'hint'; tzh.style.marginTop = '0'; tzh.textContent = (XTRA_I18N[LANG] || XTRA_I18N.en).tzRef; card.appendChild(tzh); }
      if (!n) { var pn = document.createElement('div'); pn.className = 'hint'; pn.textContent = T.pickName; card.appendChild(pn); box.appendChild(card); return; }
      var note = document.createElement('input'); note.type = 'text'; note.maxLength = 120; note.placeholder = T.note; note.style.marginTop = '8px';
      var ok = authed(n);
      if (r.open && !ok) { var lf = document.createElement('div'); lf.className = 'hint fk-first'; lf.textContent = F_().loginFirst; lf.style.cursor = 'pointer'; lf.addEventListener('click', function(){ showTab('form'); openAuth(); }); card.appendChild(lf); }
      if (r.open && ok) card.appendChild(note);
      function lbl(c){ return c === 'no' ? T.no : (c.indexOf('sub') === 0 ? T.hE : T.hS) + ': ' + (/A$/.test(c) && c !== 'AB' && c !== 'sub' ? T.tA : /B$/.test(c) && c !== 'AB' && c !== 'sub' ? T.tB : T.AB); }
      [['hS', [['A', T.tA, r.time_a], ['B', T.tB, r.time_b], ['AB', T.AB, '']]], ['hE', [['subA', T.tA, r.time_a], ['subB', T.tB, r.time_b], ['sub', T.AB, '']]], ['', [['no', T.no, '']]]].forEach(function(grp){
        if (grp[0]) { var gh = document.createElement('div'); gh.className = 'hint'; gh.style.margin = '10px 0 0'; gh.style.fontWeight = '700'; gh.textContent = T[grp[0]]; card.appendChild(gh); }
        grp[1].forEach(function(o){
          var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'evopt' + (mine === o[0] ? ' on' : '');
          var tl = o[2] ? tzLocal(o[2]) : '';
          bt.textContent = (mine === o[0] ? '✓ ' : '') + o[1] + (o[2] ? ' (' + o[2] + (tl ? ' · ' + tl : '') + ')' : '');
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
    rpc('my_merits', { p_name: n, p_token: tok() }).then(function(r){ if (MER_FOR !== n) return; MER_DATA = Array.isArray(r) ? r : []; renderMerits(); renderWeek(); }).catch(function(){});
  }
  function renderMerits(){
    var card = $('merCard'); if (!MER_DATA.length || (PROF_VIEW && PROF_VIEW !== $('name').value)) { card.classList.add('hide'); return; }
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
      if (x.to && $(x.to)) { d.style.cursor = 'pointer'; d.addEventListener('click', function(){ neuGo('form:' + x.to); }); }
      l.appendChild(d); });
    card.classList.toggle('hide', !items.length);
  }

  /* ---------- Ruhmeshalle (nur Positives) ---------- */
  function renderHof(){
    var card = $('hofCard'); if (!PROF_STATS) { if (!PROF_BUSY) { PROF_BUSY = true; rpc('profile_stats').then(function(r){ PROF_STATS = r || {}; mergePub(); }).catch(function(){ PROF_STATS = {}; }).then(function(){ PROF_BUSY = false; renderHof(); }); } return; }
    var T = HOF_I18N[LANG] || HOF_I18N.en, S = PROF_STATS, names = Object.keys(S), box = $('hofBox'); box.innerHTML = '';
    $('hofTitle').textContent = T.hof;
    function top(f, min){ return names.map(function(n){ return { n: n, v: f(S[n] || {}) }; }).filter(function(x){ return x.v > (min || 0); }).sort(function(a, b){ return b.v - a.v || a.n.localeCompare(b.n); }).slice(0, 5); }
    var pm = names.slice().filter(function(n){ return (S[n].b30 || 0) > 0 || (S[n].g30 || 0) > 0; }).sort(function(a, b){ return (S[b].b30 || 0) - (S[a].b30 || 0) || (S[b].g30 || 0) - (S[a].g30 || 0); })[0];
    var lists = [[T.topBees, top(function(s){ return s.b || 0; }), function(v){ return '🐝 ' + v; }], [T.topGrowth, top(function(s){ return s.g30 || 0; }), function(v){ return '+' + String(v).replace('.', LANG === 'en' ? '.' : ',') + ' %'; }],
                 [T.topEvents, top(function(s){ return (s.pds || 0) + (s.pcs || 0); }), function(v){ return T.evN.replace('{n}', v); }]];
    if (!pm && !lists.some(function(l){ return l[1].length; })) { var no = document.createElement('div'); no.className = 'hint'; no.textContent = T.none; box.appendChild(no); card.classList.remove('hide'); return; }
    loadAvatars(names, function(){ renderHof(); });
    if (pm) { var p = document.createElement('div'); p.className = 'hof-potm'; p.appendChild(avEl(pm, 96)); var t = document.createElement('div');
      var k = document.createElement('div'); k.className = 'hint'; k.style.marginTop = '0'; k.textContent = '👑 ' + T.potm; t.appendChild(k);
      var b = document.createElement('b'); b.textContent = pm; t.appendChild(b);
      var w = document.createElement('div'); w.className = 'hint'; w.style.marginTop = '0'; w.textContent = (S[pm].b30 ? T.whyB.replace('{n}', S[pm].b30) : T.whyG.replace('{g}', S[pm].g30)); t.appendChild(w);
      p.appendChild(t); p.addEventListener('click', function(){ openProfile(pm); }); box.appendChild(p); }
    var g = document.createElement('div'); g.className = 'hof-grid';
    lists.forEach(function(l){ if (!l[1].length) return; var c = document.createElement('div'); var h = document.createElement('h4'); h.textContent = l[0]; c.appendChild(h);
      l[1].forEach(function(x, i){ var r = document.createElement('div'); r.className = 'hof-row'; r.appendChild(avEl(x.n, 44)); var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = (i + 1) + '. ' + x.n; r.appendChild(nm);
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
    $('nameSaved').classList.toggle('hide', !nm || authed(nm));
    $('adminBtn').classList.toggle('hide', !(nm && DATA && (DATA.leaders || []).indexOf(nm) >= 0) || !$('hdrAdmin').classList.contains('hide'));
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
    setMsg(''); clearBad();
  }

  // Fehler im Formular: Code fürs Logbuch, Text für den Spieler, Feld zum Hinspringen
  function fail(code, txt, field){ return { code: code, err: txt, f: typeof field === 'string' ? $(field) : field }; }
  function collect(){
    var name = NEW_MODE ? $('newName').value.trim().replace(/\s+/g, ' ') : $('name').value;
    if (NEW_MODE) {
      if (name.length < 2 || name.length > 40) return fail('NEWNAME', t('errNewName'), 'newName');
      var hit = DATA.members.filter(function(m){ return m.toLowerCase() === name.toLowerCase(); })[0];
      if (hit) return fail('EXISTS', t('errExists'), 'newName');
    }
    if (!name) return fail('NAME', t('errName'), 'name');
    var squads = [];
    for (var i = 0; i < DATA.squads; i++){
      var c = $('sq'+i), tsel = c.querySelector('.type'), pin_ = c.querySelector('.pow'), type = tsel.value, p = parsePow(pin_.value);
      if (p !== null && isNaN(p)) return fail('POWER:T' + (i+1), t('errPower'), pin_);
      if (i < REQ_SQUADS && (!type || p === null)) return fail('TREQ:T' + (i+1), t('errTreq', {n: i+1}), type ? pin_ : tsel);
      if (!!type !== (p !== null)) return fail('SQUAD:T' + (i+1), t('errSquad', {n: i+1}), type ? pin_ : tsel);
      squads.push({ type: type, power: p === null ? null : (p >= 10000 ? Math.round(p / 1e4) / 100 : p) });
    }
    var hero = parsePow($('hero').value);
    if (hero === null || isNaN(hero)) return fail('HERO', t('errHero'), 'hero');
    if (hero >= 10000) hero = Math.round(hero / 1e4) / 100;
    var stxt = $('gstage').value.trim(), gst = /^\d{1,2}$/.test(stxt) ? parseInt(stxt, 10) : NaN;
    if (!(gst >= 1 && gst <= 30)) return fail('GSTAGE', t('errGstage'), 'gstage');
    var gtxt = $('gorilla').value.trim(), gor = /^\d{1,3}$/.test(gtxt) ? parseInt(gtxt, 10) : NaN;
    if (!(gor >= 1)) return fail('GORILLA', t('errGorilla'), 'gorilla');
    var gpw = parsePow($('gpower').value);
    if (gpw === null || isNaN(gpw)) return fail('GPOWER', t('errGpower'), 'gpower');
    gpw = Math.round(gpw < 10000 ? gpw * 1e6 : gpw);
    if (gpw > 1e9) return fail('GPOWER', t('errGpower'), 'gpower');
    var email = $('email').value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('EMAIL', t('errEmail'), 'email');
    var ex = NEW_MODE ? null : DATA.entries[name];
    if (!email && !(ex && ex.hasEmail)) return fail('EMAIL_REQ', t('errEmailReq'), 'email');
    var pin = null;
    if (NEW_MODE) { pin = $('newPin').value; if (pin.length < 4 || pin.length > 32) return fail('PINLEN', F_().err.ERR_PINLEN, 'newPin'); if (pin !== $('newPin2').value) return fail('PIN_MISMATCH', F_().pinMismatch, 'newPin2'); }
    else if (!authed(name)) return fail('LOGIN', F_().loginFirst, null);
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

  // Server-Fehler → Feld, zu dem der Spieler springen soll
  function errField(m){
    m = String(m || '');
    var sq = m.match(/ERR_(?:SQUAD|TREQ):(\d)/);
    if (sq) { var c = $('sq' + (sq[1] - 1)); return c ? (c.querySelector('.type').value ? c.querySelector('.pow') : c.querySelector('.type')) : null; }
    var map = [['ERR_NEWNAME','newName'], ['ERR_EXISTS','newName'], ['ERR_HERO','hero'], ['ERR_GORILLA','gorilla'], ['ERR_GSTAGE','gstage'], ['ERR_GPOWER','gpower'],
               ['ERR_T1', null], ['ERR_PINLEN','newPin'], ['ERR_PIN','newPin'], ['ERR_EMAIL','email'], ['ERR_POWER', null]];
    for (var i = 0; i < map.length; i++) if (m.indexOf(map[i][0]) >= 0) return map[i][1] ? $(map[i][1]) : null;
    return null;
  }
  // Feld rot markieren, Hinweis direkt darunter, hinscrollen; verschwindet beim Tippen
  function clearBad(){
    var b = document.querySelectorAll('.bad'); for (var i = 0; i < b.length; i++) b[i].classList.remove('bad');
    var n = document.querySelectorAll('.field-err'); for (var j = 0; j < n.length; j++) n[j].remove();
  }
  function markBad(el, txt){
    clearBad();
    if (!el || el.offsetParent === null) { var m = $('msg'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    el.classList.add('bad');
    var note = document.createElement('div'); note.className = 'field-err'; note.textContent = '⚠️ ' + txt;
    var anchor = el.closest('.row') || el;
    anchor.parentNode.insertBefore(note, anchor.nextSibling);
    var off = function(){ el.classList.remove('bad'); if (note.parentNode) note.remove(); el.removeEventListener('input', off); el.removeEventListener('change', off); };
    el.addEventListener('input', off); el.addEventListener('change', off);
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(e){ el.scrollIntoView(); }
    setTimeout(function(){ try { el.focus({ preventScroll: true }); } catch(e){ el.focus(); } }, 350);
  }
  /* ---------- Fehlerprotokoll ----------
     Jeder Fehlversuch bekommt eine Nr. (z. B. F-7K3Q). Der Spieler sieht sie unter der Meldung und kann einen
     Fehlerbericht kopieren; dieselbe Nr. steht im Admin-Logbuch (log_form_fail), so lässt sich beides zuordnen. */
  var ERRLOG_I18N = {
    de: { nr:'Fehler-Nr.', copy:'📋 Fehlerbericht kopieren', copied:'Kopiert – schick ihn R4/R5 im Allianz-Chat.', copyFail:'Kopieren ging nicht – bitte den Text unten markieren und kopieren.', show:'Fehlerprotokoll ({n})', hide:'Fehlerprotokoll ausblenden', clear:'Liste leeren', copyAll:'📋 Alles kopieren', hint:'R4/R5 sehen diese Fehler ebenfalls. Wenn du nicht weiterkommst, schick ihnen den Bericht.', title:'SKWS Fehlerbericht', time:'Zeit', name:'Name', act:'Aktion', actNew:'Neu eintragen', actSave:'Speichern', err:'Fehler', dev:'Gerät', none:'–' },
    en: { nr:'Error no.', copy:'📋 Copy error report', copied:'Copied – send it to R4/R5 in the alliance chat.', copyFail:'Copying didn’t work – please select the text below and copy it.', show:'Error log ({n})', hide:'Hide error log', clear:'Clear list', copyAll:'📋 Copy all', hint:'R4/R5 see these errors too. If you’re stuck, send them the report.', title:'SKWS error report', time:'Time', name:'Name', act:'Action', actNew:'Register as new', actSave:'Save', err:'Error', dev:'Device', none:'–' },
    fr: { nr:'Erreur n°', copy:'📋 Copier le rapport d’erreur', copied:'Copié – envoie-le aux R4/R5 dans le chat d’alliance.', copyFail:'La copie n’a pas marché – sélectionne le texte ci-dessous et copie-le.', show:'Journal des erreurs ({n})', hide:'Masquer le journal', clear:'Vider la liste', copyAll:'📋 Tout copier', hint:'Les R4/R5 voient aussi ces erreurs. Si tu es bloqué, envoie-leur le rapport.', title:'Rapport d’erreur SKWS', time:'Heure', name:'Nom', act:'Action', actNew:'Nouvelle inscription', actSave:'Enregistrer', err:'Erreur', dev:'Appareil', none:'–' },
    es: { nr:'Error n.º', copy:'📋 Copiar informe de error', copied:'Copiado – envíalo a R4/R5 en el chat de la alianza.', copyFail:'No se pudo copiar – selecciona el texto de abajo y cópialo.', show:'Registro de errores ({n})', hide:'Ocultar registro', clear:'Vaciar lista', copyAll:'📋 Copiar todo', hint:'R4/R5 también ven estos errores. Si no avanzas, envíales el informe.', title:'Informe de error SKWS', time:'Hora', name:'Nombre', act:'Acción', actNew:'Registro nuevo', actSave:'Guardar', err:'Error', dev:'Dispositivo', none:'–' },
    pt: { nr:'Erro n.º', copy:'📋 Copiar relatório de erro', copied:'Copiado – envie para R4/R5 no chat da aliança.', copyFail:'Não foi possível copiar – selecione o texto abaixo e copie.', show:'Registro de erros ({n})', hide:'Ocultar registro', clear:'Limpar lista', copyAll:'📋 Copiar tudo', hint:'R4/R5 também veem esses erros. Se travar, envie o relatório para eles.', title:'Relatório de erro SKWS', time:'Hora', name:'Nome', act:'Ação', actNew:'Novo cadastro', actSave:'Salvar', err:'Erro', dev:'Dispositivo', none:'–' },
    it: { nr:'Errore n.', copy:'📋 Copia segnalazione errore', copied:'Copiato – mandalo a R4/R5 nella chat dell’alleanza.', copyFail:'Copia non riuscita – seleziona il testo qui sotto e copialo.', show:'Registro errori ({n})', hide:'Nascondi registro', clear:'Svuota elenco', copyAll:'📋 Copia tutto', hint:'Anche R4/R5 vedono questi errori. Se sei bloccato, manda loro la segnalazione.', title:'Segnalazione errore SKWS', time:'Ora', name:'Nome', act:'Azione', actNew:'Nuova iscrizione', actSave:'Salva', err:'Errore', dev:'Dispositivo', none:'–' },
    tr: { nr:'Hata no', copy:'📋 Hata raporunu kopyala', copied:'Kopyalandı – ittifak sohbetinde R4/R5’e gönder.', copyFail:'Kopyalanamadı – lütfen aşağıdaki metni seçip kopyala.', show:'Hata kaydı ({n})', hide:'Hata kaydını gizle', clear:'Listeyi temizle', copyAll:'📋 Tümünü kopyala', hint:'R4/R5 de bu hataları görür. Takılırsan raporu onlara gönder.', title:'SKWS hata raporu', time:'Zaman', name:'Ad', act:'İşlem', actNew:'Yeni kayıt', actSave:'Kaydet', err:'Hata', dev:'Cihaz', none:'–' },
    ru: { nr:'Ошибка №', copy:'📋 Скопировать отчёт об ошибке', copied:'Скопировано – отправь его R4/R5 в чат альянса.', copyFail:'Не удалось скопировать – выдели текст ниже и скопируй его.', show:'Журнал ошибок ({n})', hide:'Скрыть журнал', clear:'Очистить список', copyAll:'📋 Скопировать всё', hint:'R4/R5 тоже видят эти ошибки. Если не получается, отправь им отчёт.', title:'Отчёт об ошибке SKWS', time:'Время', name:'Имя', act:'Действие', actNew:'Новая регистрация', actSave:'Сохранение', err:'Ошибка', dev:'Устройство', none:'–' },
    pl: { nr:'Błąd nr', copy:'📋 Kopiuj raport błędu', copied:'Skopiowano – wyślij go R4/R5 na czacie sojuszu.', copyFail:'Kopiowanie nie zadziałało – zaznacz tekst poniżej i skopiuj go.', show:'Dziennik błędów ({n})', hide:'Ukryj dziennik', clear:'Wyczyść listę', copyAll:'📋 Kopiuj wszystko', hint:'R4/R5 też widzą te błędy. Jeśli utkniesz, wyślij im raport.', title:'Raport błędu SKWS', time:'Czas', name:'Imię', act:'Akcja', actNew:'Nowa rejestracja', actSave:'Zapis', err:'Błąd', dev:'Urządzenie', none:'–' }
  };
  function EL(){ return ERRLOG_I18N[LANG] || ERRLOG_I18N.en; }
  var ERRLOG_KEY = 'skws_errlog', ERRLOG_MAX = 20, errOpen = false;
  function errLoad(){ try { var a = JSON.parse(store(ERRLOG_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
  function errSaveList(a){ try { store(ERRLOG_KEY, JSON.stringify(a.slice(-ERRLOG_MAX))); } catch(e){} }
  function errRef(){
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'F-', b = null;
    try { b = crypto.getRandomValues(new Uint8Array(5)); } catch(e){}
    for (var i = 0; i < 5; i++) s += abc.charAt((b ? b[i] : Math.floor(Math.random() * 256)) % abc.length);
    return s;
  }
  // kurze Geräteangabe ohne persönliche Daten, z. B. „Android 10 · Chrome 157“
  function devInfo(){
    var u = navigator.userAgent || '', os = /Android ([\d.]+)/.exec(u) ? 'Android ' + /Android ([\d.]+)/.exec(u)[1] : /iPhone|iPad/.test(u) ? 'iOS' : /Windows/.test(u) ? 'Windows' : /Mac OS X/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : '?';
    var br = /Edg\/(\d+)/.exec(u) ? 'Edge ' + /Edg\/(\d+)/.exec(u)[1] : /OPR\/(\d+)/.exec(u) ? 'Opera ' + /OPR\/(\d+)/.exec(u)[1] : /Firefox\/(\d+)/.exec(u) ? 'Firefox ' + /Firefox\/(\d+)/.exec(u)[1]
           : /Chrome\/(\d+)/.exec(u) ? 'Chrome ' + /Chrome\/(\d+)/.exec(u)[1] : /Version\/(\d+).*Safari/.exec(u) ? 'Safari ' + /Version\/(\d+).*Safari/.exec(u)[1] : '';
    return (window.SKWSAndroid ? 'App · ' : '') + os + (br ? ' · ' + br : '');
  }
  function errReport(list){
    var L = EL();
    return list.map(function(x){
      var d = new Date(x.at), tz = -d.getTimezoneOffset() / 60;
      return [L.title, L.nr + ' ' + x.ref,
        L.time + ': ' + d.toLocaleString(LANG, { dateStyle: 'short', timeStyle: 'short' }) + ' (UTC' + (tz >= 0 ? '+' : '') + tz + ')',
        L.name + ': ' + (x.name || L.none), L.act + ': ' + (x.isNew ? L.actNew : L.actSave),
        L.err + ': ' + x.code + ' – ' + x.text, L.dev + ': ' + x.dev + ' · ' + x.lang].join('\n');
    }).join('\n\n');
  }
  function copyText(txt, done){
    function fallback(){
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch(e){} ta.remove(); done(ok);
    }
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(function(){ done(true); }, fallback); return; } } catch(e){}
    fallback();
  }
  // Kasten unter der Meldung: letzte Fehler-Nr., Kopieren, aufklappbares Protokoll
  function errRender(highlight){
    var box = $('errBox'), list = errLoad(), L = EL();
    if (!box) { box = document.createElement('div'); box.id = 'errBox'; box.className = 'errbox'; var m = $('msg'); m.parentNode.insertBefore(box, m.nextSibling); }
    if (!list.length) { box.innerHTML = ''; box.classList.add('hide'); return; }
    box.classList.remove('hide'); box.innerHTML = '';
    var last = list[list.length - 1];
    if (highlight) {
      var top = document.createElement('div'); top.className = 'errbox-top';
      var nr = document.createElement('span'); nr.className = 'errbox-nr'; nr.textContent = L.nr + ' ' + last.ref;
      var cp = document.createElement('button'); cp.type = 'button'; cp.className = 'linkbtn'; cp.textContent = L.copy;
      cp.addEventListener('click', function(){ copyText(errReport([last]), function(ok){ stat.textContent = ok ? L.copied : L.copyFail; stat.className = 'errbox-stat ' + (ok ? 'ok' : 'err'); if (!ok) { errOpen = true; errRender(true); } }); });
      top.appendChild(nr); top.appendChild(cp); box.appendChild(top);
      var stat = document.createElement('div'); stat.className = 'errbox-stat'; box.appendChild(stat);
    }
    var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'linkbtn errbox-tg'; tg.textContent = errOpen ? L.hide : L.show.replace('{n}', list.length);
    tg.addEventListener('click', function(){ errOpen = !errOpen; errRender(highlight); });
    box.appendChild(tg);
    if (errOpen) {
      var hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = L.hint; box.appendChild(hint);
      var ta = document.createElement('textarea'); ta.className = 'errbox-ta'; ta.readOnly = true; ta.rows = Math.min(14, list.length * 8); ta.value = errReport(list.slice().reverse());
      ta.addEventListener('focus', function(){ ta.select(); }); box.appendChild(ta);
      var row = document.createElement('div'); row.className = 'errbox-row';
      var all = document.createElement('button'); all.type = 'button'; all.className = 'linkbtn'; all.textContent = L.copyAll;
      var st2 = document.createElement('span'); st2.className = 'errbox-stat';
      all.addEventListener('click', function(){ copyText(ta.value, function(ok){ st2.textContent = ok ? L.copied : L.copyFail; st2.className = 'errbox-stat ' + (ok ? 'ok' : 'err'); if (!ok) { ta.focus(); ta.select(); } }); });
      var clr = document.createElement('button'); clr.type = 'button'; clr.className = 'linkbtn'; clr.textContent = L.clear;
      clr.addEventListener('click', function(){ errSaveList([]); errOpen = false; errRender(false); });
      row.appendChild(all); row.appendChild(clr); box.appendChild(row); box.appendChild(st2);
    }
  }
  // Fehlversuch merken (Gerät) und fürs Logbuch melden (fire-and-forget, Fehler hier nie anzeigen)
  function logFail(code, name, isNew, text){
    code = String(code || 'UNKNOWN').slice(0, 30);
    var x = { ref: errRef(), at: new Date().toISOString(), code: code, text: String(text || ''), name: name || '', isNew: !!isNew, lang: LANG, dev: devInfo() };
    var list = errLoad(); list.push(x); errSaveList(list); errRender(true);
    try {
      rpc('log_form_fail', { p_name: name || null, p_code: code, p_new: !!isNew, p_lang: LANG, p_app: !!window.SKWSAndroid, p_ref: x.ref, p_dev: x.dev.replace(/ · /g, ' / ').slice(0, 60) }).catch(function(){});
    } catch(e){}
  }
  function formName(){ return NEW_MODE ? $('newName').value.trim().replace(/\s+/g, ' ') : $('name').value; }

  function save(){
    if (busy) return;
    if (!NEW_MODE && $('name').value && !authed($('name').value)) { openAuth(); setMsg(F_().loginFirst, 'err'); return; }
    var r = collect();
    if (r.err) { setMsg(r.err, 'err'); markBad(r.f, r.err); logFail(r.code, formName(), NEW_MODE, r.err); return; }
    clearBad(); errRender(false);
    // Heldenkraft wirkt zu klein (z. B. 6,1 statt 106,1 Mio.) → einmal nachfragen
    var t1p = r.data.squads[0] && r.data.squads[0].power;
    if (r.data.hero && r.data.hero < 20 && t1p && t1p > 15) { var XH = XTRA_I18N[LANG] || XTRA_I18N.en; if (!confirm(XH.heroLow.replace('{v}', fmtPow(r.data.hero)))) { $('hero').focus(); return; } }
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
      .catch(function(err){
        done(); var em = String(err && err.message || '');
        if (em.indexOf('ERR_LOGIN') >= 0 && authed(r.data.name)) Funk.expired();
        var txt = errText(em); setMsg(txt, 'err'); markBad(errField(em), txt);
        var code = (em.match(/ERR_[A-Z_0-9:]+/) || [''])[0].replace(/^ERR_/, 'SRV_') || 'SRV_' + (/fetch|network|Failed/i.test(em) ? 'NETWORK' : 'UNKNOWN');
        logFail(code, r.data.name, isNew, txt);
      });
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
    rows.forEach(function(r, i){ r.rank = i + 1; });
    var XT = XTRA_I18N[LANG] || XTRA_I18N.en, q = ($('ovSearch').value || '').trim().toLowerCase();
    $('ovSearch').placeholder = XT.search;
    if (q) { rows = rows.filter(function(r){ return r.name.toLowerCase().indexOf(q) >= 0; }); missing = missing.filter(function(n){ return n.toLowerCase().indexOf(q) >= 0; }); }
    var x = members.length - missing.length, y = members.length;
    $('statTxt').textContent = t('submitted', {x: x, y: y});
    $('ovHint').textContent = (AV_I18N[LANG] || AV_I18N.en).tapName;
    if (!renderOverview.busy) { renderHof(); if (window.Mehr && Mehr.ready()) Mehr.vsOverview($('vsBox')); }
    $('statBar').style.width = (y ? Math.round(x / y * 100) : 0) + '%';

    var tb = $('ovBody'); tb.innerHTML = '';
    loadAvatars(members, function(){ if (!$('overviewView').classList.contains('hide') && !renderOverview.busy) { renderOverview.busy = true; renderOverview(); renderOverview.busy = false; } });
    rows.forEach(function(r, i){
      var tr = document.createElement('tr');
      var td0 = document.createElement('td'); td0.textContent = r.rank; td0.className = 'typ';
      var td1 = document.createElement('td'), nm = document.createElement('div'); nm.className = 'ovname'; nm.appendChild(avEl(r.name, 44));
      var col = document.createElement('div'); col.className = 'ovcol'; nm.appendChild(col);
      var ns = document.createElement('span'); ns.className = 'ovn'; ns.textContent = r.name + (DATA.away && DATA.away[r.name] && DATA.away[r.name][0].from <= new Date().toISOString().slice(0, 10) ? ' 🏖️' : ''); col.appendChild(ns); td1.appendChild(nm);
      nm.addEventListener('click', (function(x){ return function(){ openProfile(x); }; })(r.name));
      if (r.hero || r.gorilla) {
        var hs = document.createElement('div'); hs.className = 'typ';
        var g = [r.gstage ? '★' + r.gstage : '', r.gorilla ? 'Lv ' + r.gorilla : '', r.gpower ? fmtPow(Math.round(r.gpower / 1e4) / 100) : ''].filter(Boolean).join(' ');
        hs.textContent = [r.hero ? t('heroShort') + ' ' + fmtPow(r.hero) : '', g ? '🦍 ' + g : ''].filter(Boolean).join(' · ');
        col.appendChild(hs);
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

    if (q && !rows.length) { var nr = document.createElement('tr'), nd = document.createElement('td'); nd.colSpan = 4; nd.className = 'typ'; nd.textContent = XT.noHit; nr.appendChild(nd); tb.appendChild(nr); }
    $('missingCard').classList.toggle('hide', !missing.length);
    var ml = $('missingList'); ml.innerHTML = '';
    missing.sort(function(a,b){ return a.localeCompare(b, undefined, {sensitivity:'base'}); }).forEach(function(n){
      var s = document.createElement('span'); s.textContent = n; ml.appendChild(s);
    });
  }

  // Sprungziel aus „Neu für dich“ / „Diese Woche“: 'funk', 'profile' oder 'form:<Karten-ID>' (der Reiter ergibt sich aus der Karte)
  var VIEW_TAB = { formView:'form', eventsView:'events', profileView:'profile', overviewView:'overview', funkView:'funk' };
  function neuGo(to){
    if (to === 'funk') { showTab('funk'); return; }
    if (to === 'profile') { PROF_VIEW = null; showTab('profile'); window.scrollTo(0, 0); return; }
    var id = to.split(':')[1], el0 = $(id), sec = el0 && el0.closest('section');
    if (id === 'merCard') PROF_VIEW = null;
    showTab(sec && VIEW_TAB[sec.id] || 'form');
    setTimeout(function(){ var x = $(id); if (x && !x.classList.contains('hide')) { if (window.Klapp) Array.prototype.forEach.call(x.classList.contains('card') ? [x] : x.querySelectorAll('.card.zu'), function(c){ Klapp.open(c); }); x.scrollIntoView({ behavior:'smooth', block:'start' }); } }, 50);
  }
  function showTab(which){
    $('tabForm').classList.toggle('on', which === 'form');
    $('tabEvents').classList.toggle('on', which === 'events');
    $('eventsView').classList.toggle('hide', which !== 'events');
    $('tabOverview').classList.toggle('on', which === 'overview');
    $('tabProfile').classList.toggle('on', which === 'profile');
    $('formView').classList.toggle('hide', which !== 'form');
    $('overviewView').classList.toggle('hide', which !== 'overview');
    $('profileView').classList.toggle('hide', which !== 'profile');
    $('tabFunk').classList.toggle('on', which === 'funk');
    $('funkView').classList.toggle('hide', which !== 'funk');
    if (which === 'overview') renderOverview();   // frisch zeichnen (z. B. inzwischen geladene Profilbilder)
    if (which === 'profile') loadProfile(); else if (window.Stil && Stil.ready()) Stil.clearBg();
    if (which === 'funk') { Funk.show(); if (window.Mehr && Mehr.ready()) Mehr.renderHelp(); }
  }

  /* ---------- Avatare ---------- */
  var AV = {}, AV_LOADING = {};
  (function(){ try { var c = JSON.parse(localStorage.getItem('skws_av') || '{}'); Object.keys(c).forEach(function(n){ AV[n] = c[n]; }); } catch(e){} })();
  function avStore(){ try { localStorage.setItem('skws_av', JSON.stringify(AV)); } catch(e){} }
  // Bilder für die Namen laden, die einen neueren Stand haben als im Zwischenspeicher
  var AV_WAIT = [];
  function loadAvatars(names, cb){
    var ver = (DATA && DATA.av) || {}, need = names.filter(function(n){ return ver[n] && (!AV[n] || AV[n].v !== ver[n]) && !AV_LOADING[n]; });
    Object.keys(AV).forEach(function(n){ if (!ver[n]) delete AV[n]; });
    // Bilder, die gerade schon von einem anderen Aufruf geladen werden: danach trotzdem neu zeichnen
    if (cb && names.some(function(n){ return AV_LOADING[n]; })) AV_WAIT.push(cb);
    if (!need.length) return;
    need.forEach(function(n){ AV_LOADING[n] = 1; });
    var chunks = []; for (var i = 0; i < need.length; i += 100) chunks.push(need.slice(i, i + 100));
    Promise.all(chunks.map(function(c){ return rpc('get_avatars', { p_names: c }).then(function(r){ Object.keys(r || {}).forEach(function(n){ AV[n] = r[n]; }); }); }))
      .catch(function(){}).then(function(){ need.forEach(function(n){ delete AV_LOADING[n]; }); avStore(); var w = AV_WAIT; AV_WAIT = []; if (cb) cb(); w.forEach(function(f){ if (f !== cb) try { f(); } catch(e){} }); });
  }
  function avEl(name, size){
    var d = document.createElement('span'); d.className = 'av'; d.style.width = d.style.height = size + 'px'; d.style.fontSize = Math.round(size * .45) + 'px';
    var a = AV[name] && (DATA && DATA.av && DATA.av[name]) ? AV[name].d : null, fr = window.Stil && Stil.ready() ? Stil.frameOf(name) : ''; if (fr) d.classList.add('fr-s', 'fr-' + fr);
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
  /* ---------- Geschenke ---------- */
  var PROF_GIFT = {}, GIFT_PICK = null, GIFT_MSG = '', PROF_BADGE = {}, PROF_PLQ = {};
  var BADGE_IC = { ds:'🏜️', cs:'🧪' };
  // Interne Notizen (nur Mentoren der Gruppe und R4/R5, nach Anmeldung)
  var PROF_NOTES = {};
  function notesCard(n){
    var s = window.Funk && Funk.session(); if (!s) return null;
    var key = s.name + '|' + n;
    if (PROF_NOTES[key] === undefined) { PROF_NOTES[key] = null; rpc('notes_for', { p_token: s.tok, p_name: n }).then(function(r){ PROF_NOTES[key] = r && r.ok ? r : false; if (PROF_NOTES[key] && PROF_NOTES[key].allowed) renderProfile(); }).catch(function(){ PROF_NOTES[key] = false; }); return null; }
    var r = PROF_NOTES[key]; if (!r || !r.allowed) return null;
    // eigenes Profil: nur die für den Spieler freigegebenen Notizen, ohne Karte, wenn es keine gibt
    var self = s.name === n, items = self ? (r.self ? (r.items || []).filter(function(x){ return x.vis === 'player'; }) : []) : (r.items || []);
    if (self && !items.length) return null;
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, c = document.createElement('div'); c.className = 'card notes-card';
    function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; }
    c.appendChild(el('div', 'sq-h')).appendChild(el('b', '', self ? X.nSelf : X.nTitle)); c.appendChild(el('div', 'hint', self ? X.nSelfHint : X.nHint));
    if (!items.length) c.appendChild(el('div', 'hint', X.nNone));
    items.forEach(function(x){ var it = el('div', 'gift-row'); var t = el('div', 'gift-tx'); t.appendChild(el('div', 'fk-body', x.body));
      t.appendChild(el('span', '', new Date(x.t).toLocaleDateString(LANG) + (x.by ? ' · ' + x.by : '') + (!self && x.vis === 'player' ? ' · ' + X.nPl : ''))); it.appendChild(t); c.appendChild(it); });
    return c;
  }
  // Plaketten: Jahrgang, Saison, Treue, Stufen je Event (mit Seltenheit), längste Serie
  var TIER_N = [5, 10, 25, 50], TIER_IC = ['🥉','🥈','🥇','💎'], LOYAL_M = [1, 3, 6, 12, 24, 36];
  function plaques(n, c, el, X, l){
    var P = PROF_PLQ[n] || {}, m = P.member, items = [];
    if (m && m.years) m.years.forEach(function(y){ items.push({ ic:'📅', t: X.year.replace('{y}', y), cls:'py' }); });
    if (m && m.seasons) m.seasons.forEach(function(s){ items.push({ ic: s.icon || '🎄', t: s.label, cls:'ps' }); });
    if (m && m.from) {
      var mon = Math.floor((new Date(m.to) - new Date(m.from)) / (30.44 * 86400000)), hit = 0, nx = null;
      LOYAL_M.forEach(function(x){ if (mon >= x) hit = x; else if (nx === null) nx = x; });
      if (hit) items.push({ ic:'🏅', t: X.loyal + ' · ' + (hit >= 12 ? (hit === 12 ? X.yr1 : X.yrs.replace('{n}', hit / 12)) : X.mon.replace('{n}', hit)), sub: nx ? X.nextT.replace('{n}', nx >= 12 ? (nx === 12 ? X.yr1 : X.yrs.replace('{n}', nx / 12)) : X.mon.replace('{n}', nx)) : '', cls:'pl' });
    }
    ['ds','cs'].forEach(function(k){
      var cnt = l.filter(function(b){ return b.k === k; }).length, t = -1; TIER_N.forEach(function(x, i){ if (cnt >= x) t = i; });
      var S = PROF_STATS || {}, all = Object.keys(S), key = k === 'ds' ? 'pds' : 'pcs';
      if (t >= 0) { var have = all.filter(function(x){ return (S[x][key] || 0) >= TIER_N[t]; }).length;
        items.push({ ic: TIER_IC[t], t: X[k] + ' · ' + X.tiers[t] + ' (' + cnt + '×)', sub: (all.length ? X.rare.replace('{p}', Math.max(1, Math.round(have / all.length * 100))) : '') + (TIER_N[t + 1] ? ' · ' + X.nextT.replace('{n}', TIER_N[t + 1] + '×') : ''), cls:'pt' + t }); }
      else if (cnt) items.push({ ic:'▫️', t: X[k] + ' · ' + cnt + '/' + TIER_N[0], sub: X.nextT.replace('{n}', TIER_N[0] + '×') + ': ' + X.tiers[0], cls:'pn' });
      var st = (P.streak || {})[k] || 0; if (st >= 2) items.push({ ic:'🔥', t: X[k] + ' · ' + X.streak.replace('{n}', st), cls:'pf' });
    });
    if (!items.length) return;
    c.appendChild(el('label', 'l', X.plTitle));
    var g = el('div', 'plq-grid');
    items.forEach(function(x){ var d = el('div', 'plq ' + x.cls); d.appendChild(el('i', '', x.ic)); var t = el('div'); t.appendChild(el('b', '', x.t)); if (x.sub) t.appendChild(el('small', '', x.sub)); d.appendChild(t); g.appendChild(d); });
    c.appendChild(g);
    if (l.length) c.appendChild(el('label', 'l', X.bTitle));
  }
  // Selbstmeldung „Ich war dabei“ (nach Anmeldung, auf der Eintragen-Seite)
  var CLAIMS = null;
  function loadClaims(){
    var s = window.Funk && Funk.session(); if (!s || s.name !== $('name').value) { CLAIMS = null; renderClaims(); return; }
    rpc('claim_list', { p_token: s.tok }).then(function(r){ CLAIMS = r && r.ok ? r.items : null; renderClaims(); }).catch(function(){ CLAIMS = null; renderClaims(); });
  }
  function renderClaims(){ renderClaimCards(); evLabels(); }
  function renderClaimCards(){
    var box = $('claimCards'); if (!box) return; box.innerHTML = '';
    if (!CLAIMS || !CLAIMS.length) return;
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, s = Funk.session(), c = document.createElement('div'); c.className = 'card';
    var h = document.createElement('div'); h.className = 'sq-h'; var b = document.createElement('b'); b.textContent = X.claimT; h.appendChild(b); c.appendChild(h);
    CLAIMS.forEach(function(e){
      var r = document.createElement('div'); r.className = 'claim-row';
      var i = document.createElement('i'); i.textContent = e.icon || '🎖️'; r.appendChild(i);
      var t = document.createElement('b'); t.textContent = e.label; r.appendChild(t);
      if (e.status) { var st = document.createElement('span'); st.className = 'claim-st ' + e.status; st.textContent = e.status === 'ok' ? X.claimOk : e.status === 'no' ? X.claimNo : X.claimP; r.appendChild(st); }
      else if (e.open) { var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn claim-btn'; bt.textContent = '✋ ' + X.claimB;
        bt.addEventListener('click', function(){ bt.disabled = true; rpc('claim_send', { p_token: s.tok, p_event: e.id }).then(loadClaims).catch(function(){ bt.disabled = false; }); }); r.appendChild(bt); }
      c.appendChild(r);
    });
    box.appendChild(c);
  }
  // Teilnehmermarken: automatisch je Wüstensturm/Schluchtsturm als Stammspieler, dazu eigene Marken von R4/R5
  function badgeCard(n){
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, l = PROF_BADGE[n] || [], c = document.createElement('div'); c.className = 'card';
    function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; }
    var hd = el('div', 'sq-h'); hd.appendChild(el('b', '', '🎖️ ' + X.awards)); hd.appendChild(el('span', 'tag', String(l.length))); c.appendChild(hd);
    plaques(n, c, el, X, l);
    if (!l.length) { c.appendChild(el('div', 'hint', X.bNone)); return c; }
    var cnt = {}; l.forEach(function(b){ var k = b.k === 'x' ? 'x:' + (b.icon || '🎖️') + (b.label || '') : b.k; cnt[k] = cnt[k] || { n:0, b:b }; cnt[k].n++; });
    var shelf = el('div', 'gift-shelf');
    Object.keys(cnt).forEach(function(k){ var o = cnt[k], s = el('span', 'gift-chip badge-chip');
      s.appendChild(el('i', '', o.b.k === 'x' ? (o.b.icon || '🎖️') : BADGE_IC[o.b.k])); s.appendChild(el('b', '', (o.b.k === 'x' ? o.b.label : X[o.b.k]) + ' × ' + o.n)); shelf.appendChild(s); });
    c.appendChild(shelf);
    var grid = el('div', 'badge-grid');
    l.slice(0, 24).forEach(function(b){
      var m = el('div', 'badge-m ' + (b.k === 'x' ? 'bx' : 'b' + b.k)); m.appendChild(el('i', '', b.k === 'x' ? (b.icon || '🎖️') : BADGE_IC[b.k]));
      m.appendChild(el('b', '', b.k === 'x' ? b.label : X[b.k])); if (b.k !== 'x') m.appendChild(el('span', '', b.label));
      m.appendChild(el('small', '', new Date(b.t).toLocaleDateString(LANG, { day:'2-digit', month:'2-digit', year:'2-digit' }))); grid.appendChild(m);
    });
    c.appendChild(grid); return c;
  }
  function giftCard(n, own){
    var G = GIFT_I18N[LANG] || GIFT_I18N.en, gd = PROF_GIFT[n] || { c:{}, l:[] }, c = document.createElement('div'); c.className = 'card';
    function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; }
    var tot = Object.keys(gd.c).reduce(function(a, k){ return a + gd.c[k]; }, 0);
    var hd = el('div', 'sq-h'); hd.appendChild(el('b', '', '🎁 ' + G.title)); hd.appendChild(el('span', 'tag', String(tot))); c.appendChild(hd);
    if (tot) { var shelf = el('div', 'gift-shelf'); Object.keys(GIFT_ICON).forEach(function(k){ if (!gd.c[k]) return; var s = el('span', 'gift-chip'); s.title = G.g[k];
      s.appendChild(el('i', '', GIFT_ICON[k])); s.appendChild(el('b', '', '× ' + gd.c[k])); shelf.appendChild(s); }); c.appendChild(shelf); }
    else c.appendChild(el('div', 'hint', G.none));
    if (gd.l.length) {
      c.appendChild(el('label', 'l', G.recent));
      gd.l.slice(0, 8).forEach(function(x){
        var r = el('div', 'gift-row'); r.appendChild(el('i', 'gift-ic', GIFT_ICON[x.kind] || '🎁'));
        var a = avEl(x.from, 32); a.style.cursor = 'pointer'; a.addEventListener('click', function(){ openProfile(x.from); }); r.appendChild(a);
        var t = el('div', 'gift-tx'); t.appendChild(el('b', '', G.g[x.kind] || x.kind)); t.appendChild(el('span', '', ' ' + G.from.replace('{n}', x.from)));
        if (x.note) t.appendChild(el('div', 'gift-note', '„' + x.note + '“'));
        r.appendChild(t); r.appendChild(el('span', 'gift-t', new Date(x.t).toLocaleDateString(LANG, { day:'2-digit', month:'2-digit' }))); c.appendChild(r);
      });
    }
    if (!own) {
      var s = window.Funk && Funk.session();
      if (!s) { c.appendChild(el('div', 'hint fk-first', G.login)); return c; }
      if (s.name === n) return c;
      if (GIFT_PICK !== n) { var gr = el('div', 'btnrow gift-btns'); var b = el('button', 'btn gift-open', G.send); b.type = 'button'; b.addEventListener('click', function(){ GIFT_PICK = n; GIFT_MSG = ''; renderProfile(); }); gr.appendChild(b);
        var pm = el('button', 'ghost gift-open', (FUNK_I18N[LANG] || FUNK_I18N.en).newMsg); pm.type = 'button'; pm.addEventListener('click', function(){ showTab('funk'); Funk.compose(n); }); gr.appendChild(pm); c.appendChild(gr); }
      else {
        var f = el('div', 'gift-form'); f.appendChild(el('div', 'hint', G.pick.replace('{n}', n)));
        var grid = el('div', 'gift-grid'), chosen = null;
        Object.keys(GIFT_ICON).forEach(function(k){ var g = el('button', 'gift-opt'); g.type = 'button'; g.appendChild(el('i', '', GIFT_ICON[k])); g.appendChild(el('span', '', G.g[k]));
          g.addEventListener('click', function(){ chosen = k; Array.prototype.forEach.call(grid.children, function(x){ x.classList.remove('on'); }); g.classList.add('on'); send.disabled = false; }); grid.appendChild(g); });
        f.appendChild(grid);
        var note = el('input'); note.maxLength = 80; note.placeholder = G.note; f.appendChild(note);
        var m = el('div', 'msg');
        var send = el('button', 'btn', G.sendBtn); send.type = 'button'; send.disabled = true;
        send.addEventListener('click', function(){
          send.disabled = true;
          rpc('gift_send', { p_token: s.tok, p_to: n, p_kind: chosen, p_note: note.value }).then(function(r){
            if (r && r.err === 'ERR_SESSION') { Funk.expired(); return; }
            if (!r || !r.ok) { send.disabled = false; m.textContent = (G.err[r && r.err] || G.err.ERR) + (r && r.left !== undefined && r.left < 999 ? ' · ' + G.left.replace('{n}', r.left) : ''); m.className = 'msg err'; return; }
            GIFT_PICK = null; GIFT_MSG = G.sent + ' ' + (r.left >= 999 ? G.unl : G.left.replace('{n}', r.left)); delete PROF_STK[n]; loadProfile();
          }, function(){ send.disabled = false; m.textContent = G.err.ERR; m.className = 'msg err'; });
        });
        var row = el('div', 'btnrow'); row.appendChild(send); var cn = el('button', 'ghost', G.cancel); cn.type = 'button'; cn.addEventListener('click', function(){ GIFT_PICK = null; renderProfile(); }); row.appendChild(cn);
        f.appendChild(row); f.appendChild(m); c.appendChild(f);
      }
      if (GIFT_MSG) { c.appendChild(el('div', 'msg ok', GIFT_MSG)); }
    }
    return c;
  }
  var PROF_VIEW = null;
  function openProfile(n){ PROF_VIEW = n === $('name').value ? null : n; showTab('profile'); window.scrollTo(0, 0); }

  /* ---------- Profil: Bienchen, Teufelchen, Erfolge ---------- */
  var PROF_STATS = null, PROF_STK = {}, PROF_BUSY = false, WALLET_PUB = null;
  // Anmeldetage (Taler-Konto) in die Profil-Statistik übernehmen – für den Erfolg „Stammgast“
  function mergePub(){ if (!PROF_STATS || !WALLET_PUB) return; Object.keys(WALLET_PUB).forEach(function(n){ if (PROF_STATS[n]) PROF_STATS[n].ld = WALLET_PUB[n].days || 0; }); }
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
    { id:'redeemed', ic:'🌅', t:[1], v:function(s){ return s.d > 0 && !s.d90 ? 1 : 0; } },
    { id:'login', ic:'📅', t:[7, 30, 100], v:function(s){ return s.ld || 0; } }
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
      (window.Zuschnitt ? function(file, cb){ Zuschnitt.open(file, LANG, cb); } : avShrink)(f, function(u, cancel){ fi.value = ''; if (cancel) { msg.textContent = ''; return; } data = u; msg.textContent = u ? '' : AT.err; pv.innerHTML = ''; if (u) { var im = document.createElement('img'); im.src = u; im.style.cssText = 'width:64px;height:64px;border-radius:50%;object-fit:cover'; pv.appendChild(im); } bs.disabled = !u; }); });
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
    if (n && !PROF_STK[n]) rpc('player_profile', { p_name: n }).then(function(r){ PROF_STK[n] = (r && r.stickers) || []; PROF_GIFT[n] = { c: (r && r.gifts) || {}, l: (r && r.gift_list) || [] }; PROF_BADGE[n] = (r && r.badges) || []; PROF_PLQ[n] = { member: r && r.member, streak: (r && r.streak) || {} };
      loadAvatars(PROF_GIFT[n].l.map(function(x){ return x.from; }), renderProfile); renderProfile(); }).catch(function(){ PROF_STK[n] = []; renderProfile(); });
    renderProfile();
  }
  function renderProfile(){
    var box = $('profBox'), T = PROF_I18N[LANG] || PROF_I18N.en, AT = AV_I18N[LANG] || AV_I18N.en, me = $('name').value, n = PROF_VIEW || me, own = !PROF_VIEW || PROF_VIEW === me; box.innerHTML = '';
    function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; }
    $('merCard').classList.toggle('hide', !own || !MER_DATA.length);
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
    var sub = []; if (s.jd || s.fe) sub.push(T.since.replace('{d}', fmtD(s.jd || s.fe))); if (s.role) sub.push(T.role[s.role]); if (window.Mehr && Mehr.ready() && Mehr.awayText(n)) sub.push(Mehr.awayText(n));
    hn.appendChild(el('div', 'hint', sub.join(' · '))); h.appendChild(hn); c.appendChild(h);
    // „Avatar ändern“ direkt unter Bild und Name
    if (own) { var avu = avUploader(n, AT); avu.classList.add('av-under');
      var sb = window.Stil && Stil.ready() ? Stil.button(n) : null; if (sb) { var tg0 = avu.querySelector('button'); var bw = document.createElement('div'); bw.className = 'av-btns'; tg0.parentNode.insertBefore(bw, tg0); bw.appendChild(tg0); bw.appendChild(sb); }
      c.appendChild(avu); }
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
    // Fremdes Profil: direkt eine Nachricht schreiben (ohne Anmeldung führt der Knopf zur PIN-Anmeldung)
    if (!own && DATA.members.indexOf(n) >= 0) {
      var pmr = el('div', 'btnrow prof-pm'), pmb = el('button', 'btn', (FUNK_I18N[LANG] || FUNK_I18N.en).newMsg); pmb.type = 'button';
      pmb.addEventListener('click', function(){ if (window.Funk && Funk.session()) { showTab('funk'); Funk.compose(n); } else { showTab('form'); openAuth(); } });
      pmr.appendChild(pmb); c.appendChild(pmr);
    }
    box.appendChild(c);
    if (window.Stil && Stil.ready()) { Stil.decorate(c, n, pav); if (own) { var se = Stil.editor(n); if (se) box.appendChild(se); } }
    // Erste Schritte (neue Mitglieder), Allianz-Duell, Entwicklung
    if (window.Mehr && Mehr.ready()) [own ? Mehr.onbCard(n) : null, Mehr.vsCard(n), Mehr.devCard(n)].forEach(function(x){ if (x) box.appendChild(x); });
    // Auszeichnungen: Plaketten, Teilnehmermarken und Erfolge in einer Karte
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, aw = badgeCard(n);
    var all = Object.keys(PROF_STATS), got = 0; ACH.forEach(function(a){ if (achTier(a, s, e).t) got++; });
    // Zähler oben: alle Auszeichnungen zusammen (Plaketten + Marken + freigeschaltete Erfolge), nicht nur die Marken
    var awTag = aw.querySelector('.sq-h .tag'); if (awTag) awTag.textContent = String(aw.querySelectorAll('.plq').length + (PROF_BADGE[n] || []).length + got);
    var ah = el('div', 'sq-h ach-h'); ah.appendChild(el('label', 'l', T.ach)); ah.appendChild(el('span', 'tag req', T.unlocked.replace('{a}', got).replace('{b}', ACH.length))); aw.appendChild(ah);
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
    aw.appendChild(g); box.appendChild(aw);
    // Von anderen: Bienchen/Teufelchen-Sticker und Geschenke in einer Karte
    var fo = giftCard(n, own), G = GIFT_I18N[LANG] || GIFT_I18N.en, fh = fo.firstChild, sec = document.createDocumentFragment();
    var gTot = fh.lastChild ? fh.lastChild.textContent : '0'; fh.firstChild.textContent = '💌 ' + X.fromOthers; if (fh.lastChild && fh.lastChild.className === 'tag') fh.removeChild(fh.lastChild);
    var sh = el('div', 'sq-h'); sh.appendChild(el('label', 'l', T.stickers)); sh.appendChild(el('span', 'tag', '🐝 ' + (s.b || 0) + '  ·  😈 ' + (s.d || 0))); sec.appendChild(sh);
    var info = el('div', 'hint');
    if (!stk.length) sec.appendChild(el('div', 'hint', T.noStickers));
    else {
      var w = el('div', 'stk');
      stk.forEach(function(x){
        var old = x.kind === 'malus' && (Date.now() - new Date(x.t)) > 90 * 86400000;
        var sp = el('span', (x.kind === 'bonus' ? 'b' : 'd') + (old ? ' old' : ''), x.kind === 'bonus' ? '🐝' : '😈');
        sp.title = fmtD(x.t) + ' · ' + x.reason + (old ? ' (' + T.old + ')' : '');
        sp.addEventListener('click', function(){ info.textContent = sp.title; });
        w.appendChild(sp);
      });
      sec.appendChild(w);
    }
    sec.appendChild(info); var gl = el('div', 'sq-h'); gl.appendChild(el('label', 'l', '🎁 ' + G.title)); gl.appendChild(el('span', 'tag', gTot)); sec.appendChild(gl);
    fo.insertBefore(sec, fh.nextSibling); box.appendChild(fo);
    // Meine Mentorengruppe (nur im eigenen Profil nach Anmeldung) – unter den Auszeichnungen
    if (own && window.Mehr && Mehr.ready()) { var ac = Mehr.awayCard(n); if (ac) box.appendChild(ac); }
    var gc = own ? groupCard(n, el) : null; if (gc) box.appendChild(gc);
    var nc = notesCard(n); if (nc) box.appendChild(nc);
  }

  /* ---------- Meine Mentorengruppe ---------- */
  var GRP = null, GRP_FOR = null, GRP_BUSY = false;
  function loadGroup(force){
    var sx = window.Funk && Funk.session(); if (!sx) { GRP = null; GRP_FOR = null; return; }
    if (GRP_BUSY || (!force && GRP_FOR === sx.name)) return;
    GRP_BUSY = true; GRP_FOR = sx.name;
    rpc('my_group', { p_token: sx.tok }).then(function(r){ GRP = r && r.ok ? r : false; if (r && r.err === 'ERR_SESSION') Funk.expired(); })
      .catch(function(){ GRP = false; }).then(function(){ GRP_BUSY = false; if (!$('profileView').classList.contains('hide')) renderProfile(); });
  }
  function groupCard(n, el){
    var sx = window.Funk && Funk.session(); if (!sx || sx.name !== n) return null;
    if (GRP_FOR !== n) loadGroup(); if (!GRP) return null;   // false = Datenbank-Erweiterung fehlt noch → Karte weglassen
    var X = XTRA_I18N[LANG] || XTRA_I18N.en, E = EV_I18N[LANG] || EV_I18N.en, c = el('div', 'card grp-card');
    var hd = el('div', 'sq-h'); hd.appendChild(el('b', '', '🎓 ' + X.grpTitle)); if (GRP.g) hd.appendChild(el('span', 'tag req', X.grpNo.replace('{g}', GRP.g))); c.appendChild(hd);
    if (!GRP.g) { c.appendChild(el('div', 'hint', X.grpNone)); return c; }
    function who(label, names){ if (!names || !names.length) return; var r = el('div', 'grp-who'); r.appendChild(el('span', 'grp-k', label));
      var v = el('span', 'grp-v'); names.forEach(function(m){ var a = el('a', 'grp-n'); a.href = '#'; a.appendChild(avEl(m, 28)); a.appendChild(document.createTextNode(m)); a.addEventListener('click', function(ev){ ev.preventDefault(); openProfile(m); }); v.appendChild(a); }); r.appendChild(v); c.appendChild(r); }
    who(X.grpLead, GRP.r4 ? [GRP.r4] : []); who(X.grpMentors, GRP.mentors || []);
    loadAvatars([GRP.r4].concat(GRP.mentors || [], (GRP.members || []).map(function(m){ return m.name; })).filter(Boolean), function(){});
    if (GRP.intensive) c.appendChild(el('div', 'hint', '💪 ' + X.grpInt));
    if (!GRP.members) return c;
    // Mentoren / Gruppenleitung: alle Mitglieder mit Beitritt im Spiel, Meldung und Event-Anmeldung
    var mem = GRP.members.filter(function(m){ return m.active; }), okN = mem.filter(function(m){ return m.ok; }).length;
    var mh = el('div', 'sq-h'); mh.appendChild(el('label', 'l', X.grpMembers.replace('{n}', mem.length))); mh.appendChild(el('span', 'tag', X.grpSum.replace('{a}', okN).replace('{b}', mem.length - okN))); c.appendChild(mh);
    c.appendChild(el('div', 'hint', X.grpHint));
    var ev = DATA.ev || {}, fmt = function(x){ return new Date(x).toLocaleDateString(LANG, { day:'2-digit', month:'2-digit' }); };
    mem.forEach(function(m){
      var r = el('div', 'grp-row'), a = avEl(m.name, 36); a.style.cursor = 'pointer'; a.addEventListener('click', function(){ openProfile(m.name); }); r.appendChild(a);
      var tx = el('div', 'grp-tx'); var nm = el('b', '', m.name); nm.style.cursor = 'pointer'; nm.addEventListener('click', function(){ openProfile(m.name); }); tx.appendChild(nm);
      if (m.rank) tx.appendChild(el('span', 'grp-rk', ' ' + m.rank));
      if (GRP.canEdit && window.Mehr && Mehr.ready()) tx.appendChild(Mehr.onbBadge(m.name));
      var bits = [], cls = [];
      bits.push(m.ok ? '✅ ' + X.grpOk : m.at ? '⏳ ' + X.grpOpen.replace('{d}', fmt(m.at)) : '❔ ' + X.grpUnk);
      var en = DATA.entries[m.name], d = en ? Math.floor((Date.now() - new Date(en.updated)) / 86400000) : null;
      bits.push(en ? (d > 7 ? '⚠️ ' + X.grpStale.replace('{n}', d) : X.grpFresh) : '⚠️ ' + X.grpNever);
      ['ds','cs'].forEach(function(k){ var rr = ev[k]; if (rr && rr.open) bits.push((rr.signups && rr.signups[m.name] ? '✓ ' + X.grpSign : '✗ ' + X.grpNoSign).replace('{ev}', E[k])); });
      var sub = el('div', 'hint grp-sub', bits.join(' · ')); tx.appendChild(sub); r.appendChild(tx);
      if (GRP.canEdit) {
        var b = el('button', m.ok ? 'mini ghost grp-btn' : 'mini grp-btn', m.ok ? X.grpUndo : X.grpMark); b.type = 'button';
        b.addEventListener('click', function(){ b.disabled = true;
          rpc('group_join', { p_token: sx.tok, p_name: m.name, p_ok: !m.ok }).then(function(res){
            if (res && res.err === 'ERR_SESSION') { Funk.expired(); return; }
            if (!res || !res.ok) { b.disabled = false; b.textContent = X.grpErr; return; }
            loadGroup(true);
          }, function(){ b.disabled = false; b.textContent = X.grpErr; }); });
        r.appendChild(b);
      }
      c.appendChild(r);
    });
    return c;
  }

  /* ---------- Sprache ---------- */
  function setLang(l, manual){
    if (!DATA.i18n[l]) l = 'en';
    LANG = l; $('lang').value = l; store('skws_lang', l);
    if (manual) store('skws_lang_manual', '1');
    applyLang();
    if ($('errBox')) errRender(!!$('errBox').querySelector('.errbox-nr'));
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
    errRender(false); // vorhandenes Fehlerprotokoll (nur als Link) anzeigen
    $('newBtn').addEventListener('click', function(){ setNewMode(true); });
    $('backBtn').addEventListener('click', function(){ setNewMode(false); });
    $('tabForm').addEventListener('click', function(){ showTab('form'); });
    $('tabOverview').addEventListener('click', function(){ showTab('overview'); });
    $('tabProfile').addEventListener('click', function(){ PROF_VIEW = null; showTab('profile'); });
    $('tabFunk').addEventListener('click', function(){ showTab('funk'); });
    $('tabEvents').addEventListener('click', function(){ showTab('events'); });
    $('ovSearch').addEventListener('input', function(){ renderOverview(); });

    setupRem();
    setupLinks();
    Funk.init({ data: function(){ return DATA; }, lang: function(){ return LANG; }, myName: function(){ return $('name').value; },
      avEl: avEl, loadAvatars: loadAvatars, openProfile: openProfile,
      onSettled: function(c){ if (window.Stil && Stil.ready()) Stil.claim(); if (window.Neu) Neu.run({ tok: c.tok, name: c.name, inbox: c.inbox, rooms: c.rooms, seen: c.seen, lang: LANG, data: DATA, go: neuGo }); },
      onNews: function(c){ if (window.Neu) Neu.run({ tok: c.tok, name: c.name, inbox: c.inbox, rooms: c.rooms, seen: c.seen, lang: LANG, data: DATA, go: neuGo }, true); },
      onAuth: function(){ if (window.Mehr) Mehr.reset(); if (window.Stil && Stil.ready()) { Stil.loadWallet(); Stil.claim(); } MER_FOR = null; GRP = null; GRP_FOR = null; loadMerits(); renderAuth(); renderEv(); loadClaims(); if (!$('profileView').classList.contains('hide')) renderProfile(); } });
    if (window.Umfragen) Umfragen.init({ lang: function(){ return LANG; }, tok: tok, me: function(){ var n = $('name').value; return n && authed(n) ? n : null; },
      changed: evLabels, expired: function(){ Funk.expired(); } });
    if (window.Mehr) Mehr.init({ lang: function(){ return LANG; }, data: function(){ return DATA; }, sel: function(){ return $('name').value; }, tzWhen: tzWhen, openProfile: openProfile,
      reProfile: function(){ if (!$('profileView').classList.contains('hide')) renderProfile(); }, reload: refreshShared });
    if (window.Stil) Stil.init({ lang: function(){ return LANG; }, data: function(){ return DATA; }, pub: function(p){ WALLET_PUB = p; mergePub(); },
      reProfile: function(){ if (!$('profileView').classList.contains('hide')) renderProfile(); },
      stats: function(n){ var st = (PROF_STATS && PROF_STATS[n]) || {}, d = st.jd || st.fe;
        return { ev: (st.pds || 0) + (st.pcs || 0), ds: st.pds || 0, cs: st.pcs || 0, bees: st.b || 0, days: d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 0,
          mentor: st.role === 'mentor' || st.role === 'r4', lead: !!(DATA && DATA.leaders && DATA.leaders.indexOf(n) >= 0), rank: DATA && DATA.rk ? DATA.rk[n] : null }; },
      earned: function(n){ var st = (PROF_STATS && PROF_STATS[n]) || {}, e = DATA && DATA.entries[n], T = PROF_I18N[LANG] || PROF_I18N.en, out = [], seen = {};
        ACH.forEach(function(a){ var r = achTier(a, st, e); if (r.t) out.push({ key: 'a:' + a.id, ic: a.ic, label: T.a[a.id][0] + (a.t.length > 1 ? ' ' + ['I', 'II', 'III'][r.t - 1] : '') }); });
        (PROF_BADGE[n] || []).forEach(function(b){ if (b.k !== 'x') return; var k = 'm:' + (b.icon || '🎖️') + (b.label || ''); if (seen[k]) return; seen[k] = 1; out.push({ key: k.slice(0, 80), ic: b.icon || '🎖️', label: b.label || '' }); });
        return out; } });
    // Karten auf- und zuklappen: Profil, Übersicht, Funk und die Info-Karten auf „Eintragen“ (nicht das Eingabeformular)
    if (window.Klapp) Klapp.init({ key: 'skws_zu', ok: function(c){
      if (c.closest('#pollBox')) return false;
      if (c.closest('.fk-overlay, #fkModal') || c.classList.contains('fk-head') || c.classList.contains('sq') || c.classList.contains('fk-modal')) return false;
      var v = c.closest('section'), id = v && v.id;
      if (id === 'profileView' || id === 'overviewView' || id === 'funkView' || id === 'eventsView') return true;
      return ['weekCard','merCard','dsCard','csCard','linksCard','appRemCard'].indexOf(c.id) >= 0 || !!c.closest('#evCards, #claimCards');
    } });
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
      init({ alliance: ALLIANCE, members: res.members || [], leaders: res.leaders || [], entries: res.entries || {}, ds: res.ds || null, cs: res.cs || null, ev: res.ev || null, av: res.av || {}, away: res.away || null, cal: res.cal || null, sty: res.sty || null, rk: res.rk || null,
             troops: ['tank','missile','aircraft','mixed'], squads: 4, langs: LANG_NAMES, i18n: I18N });
    })
    .catch(function(){ $('loadingTxt').textContent = 'Error – please reload / Fehler – bitte neu laden'; });
})();
