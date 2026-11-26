/* SKWS Squads – Admin: core (gemeinsamer globaler Bereich, Reihenfolge der Dateien beachten) */
var SB_URL = 'https://ulwuoxfglmlcdppdegml.supabase.co/rest/v1/rpc/';
var SB_KEY = 'sb_publishable_f9uikP8ZEHD7leJtckyKbg_E-jLm_Nn';
var TROOPS = { tank:'Panzer', missile:'Raketenwerfer', aircraft:'Flugzeug', mixed:'Gemischt' };
var TROOPS_SHORT = { tank:'Panzer', missile:'Rakete', aircraft:'Flugzeug', mixed:'Gemischt' };
function squadCell(s){ return s && s.type ? '<b>' + fmt(s.power) + '</b><div class="tl"><span class="dot" style="background:var(--' + s.type + ')"></span>' + TROOPS_SHORT[s.type] + '</div>' : '<span class="muted">–</span>'; }
var TROOP_ORDER = ['tank','missile','aircraft','mixed'];
var SLOT_COLORS = ['var(--s1)','var(--s2)','var(--s3)','var(--s4)'];
var RANKS = ['R5','R4','R3','R2','R1'];
var DAY = 86400000, STALE_DAYS = 7;
var $ = function(id){ return document.getElementById(id); };
var PW = null, D = null, curPlayer = null, ACTOR = '';
function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){ return null; } }
// Name fürs Logbuch: eigener Admin-Name, sonst der auf der Eintragsseite gewählte Spielername
ACTOR = ls('skws_admin_actor') || ls('skws_name') || '';
function savedPw(){ return ls('skws_admin_pw_keep') || store('skws_admin_pw'); }
function forgetPw(){ ls('skws_admin_pw_keep', null); store('skws_admin_pw', null); }

function store(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch(e){ return null; } }
function rpc(fn, body){
  return fetch(SB_URL + fn, { method:'POST', headers:{ apikey: SB_KEY, 'Content-Type':'application/json' }, body: JSON.stringify(body || {}) })
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if (!r.ok) throw new Error((j && j.message) || 'ERR'); return j; }); });
}
// ---------- Zentrale Ablage (Datenbank „app_kv“): Wüstensturm-/Schluchtsturm-Planung und Kartenbild ----------
// Fällt nur auf das Gerät zurück, solange die Datenbank-Erweiterung fehlt.
var KV = {}, KV_OK = false, KV_INFO = {}, KV_T = {}, KV_PEND = {};
var KV_LOCAL = { ds_state: 'skws_ds', cs_state: 'skws_cs' };
function kvLoad(){
  if (Object.keys(KV_PEND).length) return Promise.resolve();          // eigene Änderungen noch unterwegs: nicht überschreiben
  return rpc('admin_kv', { p_pw: PW, p_action: 'get' }).then(function(r){
    KV_OK = true; KV = {}; KV_INFO = r.items || {};
    Object.keys(KV_INFO).forEach(function(k){ KV[k] = KV_INFO[k].data; });
    kvMigrate();
  }).catch(function(){ KV_OK = false; });
}
function kvLocal(key){ try { if (KV_LOCAL[key]) return JSON.parse(ls(KV_LOCAL[key]) || 'null'); if (key === 'ds_map') { var bg = ls('skws_ds_map'), pos = JSON.parse(ls('skws_ds_pos2') || 'null'); return bg || pos ? { bg: bg || null, pos: pos || null } : null; } } catch(e){} return null; }
function kvGet(key){ return KV_OK ? (KV[key] === undefined ? null : KV[key]) : kvLocal(key); }
function kvSend(key){
  var val = KV[key]; delete KV_T[key];
  return rpc('admin_kv', { p_pw: PW, p_action: 'set', p_key: key, p_data: val === undefined ? null : val, p_actor: ACTOR || null })
    .then(function(){ delete KV_PEND[key]; KV_INFO[key] = { at: new Date().toISOString(), by: ACTOR || 'Admin' }; })
    .catch(function(){ delete KV_PEND[key]; if (typeof toast === 'function') toast('Speichern in der Datenbank fehlgeschlagen – bitte Verbindung prüfen.', false); });
}
function kvSet(key, val, now){
  if (!KV_OK) {                                                          // ohne Datenbank-Erweiterung wie bisher auf dem Gerät
    if (KV_LOCAL[key]) ls(KV_LOCAL[key], val === null ? null : JSON.stringify(val));
    else if (key === 'ds_map') { ls('skws_ds_map', val && val.bg || null); ls('skws_ds_pos2', val && val.pos ? JSON.stringify(val.pos) : null); }
    return;
  }
  KV[key] = val; KV_PEND[key] = true; clearTimeout(KV_T[key]);
  if (now) return kvSend(key);
  KV_T[key] = setTimeout(function(){ kvSend(key); }, 500);
}
// alte Daten vom Gerät einmalig in die Datenbank übernehmen und danach vom Gerät löschen
function kvMigrate(){
  ['ds_state', 'cs_state', 'ds_map'].forEach(function(key){
    var loc = kvLocal(key); if (!loc) return;
    var done = function(){ if (KV_LOCAL[key]) ls(KV_LOCAL[key], null); else { ls('skws_ds_map', null); ls('skws_ds_pos2', null); } };
    if (KV[key] === undefined || KV[key] === null) { KV[key] = loc; KV_PEND[key] = true; kvSend(key).then(done); } else done();
  });
}
document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') Object.keys(KV_T).forEach(function(k){ clearTimeout(KV_T[k]); kvSend(k); }); });
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function fmt(n, d){ if (n === null || n === undefined || isNaN(n)) return '–'; return Number(n).toLocaleString('de-DE', {maximumFractionDigits: d === undefined ? 1 : d}); }
function fmtM(n){ return n ? fmt(n) + ' M' : '–'; }
function fmtDelta(n){
  if (!n) return '<span class="muted">±0</span>';
  return '<span class="' + (n > 0 ? 'up' : 'down') + '">' + (n > 0 ? '▲ +' : '▼ ') + fmt(n) + '</span>';
}
function fmtDate(t){ return new Date(t).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'2-digit'}); }
function fmtDateTime(t){ return new Date(t).toLocaleString('de-DE', {day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'}); }
function ago(t){
  if (!t) return '';
  var d = Math.floor((Date.now() - new Date(t)) / DAY);
  return d <= 0 ? 'heute' : d === 1 ? 'gestern' : 'vor ' + d + ' Tagen';
}
function lastUpd(t){ return t ? fmtDate(t) + ' · ' + ago(t) : 'nie'; }
function daysSince(t){ return t ? Math.floor((Date.now() - new Date(t)) / DAY) : null; }
function dayKey(t){ var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function sumSquads(sq){ var s = 0; (sq || []).forEach(function(x){ if (x && x.power) s += Number(x.power); }); return Math.round(s * 100) / 100; }
function gorillaCell(e){ var a = []; if (e.gstage) a.push('★' + e.gstage); if (e.gorilla) a.push('Lv ' + e.gorilla); if (e.gpower) a.push(fmt(e.gpower / 1e6, 2) + ' M'); return a.length ? a.join(' · ') : '–'; }
function sq(e, i){ return (e && e.squads && e.squads[i]) || {}; }

/* ---------- Daten aufbereiten ---------- */
function prep(raw){
  var hist = (raw.history || []).map(function(h){ return { name: h.name, squads: h.squads, t: new Date(h.t), total: sumSquads(h.squads) }; });
  hist.sort(function(a,b){ return a.t - b.t; });
  var byName = {};
  hist.forEach(function(h){ (byName[h.name] = byName[h.name] || []).push(h); });
  // Mehrere Speicherungen kurz hintereinander (Eintragen in Etappen, Tippfehler korrigiert) zählen als eine Meldung:
  // es zählt jeweils die letzte innerhalb von 60 Minuten. Sonst wirkt z. B. eine halb ausgefüllte erste Meldung wie ein riesiger Zuwachs.
  Object.keys(byName).forEach(function(n){ var l = byName[n]; byName[n] = l.filter(function(h, i){ return i === l.length - 1 || l[i + 1].t - h.t > 60 * 60 * 1000; }); });

  var players = raw.members.map(function(m){
    var e = raw.entries[m.name] || null, hs = byName[m.name] || [];
    var total = e ? sumSquads(e.squads) : 0;
    var prev = hs.length > 1 ? hs[hs.length - 2].total : null;
    var first = hs.length ? hs[0].total : null;
    return {
      name: m.name, rank: m.rank || '–', entry: e, total: total,
      active: m.active !== false, leftAt: m.left_at ? new Date(m.left_at) : null, joinedAt: m.joined_at ? new Date(m.joined_at) : null,
      t1: e ? Number(sq(e,0).power || 0) : 0,
      delta: prev === null ? null : Math.round((total - prev) * 100) / 100,
      growth: first === null ? null : Math.round((total - first) * 100) / 100,
      updated: e ? new Date(e.updated) : null,
      stale: e ? (Date.now() - new Date(e.updated)) > STALE_DAYS * DAY : false,
      history: hs
    };
  });

  // Tageswerte der Allianz: je Tag der jeweils letzte bekannte Stand jedes Spielers (Ausgeschiedene ab Austrittstag nicht mehr)
  var leftKey = {}; raw.members.forEach(function(m){ if (m.left_at) leftKey[m.name] = dayKey(m.left_at); });
  var days = [], latest = {}, i = 0;
  var keys = []; hist.forEach(function(h){ var k = dayKey(h.t); if (keys[keys.length-1] !== k) keys.push(k); });
  keys.forEach(function(k){
    while (i < hist.length && dayKey(hist[i].t) <= k) { latest[hist[i].name] = hist[i]; i++; }
    Object.keys(latest).forEach(function(n){ if (leftKey[n] && leftKey[n] <= k) delete latest[n]; });
    var slots = [0,0,0,0], total = 0, count = 0;
    Object.keys(latest).forEach(function(n){
      var s = latest[n].squads || []; count++;
      for (var j = 0; j < 4; j++) { var p = Number((s[j] || {}).power || 0); slots[j] += p; total += p; }
    });
    var p = k.split('-');
    days.push({ key: k, x: new Date(+p[0], +p[1]-1, +p[2], 12), total: total, slots: slots, count: count });
  });
  var lastLeft = Object.keys(leftKey).map(function(n){ return leftKey[n]; }).sort().pop();
  if (lastLeft && days.length && lastLeft > days[days.length-1].key) {
    var prev = days[days.length-1], k2 = lastLeft, slots = [0,0,0,0], tot = 0, cnt = 0;
    Object.keys(latest).forEach(function(n){ if (leftKey[n] && leftKey[n] <= k2) return; cnt++; var s = latest[n].squads || []; for (var j = 0; j < 4; j++) { var pw = Number((s[j] || {}).power || 0); slots[j] += pw; tot += pw; } });
    var q = k2.split('-'); days.push({ key: k2, x: new Date(+q[0], +q[1]-1, +q[2], 12), total: tot, slots: slots, count: cnt });
  }
  var act = players.filter(function(p){ return p.active; });
  return { all: players, players: act, left: players.filter(function(p){ return !p.active; }), days: days, members: act.length };
}

/* ---------- Liniendiagramm (SVG) ---------- */
function niceStep(r){ var p = Math.pow(10, Math.floor(Math.log10(r))), f = r / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
function lineChart(el, series, o){
  o = o || {};
  var pts = []; series.forEach(function(s){ s.points.forEach(function(p){ pts.push(p); }); });
  if (!pts.length){ el.innerHTML = '<div class="empty">Noch keine Daten – sobald Meldungen eingehen, erscheint hier der Verlauf.</div>'; return; }
  var labels = series.length > 1 && series.length <= 4;
  var W = Math.max(300, Math.round(el.clientWidth || 640)), H = o.h || (W < 500 ? 220 : 260), ml = 52, mr = labels ? 74 : 16, mt = 14, mb = 28;
  var xs = pts.map(function(p){ return +p.x; }), ys = pts.map(function(p){ return p.y; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  if (x0 === x1) { x0 -= DAY; x1 += DAY; }
  var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
  var pad = (hi - lo) * 0.15 || Math.max(1, hi * 0.1);
  lo = o.zero ? 0 : Math.max(0, lo - pad); hi = hi + pad;
  var step = niceStep((hi - lo) / 4); lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  var X = function(v){ return ml + (v - x0) / (x1 - x0) * (W - ml - mr); };
  var Y = function(v){ return mt + (1 - (v - lo) / (hi - lo)) * (H - mt - mb); };
  var unit = o.unit === undefined ? ' M' : o.unit;
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'Diagramm') + '">';
  for (var v = lo; v <= hi + step / 2; v += step) {
    s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--grid)" stroke-width="1"/>';
    s += '<text x="' + (ml - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="11" fill="var(--muted)">' + fmt(v, 0) + '</text>';
  }
  var uniq = []; xs.slice().sort(function(a,b){return a-b;}).forEach(function(x){ if (uniq[uniq.length-1] !== x) uniq.push(x); });
  var xt = uniq.length <= 1 ? uniq : uniq.length === 2 ? uniq : [uniq[0], uniq[Math.floor(uniq.length/2)], uniq[uniq.length-1]];
  xt.forEach(function(x, idx){
    var anchor = xt.length > 1 && idx === 0 ? 'start' : xt.length > 1 && idx === xt.length - 1 ? 'end' : 'middle';
    s += '<text x="' + X(x) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '" font-size="11" fill="var(--muted)">' + fmtDate(x) + '</text>';
  });
  series.forEach(function(se){
    if (!se.points.length) return;
    var d = se.points.map(function(p, i){ return (i ? 'L' : 'M') + X(+p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }).join(' ');
    s += '<path d="' + d + '" fill="none" stroke="' + se.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    if (se.points.length <= 12) se.points.forEach(function(p){
      s += '<circle cx="' + X(+p.x) + '" cy="' + Y(p.y) + '" r="4" fill="' + se.color + '" stroke="var(--card)" stroke-width="2"/>';
    });
  });
  if (labels) {
    var ends = series.filter(function(se){ return se.points.length; }).map(function(se){
      var p = se.points[se.points.length - 1]; return { se: se, y: Y(p.y), x: X(+p.x) };
    }).sort(function(a,b){ return a.y - b.y; });
    for (var k = 1; k < ends.length; k++) if (ends[k].y - ends[k-1].y < 14) ends[k].y = ends[k-1].y + 14;
    ends.forEach(function(e){
      s += '<line x1="' + (W - mr + 6) + '" x2="' + (W - mr + 16) + '" y1="' + e.y + '" y2="' + e.y + '" stroke="' + e.se.color + '" stroke-width="3" stroke-linecap="round"/>';
      s += '<text x="' + (W - mr + 20) + '" y="' + (e.y + 4) + '" font-size="12" fill="var(--muted)">' + esc(e.se.name) + '</text>';
    });
  }
  s += '<line class="xh" x1="0" x2="0" y1="' + mt + '" y2="' + (H - mb) + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>';
  s += '<rect class="hit" x="' + ml + '" y="0" width="' + (W - ml - mr) + '" height="' + H + '" fill="transparent"/></svg>';
  var legend = series.length > 1 ? '<div class="legend">' + series.map(function(se){ return '<span><i style="background:' + se.color + '"></i>' + esc(se.name) + '</span>'; }).join('') + '</div>' : '';
  el.innerHTML = legend + s + '<div class="tip hide"></div>';

  var svg = el.querySelector('svg'), tip = el.querySelector('.tip'), xh = el.querySelector('.xh');
  function move(ev){
    var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * W;
    var best = uniq[0], bd = Infinity;
    uniq.forEach(function(x){ var dd = Math.abs(X(x) - px); if (dd < bd) { bd = dd; best = x; } });
    xh.setAttribute('x1', X(best)); xh.setAttribute('x2', X(best)); xh.setAttribute('visibility', 'visible');
    var rows = series.map(function(se){
      var p = null; se.points.forEach(function(q){ if (+q.x === best) p = q; });
      return p ? '<div><span class="dot" style="background:' + se.color + '"></span>' + esc(se.name) + '<em>' + fmt(p.y) + unit + '</em></div>' : '';
    }).join('');
    tip.innerHTML = '<b>' + (o.time ? fmtDateTime(best) : fmtDate(best)) + '</b>' + rows;
    tip.classList.remove('hide');
    var left = X(best) / W * r.width + 12, er = el.getBoundingClientRect();
    if (left + tip.offsetWidth > er.width) left = X(best) / W * r.width - tip.offsetWidth - 12;
    tip.style.left = Math.max(0, left) + 'px'; tip.style.top = (el.querySelector('.legend') ? 26 : 0) + 'px';
  }
  function leave(){ tip.classList.add('hide'); xh.setAttribute('visibility', 'hidden'); }
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', leave);
}
