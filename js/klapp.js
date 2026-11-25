/* SKWS Squads – Karten auf- und zuklappen (Tipp auf die Überschrift), Zustand wird im Browser gemerkt */
var Klapp = (function(){
  var KEY = 'skws_zu', OK = function(){ return true; }, ST = {};
  function load(){ try { ST = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ ST = {}; } }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch(e){} }
  // Überschrift = erstes Element der Karte (h2, .sq-h oder .devhead)
  function head(c){ var h = c.firstElementChild; return h && (h.tagName === 'H2' || h.classList.contains('sq-h') || h.classList.contains('devhead')) ? h : null; }
  function key(c, h){ var s = c.closest('section'); return (s && s.id || '') + ':' + (c.id || h.textContent.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().slice(0, 60)); }
  function bind(c){
    if (c.dataset.klapp) return;
    var h = head(c); if (!h || !OK(c)) return;
    c.dataset.klapp = '1'; h.classList.add('klapp-h');
    var k = key(c, h); if (!k.split(':')[1]) { c.dataset.klapp = ''; h.classList.remove('klapp-h'); return; }
    c.dataset.kk = k; if (ST[k]) c.classList.add('zu');
  }
  function scan(n){ if (n.classList && n.classList.contains('card')) bind(n); if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll('.card'), bind); }
  function toggle(c, zu){ c.classList.toggle('zu', zu); if (zu) ST[c.dataset.kk] = 1; else delete ST[c.dataset.kk]; save(); }
  function init(cfg){
    KEY = cfg.key || KEY; OK = cfg.ok || OK; load(); scan(document);
    // Karten, deren Überschrift erst später Text bekommt, nachträglich erfassen
    new MutationObserver(function(ms){ ms.forEach(function(m){
      Array.prototype.forEach.call(m.addedNodes, function(n){ if (n.nodeType === 1) scan(n); });
      if (m.type === 'characterData' || m.target.nodeType === 1) { var c = (m.target.nodeType === 1 ? m.target : m.target.parentElement); c = c && c.closest && c.closest('.card'); if (c && !c.dataset.klapp) bind(c); }
    }); }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function(e){
      var h = e.target.closest('.klapp-h'); if (!h) return;
      if (e.target.closest('button, a, input, select, textarea, label')) return;
      var c = h.parentElement; if (!c || !c.dataset.kk) return;
      toggle(c, !c.classList.contains('zu'));
    });
  }
  return { init: init, open: function(c){ if (c && c.dataset && c.dataset.kk) toggle(c, false); } };
})();
