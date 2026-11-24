/* SKWS Squads – Funk: Anmeldung mit PIN, Shoutboxen (Alle / Mentoren / R4-R5), persönliche Nachrichten mit Bestätigung */
var Funk = (function(){
  var A = null;                // Verbindung zur Hauptseite (index.js)
  var S = { tok:null, name:null, level:null, unacked:0, rooms:{}, room:'all', inbox:null, sent:null, items:[], compose:null, showPin:false, login:null, msg:'', busy:false };
  var ROOMS = ['all','mentor','lead'];

  function T(){ return FUNK_I18N[A.lang()] || FUNK_I18N.en; }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){ return null; } }
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function btn(cls, txt, fn){ var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function errText(r){ var E = T().err; return (E[r && r.err] || E.ERR).replace('{left}', r && r.left !== undefined ? r.left : '?'); }
  function when(t){ return new Date(t).toLocaleString(A.lang(), { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }); }
  function seen(){ try { return JSON.parse(ls('skws_funk_seen') || '{}'); } catch(e){ return {}; } }
  function setSeen(room, id){ var s = seen(); if (id && (s[room] || 0) < id) { s[room] = id; ls('skws_funk_seen', JSON.stringify(s)); } }
  function visible(){ return !document.hidden && !$('funkView').classList.contains('hide'); }
  function $(id){ return document.getElementById(id); }

  function call(fn, body){
    body = body || {}; if (S.tok) body.p_token = S.tok;
    return rpc(fn, body).then(function(r){ if (r && r.err === 'ERR_SESSION') drop(); return r || {}; }, function(){ return { ok:false, err:'ERR' }; });
  }
  function drop(){ S.tok = S.name = S.level = null; S.inbox = S.sent = null; S.items = []; S.unacked = 0; S.rooms = {}; ls('skws_funk', null); badge(); render(); if (A && A.onAuth) A.onAuth(); }

  /* ---------- Status, Abfrage im Hintergrund ---------- */
  function status(){
    if (!S.tok) return Promise.resolve();
    return call('funk_status').then(function(r){
      if (!r.ok) return;
      var before = S.unacked; S.name = r.name; S.level = r.level; S.unacked = r.unacked || 0; S.rooms = r.rooms || {};
      if (!(S.room in S.rooms)) S.room = 'all';
      badge();
      if (S.unacked && (S.unacked !== before || !S.inbox)) loadInbox();
    });
  }
  function newRooms(){ var s = seen(), n = 0; Object.keys(S.rooms).forEach(function(r){ if (S.rooms[r] && S.rooms[r] > (s[r] || 0)) n++; }); return n; }
  function badge(){
    var b = $('tabFunk'); if (!b) return;
    b.textContent = T().tab;
    var n = S.unacked, dot = S.tok && newRooms();
    if (n || dot) { var s = el('span', 'fk-badge', n ? String(n) : '•'); b.appendChild(s); }
  }

  /* ---------- Nachrichten ---------- */
  function loadInbox(){
    return call('msg_inbox').then(function(r){
      if (!r.ok) return;
      S.inbox = r.inbox || []; S.sent = r.sent || [];
      S.unacked = S.inbox.filter(function(m){ return !m.ack; }).length;
      badge(); modal(); if (visible()) render();
    });
  }
  function ack(id){
    return call('msg_ack', { p_id: id }).then(function(r){
      if (!r.ok) return;
      (S.inbox || []).forEach(function(m){ if (m.id === id) m.ack = new Date().toISOString(); });
      S.unacked = (S.inbox || []).filter(function(m){ return !m.ack; }).length;
      badge(); modal(); if (visible()) render();
    });
  }
  // Unbestätigte Nachrichten erscheinen nach dem Anmelden sofort und müssen bestätigt werden
  function modal(){
    var box = $('fkModal'), open = (S.inbox || []).filter(function(m){ return !m.ack; }).reverse();
    if (!S.tok || !open.length) { box.classList.add('hide'); box.innerHTML = ''; document.body.classList.remove('fk-lock'); return; }
    var m = open[0], L = T(); box.innerHTML = '';
    var c = el('div', 'card fk-modal');
    c.appendChild(el('div', 'fk-mtitle', (m.kind === 'gift' ? '🎁 ' + giftT().got.replace('{n}', m.from) : L.mustAck) + (open.length > 1 ? ' · ' + L.ofN.replace('{i}', 1).replace('{n}', open.length) : '')));
    c.appendChild(msgHead(m));
    msgBody(m, c);
    var b = btn('btn', m.kind === 'gift' ? '❤ ' + giftT().thanks : '✔ ' + L.confirm, function(){ b.disabled = true; ack(m.id).then(function(){ b.disabled = false; }); });
    c.appendChild(b);
    box.appendChild(c); box.classList.remove('hide'); document.body.classList.add('fk-lock');
  }
  function giftT(){ return (window.GIFT_I18N && (GIFT_I18N[A.lang()] || GIFT_I18N.en)) || { g:{}, thanks:'OK', got:'{n}' }; }
  // Nachrichtentext; Geschenke als großes Symbol mit Namen und Notiz
  function msgBody(m, c){
    if (m.kind === 'gift') {
      var g = el('div', 'fk-gift'); g.appendChild(el('i', '', (window.GIFT_ICON && GIFT_ICON[m.subject]) || '🎁')); g.appendChild(el('b', '', giftT().g[m.subject] || m.subject));
      if (m.body) g.appendChild(el('div', 'fk-body', '„' + m.body + '“'));
      c.appendChild(g); return;
    }
    if (m.subject) c.appendChild(el('b', 'fk-subj', m.subject));
    c.appendChild(el('div', 'fk-body', m.body));
  }
  function msgHead(m){
    var L = T(), h = el('div', 'fk-mh');
    var who = m.from || '';
    if (A.data().members.indexOf(who) >= 0) h.appendChild(A.avEl(who, 40));
    h.appendChild(el('span', 'fk-who', (m.kind === 'bc' ? '📢 ' + L.bc + ' · ' : m.kind === 'gift' ? '🎁 ' : '') + L.from.replace('{n}', who)));
    h.appendChild(el('span', 'fk-t', when(m.t)));
    return h;
  }

  /* ---------- Anmeldung ---------- */
  // Anmeldefeld für einen festen Namen: PIN eingeben, beim ersten Mal festlegen, oder PIN vergessen (E-Mail-Abgleich)
  var ST = {};
  function authBox(box, name, onOk, mode){
    var L = T(); box.innerHTML = '';
    if (!name) return;
    var msg = el('div', 'msg');
    function fail(r){ msg.textContent = r && r.err === 'ERR_NOMAIL' ? L.noMail : errText(r); msg.className = 'msg err'; }
    function input(type, ph){ var i = el('input'); i.type = type; i.placeholder = ph; i.autocomplete = type === 'email' ? 'email' : 'off'; box.appendChild(i); return i; }
    function link(txt, fn){ var a = el('a', 'fk-link', txt); a.href = '#'; a.addEventListener('click', function(e){ e.preventDefault(); fn(); }); return a; }
    function done(r){ if (!r || !r.ok) { fail(r); return; } var old = p1 && p1.value; adopt(r.token, r.name, r.level); if (r.must_change) mustChange(old); if (onOk) onOk(); }
    var st = ST[name];
    if (!st) {
      box.appendChild(el('div', 'hint', '…'));
      rpc('auth_status', { p_name: name }).then(function(r){ ST[name] = r; authBox(box, name, onOk, mode); }, function(){ box.innerHTML = ''; fail(null); box.appendChild(msg); });
      return;
    }
    var go, p1, p2, em;
    if (mode === 'reset') {
      box.appendChild(el('div', 'hint fk-first', L.resetHint));
      em = input('email', L.email); p1 = input('password', L.pinNew); p2 = input('password', L.pinAgain);
      go = btn('btn', L.resetBtn, function(){
        if (p1.value !== p2.value) { msg.textContent = L.pinMismatch; msg.className = 'msg err'; return; }
        go.disabled = true; rpc('auth_reset_pin', { p_name: name, p_email: em.value, p_pin: p1.value }).then(function(r){ go.disabled = false; if (r && r.ok) ST[name] = null; done(r); }, function(){ go.disabled = false; fail(null); });
      });
      box.appendChild(go); box.appendChild(msg); box.appendChild(link(L.back, function(){ authBox(box, name, onOk); }));
    } else if (st.has_pin) {
      p1 = input('password', L.pin);
      go = btn('btn', L.login, function(){
        go.disabled = true; rpc('auth_login', { p_name: name, p_pin: p1.value }).then(function(r){ go.disabled = false; done(r); }, function(){ go.disabled = false; fail(null); });
      });
      box.appendChild(go); box.appendChild(msg); box.appendChild(btn('ghost fk-forgot', '🔑 ' + L.forgot, function(){ authBox(box, name, onOk, 'reset'); }));
    } else {
      box.appendChild(el('b', 'fk-step', L.newPinTitle));
      box.appendChild(el('div', 'hint fk-first', L.pinFirst));
      p1 = input('password', L.pinNew); p2 = input('password', L.pinAgain);
      if (st.need_email) { em = input('email', L.email); box.appendChild(el('div', 'hint', L.mailHint)); }
      go = btn('btn', L.login, function(){
        if (p1.value !== p2.value) { msg.textContent = L.pinMismatch; msg.className = 'msg err'; return; }
        go.disabled = true; rpc('auth_login', { p_name: name, p_pin: p1.value, p_email: em ? em.value : null }).then(function(r){ go.disabled = false; if (r && r.ok) ST[name] = null; done(r); }, function(){ go.disabled = false; fail(null); });
      });
      box.appendChild(go); box.appendChild(msg);
    }
    box.querySelectorAll('input').forEach(function(i){ i.addEventListener('keydown', function(e){ if (e.key === 'Enter') go.click(); }); });
  }
  // Nach Anmeldung mit Start-PIN von R4/R5: eigene PIN festlegen
  function mustChange(old){
    var L = T(), o = el('div', 'fk-overlay'), c = el('div', 'card fk-modal');
    c.appendChild(el('div', 'fk-mtitle', '🔑 ' + L.newPinTitle));
    c.appendChild(el('div', 'hint', L.mustChange));
    var p1 = el('input'); p1.type = 'password'; p1.placeholder = L.pinNew; c.appendChild(p1);
    var p2 = el('input'); p2.type = 'password'; p2.placeholder = L.pinAgain; c.appendChild(p2);
    var m = el('div', 'msg');
    var b = btn('btn', L.save, function(){
      if (p1.value !== p2.value) { m.textContent = L.pinMismatch; m.className = 'msg err'; return; }
      b.disabled = true;
      call('auth_change_pin', { p_old: old || '', p_new: p1.value }).then(function(r){ b.disabled = false; if (r.ok) { o.remove(); document.body.classList.remove('fk-lock'); } else { m.textContent = errText(r); m.className = 'msg err'; } });
    });
    c.appendChild(b); c.appendChild(m);
    c.appendChild(btn('ghost', L.later, function(){ o.remove(); document.body.classList.remove('fk-lock'); }));
    o.appendChild(c); document.body.appendChild(o); document.body.classList.add('fk-lock');
  }
  // Anmeldung übernehmen (auch von der Neu-Eintragung)
  function adopt(tok, name, level){
    S.tok = tok; S.name = name; S.level = level || null; S.login = null; S.inbox = null;
    ls('skws_funk', JSON.stringify({ tok: tok, name: name }));
    status().then(function(){ loadInbox(); if (visible()) { loadShouts(); render(); } });
    if (A && A.onAuth) A.onAuth();
  }

  function loginCard(box){
    var L = T(), D = A.data(), c = el('div', 'card');
    c.appendChild(el('h2', '', L.loginTitle));
    c.appendChild(el('div', 'hint', L.loginHint));
    c.appendChild(el('label', 'l', L.name));
    var sel = el('select');
    var o0 = el('option', '', L.pickName); o0.value = ''; sel.appendChild(o0);
    D.members.forEach(function(n){ var o = el('option', '', n); o.value = n; sel.appendChild(o); });
    sel.value = S.loginName || A.myName() || ls('skws_name') || '';
    c.appendChild(sel);
    var more = el('div'); c.appendChild(more);
    sel.addEventListener('change', function(){ S.loginName = sel.value; authBox(more, sel.value); });
    box.appendChild(c);
    authBox(more, sel.value);
  }

  /* ---------- Ansicht nach dem Anmelden ---------- */
  function headCard(box){
    var L = T(), c = el('div', 'card fk-head');
    var row = el('div', 'fk-me'); row.appendChild(A.avEl(S.name, 56));
    var tx = el('div'); tx.appendChild(el('b', '', L.as.replace('{n}', S.name))); tx.appendChild(el('div', 'hint', L.lvl[S.level] || '')); row.appendChild(tx);
    row.appendChild(btn('mini', '🔑', function(){ S.showPin = !S.showPin; render(); }));
    row.appendChild(btn('mini', L.logout, function(){ call('auth_logout').then(drop); }));
    c.appendChild(row);
    if (S.showPin) {
      var f = el('div', 'fk-pin'); f.appendChild(el('label', 'l', L.changePin));
      var o = el('input'); o.type = 'password'; o.placeholder = L.oldPin;
      var n1 = el('input'); n1.type = 'password'; n1.placeholder = L.pinNew;
      var n2 = el('input'); n2.type = 'password'; n2.placeholder = L.pinAgain;
      var m = el('div', 'msg');
      f.appendChild(o); f.appendChild(n1); f.appendChild(n2);
      f.appendChild(btn('btn', L.save, function(){
        if (n1.value !== n2.value) { m.textContent = L.pinMismatch; m.className = 'msg err'; return; }
        call('auth_change_pin', { p_old: o.value, p_new: n1.value }).then(function(r){ m.textContent = r.ok ? L.pinChanged : errText(r); m.className = 'msg ' + (r.ok ? 'ok' : 'err'); if (r.ok) o.value = n1.value = n2.value = ''; });
      }));
      f.appendChild(m); c.appendChild(f);
    }
    box.appendChild(c);
  }

  function msgCard(box){
    var L = T(), D = A.data(), c = el('div', 'card');
    var h = el('div', 'sq-h'); h.appendChild(el('b', '', '✉️ ' + L.msgs));
    h.appendChild(btn('mini', L.newMsg, function(){ S.compose = S.compose ? null : { to:'' }; render(); }));
    c.appendChild(h);
    if (S.compose) {
      var f = el('div', 'fk-compose');
      f.appendChild(el('label', 'l', L.to));
      var to = el('select'); var o0 = el('option', '', L.pickName); o0.value = ''; to.appendChild(o0);
      D.members.forEach(function(n){ if (n !== S.name) { var o = el('option', '', n); o.value = n; to.appendChild(o); } });
      to.value = S.compose.to || ''; f.appendChild(to);
      var su = el('input'); su.placeholder = L.subject; su.maxLength = 80; su.value = S.compose.subject || ''; f.appendChild(su);
      var tx = el('textarea'); tx.placeholder = L.text; tx.maxLength = 2000; tx.rows = 4; f.appendChild(tx);
      var m = el('div', 'msg');
      var row = el('div', 'btnrow');
      var sb = btn('btn', L.send, function(){
        if (!to.value) { m.textContent = L.err.ERR_NAME; m.className = 'msg err'; return; }
        sb.disabled = true;
        call('msg_send', { p_to: to.value, p_subject: su.value, p_body: tx.value }).then(function(r){
          sb.disabled = false;
          if (!r.ok) { m.textContent = errText(r); m.className = 'msg err'; return; }
          S.compose = null; S.msg = L.sent; loadInbox();
        });
      });
      row.appendChild(sb); row.appendChild(btn('ghost', L.cancel, function(){ S.compose = null; render(); }));
      f.appendChild(row); f.appendChild(m); c.appendChild(f);
      setTimeout(function(){ (to.value ? tx : to).focus(); }, 0);
    }
    if (S.msg) { c.appendChild(el('div', 'msg ok', S.msg)); S.msg = ''; }
    c.appendChild(el('label', 'l', L.inbox));
    if (!S.inbox) c.appendChild(el('div', 'hint', '…'));
    else if (!S.inbox.length) c.appendChild(el('div', 'hint', L.none));
    else S.inbox.forEach(function(m){
      var it = el('div', 'fk-msg' + (m.ack ? '' : ' new'));
      it.appendChild(msgHead(m));
      msgBody(m, it);
      var row = el('div', 'fk-mf');
      if (!m.ack) row.appendChild(btn('mini', m.kind === 'gift' ? '❤ ' + giftT().thanks : '✔ ' + L.confirm, function(){ ack(m.id); }));
      else row.appendChild(el('span', 'fk-ok', '✔ ' + L.confirmed));
      if (m.from && m.from !== S.name && D.members.indexOf(m.from) >= 0)
        row.appendChild(btn('mini', '↩ ' + L.reply, function(){ S.compose = { to: m.from, subject: m.subject ? (/^re:/i.test(m.subject) ? m.subject : 'Re: ' + m.subject).slice(0, 80) : '' }; render(); window.scrollTo(0, 0); }));
      it.appendChild(row); c.appendChild(it);
    });
    if (S.sent && S.sent.length) {
      var d = el('details', 'fk-sent'); d.appendChild(el('summary', '', L.outbox + ' (' + S.sent.length + ')'));
      S.sent.forEach(function(m){
        var it = el('div', 'fk-msg');
        var hh = el('div', 'fk-mh'); hh.appendChild(el('span', 'fk-who', L.to + ': ' + (m.to || []).map(function(x){ return x.name; }).join(', '))); hh.appendChild(el('span', 'fk-t', when(m.t))); it.appendChild(hh);
        if (m.subject) it.appendChild(el('b', 'fk-subj', m.subject));
        it.appendChild(el('div', 'fk-body', m.body));
        (m.to || []).forEach(function(x){ it.appendChild(el('span', x.ack ? 'fk-ok' : 'fk-open', (x.ack ? '✔ ' + L.confirmed + ' · ' + when(x.ack) : '… ' + L.open))); });
        d.appendChild(it);
      });
      c.appendChild(d);
    }
    box.appendChild(c);
  }

  /* ---------- Shoutbox ---------- */
  function loadShouts(){
    if (!S.tok) return Promise.resolve();
    var room = S.room;
    return call('shout_list', { p_room: room }).then(function(r){
      if (!r.ok || room !== S.room) return;
      var last = S.items.length ? S.items[S.items.length - 1].id : 0, nl = r.items.length ? r.items[r.items.length - 1].id : 0;
      var changed = S.items.length !== r.items.length || last !== nl;
      S.items = r.items; S.itemsRoom = room;
      if (visible()) { setSeen(room, nl); badge(); }
      A.loadAvatars(r.items.map(function(x){ return x.name; }).filter(function(n, i, a){ return a.indexOf(n) === i; }), function(){ if (visible()) drawShouts(); });
      if (changed && visible()) drawShouts();
    });
  }
  function shoutCard(box){
    var L = T(), c = el('div', 'card'); c.id = 'fkShoutCard';
    c.appendChild(el('div', 'sq-h')).appendChild(el('b', '', '📣 ' + L.shout));
    var tabs = el('div', 'fk-rooms'), s = seen();
    ROOMS.forEach(function(r){
      if (!(r in S.rooms)) return;
      var b = btn(r === S.room ? 'on' : '', L.rooms[r], function(){ if (S.room === r) return; S.room = r; S.items = []; render(); loadShouts(); });
      if (r !== S.room && S.rooms[r] && S.rooms[r] > (s[r] || 0)) b.appendChild(el('span', 'fk-dot'));
      tabs.appendChild(b);
    });
    if (tabs.children.length > 1) c.appendChild(tabs);
    c.appendChild(el('div', 'hint', L.roomHint[S.room]));
    var list = el('div', 'fk-list'); list.id = 'fkList'; c.appendChild(list);
    var row = el('div', 'fk-send');
    var inp = el('input'); inp.placeholder = L.write; inp.maxLength = 500; inp.id = 'fkIn';
    var m = el('div', 'msg');
    function send(){
      var v = inp.value.trim(); if (!v || S.busy) return;
      S.busy = true;
      call('shout_post', { p_room: S.room, p_body: v }).then(function(r){
        S.busy = false;
        if (!r.ok) { m.textContent = errText(r); m.className = 'msg err'; return; }
        inp.value = ''; m.textContent = ''; loadShouts();
      });
    }
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') send(); });
    row.appendChild(inp); row.appendChild(btn('btn', '➤', send));
    c.appendChild(row); c.appendChild(m);
    box.appendChild(c);
    drawShouts();
  }
  function drawShouts(){
    var list = $('fkList'); if (!list) return;
    var L = T(), atEnd = list.scrollHeight - list.scrollTop - list.clientHeight < 40 || !list.children.length;
    list.innerHTML = '';
    if (S.itemsRoom === S.room && !S.items.length) list.appendChild(el('div', 'hint', L.empty));
    S.items.forEach(function(x){
      var it = el('div', 'fk-sh' + (x.name === S.name ? ' me' : ''));
      var a = A.avEl(x.name, 42); a.style.cursor = 'pointer'; a.addEventListener('click', function(){ A.openProfile(x.name); }); it.appendChild(a);
      var b = el('div', 'fk-shb');
      var h = el('div', 'fk-shh'); h.appendChild(el('b', '', x.name)); h.appendChild(el('span', 'fk-t', when(x.t)));
      if (x.name === S.name || S.level === 'lead') h.appendChild(btn('fk-x', '✕', function(){ if (confirm(L.delQ)) call('shout_delete', { p_id: x.id }).then(loadShouts); }));
      b.appendChild(h); b.appendChild(el('div', 'fk-body', x.body)); it.appendChild(b);
      list.appendChild(it);
    });
    if (atEnd) list.scrollTop = list.scrollHeight;
  }

  function render(){
    var box = $('funkBox'); if (!box || !A) return;
    box.innerHTML = '';
    if (!S.tok) { loginCard(box); return; }
    headCard(box); msgCard(box); shoutCard(box);
  }

  return {
    init: function(app){
      A = app;
      try { var s = JSON.parse(ls('skws_funk') || 'null'); if (s && s.tok) { S.tok = s.tok; S.name = s.name; } } catch(e){}
      badge();
      if (S.tok) status().then(function(){ if (S.tok) loadInbox(); });
      setInterval(function(){ if (S.tok && !document.hidden) status(); }, 60000);
      setInterval(function(){ if (S.tok && visible()) loadShouts(); }, 8000);
      document.addEventListener('visibilitychange', function(){ if (!document.hidden && S.tok) { status(); if (visible()) loadShouts(); } });
    },
    ready: function(){ return !!A; },
    session: function(){ return S.tok ? { tok: S.tok, name: S.name } : null; },
    authBox: authBox, adopt: adopt,
    logout: function(){ call('auth_logout').then(drop); },
    expired: function(){ drop(); },
    show: function(){ render(); if (S.tok) { loadInbox(); loadShouts(); } },
    lang: function(){ if (!A) return; badge(); if (!$('funkView').classList.contains('hide')) render(); modal(); }
  };
})();
