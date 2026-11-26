/* SKWS Squads – „Neu für dich“: Zusammenfassung nach dem Anmelden (seit dem letzten Besuch) */
var NEU_I18N = {
  de: { none:'Gerade nichts Neues.', last:'Zuletzt gezeigt am {d}:', btn:'Neu für dich', title:'✨ Neu für dich', since:'Seit deinem letzten Besuch am {d}', first:'Aus den letzten 7 Tagen', msgs:'{n} neue Nachrichten', msg1:'1 neue Nachricht', gift:'{g} von {n}', badge:'Neue Marke: {b}', tier:'Neue Stufe erreicht: {ev} {t}', bonus:'Bonus: {r}', malus:'Malus: {r}', cOk:'„{e}“ wurde bestätigt – Marke erhalten', cNo:'„{e}“ wurde nicht bestätigt', cOpen:'Warst du bei „{e}“ dabei? Jetzt melden', sign:'Anmeldung offen: {ev} {l}', team:'Du bist eingeteilt: {ev} · Team {t}{time}', shout:'Neue Beiträge in der Shoutbox', ok:'Alles klar' },
  en: { none:'Nothing new right now.', last:'Last shown on {d}:', btn:'New for you', title:'✨ New for you', since:'Since your last visit on {d}', first:'From the last 7 days', msgs:'{n} new messages', msg1:'1 new message', gift:'{g} from {n}', badge:'New badge: {b}', tier:'New level reached: {ev} {t}', bonus:'Bonus: {r}', malus:'Penalty: {r}', cOk:'“{e}” was confirmed – badge earned', cNo:'“{e}” was not confirmed', cOpen:'Were you at “{e}”? Report now', sign:'Sign-up open: {ev} {l}', team:'You are in the line-up: {ev} · Team {t}{time}', shout:'New posts in the shoutbox', ok:'Got it' },
  fr: { none:'Rien de nouveau pour l’instant.', last:'Dernier affichage le {d} :', btn:'Nouveau pour toi', title:'✨ Nouveau pour toi', since:'Depuis ta dernière visite le {d}', first:'Des 7 derniers jours', msgs:'{n} nouveaux messages', msg1:'1 nouveau message', gift:'{g} de {n}', badge:'Nouveau badge : {b}', tier:'Nouveau niveau atteint : {ev} {t}', bonus:'Bonus : {r}', malus:'Malus : {r}', cOk:'« {e} » a été confirmé – badge obtenu', cNo:'« {e} » n’a pas été confirmé', cOpen:'Tu étais à « {e} » ? Signale-le', sign:'Inscription ouverte : {ev} {l}', team:'Tu es dans la composition : {ev} · Équipe {t}{time}', shout:'Nouveaux messages dans la shoutbox', ok:'Compris' },
  es: { none:'Nada nuevo por ahora.', last:'Mostrado por última vez el {d}:', btn:'Novedades para ti', title:'✨ Novedades para ti', since:'Desde tu última visita el {d}', first:'De los últimos 7 días', msgs:'{n} mensajes nuevos', msg1:'1 mensaje nuevo', gift:'{g} de {n}', badge:'Nueva insignia: {b}', tier:'Nuevo nivel alcanzado: {ev} {t}', bonus:'Bonus: {r}', malus:'Penalización: {r}', cOk:'«{e}» fue confirmado – insignia obtenida', cNo:'«{e}» no fue confirmado', cOpen:'¿Estuviste en «{e}»? Avisa ahora', sign:'Inscripción abierta: {ev} {l}', team:'Estás en la alineación: {ev} · Equipo {t}{time}', shout:'Nuevas entradas en el shoutbox', ok:'Entendido' },
  pt: { none:'Nada de novo agora.', last:'Mostrado pela última vez em {d}:', btn:'Novidades para você', title:'✨ Novidades para você', since:'Desde sua última visita em {d}', first:'Dos últimos 7 dias', msgs:'{n} novas mensagens', msg1:'1 nova mensagem', gift:'{g} de {n}', badge:'Nova insígnia: {b}', tier:'Novo nível alcançado: {ev} {t}', bonus:'Bônus: {r}', malus:'Penalidade: {r}', cOk:'“{e}” foi confirmado – insígnia recebida', cNo:'“{e}” não foi confirmado', cOpen:'Você estava em “{e}”? Avise agora', sign:'Inscrição aberta: {ev} {l}', team:'Você está na escalação: {ev} · Time {t}{time}', shout:'Novas mensagens no shoutbox', ok:'Entendi' },
  it: { none:'Niente di nuovo al momento.', last:'Ultima visualizzazione il {d}:', btn:'Novità per te', title:'✨ Novità per te', since:'Dalla tua ultima visita il {d}', first:'Degli ultimi 7 giorni', msgs:'{n} nuovi messaggi', msg1:'1 nuovo messaggio', gift:'{g} da {n}', badge:'Nuovo distintivo: {b}', tier:'Nuovo livello raggiunto: {ev} {t}', bonus:'Bonus: {r}', malus:'Penalità: {r}', cOk:'«{e}» è stato confermato – distintivo ottenuto', cNo:'«{e}» non è stato confermato', cOpen:'Eri a «{e}»? Segnalalo ora', sign:'Iscrizione aperta: {ev} {l}', team:'Sei in formazione: {ev} · Squadra {t}{time}', shout:'Nuovi messaggi nella shoutbox', ok:'Ok' },
  tr: { none:'Şu an yeni bir şey yok.', last:'En son {d} tarihinde gösterildi:', btn:'Senin için yeni', title:'✨ Senin için yeni', since:'{d} tarihindeki son ziyaretinden beri', first:'Son 7 günden', msgs:'{n} yeni mesaj', msg1:'1 yeni mesaj', gift:'{n} kişisinden {g}', badge:'Yeni rozet: {b}', tier:'Yeni seviyeye ulaştın: {ev} {t}', bonus:'Bonus: {r}', malus:'Ceza: {r}', cOk:'“{e}” onaylandı – rozet kazandın', cNo:'“{e}” onaylanmadı', cOpen:'“{e}” etkinliğinde miydin? Şimdi bildir', sign:'Kayıt açık: {ev} {l}', team:'Kadrodasın: {ev} · Takım {t}{time}', shout:'Shoutbox’ta yeni mesajlar', ok:'Tamam' },
  ru: { none:'Пока ничего нового.', last:'Последний показ {d}:', btn:'Новое для тебя', title:'✨ Новое для тебя', since:'С твоего последнего визита {d}', first:'За последние 7 дней', msgs:'Новых сообщений: {n}', msg1:'1 новое сообщение', gift:'{g} от {n}', badge:'Новый значок: {b}', tier:'Новый уровень: {ev} {t}', bonus:'Бонус: {r}', malus:'Штраф: {r}', cOk:'«{e}» подтверждено – значок получен', cNo:'«{e}» не подтверждено', cOpen:'Ты был на «{e}»? Сообщи сейчас', sign:'Запись открыта: {ev} {l}', team:'Ты в составе: {ev} · Команда {t}{time}', shout:'Новые сообщения в чате', ok:'Понятно' },
  pl: { none:'Na razie nic nowego.', last:'Ostatnio pokazane {d}:', btn:'Nowe dla ciebie', title:'✨ Nowe dla ciebie', since:'Od twojej ostatniej wizyty {d}', first:'Z ostatnich 7 dni', msgs:'Nowe wiadomości: {n}', msg1:'1 nowa wiadomość', gift:'{g} od {n}', badge:'Nowa odznaka: {b}', tier:'Nowy poziom: {ev} {t}', bonus:'Bonus: {r}', malus:'Kara: {r}', cOk:'„{e}” potwierdzono – odznaka zdobyta', cNo:'„{e}” nie zostało potwierdzone', cOpen:'Byłeś na „{e}”? Zgłoś teraz', sign:'Zapisy otwarte: {ev} {l}', team:'Jesteś w składzie: {ev} · Drużyna {t}{time}', shout:'Nowe wpisy w shoutboxie', ok:'Jasne' }
};
var Neu = (function(){
  var DONE = {}, TIER = [5, 10, 25, 50], LOADED = Date.now() - 5000; // gerade im Pflichtfenster bestätigte Nachrichten nicht noch einmal melden
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e){ return null; } }
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function f(s, o){ return String(s).replace(/\{(\w+)\}/g, function(m, k){ return o[k] !== undefined ? o[k] : m; }); }
  function tierOf(c){ var t = -1; TIER.forEach(function(x, i){ if (c >= x) t = i; }); return t; }
  function safe(p){ return p.then(function(r){ return r; }, function(){ return null; }); }

  // ctx: { tok, name, inbox, rooms, seen, lang, data, go(target) }
  // again = über den ✨-Knopf erneut geöffnet: zeigt Neues oder sonst die zuletzt gezeigte Liste
  function run(ctx, again){
    if (!ctx.tok || !ctx.name || (DONE[ctx.tok] && !again)) return;
    DONE[ctx.tok] = true;
    var key = 'skws_neu_' + ctx.name, st = null, cen = window.PState ? PState.get('neu', key + '_all') : null;
    // zentral gespeichert (alle Geräte gleich); ältere Stände vom Gerät werden übernommen
    if (cen && cen.st) st = cen.st; else try { st = JSON.parse(ls(key) || 'null'); } catch(e){}
    function keep(k, v){ ls(k, JSON.stringify(v)); if (!window.PState) return; var c = PState.get('neu', key + '_all') || {}; if (k === key) c.st = v; else c.last = v; PState.set('neu', c, key + '_all'); }
    var first = !st; st = st || { claims:{}, team:{} };
    var since = first ? Date.now() - 7 * 86400000 : new Date(st.t).getTime();
    function isNew(t){ return t && new Date(t).getTime() > since; }
    Promise.all([
      safe(rpc('player_profile', { p_name: ctx.name })),
      safe(rpc('my_merits', { p_name: ctx.name, p_token: ctx.tok })),
      safe(rpc('claim_list', { p_token: ctx.tok }))
    ]).then(function(res){
      var L = NEU_I18N[ctx.lang] || NEU_I18N.en, X = XTRA_I18N[ctx.lang] || XTRA_I18N.en, G = GIFT_I18N[ctx.lang] || GIFT_I18N.en;
      var P = res[0] || {}, M = Array.isArray(res[1]) ? res[1] : [], C = res[2] && res[2].ok ? res[2].items || [] : null, D = ctx.data || {};
      var items = [], save = { t: new Date().toISOString(), claims: {}, team: {}, sign: {}, rooms: {} };
      function add(ic, txt, to, cls){ items.push({ ic: ic, t: txt, to: to, c: cls || '' }); }
      // Nachrichten (Geschenke stehen einzeln weiter unten)
      var nm = (ctx.inbox || []).filter(function(m){ return m.kind !== 'gift' && isNew(m.t) && !(m.ack && new Date(m.ack).getTime() >= LOADED); }).length;
      if (nm) add('✉️', nm === 1 ? L.msg1 : f(L.msgs, { n: nm }), 'funk');
      // Geschenke
      var gl = (P.gift_list || []).filter(function(g){ return isNew(g.t); });
      gl.slice(0, 5).forEach(function(g){ add(GIFT_ICON[g.kind] || '🎁', f(L.gift, { g: G.g[g.kind] || g.kind, n: g.from }), 'profile', 'ok'); });
      if (gl.length > 5) add('🎁', '+ ' + (gl.length - 5), 'profile', 'ok');
      // Marken und neue Stufen
      var bl = P.badges || [];
      bl.filter(function(b){ return isNew(b.t); }).slice(0, 6).forEach(function(b){
        add(b.k === 'x' ? (b.icon || '🎖️') : '🎖️', f(L.badge, { b: b.k === 'x' ? b.label : X[b.k] + ' ' + (b.label || '') }), 'profile', 'ok'); });
      ['ds','cs'].forEach(function(k){
        var all = bl.filter(function(b){ return b.k === k; }), old = all.filter(function(b){ return !isNew(b.t); }).length, t = tierOf(all.length);
        if (t >= 0 && t > tierOf(old)) add('🏆', f(L.tier, { ev: X[k], t: X.tiers[t] }), 'profile', 'ok');
      });
      // Bonus / Malus (nur was der Spieler sehen darf)
      M.filter(function(m){ return isNew(m.created_at); }).forEach(function(m){
        add(m.kind === 'malus' ? '⚠️' : '🐝', f(m.kind === 'malus' ? L.malus : L.bonus, { r: m.reason || '' }), 'form:merCard', m.kind === 'malus' ? 'warn' : 'ok'); });
      // Selbstmeldungen: Entscheidung oder neues offenes Event
      if (C) C.forEach(function(e){
        var s = e.status || (e.open ? 'open' : ''), was = (st.claims || {})[e.id]; save.claims[e.id] = s;
        if (s === was) return;
        if (s === 'ok') add('✅', f(L.cOk, { e: e.label }), 'profile', 'ok');
        else if (s === 'no') add('❌', f(L.cNo, { e: e.label }), 'form:claimCards', 'warn');
        else if (s === 'open' && !was) add(e.icon || '✋', f(L.cOpen, { e: e.label }), 'form:claimCards', 'warn');
      }); else save.claims = st.claims || {};
      // Events: offene Anmeldung und neue Einteilung
      ['ds','cs'].forEach(function(k){
        var r = D.ev && D.ev[k];
        // offene Anmeldung: einmal je Runde (danach erinnert die Karte „Diese Woche“)
        var rid = r && r.open && !(r.signups && r.signups[ctx.name]) ? String(r.id || r.label) : '';
        if (rid && rid !== ((st.sign || {})[k] || '')) add('📝', f(L.sign, { ev: X[k], l: r.label || '' }), 'form:evCards', 'warn');
        save.sign = save.sign || {}; save.sign[k] = rid || ((st.sign || {})[k] || '');
        var Pl = D[k], sig = '';
        if (Pl && Pl.teams) Object.keys(Pl.teams).forEach(function(t){ var Tm = Pl.teams[t];
          if ((Tm.m || []).some(function(x){ return x[0] === ctx.name; }) || (Tm.s || []).indexOf(ctx.name) >= 0) {
            sig = (Pl.label || Pl.id || '') + '|' + t + '|' + (Tm.time || '');
            if (sig !== (st.team || {})[k]) add('⚔️', f(L.team, { ev: X[k], t: t, time: Tm.time ? ' · ' + Tm.time : '' }), 'form:' + k + 'Card');
          } });
        save.team[k] = sig;
      });
      // Shoutbox: nur wenn seit dem letzten Mal (oder seit dem letzten Lesen) etwas dazukam
      save.rooms = {}; var nr = 0;
      Object.keys(ctx.rooms || {}).forEach(function(r){ var id = ctx.rooms[r] || 0, was = Math.max((ctx.seen || {})[r] || 0, (st.rooms || {})[r] || 0); save.rooms[r] = Math.max(id, (st.rooms || {})[r] || 0); if (id > was) nr++; });
      if (nr) add('💬', L.shout, 'funk');
      var sub = first ? L.first : f(L.since, { d: new Date(since).toLocaleString(ctx.lang, { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) });
      if (!items.length) {
        keep(key, save); if (!again) return;
        var last = (cen && cen.last) || null; if (!last) try { last = JSON.parse(ls(key + '_last') || 'null'); } catch(e){}
        show(last ? last.items : [], L, L.none + (last ? ' ' + f(L.last, { d: new Date(last.t).toLocaleString(ctx.lang, { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) }) : ''), function(to){ if (to) ctx.go(to); });
        return;
      }
      keep(key + '_last', { t: save.t, items: items });
      show(items, L, sub, function(to){
        keep(key, save); if (to) ctx.go(to);
      });
    });
  }
  function show(items, L, sub, close){
    if (document.querySelector('.neu-ov')) return;
    var o = el('div', 'fk-overlay neu-ov'), c = el('div', 'card fk-modal neu-modal');
    c.appendChild(el('div', 'fk-mtitle neu-title', L.title)); c.appendChild(el('div', 'hint neu-sub', sub));
    var list = el('div', 'neu-list');
    function done(to){ o.remove(); if (!document.querySelector('.fk-overlay:not(.hide)') && document.getElementById('fkModal').classList.contains('hide')) document.body.classList.remove('fk-lock'); close(to); }
    items.forEach(function(x){
      var r = el('button', 'neu-row ' + x.c); r.type = 'button';
      r.appendChild(el('i', '', x.ic)); r.appendChild(el('span', '', x.t)); r.appendChild(el('b', 'neu-go', '›'));
      r.addEventListener('click', function(){ done(x.to); }); list.appendChild(r);
    });
    c.appendChild(list);
    var b = el('button', 'btn', '✔ ' + L.ok); b.type = 'button'; b.addEventListener('click', function(){ done(null); }); c.appendChild(b);
    o.appendChild(c); o.addEventListener('click', function(e){ if (e.target === o) done(null); });
    document.body.appendChild(o); document.body.classList.add('fk-lock');
  }
  return { run: run, reset: function(){ DONE = {}; } };
})();
