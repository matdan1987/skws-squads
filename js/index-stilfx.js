// SKWS Squads – animierte Profil-Designs: Rahmen um den Avatar, Header in der Profilkarte, Hintergründe für die ganze Seite.
// Alles nur mit HTML-Elementen und CSS-Animationen (css/stil-fx.css), keine Bilder.
var StilFX = (function(){
  var FR = ['eq', 'flame', 'orbit', 'bolt', 'hex', 'runes', 'glitch', 'crown'],
      HD = ['hyper', 'synth', 'thunder', 'lava', 'vortex', 'deepsea'],
      BG = ['northern', 'coderain', 'warp', 'fireflies', 'neongrid'];
  var UID = 0;
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function rnd(seed){ var s = (seed * 7919) % 233280 || 1; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  // Element im Kreis um die Mitte: äußere Hülle dreht, inneres Element sitzt (per CSS) im Abstand vom Mittelpunkt
  function rad(box, deg, inner){ var o = el('span', 'fx-rad'); o.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)'; o.appendChild(inner); box.appendChild(o); return inner; }
  function dur(x, a, b){ x.style.animationDuration = a.toFixed(2) + 's'; if (b !== undefined) x.style.animationDelay = (-b).toFixed(2) + 's'; }
  // Avatar in eine Hülle setzen, damit Ebenen davor und dahinter liegen können
  function wrap(av, cls){ cls = cls || 'av-wrap'; var p = av.parentNode; if (p && p.classList.contains(cls)) return p;
    var w = el('span', cls); if (p) p.insertBefore(w, av); w.appendChild(av); return w; }
  function svgPts(r, rot){ var a = []; for (var i = 0; i < 6; i++) { var t = (i * 60 + rot) * Math.PI / 180; a.push((60 + r * Math.cos(t)).toFixed(1) + ',' + (60 + r * Math.sin(t)).toFixed(1)); } return a.join(' '); }

  /* ---------- Rahmen ---------- */
  function frame(w, k, small){
    var back = el('span', 'fxf fxf-b fxf-' + k), front = el('span', 'fxf fxf-f fxf-' + k), i, n, x;
    w.classList.add('fxw-' + k);
    if (k === 'eq') {
      n = small ? 28 : 64;
      for (i = 0; i < n; i++) { var hu = Math.round(i * 360 / n); x = el('i', 'eq');
        x.style.background = 'linear-gradient(to top,hsl(' + hu + ',100%,55%),hsl(' + ((hu + 60) % 360) + ',100%,78%))';
        x.style.boxShadow = '0 0 8px hsl(' + hu + ',100%,60%)';
        dur(x, .32 + ((i * 7) % 9) / 16, (i * .37) % 1.3); rad(back, i * 360 / n, x); }
    } else if (k === 'flame') {
      back.appendChild(el('span', 'fl-glow'));
      n = small ? 16 : 40;
      for (i = 0; i < n; i++) { x = el('i', 'fl'); x.style.height = 'calc(var(--R) * ' + (.42 + ((i * 5) % 7) / 18).toFixed(2) + ')';
        dur(x, .38 + ((i * 3) % 5) / 12, (i * .23) % 1); rad(back, i * 360 / n, x); }
      if (!small) for (i = 0; i < 16; i++) { x = el('i', 'fl-sp'); dur(x, 1.1 + (i % 4) * .3, (i * .41) % 1.8); rad(front, i * 360 / 16 + 11, x); }
    } else if (k === 'orbit') {
      [[0, '#22d3ee', 1.7], [60, '#f472b6', 2.3], [-60, '#facc15', 1.35]].forEach(function(o){
        var ob = el('span', 'orb'), ln = el('span', 'orb-l'), ox = el('span', 'orb-x'), oy = el('span', 'orb-y'), e = el('i', 'orb-e');
        ob.style.transform = 'rotate(' + o[0] + 'deg)'; ln.style.color = o[1];
        e.style.background = '#fff'; e.style.boxShadow = '0 0 6px 2px ' + o[1] + ',0 0 16px 5px ' + o[1];
        dur(ox, o[2] / 2); dur(oy, o[2] / 2, o[2] / 4);
        oy.appendChild(e); ox.appendChild(oy); ob.appendChild(ln); ob.appendChild(ox); front.appendChild(ob); });
      back.appendChild(el('span', 'orb-glow'));
    } else if (k === 'bolt') {
      var s = '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" class="bolt-glow"/>';
      for (var p = 0; p < 3; p++) { var R = rnd(p * 31 + 5), d = '';
        for (var a = 0; a <= 360; a += 9) { var rr = a === 360 ? null : 48 + (R() - .5) * 9, t = a * Math.PI / 180; if (rr === null) { d += 'Z'; break; }
          d += (a ? 'L' : 'M') + (60 + rr * Math.cos(t)).toFixed(1) + ' ' + (60 + rr * Math.sin(t)).toFixed(1); }
        for (var b = 0; b < 5; b++) { var t0 = R() * Math.PI * 2, r1 = 51, r2 = 55 + R() * 3, r3 = 58 + R() * 4;
          d += 'M' + (60 + r1 * Math.cos(t0)).toFixed(1) + ' ' + (60 + r1 * Math.sin(t0)).toFixed(1) + 'L' + (60 + r2 * Math.cos(t0 + .07)).toFixed(1) + ' ' + (60 + r2 * Math.sin(t0 + .07)).toFixed(1)
            + 'L' + (60 + r3 * Math.cos(t0 - .03)).toFixed(1) + ' ' + (60 + r3 * Math.sin(t0 - .03)).toFixed(1); }
        s += '<path class="bolt-p bp' + p + '" d="' + d + '"/>'; }
      front.innerHTML = s + '</svg>';
    } else if (k === 'hex') {
      var g = 'fxh' + (++UID);
      front.innerHTML = '<svg viewBox="0 0 120 120"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#a3e635"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>'
        + '<g class="hx3"><polygon points="' + svgPts(50, 0) + '"/></g><g class="hx1"><polygon points="' + svgPts(54, 30) + '" stroke="url(#' + g + ')"/></g><g class="hx2"><polygon points="' + svgPts(58, 0) + '" stroke="url(#' + g + ')"/></g></svg>';
      back.appendChild(el('span', 'hx-glow'));
    } else if (k === 'runes') {
      var RU = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
      back.appendChild(el('span', 'rn-glow'));
      [['r1', small ? 10 : 22], ['r2', small ? 14 : 30]].forEach(function(c, j){ var ring = el('span', 'rn ' + c[0]);
        for (var q = 0; q < c[1]; q++) { var ch = el('i', '', RU[(q * 7 + j * 3) % RU.length]); ch.style.animationDelay = (-(q * .29) % 2).toFixed(2) + 's'; rad(ring, q * 360 / c[1], ch); }
        front.appendChild(ring); });
    } else if (k === 'glitch') {
      ['tl', 'tr', 'bl', 'br'].forEach(function(c){ front.appendChild(el('span', 'gl-c gl-' + c)); });
      front.appendChild(el('span', 'gl-scan')); front.appendChild(el('span', 'gl-bar')); front.appendChild(el('span', 'gl-bar b2'));
    } else if (k === 'crown') {
      back.appendChild(el('span', 'cr-ring')); back.appendChild(el('span', 'cr-glow'));
      front.appendChild(el('span', 'cr-c', '👑'));
      n = small ? 4 : 10; for (i = 0; i < n; i++) { x = el('i', 'cr-s', '✦'); dur(x, 1.4 + (i % 3) * .4, i * .37); rad(front, i * 360 / n + 18, x); }
    }
    w.insertBefore(back, w.firstChild); w.appendChild(front);
    return w;
  }

  /* ---------- Header ---------- */
  function header(b, k, small){
    var L = el('span', 'hfx hfx-' + k), i, n, x, R = rnd(k.length * 13 + 3);
    if (k === 'hyper') {
      L.appendChild(el('span', 'hy-core'));
      var c = el('span', 'hy-c'); n = small ? 24 : 120;
      for (i = 0; i < n; i++) { x = el('i', 'hy'); dur(x, .55 + R() * .9, R() * 1.5); x.style.opacity = 0; rad(c, (i * 137.5) % 360, x); }
      L.appendChild(c);
    } else if (k === 'synth') {
      L.appendChild(el('span', 'sy-glow')); L.appendChild(el('span', 'sy-sun'));
      var fl = el('span', 'sy-floor'); fl.appendChild(el('span', 'sy-grid')); L.appendChild(fl); L.appendChild(el('span', 'sy-hz'));
    } else if (k === 'thunder') {
      ['c1', 'c2', 'c3'].forEach(function(c){ L.appendChild(el('span', 'th-cl ' + c)); });
      n = small ? 10 : 46; for (i = 0; i < n; i++) { x = el('i', 'th-d'); x.style.left = (R() * 115).toFixed(1) + '%'; dur(x, .45 + R() * .35, R() * 1); L.appendChild(x); }
      L.insertAdjacentHTML('beforeend', '<svg class="th-bolt" viewBox="0 0 60 200"><path d="M38 0 L14 88 L32 88 L10 200 L52 66 L31 66 L48 0Z"/></svg><svg class="th-bolt b2" viewBox="0 0 60 200"><path d="M30 0 L18 70 L30 70 L16 160 L44 56 L30 56 L40 0Z"/></svg>');
      L.appendChild(el('span', 'th-flash'));
    } else if (k === 'lava') {
      var C = ['#f97316', '#ef4444', '#facc15', '#ec4899', '#fb923c', '#dc2626', '#f59e0b', '#be123c', '#fde047', '#f43f5e'];
      C.forEach(function(col, j){ x = el('i', 'lv-b'); x.style.background = 'radial-gradient(circle,' + col + ' 0,' + col + ' 45%,transparent 70%)';
        x.style.left = (R() * 80 - 10).toFixed(0) + '%'; x.style.top = (R() * 85 - 5).toFixed(0) + '%'; x.style.width = (30 + R() * 30).toFixed(0) + '%';
        dur(x, 6 + R() * 7, R() * 8); if (j % 2) x.style.animationDirection = 'alternate-reverse'; L.appendChild(x); });
    } else if (k === 'vortex') {
      L.appendChild(el('span', 'vx vx1')); L.appendChild(el('span', 'vx vx2')); L.appendChild(el('span', 'vx-core')); L.appendChild(el('span', 'vx-st'));
    } else if (k === 'deepsea') {
      for (i = 0; i < 5; i++) { x = el('i', 'ds-ray'); x.style.left = (i * 21 - 4) + '%'; dur(x, 5 + i * 1.3, i * 1.7); L.appendChild(x); }
      n = small ? 6 : 22; for (i = 0; i < n; i++) { x = el('i', 'ds-bub'); var sz = (small ? 3 : 5) + R() * (small ? 4 : 12);
        x.style.width = x.style.height = sz.toFixed(0) + 'px'; x.style.left = (R() * 96).toFixed(1) + '%'; dur(x, 4 + R() * 6, R() * 9); L.appendChild(x); }
      L.appendChild(el('span', 'ds-caus'));
    }
    b.appendChild(L); b.classList.add('hfx-on');
  }

  /* ---------- Hintergrund ---------- */
  function fillBg(L, k, small){
    var i, n, x, R = rnd(k.length * 17 + 1);
    if (k === 'northern') { ['b1', 'b2', 'b3'].forEach(function(c){ L.appendChild(el('span', 'nl-b ' + c)); }); }
    else if (k === 'coderain') {
      var CH = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789SKWS', w = window.innerWidth || 400;
      n = small ? 7 : Math.min(40, Math.ceil(w / 20));
      for (i = 0; i < n; i++) { var t = '', len = small ? 8 : 18 + Math.floor(R() * 16); for (var j = 0; j < len; j++) t += CH[Math.floor(R() * CH.length)] + '\n';
        x = el('span', 'cr-col', t); x.style.left = (i / n * 100 + R() * 2).toFixed(1) + '%'; dur(x, (small ? 1.5 : 4) + R() * (small ? 2 : 7), R() * 10);
        x.style.opacity = (.35 + R() * .65).toFixed(2); L.appendChild(x); }
    } else if (k === 'warp') { L.appendChild(el('span', 'wp-glow')); ['wp1', 'wp2', 'wp3'].forEach(function(c){ L.appendChild(el('span', 'wp ' + c)); }); }
    else if (k === 'fireflies') {
      n = small ? 7 : 34;
      for (i = 0; i < n; i++) { x = el('i', 'ff'); x.style.left = (R() * 100).toFixed(1) + '%'; x.style.top = (R() * 100).toFixed(1) + '%';
        x.style.setProperty('--x', ((R() - .5) * (small ? 20 : 160)).toFixed(0) + 'px'); x.style.setProperty('--y', ((R() - .5) * (small ? 14 : 120)).toFixed(0) + 'px');
        x.style.animationDuration = (7 + R() * 8).toFixed(1) + 's,' + (1.2 + R() * 2).toFixed(1) + 's'; x.style.animationDelay = (-R() * 10).toFixed(1) + 's,' + (-R() * 3).toFixed(1) + 's';
        L.appendChild(x); }
    } else if (k === 'neongrid') {
      L.appendChild(el('span', 'sy-glow')); L.appendChild(el('span', 'sy-sun'));
      var fl = el('span', 'sy-floor'); fl.appendChild(el('span', 'sy-grid')); L.appendChild(fl); L.appendChild(el('span', 'sy-hz'));
    }
  }
  // ohne box: Ebene für die ganze Seite (bleibt bestehen, solange derselbe Hintergrund gewählt ist); mit box: kleine Vorschau
  function bg(k, box){
    if (box) { var s = el('span', 'pbgfx small pbgfx-' + k); fillBg(s, k, true); box.appendChild(s); return; }
    var old = document.getElementById('pbgFx');
    if (old && old.getAttribute('data-k') === k) { document.body.classList.add('pbg-fx'); return; }
    if (old) old.parentNode.removeChild(old);
    document.body.classList.remove('pbg-fx');
    if (!k || BG.indexOf(k) < 0) return;
    document.body.classList.add('pbg-fx');
    var L = el('div', 'pbgfx pbgfx-' + k); L.id = 'pbgFx'; L.setAttribute('data-k', k); fillBg(L, k, false);
    document.body.insertBefore(L, document.body.firstChild);
  }
  return {
    isFrame: function(k){ return FR.indexOf(k) >= 0; }, isHeader: function(k){ return HD.indexOf(k) >= 0; }, isBg: function(k){ return BG.indexOf(k) >= 0; },
    wrap: wrap, frame: frame, header: header, bg: bg
  };
})();
