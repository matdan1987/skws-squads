/* SKWS Squads – persönliche Einstellungen zentral speichern (Datenbank „player_state“): gelesene Funk-Räume, „Neu für dich“.
   Das Gerät behält nur eine Kopie als Zwischenspeicher; maßgeblich ist der Stand in der Datenbank. */
var PState = (function(){
  var TOK = null, DATA = {}, OK = false, WAIT = [], T = {}, LOADING = false;
  function lsGet(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } }
  function lsSet(k, v){ try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function done(){ LOADING = false; var w = WAIT; WAIT = []; w.forEach(function(f){ try { f(); } catch(e){} }); }
  function load(tok){
    if (!tok) { reset(); return; }
    if (tok === TOK && (OK || LOADING)) return;
    TOK = tok; OK = false; LOADING = true; DATA = {};
    rpc('my_state', { p_token: tok }).then(function(r){ if (TOK !== tok) return; if (r && r.ok) { DATA = r.items || {}; OK = true; } done(); })
      .catch(function(){ if (TOK === tok) done(); });
  }
  function reset(){ TOK = null; OK = false; DATA = {}; done(); }
  function ready(cb){ if (!LOADING) cb(); else WAIT.push(cb); }
  // key: zentraler Schlüssel, local: alter Schlüssel auf dem Gerät, merge(zentral, gerät) → zusammengeführter Wert
  function get(key, local, merge){
    var c = OK ? DATA[key] : undefined, l = lsGet(local);
    if (!OK) return l;
    if (c === undefined || c === null) { if (l !== null) set(key, l, local); return l; }   // alter Stand vom Gerät wandert einmalig in die Datenbank
    return merge && l !== null ? merge(c, l) : c;
  }
  function set(key, val, local){
    lsSet(local, val);
    if (!TOK) return;
    DATA[key] = val; clearTimeout(T[key]);
    T[key] = setTimeout(function(){ rpc('my_state_set', { p_token: TOK, p_key: key, p_data: val }).catch(function(){}); }, 800);
  }
  return { load: load, reset: reset, ready: ready, get: get, set: set };
})();
