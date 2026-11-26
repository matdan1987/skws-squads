/* SKWS Squads – Profil gestalten: Rahmen, Header, Hintergrund, Vorzeige-Badges (Spielerseite)
   Grund-Designs für alle, besondere werden durch Erfolge, Event-Teilnahmen, Treue oder Rang freigeschaltet.
   Eigene Bilder lädt der Spieler selbst hoch; R4/R5 stellen zusätzlich Bilder für alle bereit. */
var STIL_I18N = {
  de: { t:'🎨 Profil gestalten', hint:'Wähle Rahmen, Header, Hintergrund und bis zu 3 Badges für dein Profil. 🔒-Designs schaltest du durch Erfolge frei.', frame:'Rahmen', header:'Header', bg:'Hintergrund', badges:'Badges', save:'Speichern', saved:'Gespeichert ✓', err:'Das hat nicht geklappt – bitte nochmal versuchen.',
    up:'📷 Eigenes Bild hochladen', upDel:'Eigenes Bild entfernen', upBig:'Das Bild ist zu groß oder kein Foto.', own:'Eigenes Bild', lib:'Von R4/R5', none:'Keins', pick3:'Bis zu 3 auswählen – sie erscheinen oben im Profil.', noBadges:'Noch keine Badges verdient – sie kommen mit Erfolgen und Event-Teilnahmen.',
    lockEv:'ab {n} Event-Teilnahmen', lockDs:'ab {n} Wüstensturm-Einsätzen', lockCs:'ab {n} Schluchtsturm-Einsätzen', lockBees:'ab {n} Bienchen', lockYear:'ab 1 Jahr in der Allianz', lockMentor:'für Mentoren', lockLead:'nur R4/R5',
    roleR5:'Anführer', roleR4:'Offizier', roleMentor:'Mentor', roleVet:'Veteran' },
  en: { t:'🎨 Customize profile', hint:'Pick a frame, header, background and up to 3 badges for your profile. 🔒 designs unlock through achievements.', frame:'Frame', header:'Header', bg:'Background', badges:'Badges', save:'Save', saved:'Saved ✓', err:'That didn’t work – please try again.',
    up:'📷 Upload your own picture', upDel:'Remove own picture', upBig:'The picture is too large or not a photo.', own:'Own picture', lib:'From R4/R5', none:'None', pick3:'Pick up to 3 – they appear at the top of your profile.', noBadges:'No badges earned yet – they come with achievements and event participation.',
    lockEv:'from {n} event participations', lockDs:'from {n} Desert Storm runs', lockCs:'from {n} Canyon Storm runs', lockBees:'from {n} bees', lockYear:'after 1 year in the alliance', lockMentor:'for mentors', lockLead:'R4/R5 only',
    roleR5:'Leader', roleR4:'Officer', roleMentor:'Mentor', roleVet:'Veteran' },
  fr: { t:'🎨 Personnaliser le profil', hint:'Choisis un cadre, un en-tête, un fond et jusqu’à 3 badges. Les designs 🔒 se débloquent avec les succès.', frame:'Cadre', header:'En-tête', bg:'Fond', badges:'Badges', save:'Enregistrer', saved:'Enregistré ✓', err:'Ça n’a pas marché – réessaie.',
    up:'📷 Téléverser ma propre image', upDel:'Supprimer mon image', upBig:'Image trop grande ou pas une photo.', own:'Ma photo', lib:'Par R4/R5', none:'Aucun', pick3:'Choisis jusqu’à 3 – ils apparaissent en haut du profil.', noBadges:'Pas encore de badges – ils viennent avec les succès et les événements.',
    lockEv:'dès {n} participations', lockDs:'dès {n} Tempêtes du désert', lockCs:'dès {n} Tempêtes du canyon', lockBees:'dès {n} abeilles', lockYear:'après 1 an dans l’alliance', lockMentor:'pour les mentors', lockLead:'R4/R5 seulement',
    roleR5:'Chef', roleR4:'Officier', roleMentor:'Mentor', roleVet:'Vétéran' },
  es: { t:'🎨 Personalizar perfil', hint:'Elige marco, cabecera, fondo y hasta 3 insignias. Los diseños 🔒 se desbloquean con logros.', frame:'Marco', header:'Cabecera', bg:'Fondo', badges:'Insignias', save:'Guardar', saved:'Guardado ✓', err:'No funcionó – inténtalo de nuevo.',
    up:'📷 Subir imagen propia', upDel:'Quitar imagen propia', upBig:'La imagen es demasiado grande o no es una foto.', own:'Imagen propia', lib:'De R4/R5', none:'Ninguno', pick3:'Elige hasta 3 – aparecen arriba en el perfil.', noBadges:'Aún no tienes insignias – llegan con logros y eventos.',
    lockEv:'desde {n} participaciones', lockDs:'desde {n} Tormentas del desierto', lockCs:'desde {n} Tormentas del cañón', lockBees:'desde {n} abejitas', lockYear:'tras 1 año en la alianza', lockMentor:'para mentores', lockLead:'solo R4/R5',
    roleR5:'Líder', roleR4:'Oficial', roleMentor:'Mentor', roleVet:'Veterano' },
  pt: { t:'🎨 Personalizar perfil', hint:'Escolha moldura, cabeçalho, fundo e até 3 emblemas. Designs 🔒 são liberados com conquistas.', frame:'Moldura', header:'Cabeçalho', bg:'Fundo', badges:'Emblemas', save:'Salvar', saved:'Salvo ✓', err:'Não funcionou – tente de novo.',
    up:'📷 Enviar imagem própria', upDel:'Remover imagem própria', upBig:'Imagem grande demais ou não é foto.', own:'Imagem própria', lib:'De R4/R5', none:'Nenhum', pick3:'Escolha até 3 – aparecem no topo do perfil.', noBadges:'Ainda sem emblemas – vêm com conquistas e eventos.',
    lockEv:'a partir de {n} participações', lockDs:'a partir de {n} Tempestades do deserto', lockCs:'a partir de {n} Tempestades do cânion', lockBees:'a partir de {n} abelhinhas', lockYear:'após 1 ano na aliança', lockMentor:'para mentores', lockLead:'só R4/R5',
    roleR5:'Líder', roleR4:'Oficial', roleMentor:'Mentor', roleVet:'Veterano' },
  it: { t:'🎨 Personalizza profilo', hint:'Scegli cornice, intestazione, sfondo e fino a 3 badge. I design 🔒 si sbloccano con i successi.', frame:'Cornice', header:'Intestazione', bg:'Sfondo', badges:'Badge', save:'Salva', saved:'Salvato ✓', err:'Non ha funzionato – riprova.',
    up:'📷 Carica immagine tua', upDel:'Rimuovi immagine tua', upBig:'Immagine troppo grande o non è una foto.', own:'Immagine tua', lib:'Da R4/R5', none:'Nessuno', pick3:'Scegline fino a 3 – appaiono in cima al profilo.', noBadges:'Ancora nessun badge – arrivano con successi ed eventi.',
    lockEv:'da {n} partecipazioni', lockDs:'da {n} Tempeste del deserto', lockCs:'da {n} Tempeste del canyon', lockBees:'da {n} apette', lockYear:'dopo 1 anno nell’alleanza', lockMentor:'per i mentori', lockLead:'solo R4/R5',
    roleR5:'Capo', roleR4:'Ufficiale', roleMentor:'Mentore', roleVet:'Veterano' },
  tr: { t:'🎨 Profili düzenle', hint:'Profilin için çerçeve, başlık, arka plan ve en fazla 3 rozet seç. 🔒 tasarımlar başarılarla açılır.', frame:'Çerçeve', header:'Başlık', bg:'Arka plan', badges:'Rozetler', save:'Kaydet', saved:'Kaydedildi ✓', err:'Olmadı – tekrar dene.',
    up:'📷 Kendi resmini yükle', upDel:'Kendi resmini kaldır', upBig:'Resim çok büyük veya fotoğraf değil.', own:'Kendi resmin', lib:'R4/R5’ten', none:'Yok', pick3:'En fazla 3 seç – profilin üstünde görünür.', noBadges:'Henüz rozet yok – başarılar ve etkinliklerle gelir.',
    lockEv:'{n} etkinlik katılımından itibaren', lockDs:'{n} Çöl Fırtınasından itibaren', lockCs:'{n} Kanyon Fırtınasından itibaren', lockBees:'{n} arıcıktan itibaren', lockYear:'ittifakta 1 yıldan sonra', lockMentor:'mentorlar için', lockLead:'sadece R4/R5',
    roleR5:'Lider', roleR4:'Subay', roleMentor:'Mentor', roleVet:'Kıdemli' },
  ru: { t:'🎨 Оформить профиль', hint:'Выбери рамку, шапку, фон и до 3 значков. Дизайны с 🔒 открываются достижениями.', frame:'Рамка', header:'Шапка', bg:'Фон', badges:'Значки', save:'Сохранить', saved:'Сохранено ✓', err:'Не получилось – попробуй ещё раз.',
    up:'📷 Загрузить своё изображение', upDel:'Удалить своё изображение', upBig:'Изображение слишком большое или это не фото.', own:'Своё изображение', lib:'От R4/R5', none:'Нет', pick3:'Выбери до 3 – они видны вверху профиля.', noBadges:'Пока нет значков – они появятся с достижениями и событиями.',
    lockEv:'от {n} участий', lockDs:'от {n} «Бурь в пустыне»', lockCs:'от {n} «Бурь в каньоне»', lockBees:'от {n} пчёлок', lockYear:'после 1 года в альянсе', lockMentor:'для наставников', lockLead:'только R4/R5',
    roleR5:'Лидер', roleR4:'Офицер', roleMentor:'Наставник', roleVet:'Ветеран' },
  pl: { t:'🎨 Wygląd profilu', hint:'Wybierz ramkę, nagłówek, tło i do 3 odznak. Wzory z 🔒 odblokowujesz osiągnięciami.', frame:'Ramka', header:'Nagłówek', bg:'Tło', badges:'Odznaki', save:'Zapisz', saved:'Zapisano ✓', err:'Nie udało się – spróbuj ponownie.',
    up:'📷 Wgraj własny obraz', upDel:'Usuń własny obraz', upBig:'Obraz jest za duży albo to nie zdjęcie.', own:'Własny obraz', lib:'Od R4/R5', none:'Brak', pick3:'Wybierz do 3 – pojawią się na górze profilu.', noBadges:'Brak odznak – przyjdą z osiągnięciami i wydarzeniami.',
    lockEv:'od {n} udziałów', lockDs:'od {n} Burz na pustyni', lockCs:'od {n} Burz w kanionie', lockBees:'od {n} pszczółek', lockYear:'po 1 roku w sojuszu', lockMentor:'dla mentorów', lockLead:'tylko R4/R5',
    roleR5:'Przywódca', roleR4:'Oficer', roleMentor:'Mentor', roleVet:'Weteran' }
};
// Designs: Name (de/en), Freischaltung als [Art, Zahl]
var STIL_DESIGN = {
  frame: [
    { k:'', de:'Standard', en:'Default' }, { k:'blue', de:'Blau', en:'Blue' }, { k:'green', de:'Grün', en:'Green' }, { k:'purple', de:'Violett', en:'Violet' }, { k:'red', de:'Rot', en:'Red' },
    { k:'fire', de:'Feuer', en:'Fire', lock:['bees', 5] }, { k:'ice', de:'Eis', en:'Ice', lock:['year', 1] }, { k:'gold', de:'Gold', en:'Gold', lock:['ev', 10] },
    { k:'diamond', de:'Diamant', en:'Diamond', lock:['ev', 25] }, { k:'mentor', de:'Mentor', en:'Mentor', lock:['mentor', 1] }, { k:'legend', de:'Legende', en:'Legend', lock:['lead', 1] }
  ],
  header: [
    { k:'', de:'Nacht', en:'Night' }, { k:'ocean', de:'Ozean', en:'Ocean' }, { k:'forest', de:'Wald', en:'Forest' }, { k:'sunset', de:'Abendrot', en:'Sunset' }, { k:'aurora', de:'Polarlicht', en:'Aurora' },
    { k:'desert', de:'Wüste', en:'Desert', lock:['ds', 5] }, { k:'canyon', de:'Schlucht', en:'Canyon', lock:['cs', 5] }, { k:'galaxy', de:'Galaxie', en:'Galaxy', lock:['bees', 3] },
    { k:'royal', de:'Königlich', en:'Royal', lock:['ev', 25] }, { k:'leader', de:'Führung', en:'Command', lock:['lead', 1] }
  ],
  bg: [
    { k:'', de:'Keiner', en:'None' }, { k:'stars', de:'Sterne', en:'Stars' }, { k:'grid', de:'Raster', en:'Grid' }, { k:'waves', de:'Wellen', en:'Waves' }, { k:'dunes', de:'Dünen', en:'Dunes' },
    { k:'honey', de:'Waben', en:'Honeycomb', lock:['bees', 10] }, { k:'nebula', de:'Nebel', en:'Nebula', lock:['year', 1] }
  ]
};
// Ausnahme: diese Spieler haben alle Designs freigeschaltet
var STIL_ALL = ['xX Meister Proper Xx'];
var Stil = (function(){
  var A = null, OPEN = false, STY = null, IMG = {}, LIB = null, LIB_BUSY = false, ED = null, TAB = 'frame', MSG = '';
  function L(){ return STIL_I18N[A.lang()] || STIL_I18N.en; }
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function btn(cls, txt, fn){ var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function sess(){ return window.Funk && Funk.session(); }
  function dname(d){ return A.lang() === 'de' ? d.de : d.en; }
  function load(force){
    if (STY && !force) return;
    rpc('style_get', {}).then(function(r){ STY = r && typeof r === 'object' && !Array.isArray(r) ? r : {}; A.reProfile(); }).catch(function(){ STY = false; });
  }
  function of(n){ return (STY && STY[n]) || {}; }
  function img(n, kind, cb){
    var k = n + '|' + kind; if (IMG[k] !== undefined) return IMG[k];
    IMG[k] = null; rpc('style_img', { p_name: n, p_kind: kind }).then(function(r){ IMG[k] = typeof r === 'string' ? r : false; cb && cb(); }).catch(function(){ IMG[k] = false; });
    return null;
  }
  function lib(cb){ if (LIB || LIB_BUSY) return LIB; LIB_BUSY = true; rpc('style_assets', {}).then(function(r){ LIB = Array.isArray(r) ? r : []; LIB_BUSY = false; cb && cb(); }).catch(function(){ LIB = []; LIB_BUSY = false; }); return null; }
  function libImg(key){ var id = +String(key).slice(4), x = (LIB || []).filter(function(a){ return a.id === id; })[0]; if (!LIB) lib(A.reProfile); return x ? x.data : null; }
  // freigeschaltet?
  function lockText(d){ var T = L(), l = d.lock; if (!l) return '';
    return ({ ev: T.lockEv, ds: T.lockDs, cs: T.lockCs, bees: T.lockBees, year: T.lockYear, mentor: T.lockMentor, lead: T.lockLead }[l[0]] || '').replace('{n}', l[1]); }
  function unlocked(d, n){ if (!d.lock || STIL_ALL.indexOf(n) >= 0) return true; var s = A.stats(n), l = d.lock;
    return l[0] === 'ev' ? s.ev >= l[1] : l[0] === 'ds' ? s.ds >= l[1] : l[0] === 'cs' ? s.cs >= l[1] : l[0] === 'bees' ? s.bees >= l[1] : l[0] === 'year' ? s.days >= 365 : l[0] === 'mentor' ? s.mentor : l[0] === 'lead' ? s.lead : false; }

  /* ---------- Anzeige im Profil ---------- */
  function headerBg(n, cur, redraw){
    var h = cur.header || '';
    if (h === 'own') { var u = img(n, 'header', redraw); return u ? 'url("' + u + '")' : null; }
    if (h.indexOf('lib:') === 0) { var v = libImg(h); return v ? 'url("' + v + '")' : null; }
    return null;
  }
  function decorate(card, n, av){
    var cur = ED && ED.n === n ? ED : of(n), T = L();
    card.classList.add('sty-card');
    var ban = el('div', 'sty-banner hb-' + ((cur.header && cur.header.indexOf(':') < 0 && cur.header !== 'own') ? cur.header : 'night'));
    var bi = headerBg(n, cur, A.reProfile); if (bi) { ban.style.backgroundImage = bi; ban.classList.add('hb-img'); }
    card.insertBefore(ban, card.firstChild);
    if (av) { av.classList.add('sty-av'); if (cur.frame) av.classList.add('fr-' + cur.frame); }
    // Rang-/Rollen-Badges und Vorzeige-Badges unter dem Namen
    var s = A.stats(n), row = el('div', 'sty-badges');
    if (s.rank === 'R5') row.appendChild(el('span', 'sty-role r5', '👑 ' + T.roleR5)); else if (s.rank === 'R4') row.appendChild(el('span', 'sty-role r4', '⭐ ' + T.roleR4));
    if (s.mentor && !s.lead) row.appendChild(el('span', 'sty-role mt', '🎓 ' + T.roleMentor));
    if (s.days >= 365) row.appendChild(el('span', 'sty-role vt', '🛡️ ' + T.roleVet));
    var earned = A.earned(n), byKey = {}; earned.forEach(function(b){ byKey[b.key] = b; });
    (cur.show || []).forEach(function(k){ var b = byKey[k]; if (b) { var sp = el('span', 'sty-show', b.ic + ' ' + b.label); row.appendChild(sp); } });
    if (row.children.length) { var hn = card.querySelector('.prof-h > div:last-child'); (hn || card).appendChild(row); }
    applyBg(n, cur);
  }
  // Hintergrund gilt für die ganze Seite, solange das Profil offen ist (kein Kasten um die Karten)
  function applyBg(n, cur){
    clearBg();
    cur = cur || of(n); var b = cur.bg || '', body = document.body;
    if (!b) return;
    if (b === 'own' || b.indexOf('lib:') === 0) {
      var u = b === 'own' ? img(n, 'bg', A.reProfile) : libImg(b);
      if (u) { body.classList.add('pbg-img'); body.style.backgroundImage = 'linear-gradient(rgba(6,10,20,.6),rgba(6,10,20,.8)), url("' + u + '")'; }
      return;
    }
    body.classList.add('pbg-' + b);
  }
  function clearBg(){ var body = document.body; body.className = body.className.replace(/\bpbg-\S+/g, '').trim(); body.style.backgroundImage = ''; }
  // Rahmen-Klasse für Avatare in Listen (Übersicht, Funk …)
  function frameOf(n){ var D = A.data(); return (D && D.sty && D.sty[n]) || (STY && STY[n] && STY[n].frame) || ''; }

  /* ---------- Editor (eigenes Profil) ---------- */
  function shrink(file, kind, cb){
    var rd = new FileReader();
    rd.onload = function(){ var im = new Image(); im.onload = function(){
      var W = 1080, H = Math.round(1080 * im.height / im.width), sx = 0, sy = 0, sw = im.width, sh = im.height;
      if (H > 1600) { H = 1600; W = Math.round(1600 * im.width / im.height); }
      var c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
      var q = .82, u = c.toDataURL('image/jpeg', q); while (u.length > 380000 && q > .35) { q -= .08; u = c.toDataURL('image/jpeg', q); }
      cb(u.length <= 380000 ? u : null);
    }; im.onerror = function(){ cb(null); }; im.src = rd.result; };
    rd.onerror = function(){ cb(null); }; rd.readAsDataURL(file);
  }
  // Knopf neben „Avatar ändern“: öffnet bzw. schließt den Editor (standardmäßig zu, damit man sein Profil so sieht wie andere)
  function button(n){
    var s = sess(); if (!s || s.name !== n || STY === false) return null;
    return btn('sty-btn' + (OPEN ? ' on' : ''), OPEN ? '✕ ' + L().t.replace(/^\S+\s/, '') : L().t, function(){
      OPEN = !OPEN; A.reProfile(); if (OPEN) setTimeout(function(){ var e = document.querySelector('.sty-ed'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); });
  }
  function editor(n){
    var s = sess(); if (!OPEN || !s || s.name !== n || STY === false) return null;
    if (STY === null) { load(); return null; }
    if (!ED || ED.n !== n) { var c0 = of(n); ED = { n: n, frame: c0.frame || '', header: c0.header || '', bg: c0.bg || '', show: (c0.show || []).slice(), hi: !!c0.hi, bi: !!c0.bi }; }
    var T = L(), card = el('div', 'card sty-ed'), h = el('div', 'sq-h'); h.appendChild(el('b', '', T.t)); card.appendChild(h);
    card.appendChild(el('div', 'hint', T.hint));
    var tabs = el('div', 'sty-tabs'); [['frame', T.frame], ['header', T.header], ['bg', T.bg], ['badges', T.badges]].forEach(function(t){ tabs.appendChild(btn('mini' + (TAB === t[0] ? ' on' : ''), t[1], function(){ TAB = t[0]; A.reProfile(); })); });
    card.appendChild(tabs);
    var g = el('div', 'sty-grid' + (TAB === 'badges' ? ' sty-bgrid' : ''));
    if (TAB === 'badges') {
      var earned = A.earned(n);
      card.appendChild(el('div', 'hint', earned.length ? T.pick3 : T.noBadges));
      earned.forEach(function(b){ var on = ED.show.indexOf(b.key) >= 0, o = btn('sty-opt sty-b' + (on ? ' on' : ''), b.ic + ' ' + b.label, function(){
        var i = ED.show.indexOf(b.key); if (i >= 0) ED.show.splice(i, 1); else { if (ED.show.length >= 3) ED.show.shift(); ED.show.push(b.key); } A.reProfile(); }); g.appendChild(o); });
    } else {
      STIL_DESIGN[TAB].forEach(function(d){
        var ok = unlocked(d, n), on = ED[TAB] === d.k, o = el('button', 'sty-opt' + (on ? ' on' : '') + (ok ? '' : ' lock')); o.type = 'button';
        var pv = el('span', 'sty-pv ' + (TAB === 'frame' ? 'pv-frame fr-' + (d.k || 'none') : TAB === 'header' ? 'hb-' + (d.k || 'night') : 'pv-bg bg-' + (d.k || 'none')));
        if (TAB === 'frame') pv.appendChild(el('i', '', '🙂'));
        o.appendChild(pv); o.appendChild(el('b', '', (ok ? '' : '🔒 ') + dname(d))); if (!ok) o.appendChild(el('small', '', lockText(d)));
        if (ok) o.addEventListener('click', function(){ ED[TAB] = d.k; A.reProfile(); });
        g.appendChild(o);
      });
      if (TAB !== 'frame') {
        if (!LIB) lib(A.reProfile);
        (LIB || []).filter(function(a){ return a.kind === TAB; }).forEach(function(a){
          var key = 'lib:' + a.id, o = btn('sty-opt' + (ED[TAB] === key ? ' on' : ''), '', function(){ ED[TAB] = key; A.reProfile(); });
          var pv = el('span', 'sty-pv'); pv.style.backgroundImage = 'url("' + a.data + '")'; o.appendChild(pv); o.appendChild(el('b', '', a.label)); o.appendChild(el('small', '', T.lib)); g.appendChild(o);
        });
        var has = TAB === 'header' ? ED.hi : ED.bi;
        if (has) { var oo = btn('sty-opt' + (ED[TAB] === 'own' ? ' on' : ''), '', function(){ ED[TAB] = 'own'; A.reProfile(); });
          var ov = el('span', 'sty-pv'), u = img(n, TAB, A.reProfile); if (u) ov.style.backgroundImage = 'url("' + u + '")'; oo.appendChild(ov); oo.appendChild(el('b', '', T.own)); g.appendChild(oo); }
      }
    }
    card.appendChild(g);
    if (TAB === 'header' || TAB === 'bg') {
      var kind = TAB, up = el('label', 'mini sty-up'), fi = el('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.hidden = true; up.appendChild(document.createTextNode(T.up)); up.appendChild(fi);
      fi.addEventListener('change', function(){ var f = fi.files && fi.files[0]; if (!f) return;
        shrink(f, kind, function(u){ fi.value = ''; if (!u) { MSG = T.upBig; A.reProfile(); return; }
          rpc('style_upload', { p_token: s.tok, p_kind: kind, p_data: u }).then(function(r){ if (!r || !r.ok) throw 0; IMG[n + '|' + kind] = u; ED[kind] = 'own'; if (kind === 'header') ED.hi = true; else ED.bi = true; load(true); })
            .catch(function(){ MSG = T.upBig; A.reProfile(); }); }); });
      var ur = el('div', 'btnrow'); ur.appendChild(up);
      if (kind === 'header' ? ED.hi : ED.bi) ur.appendChild(btn('mini danger', T.upDel, function(){ rpc('style_upload', { p_token: s.tok, p_kind: kind, p_data: null }).then(function(){ delete IMG[n + '|' + kind]; if (kind === 'header') ED.hi = false; else ED.bi = false; if (ED[kind] === 'own') ED[kind] = ''; load(true); }); }));
      card.appendChild(ur);
    }
    var msg = el('div', 'hint', MSG); MSG = '';
    card.appendChild(btn('btn', T.save, function(){
      rpc('style_set', { p_token: s.tok, p_data: { frame: ED.frame, header: ED.header, bg: ED.bg, show: ED.show } }).then(function(r){ if (!r || !r.ok) throw 0; MSG = T.saved; STY = STY || {}; STY[n] = { frame: ED.frame, header: ED.header, bg: ED.bg, show: ED.show.slice(), hi: ED.hi, bi: ED.bi };
        var D = A.data(); if (D) { D.sty = D.sty || {}; D.sty[n] = ED.frame; } A.reProfile(); }).catch(function(){ MSG = T.err; A.reProfile(); });
    }));
    card.appendChild(msg);
    card.appendChild(btn('ghost sty-close', '✓ ' + (A.lang() === 'de' ? 'Fertig' : 'Done'), function(){ OPEN = false; A.reProfile(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
    return card;
  }
  return { init: function(api){ A = api; load(); }, ready: function(){ return !!A; }, decorate: decorate, editor: editor, button: button, clearBg: clearBg, frameOf: frameOf, reset: function(){ ED = null; } };
})();
